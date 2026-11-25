"use server";

/* Saving frames and sunglasses (Requirements_Admin.md 6.1–6.3). Every action
   checks the signed-in staff member, re-validates with the shared Zod rules,
   and runs with their role: the database refuses approval or deletion by staff
   (db/security.sql) even if this code were bypassed. Every change refreshes the
   public menus and listings at once (updateTag("catalogue")). */
import { randomUUID } from "node:crypto";
import { and, eq, ilike, ne, sql } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { brands, colours, frameImages, frames } from "@/db/schema";
import { withRole } from "@/lib/db";
import { fieldErrors, frameFields, frameSlug, intentProblems, INTENTS, type Intent } from "@/lib/frame-schema";
import { requireStaff, type Staff } from "@/lib/session";
import { findOrAdd } from "@/lib/lookups";
import { deleteUpload, saveUpload, UploadError } from "@/lib/storage";

export type SaveResult =
  | { ok: true; code: string; status: string; message: string }
  | { ok: false; errors: Record<string, string> };

type Status = "draft" | "waiting" | "sent_back" | "approved";
const fail = (errors: Record<string, string>) => ({ ok: false as const, errors });

/** Which buttons a person may press for a frame in this state (mirrors the form's action bar). */
function allowed(staff: Staff, current: Status | null): Intent[] {
  const admin = staff.role === "admin";
  if (current === "approved") return ["save"];
  if (current === "waiting") return admin ? ["approve", "sendback", "save"] : ["save"];
  return admin ? ["draft", "publish"] : ["draft", "send"]; // new, draft or sent back
}

export async function saveFrame(formData: FormData): Promise<SaveResult> {
  const staff = await requireStaff();
  const intent = String(formData.get("intent")) as Intent;
  if (!INTENTS.includes(intent)) return { ok: false, errors: { form: "Unknown action." } };
  const frameId = String(formData.get("id") || "") || null;
  const note = String(formData.get("note") ?? "").trim();

  let raw: unknown;
  try { raw = JSON.parse(String(formData.get("fields"))); } catch { return { ok: false, errors: { form: "The form couldn't be read. Reload and try again." } }; }
  const parsed = frameFields.safeParse(raw);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const f = parsed.data;
  const problems = intentProblems(intent, f);
  if (intent === "sendback" && !note) problems.note = "Say what to fix, so they know what to change.";
  if (intent === "sendback" && note.length > 300) problems.note = "Keep the note under 300 characters.";
  if (Object.keys(problems).length) return { ok: false, errors: problems };

  // New photo files, in the order the form lists them as "new:<n>"
  const files = formData.getAll("newPhotos").filter((x): x is File => x instanceof File);
  const uploaded: string[] = []; // removed again if the save fails, so no orphan files

  try {
    const result = await withRole(staff.role, async (tx) => {
      const [existing] = frameId
        ? await tx.select({ id: frames.id, status: frames.status, createdBy: frames.createdBy }).from(frames).where(eq(frames.id, frameId))
        : [];
      if (frameId && !existing) return fail({ form: "This frame no longer exists." });
      const current = (existing?.status ?? null) as Status | null;
      if (!allowed(staff, current).includes(intent)) return fail({ form: "You can't do that for this frame." });

      const [clash] = await tx.select({ id: frames.id }).from(frames)
        .where(frameId ? and(eq(frames.code, f.code), ne(frames.id, frameId)) : eq(frames.code, f.code));
      if (clash) return { ok: false as const, errors: { code: `Code ${f.code} is already used by another frame.` } };

      const brandId = await findOrAdd(tx, brands, f.brand, staff.id);
      const colourId = await findOrAdd(tx, colours, f.colour, staff.id);
      const nextStatus: Status =
        intent === "draft" ? "draft"
        : intent === "send" ? "waiting"
        : intent === "sendback" ? "sent_back"
        : intent === "publish" || intent === "approve" ? "approved"
        : (current ?? "draft"); // "save" keeps the status
      const sun = f.category === "sunglasses";
      const values = {
        code: f.code, slug: frameSlug(f.brand, f.model, f.code), brandId, model: f.model, category: f.category,
        gender: f.gender, colourId, shape: f.shape, material: f.material,
        sizeLens: f.sizeLens, sizeBridge: f.sizeBridge, sizeTemple: f.sizeTemple,
        lensTypes: sun ? f.lensTypes : null, lensColour: sun ? f.lensColour : null,
        price: f.price, availability: f.availability, availableAt: f.availableAt, isActive: f.isActive,
        status: nextStatus,
        reviewNote: intent === "sendback" ? note : nextStatus === "sent_back" ? undefined : null,
        updatedBy: staff.id, updatedAt: new Date(),
        ...(nextStatus === "approved" && current !== "approved" ? { approvedBy: staff.id, approvedAt: new Date() } : {}),
      };

      let id = frameId;
      if (id) await tx.update(frames).set(values).where(eq(frames.id, id));
      else [{ id }] = await tx.insert(frames).values({ ...values, id: randomUUID(), createdBy: staff.id }).returning({ id: frames.id });

      // Photos: keep the ones still listed, add the new files, store the final order
      const old = await tx.select({ id: frameImages.id, path: frameImages.path }).from(frameImages).where(eq(frameImages.frameId, id!));
      const rows: { path: string; kind: "front" | "side" | "closeup" | "model"; consent: boolean }[] = [];
      for (const p of f.photos) {
        if (p.key.startsWith("existing:")) {
          const hit = old.find((o) => o.id === p.key.slice(9));
          if (hit) rows.push({ path: hit.path, kind: p.kind, consent: p.consent });
        } else {
          const file = files[Number(p.key.slice(4))];
          if (!file) continue;
          const path = await saveUpload(staff, "frames", id!, file);
          uploaded.push(path);
          rows.push({ path, kind: p.kind, consent: p.consent });
        }
      }
      await tx.delete(frameImages).where(eq(frameImages.frameId, id!));
      if (rows.length) {
        await tx.insert(frameImages).values(rows.map((r, position) => ({ ...r, frameId: id!, position, createdBy: staff.id, updatedBy: staff.id })));
      }
      const dropped = old.filter((o) => !rows.some((r) => r.path === o.path)).map((o) => o.path);
      return { ok: true as const, id: id!, status: nextStatus, dropped };
    }, staff.id);

    if (!result.ok) {
      for (const p of uploaded) await deleteUpload(staff, p);
      return { ok: false, errors: result.errors };
    }
    for (const p of result.dropped) await deleteUpload(staff, p); // after the database agreed
    updateTag("catalogue");
    revalidatePath("/admin", "layout");
    const message = {
      draft: "Saved as draft. It isn't on the site. Finish it and send it for approval when you're ready.",
      waiting: "Sent for approval. An admin will check it; you'll see it on your dashboard if it's sent back.",
      sent_back: "Sent back with your note. They'll see it on their dashboard.",
      approved: "It's on the site now.",
    }[result.status];
    return { ok: true, code: f.code, status: result.status, message };
  } catch (e) {
    for (const p of uploaded) await deleteUpload(staff, p);
    if (e instanceof UploadError) return { ok: false, errors: { photos: e.message } };
    if (e instanceof Error && /Only an admin/.test(e.message)) return { ok: false, errors: { form: "Only an admin can approve a frame." } };
    throw e;
  }
}

/** Live check while typing the code: "Code already used by …". */
export async function checkCode(code: string, excludeId?: string): Promise<string | null> {
  const staff = await requireStaff();
  const c = code.trim().toUpperCase();
  if (!/^[A-Z]{2,4}-\d{3,5}$/.test(c)) return null;
  const hit = await withRole(staff.role, (tx) =>
    tx.select({ brand: brands.name, model: frames.model }).from(frames).innerJoin(brands, eq(brands.id, frames.brandId))
      .where(excludeId ? and(eq(frames.code, c), ne(frames.id, excludeId)) : eq(frames.code, c)), staff.id);
  return hit[0] ? `Code already used by ${hit[0].brand} ${hit[0].model}.` : null;
}

/** Staff: take a frame off the site straight away (only an admin deletes). */
export async function hideFrame(frameId: string): Promise<void> {
  const staff = await requireStaff();
  await withRole(staff.role, (tx) =>
    tx.update(frames).set({ isActive: false, updatedBy: staff.id, updatedAt: new Date() }).where(eq(frames.id, frameId)), staff.id);
  updateTag("catalogue");
  revalidatePath("/admin", "layout");
}

/** Admin only: delete a frame and its photo files for good. */
export async function deleteFrame(frameId: string): Promise<{ ok: boolean }> {
  const staff = await requireStaff();
  if (staff.role !== "admin") return { ok: false };
  const { deleted, paths } = await withRole(staff.role, async (tx) => {
    const imgs = await tx.select({ path: frameImages.path }).from(frameImages).where(eq(frameImages.frameId, frameId));
    const gone = await tx.delete(frames).where(eq(frames.id, frameId)).returning({ id: frames.id }); // photos cascade
    return { deleted: gone.length > 0, paths: gone.length ? imgs.map((i) => i.path) : [] };
  }, staff.id);
  for (const p of paths) await deleteUpload(staff, p);
  updateTag("catalogue");
  revalidatePath("/admin", "layout");
  return { ok: deleted };
}

/** For "Add another frame": the next free code with the same prefix, e.g. VSF-1032. */
export async function suggestCode(prefix: string): Promise<string> {
  const staff = await requireStaff();
  const p = /^[A-Z]{2,4}$/.test(prefix) ? prefix : "VSF";
  const [r] = await withRole(staff.role, (tx) =>
    tx.select({ max: sql<number | null>`max(nullif(regexp_replace(${frames.code}, '^[A-Z]+-', ''), '')::int)` })
      .from(frames).where(ilike(frames.code, `${p}-%`)), staff.id);
  return `${p}-${(r?.max ?? 1000) + 1}`;
}
