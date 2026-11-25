"use server";

/* Book an eye test (Requirements_Booking.md 2–6). Both actions run with the
   public role: getSlots returns counts only, and bookEyeTest can insert a
   booking but never read one back. Every rule is checked here again, whatever
   the browser sent. */
import { and, eq, isNull, or } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { branchClosures, branches } from "@/db/schema";
import { placeBooking } from "@/lib/booking-core";
import { bookingFields, fieldErrors, isDay, isOffered, newReference, slotsFor, type DaySlots } from "@/lib/booking-rules";
import { withRole, type Tx } from "@/lib/db";
import { purgeExpired } from "@/lib/retention";
import { looksLikeSpam, withinLimit } from "@/lib/form-guard";

async function daySlots(tx: Tx, branchSlug: string, day: string): Promise<{ branchId: string; result: DaySlots } | null> {
  const [b] = await tx.select({ id: branches.id, opens: branches.opens, closes: branches.closes, openDays: branches.openDays })
    .from(branches).where(and(eq(branches.slug, branchSlug), eq(branches.isVisible, true)));
  if (!b) return null;
  const closed = await tx.select({ day: branchClosures.day }).from(branchClosures)
    .where(and(eq(branchClosures.day, day), or(eq(branchClosures.branchId, b.id), isNull(branchClosures.branchId))));
  const counts = await tx.execute(sql`select to_char(slot_start, 'HH24:MI') as t, booked from slot_counts(${b.id}::uuid, ${day}::date)`);
  const booked = Object.fromEntries((counts.rows as { t: string; booked: number }[]).map((r) => [r.t, Number(r.booked)]));
  const result = slotsFor(day, { opens: b.opens.slice(0, 5), closes: b.closes.slice(0, 5), openDays: b.openDays }, closed.map((c) => c.day), booked);
  return { branchId: b.id, result };
}

/** The slots of a branch on a day, with full ones marked. Counts only: never who booked. */
export async function getSlots(branchSlug: string, day: string): Promise<DaySlots> {
  if (typeof branchSlug !== "string" || typeof day !== "string" || !/^[a-z0-9-]{1,40}$/.test(branchSlug) || !isDay(day)) return { state: "outside" };
  const r = await withRole("public", (tx) => daySlots(tx, branchSlug, day));
  return r?.result ?? { state: "outside" };
}

export type BookingResult =
  | { ok: true; ref: string }
  | { ok: false; errors: Record<string, string> }
  | { ok: false; full: string }
  | { ok: false; limited: true }
  | { ok: false; failed: true };

export async function bookEyeTest(fd: FormData): Promise<BookingResult> {
  // A bot gets a convincing "done" and nothing is saved
  if (looksLikeSpam(fd)) return { ok: true, ref: newReference() };
  if (!(await withinLimit("booking"))) return { ok: false, limited: true };

  const parsed = bookingFields.safeParse(Object.fromEntries(["branch", "day", "time", "name", "phone", "forWhom", "address", "note", "consent"].map((k) => [k, String(fd.get(k) ?? "")])));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const f = parsed.data;

  try {
    return await withRole("public", async (tx): Promise<BookingResult> => {
      const slots = await daySlots(tx, f.branch, f.day);
      if (!slots) return { ok: false, errors: { branch: "Choose a branch" } };
      if (slots.result.state !== "open") return { ok: false, errors: { day: "Choose another day: there are no times left on this one" } };
      if (!slots.result.slots.some((s) => s.time === f.time)) return { ok: false, errors: { time: "Choose one of the times shown" } };
      if (!isOffered(slots.result, f.time)) return { ok: false, full: f.time };
      const r = await placeBooking(tx, {
        branchId: slots.branchId, day: f.day, time: f.time, name: f.name, phone: f.phone,
        forWhom: f.forWhom, address: f.address, note: f.note,
      });
      if (r.ok) await purgeExpired(tx);
      return r.ok ? r : { ok: false, full: f.time };
    });
  } catch (e) {
    console.error("Booking could not be saved", e instanceof Error ? e.message : e);
    return { ok: false, failed: true };
  }
}
