"use server";

/* Staff eye camps (Requirements_Admin.md 7.2): add and edit camps (no approval
   step), hide; only an admin deletes (photo files too). The people count and
   photos open only once the camp's day has passed. A photo that shows people
   needs the permission tick: checked here, and again by the database. */
import { randomUUID } from "node:crypto";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { branches, campPhotos, eyeCamps } from "@/db/schema";
import { fieldErrors } from "@/lib/booking-rules";
import { campFields, campSlug, isUpcoming, MAX_CAMP_PHOTOS } from "@/lib/camp-rules";
import { withRole } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { deleteUpload, saveUpload, UploadError } from "@/lib/storage";

export type CampResult = { ok: true; slug: string } | { ok: false; errors: Record<string, string> };
const id = z.uuid();
const photoMeta = z.array(z.object({ key: z.string().max(60), showsPeople: z.boolean(), consent: z.boolean() })).max(MAX_CAMP_PHOTOS, `Up to ${MAX_CAMP_PHOTOS} photos`);

function refresh() {
  updateTag("content");
  revalidatePath("/admin", "layout");
}

export async function saveCamp(fd: FormData): Promise<CampResult> {
  const staff = await requireStaff();
  const campId = fd.get("id") ? id.safeParse(String(fd.get("id"))) : null;
  if (campId && !campId.success) return { ok: false, errors: { form: "This camp no longer exists." } };
  const parsed = campFields.safeParse({
    title: String(fd.get("title") ?? ""), day: String(fd.get("day") ?? ""), starts: String(fd.get("starts") ?? ""), ends: String(fd.get("ends") ?? ""),
    branch: String(fd.get("branch") ?? ""), place: String(fd.get("place") ?? ""), organisedWith: String(fd.get("organisedWith") ?? ""),
    description: String(fd.get("description") ?? ""), offered: fd.getAll("offered").map(String), people: String(fd.get("people") ?? ""),
    isVisible: fd.get("isVisible") === "yes",
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const f = parsed.data;
  let meta: z.infer<typeof photoMeta> = [];
  try { meta = photoMeta.parse(JSON.parse(String(fd.get("photos") ?? "[]"))); } catch { return { ok: false, errors: { photos: `Up to ${MAX_CAMP_PHOTOS} photos.` } }; }
  const after = !isUpcoming(f.day); // people and photos only once the day has passed
  if (!after && (meta.length || f.people != null)) return { ok: false, errors: { photos: "Add the people count and photos after the camp day." } };
  if (meta.some((p) => p.showsPeople && !p.consent)) return { ok: false, errors: { photos: "Tick the permission box for every photo that shows people, or remove it." } };
  const files = fd.getAll("newPhotos").filter((x): x is File => x instanceof Blob && x.size > 0);
  const uploaded: string[] = [];

  try {
    const result = await withRole(staff.role, async (tx): Promise<{ ok: false; errors: Record<string, string> } | { ok: true; slug: string; dropped: string[] }> => {
      const branchId = f.branch ? (await tx.select({ id: branches.id }).from(branches).where(eq(branches.slug, f.branch)))[0]?.id ?? null : null;
      let rowId = campId?.data;
      let slug: string;
      if (rowId) {
        const [old] = await tx.select({ slug: eyeCamps.slug }).from(eyeCamps).where(eq(eyeCamps.id, rowId));
        if (!old) return { ok: false, errors: { form: "This camp no longer exists." } };
        slug = old.slug; // the address stays the same, so shared links keep working
      } else {
        rowId = randomUUID();
        slug = campSlug(f.title, f.day);
        const [clash] = await tx.select({ id: eyeCamps.id }).from(eyeCamps).where(and(eq(eyeCamps.slug, slug), ne(eyeCamps.id, rowId)));
        if (clash) return { ok: false, errors: { title: "There's already a camp with this name on this day." } };
      }
      const values = {
        title: f.title, day: f.day, starts: f.starts, ends: f.ends, branchId, place: f.place, organisedWith: f.organisedWith,
        description: f.description, offered: f.offered, people: f.people, isVisible: f.isVisible, updatedBy: staff.id, updatedAt: new Date(),
      };
      if (campId) await tx.update(eyeCamps).set(values).where(eq(eyeCamps.id, rowId));
      else await tx.insert(eyeCamps).values({ ...values, id: rowId, slug, createdBy: staff.id });

      // Photos: keep the ones still listed, add the new files, store the final order
      const old = await tx.select({ id: campPhotos.id, path: campPhotos.path }).from(campPhotos).where(eq(campPhotos.campId, rowId));
      const rows: { path: string; showsPeople: boolean; consent: boolean }[] = [];
      for (const p of meta) {
        if (p.key.startsWith("existing:")) {
          const hit = old.find((o) => o.id === p.key.slice(9));
          if (hit) rows.push({ path: hit.path, showsPeople: p.showsPeople, consent: p.consent });
        } else if (p.key.startsWith("new:")) {
          const file = files[Number(p.key.slice(4))];
          if (!file) continue;
          const path = await saveUpload(staff, "camps", rowId, file);
          uploaded.push(path);
          rows.push({ path, showsPeople: p.showsPeople, consent: p.consent });
        }
      }
      await tx.delete(campPhotos).where(eq(campPhotos.campId, rowId));
      if (rows.length) await tx.insert(campPhotos).values(rows.map((r, position) => ({ ...r, campId: rowId!, position, createdBy: staff.id, updatedBy: staff.id })));
      const dropped = old.filter((o) => !rows.some((r) => r.path === o.path)).map((o) => o.path);
      return { ok: true, slug, dropped };
    }, staff.id);
    if (!result.ok) {
      for (const p of uploaded) await deleteUpload(staff, p);
      return { ok: false, errors: result.errors };
    }
    for (const p of result.dropped) await deleteUpload(staff, p); // after the database agreed
    refresh();
    return { ok: true, slug: result.slug };
  } catch (e) {
    for (const p of uploaded) await deleteUpload(staff, p);
    if (e instanceof UploadError) return { ok: false, errors: { photos: e.message } };
    throw e;
  }
}

/** Admin only: delete a camp and its photo files for good. */
export async function deleteCamp(campId: string): Promise<{ ok: boolean }> {
  const staff = await requireStaff();
  if (staff.role !== "admin") return { ok: false };
  const cid = id.parse(campId);
  const paths = await withRole(staff.role, async (tx) => {
    const photos = await tx.select({ path: campPhotos.path }).from(campPhotos).where(eq(campPhotos.campId, cid));
    await tx.delete(eyeCamps).where(eq(eyeCamps.id, cid)); // photos go with it (cascade)
    return photos.map((p) => p.path);
  }, staff.id);
  for (const p of paths) await deleteUpload(staff, p);
  refresh();
  return { ok: true };
}
