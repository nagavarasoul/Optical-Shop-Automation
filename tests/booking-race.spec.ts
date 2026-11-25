/* Booking safety in the database (Requirements_Booking.md 3, 6 and 8.5–8.6):
   two people racing for the last place at once get one booking and one "full";
   the public role saves without being able to read anything back. Runs the
   site's own placeBooking on two real connections as the public role. */
import { expect, test } from "@playwright/test";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/db/schema";
import { placeBooking, type NewBooking } from "../src/lib/booking-core";
import type { Tx } from "../src/lib/db";
import { connect } from "./helpers";

const NAME = `E2E Race ${Date.now()}`;
let branchId = "";
let day = "";

test.beforeAll(async () => {
  const c = await connect("owner");
  await c.query("select set_config('app.role', 'admin', false)");
  branchId = (await c.query("select id from branches where slug = 'indresham'")).rows[0].id;
  day = (await c.query("select (current_date + 5)::text d")).rows[0].d;
  // One place already taken: one left in the 10:00 slot
  await c.query(`insert into appointments (reference, branch_id, day, slot_start, name, phone, consent_at)
                 values ('E2E-' || substr(md5(random()::text), 1, 6), $1, $2, '10:00', $3, '9000000001', now())`, [branchId, day, NAME]);
  await c.end();
});

test.afterAll(async () => {
  const c = await connect("owner");
  await c.query("select set_config('app.role', 'admin', false)");
  await c.query("delete from appointments where name like 'E2E Race %'");
  await c.end();
});

async function asPublic(fn: (tx: Tx) => Promise<unknown>) {
  const c = await connect("app");
  const db = drizzle(c, { schema });
  try {
    return await db.transaction(async (tx) => {
      await tx.execute(sql`select set_config('app.role', 'public', true)`);
      return fn(tx as unknown as Tx);
    });
  } finally {
    await c.end();
  }
}

test("two bookings for the last place at the same moment: one succeeds, one is told it's full", async () => {
  const b = (n: number): NewBooking => ({ branchId, day, time: "10:00", name: NAME, phone: `900000000${n}`, forWhom: "myself", address: null, note: null });
  const results = await Promise.all([asPublic((tx) => placeBooking(tx, b(2))), asPublic((tx) => placeBooking(tx, b(3)))]);
  const ok = results.filter((r) => (r as { ok: boolean }).ok);
  expect(ok, JSON.stringify(results)).toHaveLength(1);
  expect(results.filter((r) => (r as { full?: boolean }).full)).toHaveLength(1);

  const c = await connect("owner");
  await c.query("select set_config('app.role', 'admin', false)");
  const n = (await c.query("select count(*)::int n from appointments where branch_id = $1 and day = $2 and slot_start = '10:00' and name = $3", [branchId, day, NAME])).rows[0].n;
  await c.end();
  expect(n, "never more than 2 in a slot").toBe(2);
});

test("the public role saves a booking but can't read any back, and slot counts carry no personal data", async () => {
  await asPublic(async (tx) => {
    const r = await placeBooking(tx, { branchId, day, time: "11:00", name: NAME, phone: "9000000004", forWhom: "someone_else", address: "E2E area", note: "E2E note" });
    expect((r as { ok: boolean }).ok).toBe(true);
    const seen = await tx.execute(sql`select count(*)::int n from appointments`);
    expect((seen.rows[0] as { n: number }).n, "public reads nothing").toBe(0);
    const counts = await tx.execute(sql`select * from slot_counts(${branchId}::uuid, ${day}::date)`);
    expect(counts.fields.map((f) => f.name).sort()).toEqual(["booked", "slot_start"]);
    expect(JSON.stringify(counts.rows)).not.toContain("9000000004");
  });
});
