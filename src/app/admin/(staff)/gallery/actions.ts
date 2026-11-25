"use server";

/* Staff gallery (Requirements_Admin.md 7, Requirements_Gallery.md 2): upload
   photos with a tag, caption, branch and month; show / hide; only an admin
   deletes. A photo that shows people needs the permission tick (checked here
   and by the database), and Customers stays blocked until Q146 is confirmed. */
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { galleryPhotos } from "@/db/schema";
import { fieldErrors } from "@/lib/booking-rules";
import { withRole } from "@/lib/db";
import { galleryPhotoFields, MAX_GALLERY_UPLOAD } from "@/lib/gallery-rules";
import { requireStaff } from "@/lib/session";
import { deleteUpload, saveUpload, UploadError } from "@/lib/storage";

export type GalleryResult = { ok: true; added: number } | { ok: false; errors: Record<string, string> };
const id = z.uuid();

function refresh() {
  updateTag("content");
  revalidatePath("/admin", "layout");
}

export async function uploadGalleryPhotos(fd: FormData): Promise<GalleryResult> {
  const staff = await requireStaff();
  const files = fd.getAll("photos").filter((x): x is File => x instanceof Blob && x.size > 0);
  let meta: unknown[] = [];
  try { meta = JSON.parse(String(fd.get("meta") ?? "[]")); } catch { /* checked below */ }
  if (!files.length || files.length !== meta.length) return { ok: false, errors: { form: "Choose at least one photo." } };
  if (files.length > MAX_GALLERY_UPLOAD) return { ok: false, errors: { form: `Up to ${MAX_GALLERY_UPLOAD} photos at a time.` } };
  const rows: z.infer<typeof galleryPhotoFields>[] = [];
  for (const [i, m] of meta.entries()) {
    const r = galleryPhotoFields.safeParse(m);
    if (!r.success) {
      const errs = fieldErrors(r.error);
      return { ok: false, errors: Object.fromEntries(Object.entries(errs).map(([k, v]) => [`${i}.${k}`, v])) };
    }
    rows.push(r.data);
  }

  const uploaded: string[] = [];
  try {
    await withRole(staff.role, async (tx) => {
      for (const [i, r] of rows.entries()) {
        const photoId = randomUUID();
        const path = await saveUpload(staff, "gallery", photoId, files[i]);
        uploaded.push(path);
        await tx.insert(galleryPhotos).values({
          id: photoId, path, tag: r.tag, caption: r.caption, branch: r.branch, month: r.month,
          showsPeople: r.showsPeople, consent: r.consent, createdBy: staff.id, updatedBy: staff.id,
        });
      }
    }, staff.id);
  } catch (e) {
    for (const p of uploaded) await deleteUpload(staff, p);
    if (e instanceof UploadError) return { ok: false, errors: { form: e.message } };
    throw e;
  }
  refresh();
  return { ok: true, added: rows.length };
}

/** Show or hide a photo on the site (staff and admin). */
export async function setGalleryVisible(photoId: string, visible: boolean) {
  const staff = await requireStaff();
  const pid = id.parse(photoId);
  await withRole(staff.role, (tx) => tx.update(galleryPhotos).set({ isVisible: !!visible, updatedBy: staff.id, updatedAt: new Date() }).where(eq(galleryPhotos.id, pid)), staff.id);
  refresh();
}

/** Admin only: delete a photo and its file for good. */
export async function deleteGalleryPhoto(photoId: string): Promise<{ ok: boolean }> {
  const staff = await requireStaff();
  if (staff.role !== "admin") return { ok: false };
  const pid = id.parse(photoId);
  const path = await withRole(staff.role, async (tx) => {
    const [row] = await tx.delete(galleryPhotos).where(eq(galleryPhotos.id, pid)).returning({ path: galleryPhotos.path });
    return row?.path ?? null;
  }, staff.id);
  if (path) await deleteUpload(staff, path);
  refresh();
  return { ok: true };
}
