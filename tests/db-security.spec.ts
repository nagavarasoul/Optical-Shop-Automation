/* Database security (db/security.sql), tested as the website's own database
   user, vslm_app. Each test runs in a transaction that's rolled back: it makes
   its own rows as admin, switches to the role under test, checks, and leaves
   nothing behind. This is the Phase 4 "done when": a public request can't read
   any private table. */
import { expect, test } from "@playwright/test";
import type pg from "pg";
import { connect } from "./helpers";

type Fixture = { branch: string; approved: string; draft: string };

/** Runs `fn` as `role` in a rolled-back transaction, with fresh test rows. */
async function as(role: "public" | "staff" | "admin" | null, fn: (q: pg.Client, f: Fixture) => Promise<void>) {
  const c = await connect("app");
  try {
    await c.query("begin");
    await c.query("select set_config('app.role', 'admin', true)");
    const one = async (sql: string, v: unknown[] = []) => (await c.query(sql, v)).rows[0];
    const branch = (await one("select id from branches order by sort limit 1"))?.id
      ?? (await one("insert into branches (slug, name, address, phone, whatsapp, opens, closes) values ('t', 'T', 'Test address 1', '0', '0', '09:00', '21:00') returning id")).id;
    const brand = (await one("insert into brands (name) values ('E2E brand ' || gen_random_uuid()) returning id")).id;
    const colour = (await one("insert into colours (name) values ('E2E colour ' || gen_random_uuid()) returning id")).id;
    const frame = (code: string, status: string) => one(
      `insert into frames (code, slug, brand_id, model, category, gender, colour_id, shape, price, available_at, status)
       values ($1, lower($1), $2, 'E2E model', 'eyeglasses', 'unisex', $3, 'Round', 1500, 'both', $4) returning id`,
      [`E2E-${status}-${Math.random().toString(36).slice(2, 8)}`, brand, colour, status]);
    const approved = (await frame("a", "approved")).id;
    const draft = (await frame("d", "waiting")).id;
    await c.query(`insert into appointments (reference, branch_id, day, slot_start, name, phone, consent_at)
                   values ('E2E-' || gen_random_uuid(), $1, current_date + 1, '10:00', 'Private Person', '9000000000', now())`, [branch]);
    await c.query(`insert into enquiries (name, phone, topic, message, consent_at)
                   values ('Private Person', '9000000000', 'frames', 'A private message for staff only', now())`);
    await c.query("insert into gallery_photos (path, tag, caption, is_visible) values ('x', 'shop', 'E2E hidden', false)");
    // null = no role set at all
    await c.query("select set_config('app.role', $1, true)", [role ?? ""]);
    await fn(c, { branch, approved, draft });
  } finally {
    await c.query("rollback").catch(() => {});
    await c.end();
  }
}
const n = async (c: pg.Client, sql: string, v: unknown[] = []) => Number((await c.query(sql, v)).rows[0].n);
const affected = async (c: pg.Client, sql: string, v: unknown[] = []) => (await c.query(sql, v)).rowCount;

test.describe("every table is locked down", () => {
  test("row-level security is enabled and forced on every table", async () => {
    const c = await connect("app");
    const { rows } = await c.query(`select relname from pg_class where relnamespace = 'public'::regnamespace
      and relkind = 'r' and not (relrowsecurity and relforcerowsecurity)`);
    await c.end();
    expect(rows.map((r) => r.relname), "tables without forced RLS").toEqual([]);
  });

  test("the website's database user can't bypass security", async () => {
    const c = await connect("app");
    const { rows } = await c.query("select rolsuper, rolbypassrls, rolcreaterole from pg_roles where rolname = current_user");
    const owns = await n(c, "select count(*) n from pg_class where relowner = (select oid from pg_roles where rolname = current_user)");
    await c.end();
    expect(rows[0]).toEqual({ rolsuper: false, rolbypassrls: false, rolcreaterole: false });
    expect(owns, "tables owned by vslm_app").toBe(0);
  });
});

test.describe("public visitor", () => {
  test("sees approved frames but not drafts", () => as("public", async (c, f) => {
    expect(await n(c, "select count(*) n from frames where id = $1", [f.approved])).toBe(1);
    expect(await n(c, "select count(*) n from frames where id = $1", [f.draft])).toBe(0);
    expect(await n(c, "select count(*) n from frames where status <> 'approved'")).toBe(0);
  }));

  test("can't read any booking, message or hidden photo", () => as("public", async (c) => {
    expect(await n(c, "select count(*) n from appointments")).toBe(0);
    expect(await n(c, "select count(*) n from enquiries")).toBe(0);
    expect(await n(c, "select count(*) n from gallery_photos where not is_visible")).toBe(0);
  }));

  test("can add a booking but not read it back or change it", () => as("public", async (c, f) => {
    const insert = `insert into appointments (reference, branch_id, day, slot_start, name, phone, consent_at)
                    values ('E2E-' || gen_random_uuid(), $1, current_date + 1, '11:00', 'Test Person', '9000000001', now())`;
    expect(await affected(c, insert, [f.branch])).toBe(1);
    expect(await affected(c, "update appointments set status = 'attended'")).toBe(0);
    expect(await affected(c, "delete from appointments")).toBe(0);
    await expect(c.query(`${insert} returning name, phone`, [f.branch])).rejects.toThrow(/row-level security/);
  }));

  test("can send an enquiry but not read it back", () => as("public", async (c) => {
    expect(await affected(c, `insert into enquiries (name, phone, topic, message, consent_at)
      values ('Test Person', '9000000001', 'lenses', 'Do you have progressive lenses?', now())`)).toBe(1);
    expect(await n(c, "select count(*) n from enquiries")).toBe(0);
  }));

  test("can't add a booking without consent or as already attended", () => as("public", async (c, f) => {
    await expect(c.query(`insert into appointments (reference, branch_id, day, slot_start, name, phone, consent_at, status)
      values ('E2E-x', $1, current_date + 1, '12:00', 'Test Person', '9000000001', now(), 'attended')`, [f.branch])).rejects.toThrow(/row-level security/);
  }));

  test("can't add or change content", () => as("public", async (c, f) => {
    expect(await affected(c, "update frames set price = 1 where id = $1", [f.approved])).toBe(0);
    expect(await affected(c, "update branches set phone = '1'")).toBe(0);
    await expect(c.query("insert into brands (name) values ('Intruder brand')")).rejects.toThrow(/row-level security/);
  }));

  test("booking availability gives counts only", () => as("public", async (c, f) => {
    const r = await c.query("select * from slot_counts($1, current_date + 1)", [f.branch]);
    expect(r.fields.map((x) => x.name)).toEqual(["slot_start", "booked"]);
    expect(r.rows.find((x) => x.slot_start === "10:00:00")?.booked).toBeGreaterThanOrEqual(1);
  }));

  test("can't touch the login tables", () => as("public", async (c) => {
    await expect(c.query(`select count(*) from "user"`)).rejects.toThrow(/permission denied/);
  }));

  test("a request with no role set counts as public", () => as(null, async (c, f) => {
    expect(await n(c, "select count(*) n from appointments")).toBe(0);
    expect(await n(c, "select count(*) n from frames where id = $1", [f.draft])).toBe(0);
  }));
});

test.describe("staff", () => {
  test("see drafts, bookings and messages", () => as("staff", async (c, f) => {
    expect(await n(c, "select count(*) n from frames where id = $1", [f.draft])).toBe(1);
    expect(await n(c, "select count(*) n from appointments")).toBeGreaterThanOrEqual(1);
    expect(await n(c, "select count(*) n from enquiries")).toBeGreaterThanOrEqual(1);
  }));

  test("can change an approved frame's price, which stays approved", () => as("staff", async (c, f) => {
    expect(await affected(c, "update frames set price = 2490 where id = $1", [f.approved])).toBe(1);
  }));

  test("can't approve a frame", () => as("staff", async (c, f) => {
    await expect(c.query("update frames set status = 'approved' where id = $1", [f.draft])).rejects.toThrow(/Only an admin can approve/);
  }));

  test("can't add a frame that's already approved", () => as("staff", async (c) => {
    await expect(c.query(`insert into frames (code, slug, brand_id, model, category, gender, colour_id, shape, price, available_at, status)
      select 'E2E-sneaky', 'e2e-sneaky', brand_id, 'x', category, gender, colour_id, shape, 100, available_at, 'approved' from frames limit 1`))
      .rejects.toThrow(/Only an admin can approve/);
  }));

  test("can't delete anything or change branch details", () => as("staff", async (c, f) => {
    expect(await affected(c, "delete from frames where id = $1", [f.approved])).toBe(0);
    expect(await affected(c, "delete from appointments")).toBe(0);
    expect(await affected(c, "update branches set phone = '1'")).toBe(0);
  }));
});

test.describe("admin", () => {
  test("can approve, delete and edit branch details", () => as("admin", async (c, f) => {
    expect(await affected(c, "update frames set status = 'approved' where id = $1", [f.draft])).toBe(1);
    expect(await affected(c, "delete from frames where id = $1", [f.approved])).toBe(1);
    expect(await affected(c, "update branches set map_url = 'https://maps.example' where id = $1", [f.branch])).toBe(1);
  }));

  test("still can't read the login tables directly", () => as("admin", async (c) => {
    await expect(c.query(`select count(*) from "session"`)).rejects.toThrow(/permission denied/);
  }));
});
