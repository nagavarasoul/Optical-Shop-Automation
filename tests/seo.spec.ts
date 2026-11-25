/* Search engines (sprint 5.6 part C; Requirements_Navigation.md "Search
   engines"): sitemap.xml lists the public pages and every live frame,
   pair of sunglasses and visible camp, worked out from the database with the
   site's own queries, and nothing private; robots.txt keeps crawlers out of
   the staff area and points to the sitemap. Runs once (security project). */
import { expect, test } from "@playwright/test";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/db/schema";
import type { Tx } from "../src/lib/db";
import { liveSlugsQuery } from "../src/lib/queries/catalogue";
import { campsQuery } from "../src/lib/queries/content";
import { site } from "../src/lib/site-config";
import { connect } from "./helpers";

test("sitemap.xml: public pages, live frames, sunglasses and camps; no drafts, search or staff pages", async ({ request }) => {
  const c = await connect("app");
  let want: string[];
  try {
    await c.query("select set_config('app.role', 'public', false)");
    const tx = drizzle(c, { schema }) as unknown as Tx;
    const [frames, sunglasses, camps] = [await liveSlugsQuery(tx, "frames"), await liveSlugsQuery(tx, "sunglasses"), await campsQuery(tx)];
    want = [...frames.map((s) => `/frames/${s}`), ...sunglasses.map((s) => `/sunglasses/${s}`), ...camps.map((x) => `/eye-camps/${x.slug}`)];
  } finally {
    await c.end();
  }
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const locs = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const paths = locs.map((u) => {
    expect(u.startsWith(site.url), u).toBe(true);
    return new URL(u).pathname;
  });
  for (const p of ["/", "/about", "/frames", "/sunglasses", "/lenses", "/eye-care", "/book-eye-test", "/eye-camps", "/gallery", "/contact", "/privacy"]) expect(paths, p).toContain(p);
  expect(paths.filter((p) => /^\/(frames|sunglasses|eye-camps)\/./.test(p)).sort()).toEqual([...want].sort());
  expect(paths.filter((p) => /^\/(admin|api|search|media)/.test(p)), "nothing private or noindex").toEqual([]);
  expect(new Set(paths).size, "no duplicates").toBe(paths.length);

  const owner = await connect("owner");
  await owner.query("select set_config('app.role', 'admin', false)");
  const hidden = (await owner.query("select slug from frames where status <> 'approved' or not is_active")).rows.map((r) => r.slug as string);
  await owner.end();
  for (const s of hidden) expect(paths.some((p) => p.endsWith(`/${s}`)), s).toBe(false);
});

test("robots.txt: staff area and auth API off limits, and where the sitemap is", async ({ request }) => {
  const text = await (await request.get("/robots.txt")).text();
  expect(text).toContain("Disallow: /admin");
  expect(text).toContain("Disallow: /api/");
  expect(text).toContain(`Sitemap: ${site.url}/sitemap.xml`);
});

test("share images: one site-wide 1200 × 630 PNG; a frame shares its first photo, or the site image when it has none", async ({ request }) => {
  const ogImage = async (path: string) => {
    const html = await (await request.get(path)).text();
    return [...html.matchAll(/<meta property="og:image" content="([^"]+)"/g)].map((m) => m[1]);
  };
  for (const p of ["/", "/about", "/lenses", "/eye-camps", "/contact"]) {
    const imgs = await ogImage(p);
    expect(imgs.length, p).toBe(1);
    expect(new URL(imgs[0]).pathname, p).toBe("/opengraph-image");
  }
  const res = await request.get("/opengraph-image");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toBe("image/png");
  const png = await res.body();
  expect(png.readUInt32BE(16), "width").toBe(1200);
  expect(png.readUInt32BE(20), "height").toBe(630);

  const c = await connect("app");
  await c.query("select set_config('app.role', 'public', false)");
  const tx = drizzle(c, { schema }) as unknown as Tx;
  const [slug] = await liveSlugsQuery(tx, "frames");
  const photo = (await c.query("select i.path from frame_images i join frames f on f.id = i.frame_id where f.slug = $1 order by i.position limit 1", [slug])).rows[0]?.path as string | undefined;
  await c.end();
  const imgs = await ogImage(`/frames/${slug}`);
  expect(imgs.length).toBe(1);
  expect(new URL(imgs[0]).pathname).toBe(photo ? `/media/${photo}` : "/opengraph-image");
});
