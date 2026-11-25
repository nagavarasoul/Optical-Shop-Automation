/* The menu's database rules (Requirements_Navigation.md 5 and 9.9): only
   approved, active frames count; a tier with no products has no price. Runs
   menuQuery itself in a rolled-back transaction, so the cache can't hide a bug. */
import { expect, test } from "@playwright/test";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/db/schema";
import type { Tx } from "../src/lib/db";
import { branchesQuery, menuQuery } from "../src/lib/queries/site";
import { connect } from "./helpers";

class Rollback extends Error {}
type Run = (sql: string, v?: unknown[]) => Promise<{ rows: { id: string }[] }>;

/** Runs fn in a transaction that's always rolled back. It starts as admin (to make
 *  test rows); fn switches to the role under test with run("select set_config(...)"). */
async function inRollback(fn: (tx: Tx, run: Run) => Promise<void>) {
  const c = await connect("app");
  const db = drizzle(c, { schema });
  try {
    await db.transaction(async (tx) => {
      const run: Run = (sql, v = []) => c.query(sql, v); // same connection, same transaction
      await run("select set_config('app.role', 'admin', true)");
      await fn(tx as unknown as Tx, run);
      throw new Rollback();
    });
  } catch (e) {
    if (!(e instanceof Rollback)) throw e;
  } finally {
    await c.end();
  }
}

test("brands of approved, active frames are listed; drafts and hidden frames never", async () => {
  await inRollback(async (tx, run) => {
    const brand = async (name: string) => (await run("insert into brands (name) values ($1) returning id", [name])).rows[0].id;
    const colour = (await run("insert into colours (name) values ('E2E menu colour ' || gen_random_uuid()) returning id")).rows[0].id;
    const frame = (brandId: string, status: string, active: boolean, n: number) => run(
      `insert into frames (code, slug, brand_id, model, category, gender, colour_id, shape, price, available_at, status, is_active)
       select 'E2E-MENU-' || $5 || '-' || g, 'e2e-menu-' || $5 || '-' || g, $1, 'Model', 'eyeglasses', 'unisex', $2, 'Round', 1500, 'both', $3, $4
       from generate_series(1, 50) g`, [brandId, colour, status, active, n]);
    // 50 frames each, so they rank in the top 4 shown
    await frame(await brand("E2E Approved Brand"), "approved", true, 1);
    await frame(await brand("E2E Draft Brand"), "waiting", true, 2);
    await frame(await brand("E2E Hidden Brand"), "approved", false, 3);

    await run("select set_config('app.role', 'public', true)");
    const menu = await menuQuery(tx);
    const names = menu.frameBrands.map((b) => b.name);
    expect(names).toContain("E2E Approved Brand");
    expect(names).not.toContain("E2E Draft Brand");
    expect(names).not.toContain("E2E Hidden Brand");
    expect(menu.frameBrands.find((b) => b.name === "E2E Approved Brand")?.href).toBe("/frames?brand=e2e-approved-brand");
  });
});

test("a price tier with no products is left out, never ₹0", async () => {
  await inRollback(async (tx, run) => {
    // Hide every sunglasses frame: both sunglasses tiers must disappear
    await run("update frames set is_active = false where category = 'sunglasses'");
    await run("select set_config('app.role', 'public', true)");
    const menu = await menuQuery(tx);
    expect(menu.sunglassPrices).toEqual([]);
    for (const p of [...menu.framePrices, ...menu.sunglassPrices]) expect(p.from).toBeGreaterThan(0);
  });
});

test("branches: visible ones only, and a placeholder number is flagged DUMMY D2", async () => {
  await inRollback(async (tx, run) => {
    await run(`insert into branches (slug, name, address, phone, whatsapp, opens, closes, is_visible)
               values ('e2e-hidden', 'E2E Hidden', 'Somewhere 123', '9000000000', '9000000000', '09:00', '21:00', false)`);
    await run("select set_config('app.role', 'public', true)");
    const list = await branchesQuery(tx);
    expect(list.map((b) => b.slug)).not.toContain("e2e-hidden");
    const patelguda = list.find((b) => b.slug === "patelguda");
    expect(patelguda?.dummy).toBe("D2");
    expect(list.find((b) => b.slug === "indresham")?.dummy).toBeNull();
  });
});
