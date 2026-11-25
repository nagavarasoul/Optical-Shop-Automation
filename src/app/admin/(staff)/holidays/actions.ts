"use server";

/* Branch holidays (Requirements_Admin.md settings): days a branch is closed.
   Only an admin adds or removes them (the database refuses staff too). The
   booking form and Contact read them at once (cache tag "branches"). */
import { and, eq, isNull, ne, or, sql } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { appointments, branchClosures, branches } from "@/db/schema";
import { fieldErrors } from "@/lib/booking-rules";
import { closureFields } from "@/lib/branch-rules";
import { withRole } from "@/lib/db";
import { requireStaff } from "@/lib/session";

/** `bookings`: how many bookings already stand on that day, so the admin can call them. */
export type ClosureResult = { ok: true; bookings: number } | { ok: false; errors: Record<string, string> };
const id = z.uuid();

function refresh() {
  updateTag("branches");
  revalidatePath("/admin", "layout");
}

export async function addClosure(fd: FormData): Promise<ClosureResult> {
  const staff = await requireStaff();
  if (staff.role !== "admin") return { ok: false, errors: { form: "Only an admin can change branch holidays." } };
  const parsed = closureFields.safeParse({ day: String(fd.get("day") ?? ""), branch: String(fd.get("branch") ?? ""), note: String(fd.get("note") ?? "") });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const f = parsed.data;
  try {
    const result = await withRole(staff.role, async (tx): Promise<ClosureResult> => {
      const branchId = f.branch ? (await tx.select({ id: branches.id }).from(branches).where(eq(branches.slug, f.branch)))[0]?.id : null;
      if (f.branch && !branchId) return { ok: false, errors: { branch: "Choose a branch." } };
      // Closing both branches clashes with a day already closed for one of them, and the other way round
      const [clash] = await tx.select({ id: branchClosures.id }).from(branchClosures)
        .where(and(eq(branchClosures.day, f.day), branchId ? or(isNull(branchClosures.branchId), eq(branchClosures.branchId, branchId)) : undefined));
      if (clash) return { ok: false, errors: { day: "That day is already closed for this branch." } };
      await tx.insert(branchClosures).values({ day: f.day, branchId: branchId ?? null, note: f.note, createdBy: staff.id, updatedBy: staff.id });
      const [n] = await tx.select({ n: sql<number>`count(*)::int` }).from(appointments)
        .where(and(eq(appointments.day, f.day), ne(appointments.status, "cancelled"), branchId ? eq(appointments.branchId, branchId) : undefined));
      return { ok: true, bookings: n.n };
    }, staff.id);
    if (result.ok) refresh();
    return result;
  } catch (e) {
    const clash = (e as { cause?: { code?: string }; code?: string }).cause?.code === "23505" || (e as { code?: string }).code === "23505";
    if (clash) return { ok: false, errors: { day: "That day is already closed for this branch." } };
    throw e;
  }
}

/** Admin only: open the branch again on that day. */
export async function deleteClosure(closureId: string): Promise<{ ok: boolean }> {
  const staff = await requireStaff();
  if (staff.role !== "admin") return { ok: false };
  const cid = id.parse(closureId);
  await withRole(staff.role, (tx) => tx.delete(branchClosures).where(eq(branchClosures.id, cid)), staff.id);
  refresh();
  return { ok: true };
}
