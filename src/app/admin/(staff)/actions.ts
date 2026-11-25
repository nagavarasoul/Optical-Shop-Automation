"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { appointments, enquiries, frames } from "@/db/schema";
import { BRANCH_COOKIE, branchSlugs } from "@/lib/admin-branch";
import { withRole } from "@/lib/db";
import { requireStaff } from "@/lib/session";

/* Staff-area actions for the shell, dashboard and frames list. Every one checks
   the signed-in staff member first and runs with their role, so row-level
   security has the last word (a staff request to delete or approve is refused
   by the database even if the UI were bypassed). */

/** Admin only: which branch the sidebar and dashboard show. */
export async function setWorkingBranch(slug: string) {
  const staff = await requireStaff();
  if (staff.role !== "admin" || !branchSlugs.includes(slug)) return;
  (await cookies()).set(BRANCH_COOKIE, slug, { httpOnly: true, sameSite: "lax", path: "/admin", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/admin", "layout");
}

const id = z.uuid();

/** One-tap Sold out / In stock (Requirements_Admin.md 6.3). The public site updates straight away. */
export async function toggleSoldOut(frameId: string) {
  const staff = await requireStaff();
  const fid = id.parse(frameId);
  await withRole(staff.role, async (tx) => {
    const [f] = await tx.select({ availability: frames.availability }).from(frames).where(eq(frames.id, fid));
    if (!f) return;
    await tx.update(frames)
      .set({ availability: f.availability === "sold_out" ? "in_stock" : "sold_out", updatedBy: staff.id, updatedAt: new Date() })
      .where(eq(frames.id, fid));
  }, staff.id);
  updateTag("catalogue");
  revalidatePath("/admin", "layout");
}

const bookingStatus = z.enum(["booked", "attended", "no_show", "cancelled"]);

/** Today's bookings: Attended / No-show / Cancelled. */
export async function setBookingStatus(appointmentId: string, status: string) {
  const staff = await requireStaff();
  const aid = id.parse(appointmentId), s = bookingStatus.parse(status);
  await withRole(staff.role, (tx) =>
    tx.update(appointments).set({ status: s, updatedBy: staff.id, updatedAt: new Date() })
      .where(and(eq(appointments.id, aid))), staff.id);
  revalidatePath("/admin", "layout");
}

const enquiryStatus = z.enum(["new", "replied", "closed"]);

/** Enquiries: New / Replied / Closed. */
export async function setEnquiryStatus(enquiryId: string, status: string) {
  const staff = await requireStaff();
  const eid = id.parse(enquiryId), s = enquiryStatus.parse(status);
  await withRole(staff.role, (tx) =>
    tx.update(enquiries).set({ status: s, updatedBy: staff.id, updatedAt: new Date() }).where(eq(enquiries.id, eid)), staff.id);
  revalidatePath("/admin", "layout");
}

/** Admin only: delete a booking or an enquiry for good (the database refuses staff anyway). */
export async function deleteCustomerRow(kind: "booking" | "enquiry", rowId: string) {
  const staff = await requireStaff();
  if (staff.role !== "admin") return { ok: false as const };
  const rid = id.parse(rowId);
  await withRole(staff.role, (tx) =>
    kind === "booking" ? tx.delete(appointments).where(eq(appointments.id, rid)) : tx.delete(enquiries).where(eq(enquiries.id, rid)), staff.id);
  revalidatePath("/admin", "layout");
  return { ok: true as const };
}
