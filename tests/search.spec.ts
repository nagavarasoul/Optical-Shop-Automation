/* Search (Requirements_Search.md 6), at 360 / 768 / 1440 px. Expected results
   are worked out from the database with the site's own live queries and its
   own matching (src/lib/search.ts), plus independent checks that don't use it,
   so the tests hold whatever frames and lenses are stored. */
import { expect, test, type Page } from "@playwright/test";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/db/schema";
import type { Tx } from "../src/lib/db";
import { catalogueQuery, type CatalogueItem, type Kind } from "../src/lib/queries/catalogue";
import { lensesQuery, type LensItem } from "../src/lib/queries/content";
import { GROUP_LIMIT, parseQuery, searchFrames, searchLenses } from "../src/lib/search";
import { connect } from "./helpers";

const noScroll = (p: Page) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

let data: { frames: CatalogueItem[]; sunglasses: CatalogueItem[]; lenses: LensItem[] } | undefined;
async function live() {
  if (data) return data;
  const c = await connect("app");
  try {
    await c.query("select set_config('app.role', 'public', false)");
    const tx = drizzle(c, { schema }) as unknown as Tx;
    const get = (k: Kind) => catalogueQuery(tx, k);
    return (data = { frames: await get("frames"), sunglasses: await get("sunglasses"), lenses: await lensesQuery(tx) });
  } finally {
    await c.end();
  }
}
function expected(d: NonNullable<typeof data>, raw: string) {
  const q = parseQuery(raw);
  return { frames: searchFrames(d.frames, q), sunglasses: searchFrames(d.sunglasses, q), lenses: searchLenses(d.lenses, q) };
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(e.message));
  (page as Page & { errors: string[] }).errors = errors;
});
test.afterEach(async ({ page }) => {
  expect((page as Page & { errors: string[] }).errors, "console errors").toEqual([]);
});

async function search(page: Page, q: string) {
  await page.goto(`/search?q=${encodeURIComponent(q)}`);
  // Wait until the results have replaced the "Searching…" placeholder head
  await expect(page.locator(".page-head:not([data-loading])").filter({ visible: true })).toHaveCount(1);
  await expect(page.locator(".page-head[data-loading]")).toHaveCount(0);
}
const group = (page: Page, id: string) => page.locator(`section[aria-labelledby="results-${id}"]`);
const names = (page: Page, id: string) => group(page, id).locator(".fcard__name, .lcard h3").allTextContents();

test("the header search opens the results page (the icon is hidden on phones, as in the signed-off design)", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) < 768, "no search icon under 768 px");
  const d = await live();
  const brand = d.frames[0].brand;
  await page.goto("/");
  await page.waitForFunction(() => Object.keys(document.querySelector(".icon-btn--search") ?? {}).some((k) => k.startsWith("__react")));
  await page.getByRole("button", { name: "Search", exact: true }).click();
  const box = page.locator("#search input[name=q]");
  await expect(box).toBeFocused();
  await box.fill(brand);
  await box.press("Enter");
  await expect(page).toHaveURL(/\/search\?q=/);
  expect(new URL(page.url()).searchParams.get("q")).toBe(brand);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(`Search results for “${brand}”`);
});

test("a frame code finds that frame first, in any case, with or without spaces or hyphens", async ({ page }) => {
  const d = await live();
  const f = d.frames[0];
  const bare = f.code.replace(/[^A-Za-z0-9]/g, "");
  const spaced = f.code.replace(/-/g, " ");
  for (const q of [f.code, f.code.toLowerCase(), bare, spaced]) {
    await search(page, q);
    const first = group(page, "frames").locator(".fcard").first();
    await expect(first.locator(".fcard__name"), q).toHaveText(f.model);
    await expect(first.locator(".fcard__name"), q).toHaveAttribute("href", f.href);
  }
});

test("a brand: every live item of that brand, grouped with counts, in the site's order", async ({ page }) => {
  const d = await live();
  const all = [...d.frames, ...d.sunglasses];
  const brand = [...new Set(all.map((f) => f.brand))].sort((a, b) => all.filter((f) => f.brand === b).length - all.filter((f) => f.brand === a).length)[0];
  const want = expected(d, brand);
  await search(page, brand);
  for (const k of ["frames", "sunglasses"] as const) {
    const ofBrand = d[k].filter((f) => f.brand === brand).map((f) => f.code);
    // Independent of the matching code: every frame of the brand is found
    expect(ofBrand.every((c) => want[k].some((f) => f.code === c)), k).toBe(true);
    if (!want[k].length) { await expect(group(page, k)).toHaveCount(0); continue; }
    await expect(group(page, k).getByRole("heading", { level: 2 })).toHaveText(`${k === "frames" ? "Frames" : "Sunglasses"} (${want[k].length})`);
    expect(await names(page, k), k).toEqual(want[k].slice(0, GROUP_LIMIT).map((f) => f.model));
  }
  const total = want.frames.length + want.sunglasses.length + want.lenses.length;
  await expect(page.locator(".search-page__count")).toHaveText(`${total} result${total === 1 ? "" : "s"}`);
  expect(await page.locator('meta[name="robots"][content*="noindex"]').count()).toBeGreaterThan(0);
  await expect(page).toHaveTitle(`Search: ${brand} | VS Lens Mart`);
  expect(await noScroll(page), "sideways scroll").toBe(0);
});

test("lenses: found by brand, each linking to the lenses page filtered by brand and type", async ({ page }) => {
  const d = await live();
  test.skip(!d.lenses.length, "no active lenses stored");
  const l = d.lenses[0];
  const want = expected(d, l.brand).lenses;
  expect(want.some((x) => x.id === l.id)).toBe(true);
  await search(page, l.brand);
  await expect(group(page, "lenses").getByRole("heading", { level: 2 })).toHaveText(`Lenses (${want.length})`);
  const link = group(page, "lenses").getByRole("link", { name: want[0].name, exact: true }).first();
  await expect(link).toHaveAttribute("href", new RegExp(`^/lenses\\?brand=${want[0].brandSlug}&type=`));
});

test("two words find only items that match both", async ({ page }) => {
  const d = await live();
  const f = d.frames.find((x) => /^[A-Za-z]+$/.test(x.colour) && /^[A-Za-z]+$/.test(x.brand))!;
  const q = `${f.brand} ${f.colour}`;
  const want = expected(d, q);
  await search(page, q);
  expect(want.frames.some((x) => x.code === f.code)).toBe(true);
  for (const x of [...want.frames, ...want.sunglasses]) expect(x.brand, "every result has the brand").toBe(f.brand);
  expect(await names(page, "frames")).toEqual(want.frames.slice(0, GROUP_LIMIT).map((x) => x.model));
});

test("more than 24 in a group: 24 shown and a note to narrow it down", async ({ page }) => {
  const d = await live();
  const want = expected(d, "eyeglasses").frames;
  test.skip(want.length <= GROUP_LIMIT, "needs more than 24 eyeglasses (npm run db:seed)");
  await search(page, "eyeglasses");
  await expect(group(page, "frames").locator(".fcard")).toHaveCount(GROUP_LIMIT);
  await expect(group(page, "frames")).toContainText(`Showing ${GROUP_LIMIT} of ${want.length}. Add a word`);
  await expect(group(page, "frames").getByRole("link", { name: /See all frames/ })).toHaveAttribute("href", "/frames");
});

test("drafts and hidden frames are never found", async ({ page }) => {
  const c = await connect("owner");
  await c.query("select set_config('app.role', 'admin', false)");
  const hidden = (await c.query("select code from frames where status <> 'approved' or not is_active limit 3")).rows.map((r) => r.code as string);
  await c.end();
  test.skip(!hidden.length, "no draft or hidden frames stored");
  for (const code of hidden) {
    await search(page, code);
    await expect(page.locator(".fcard"), code).toHaveCount(0);
  }
});

test("empty search, small words only, and no results each say what to do", async ({ page }) => {
  await page.goto("/search");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Search");
  await expect(page.getByText("Search by brand, model, frame code, colour or lens type.")).toBeVisible();
  await expect(page).toHaveTitle("Search | VS Lens Mart");

  await search(page, "the glasses");
  await expect(page.locator("main").getByRole("heading", { level: 2 })).toHaveText("Try something more specific.");

  await search(page, "zzzz qqqq");
  await expect(page.locator("main").getByRole("heading", { level: 2 })).toHaveText("No results for “zzzz qqqq”.");
  await expect(page.locator(".search-page__count")).toHaveText("0 results");
  await page.waitForFunction(() => Object.keys(document.querySelector(".search-page__empty .btn--primary") ?? {}).some((k) => k.startsWith("__react")));
  await page.locator(".search-page__empty").getByRole("button", { name: "Ask us on WhatsApp" }).click();
  const href = decodeURIComponent((await page.locator("#picker a").first().getAttribute("href"))!);
  expect(href).toContain("I'm looking for: zzzz qqqq");
  expect(await noScroll(page), "sideways scroll").toBe(0);
});

test("what was typed is shown as text, never as HTML", async ({ page }) => {
  await search(page, "<b>bold</b><img src=x onerror=alert(1)>");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("<b>bold</b>");
  await expect(page.locator("main b, main img[src=x]")).toHaveCount(0);
});
