/* The catalogue's database rules (Requirements_Frames.md 2–4, Requirements_Sunglasses.md 2):
   only approved, active frames are listed or get a page; frames and sunglasses
   stay apart; the cover is the first photo; newest on the site first. Runs the
   queries themselves as the public role in a rolled-back transaction, so the
   cache can't hide a bug. */
import { expect, test } from "@playwright/test";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/db/schema";
import type { Tx } from "../src/lib/db";
import { catalogueQuery, frameDetailQuery, liveSlugsQuery } from "../src/lib/queries/catalogue";
import { connect } from "./helpers";

class Rollback extends Error {}
type Run = (sql: string, v?: unknown[]) => Promise<{ rows: { id: string }[] }>;

async function inRollback(fn: (tx: Tx, run: Run) => Promise<void>) {
  const c = await connect("app");
  const db = drizzle(c, { schema });
  try {
    await db.transaction(async (tx) => {
      const run: Run = (sql, v = []) => c.query(sql, v);
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

test("only approved, active frames are listed and get a page; sunglasses stay apart", async () => {
  await inRollback(async (tx, run) => {
    const brand = (await run("insert into brands (name) values ('E2E catalogue brand ' || gen_random_uuid()) returning id")).rows[0].id;
    const colour = (await run("insert into colours (name) values ('E2E catalogue colour ' || gen_random_uuid()) returning id")).rows[0].id;
    const frame = async (code: string, category: string, status: string, active: boolean, approvedAt: string | null) =>
      (await run(
        `insert into frames (code, slug, brand_id, model, category, gender, colour_id, shape, price, available_at, status, is_active,
           approved_at, size_lens, size_bridge, size_temple, lens_types)
         values ($1, lower($1), $2, 'E2E model', $3, 'women', $4, 'Round', 2450, 'both', $5, $6, $7, 52, 18, 140, $8) returning id`,
        [code, brand, category, colour, status, active, approvedAt, category === "sunglasses" ? ["Polarized"] : null])).rows[0].id;
    const older = await frame("E2E-CQ-OLD", "eyeglasses", "approved", true, "2001-01-01");
    await frame("E2E-CQ-NEW", "computer_glasses", "approved", true, "2099-01-01");
    await frame("E2E-CQ-WAIT", "eyeglasses", "waiting", true, null);
    await frame("E2E-CQ-BACK", "eyeglasses", "sent_back", true, null);
    await frame("E2E-CQ-HIDE", "eyeglasses", "approved", false, "2099-01-02");
    await frame("E2E-CQ-SUN", "sunglasses", "approved", true, "2099-01-03");
    for (const [id, pos] of [[older, 1], [older, 0]] as const) {
      await run("insert into frame_images (frame_id, path, position) values ($1, $2, $3)", [id, `frames/${id}/cover-${pos}.webp`, pos]);
    }

    await run("select set_config('app.role', 'public', true)");
    const frames = await catalogueQuery(tx, "frames");
    const codes = frames.map((f) => f.code);
    expect(codes).toContain("E2E-CQ-OLD");
    expect(codes[0], "newest on the site first").toBe("E2E-CQ-NEW");
    for (const hidden of ["E2E-CQ-WAIT", "E2E-CQ-BACK", "E2E-CQ-HIDE", "E2E-CQ-SUN"]) expect(codes, hidden).not.toContain(hidden);

    const old = frames.find((f) => f.code === "E2E-CQ-OLD")!;
    expect(old).toMatchObject({
      href: "/frames/e2e-cq-old", category: "Eyeglasses", gender: "Women", shape: "Round", size: "52-18-140",
      price: 2450, sold: false, where: "Both branches", photo: `frames/${older}/cover-0.webp`,
    });
    expect(frames.find((f) => f.code === "E2E-CQ-NEW")?.photo, "no photo yet: the drawing shows").toBeNull();

    const sun = await catalogueQuery(tx, "sunglasses");
    expect(sun.map((f) => f.code)).toContain("E2E-CQ-SUN");
    expect(sun.find((f) => f.code === "E2E-CQ-SUN")).toMatchObject({ href: "/sunglasses/e2e-cq-sun", lens: ["Polarized"] });
    expect(sun.every((f) => f.category === "Sunglasses")).toBe(true);

    const detail = await frameDetailQuery(tx, "frames", "e2e-cq-old");
    expect(detail?.photos.map((p) => p.path)).toEqual([`frames/${older}/cover-0.webp`, `frames/${older}/cover-1.webp`]);
    for (const [kind, slug] of [["frames", "e2e-cq-wait"], ["frames", "e2e-cq-hide"], ["frames", "e2e-cq-sun"], ["sunglasses", "e2e-cq-old"], ["frames", "no-such-frame"]] as const) {
      expect(await frameDetailQuery(tx, kind, slug), `${kind}/${slug}`).toBeNull();
    }
    const slugs = await liveSlugsQuery(tx, "frames");
    expect(slugs).toContain("e2e-cq-old");
    expect(slugs).not.toContain("e2e-cq-wait");
  });
});
