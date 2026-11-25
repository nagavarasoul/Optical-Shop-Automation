/* Saving a booking (Requirements_Booking.md 3 and 6). A plain function taking
   a transaction that runs with the public role, so tests can race it directly;
   the server action (src/app/(site)/book-eye-test/actions.ts) wraps it.
   - A per-slot lock means two people can't take the last place at once: the
     second waits, then sees the slot full.
   - The public role may insert but never read appointments, so the count comes
     from slot_counts() (counts only) and the row is inserted without RETURNING. */
import { sql } from "drizzle-orm";
import { appointments } from "../db/schema";
import type { Tx } from "./db";
import { BOOKING, newReference } from "./booking-rules";

export type NewBooking = {
  branchId: string; day: string; time: string; name: string; phone: string;
  forWhom: string; address: string | null; note: string | null;
};

export async function placeBooking(tx: Tx, b: NewBooking): Promise<{ ok: true; ref: string } | { ok: false; full: true }> {
  await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`appointment|${b.branchId}|${b.day}|${b.time}`}, 0))`);
  const r = await tx.execute(sql`select coalesce(sum(booked), 0)::int as n from slot_counts(${b.branchId}::uuid, ${b.day}::date) where slot_start = ${b.time}::time`);
  if (Number((r.rows[0] as { n: number }).n) >= BOOKING.capacity) return { ok: false, full: true };

  // A clash with an existing reference is rare; try another inside a savepoint
  for (let attempt = 0; ; attempt++) {
    const ref = newReference();
    try {
      await tx.transaction(async (sp) => {
        await sp.insert(appointments).values({
          reference: ref, branchId: b.branchId, day: b.day, slotStart: b.time, name: b.name, phone: b.phone,
          forWhom: b.forWhom, address: b.address, note: b.note, consentAt: new Date(),
        });
      });
      return { ok: true, ref };
    } catch (e) {
      const clash = (e as { cause?: { code?: string }; code?: string }).cause?.code === "23505" || (e as { code?: string }).code === "23505";
      if (!clash || attempt >= 4) throw e;
    }
  }
}
