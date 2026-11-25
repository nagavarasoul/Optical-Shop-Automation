"use server";

/* Staff lenses (Requirements_Admin.md 7, Requirements_Lenses.md 2): add, edit,
   hide; only an admin deletes. No approval step. Each save refreshes the
   public Lenses page and the menu's lens brands straight away. */
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { brands, lenses } from "@/db/schema";
import { fieldErrors } from "@/lib/booking-rules";
import { withRole } from "@/lib/db";
import { lensFields } from "@/lib/lens-rules";
import { findOrAdd } from "@/lib/lookups";
import { requireStaff } from "@/lib/session";
import { deleteUpload, saveUpload, UploadError } from "@/lib/storage";

export type LensResult = { ok: true; id: string } | { ok: false; errors: Record<string, string> };
const id = z.uuid();

function refresh() {
  updateTag("content");
  updateTag("catalogue"); // the Lenses mega menu lists lens brands
  revalidatePath("/admin", "layout");
}

export async function saveLens(fd: FormData): Promise<LensResult> {
  const staff = await requireStaff();
  const lensId = fd.get("id") ? id.safeParse(String(fd.get("id"))) : null;
  if (lensId && !lensId.success) return { ok: false, errors: { form: "This lens no longer exists." } };
  const parsed = lensFields.safeParse({
    brand: String(fd.get("brand") ?? ""), name: String(fd.get("name") ?? ""), type: String(fd.get("type") ?? ""),
    features: fd.getAll("features").map(String), price: String(fd.get("price") ?? ""), isActive: fd.get("isActive") === "yes",
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const f = parsed.data;
  const photo = fd.get("photo");
  const keepPhoto = fd.get("keepPhoto") === "yes";
  let uploaded: string | null = null;

  try {
    const result = await withRole(staff.role, async (tx) => {
      const brandId = await findOrAdd(tx, brands, f.brand, staff.id, true);
      let rowId = lensId?.data;
      let oldPhoto: string | null = null;
      if (rowId) {
        const [old] = await tx.select({ photo: lenses.photoPath }).from(lenses).where(eq(lenses.id, rowId));
        if (!old) return { ok: false as const, errors: { form: "This lens no longer exists." } };
        oldPhoto = old.photo;
      } else rowId = randomUUID();
      if (photo instanceof Blob && photo.size > 0) uploaded = await saveUpload(staff, "lenses", rowId, photo);
      const photoPath = uploaded ?? (keepPhoto ? oldPhoto : null);
      const values = { brandId, name: f.name, type: f.type, features: f.features, price: f.price, isActive: f.isActive, photoPath, updatedBy: staff.id, updatedAt: new Date() };
      if (lensId) await tx.update(lenses).set(values).where(eq(lenses.id, rowId));
      else await tx.insert(lenses).values({ ...values, id: rowId, createdBy: staff.id });
      return { ok: true as const, id: rowId, dropped: oldPhoto && oldPhoto !== photoPath ? oldPhoto : null };
    }, staff.id);
    if (!result.ok) {
      if (uploaded) await deleteUpload(staff, uploaded);
      return result;
    }
    if (result.dropped) await deleteUpload(staff, result.dropped); // after the database agreed
    refresh();
    return { ok: true, id: result.id };
  } catch (e) {
    if (uploaded) await deleteUpload(staff, uploaded);
    if (e instanceof UploadError) return { ok: false, errors: { photo: e.message } };
    throw e;
  }
}

/** Admin only: delete a lens and its photo for good (the database refuses staff anyway). */
export async function deleteLens(lensId: string): Promise<{ ok: boolean }> {
  const staff = await requireStaff();
  if (staff.role !== "admin") return { ok: false };
  const lid = id.parse(lensId);
  const photo = await withRole(staff.role, async (tx) => {
    const [row] = await tx.delete(lenses).where(eq(lenses.id, lid)).returning({ photo: lenses.photoPath });
    return row?.photo ?? null;
  }, staff.id);
  if (photo) await deleteUpload(staff, photo);
  refresh();
  return { ok: true };
}
