"use server";

/* Staff testimonials (Requirements_Admin.md 7): a real customer's first name,
   branch, words and the date they agreed to be quoted. Never invented reviews,
   so the agreed date is required. Staff add, edit and hide; only an admin deletes. */
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { branches, testimonials } from "@/db/schema";
import { fieldErrors } from "@/lib/booking-rules";
import { withRole } from "@/lib/db";
import { testimonialFields } from "@/lib/gallery-rules";
import { requireStaff } from "@/lib/session";

export type TestimonialResult = { ok: true } | { ok: false; errors: Record<string, string> };
const id = z.uuid();

function refresh() {
  updateTag("content");
  revalidatePath("/admin", "layout");
}

export async function saveTestimonial(fd: FormData): Promise<TestimonialResult> {
  const staff = await requireStaff();
  const rowId = fd.get("id") ? id.safeParse(String(fd.get("id"))) : null;
  if (rowId && !rowId.success) return { ok: false, errors: { form: "This testimonial no longer exists." } };
  const parsed = testimonialFields.safeParse({
    firstName: String(fd.get("firstName") ?? ""), branch: String(fd.get("branch") ?? ""), quote: String(fd.get("quote") ?? ""),
    agreedOn: String(fd.get("agreedOn") ?? ""), isVisible: fd.get("isVisible") === "yes",
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const f = parsed.data;
  return withRole(staff.role, async (tx): Promise<TestimonialResult> => {
    const branchId = f.branch ? (await tx.select({ id: branches.id }).from(branches).where(eq(branches.slug, f.branch)))[0]?.id ?? null : null;
    const values = { firstName: f.firstName, branchId, quote: f.quote, agreedOn: f.agreedOn, isVisible: f.isVisible, updatedBy: staff.id, updatedAt: new Date() };
    if (rowId) {
      const done = await tx.update(testimonials).set(values).where(eq(testimonials.id, rowId.data)).returning({ id: testimonials.id });
      if (!done.length) return { ok: false, errors: { form: "This testimonial no longer exists." } };
    } else await tx.insert(testimonials).values({ ...values, id: randomUUID(), createdBy: staff.id });
    refresh();
    return { ok: true };
  }, staff.id);
}

/** Admin only: delete a testimonial for good. */
export async function deleteTestimonial(testimonialId: string): Promise<{ ok: boolean }> {
  const staff = await requireStaff();
  if (staff.role !== "admin") return { ok: false };
  const tid = id.parse(testimonialId);
  await withRole(staff.role, (tx) => tx.delete(testimonials).where(eq(testimonials.id, tid)), staff.id);
  refresh();
  return { ok: true };
}
