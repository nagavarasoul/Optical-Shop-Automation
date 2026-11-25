/* Frames and Sunglasses pages (sprint 5.3 part C; Requirements_Frames.md 6,
   Requirements_Sunglasses.md), at 360 / 768 / 1440 px. The expected results are
   worked out from the database with the site's own query, so the tests hold
   whatever frames are stored (they need at least 25, as `npm run db:seed` loads). */
import { expect, test, type Page } from "@playwright/test";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/db/schema";
import type { Tx } from "../src/lib/db";
import { catalogueQuery, type CatalogueItem, type Kind } from "../src/lib/queries/catalogue";
import { connect } from "./helpers";

const isDesktop = (p: Page) => (p.viewportSize()?.width ?? 0) >= 1180;
const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const noScroll = (p: Page) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

const cache: Partial<Record<Kind, CatalogueItem[]>> = {};
async function live(kind: Kind): Promise<CatalogueItem[]> {
  if (cache[kind]) return cache[kind];
  const c = await connect("app");
  try {
    await c.query("select set_config('app.role', 'public', false)");
    return (cache[kind] = await catalogueQuery(drizzle(c, { schema }) as unknown as Tx, kind));
  } finally {
    await c.end();
  }
}
/** In stock first, keeping each group's order (the page's rule for every sort). */
const soldLast = (list: CatalogueItem[]) => [...list.filter((f) => !f.sold), ...list.filter((f) => f.sold)];
/** A filter checkbox by its option text (its label also holds the count). */
const option = (p: Page, text: string) => p.locator("#filters .fopt", { has: p.getByText(text, { exact: true }) }).locator("input");
/** Opens a listing and waits until React has attached to it, so a click isn't lost. */
async function open(p: Page, url: string) {
  await p.goto(url);
  await p.waitForFunction(() => {
    const el = document.querySelector(".sort select");
    return !!el && Object.keys(el).some((k) => k.startsWith("__react"));
  });
}
const names = (p: Page) => p.locator(".frames-row .fcard__name").allTextContents();

// Every test fails on a console error or an uncaught page error
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(e.message));
  (page as Page & { errors: string[] }).errors = errors;
});
test.afterEach(async ({ page }) => {
  expect((page as Page & { errors: string[] }).errors, "console errors").toEqual([]);
});

test("/frames lists live frames newest first, sold out last, 24 at a time", async ({ page }) => {
  const items = await live("frames");
  test.skip(items.length < 25, "needs 25+ live frames (npm run db:seed)");
  const order = soldLast(items);
  await open(page, "/frames");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(`Frames ${items.length} frames`);
  await expect(page.locator(".frames-row .fcard")).toHaveCount(24);
  expect(await names(page)).toEqual(order.slice(0, 24).map((f) => f.model));
  await expect(page.locator(".results-foot")).toContainText(`Showing 24 of ${items.length}`);
  await page.getByRole("button", { name: "Load more" }).click();
  await expect(page.locator(".frames-row .fcard")).toHaveCount(Math.min(48, items.length));
  expect(await names(page)).toEqual(order.slice(0, 48).map((f) => f.model));
  const sold = page.locator(".fcard--sold");
  await expect(sold).toHaveCount(items.filter((f) => f.sold).length);
  if (items.some((f) => f.sold)) await expect(sold.first().locator(".fcard__badge")).toHaveText("Sold out");
  // Card: price and where, exactly from the database
  const first = order[0];
  const card = page.locator(".fcard").first();
  await expect(card.locator(".fcard__price")).toHaveText(rupees(first.price));
  await expect(card.locator(".fcard__where")).toHaveText(first.where);
  await expect(card.locator(".fcard__name")).toHaveAttribute("href", first.href);
  expect(await noScroll(page), "sideways scroll").toBe(0);
});

test("filters combine (OR within, AND across), update the address and the count", async ({ page }) => {
  const items = await live("frames");
  test.skip(items.length < 25, "needs 25+ live frames (npm run db:seed)");
  await open(page, "/frames");
  const panel = page.locator("#filters");
  if (!isDesktop(page)) {
    await page.getByRole("button", { name: /^Filters/ }).click();
    await expect(panel).toHaveClass(/is-open/);
  }
  const [s1, s2] = [...new Set(items.map((f) => f.shape))];
  await option(page, "Women").check();
  await option(page, s1).check();
  await option(page, s2).check();
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  await expect(page).toHaveURL(new RegExp(`\\?for=women&shape=${slug(s1)},${slug(s2)}$`));
  const want = items.filter((f) => f.gender === "Women" && [s1, s2].includes(f.shape));
  await expect(page.locator(".page-head__count")).toHaveText(`${want.length} frame${want.length === 1 ? "" : "s"}`);
  await expect(panel.locator(".filters__foot .btn--primary")).toHaveText(`Show ${want.length} frame${want.length === 1 ? "" : "s"}`); // phones only

  await panel.getByLabel("In stock only").check();
  const inStock = want.filter((f) => !f.sold);
  await expect(page.locator(".page-head__count")).toHaveText(`${inStock.length} frame${inStock.length === 1 ? "" : "s"}`);
  await expect(page).toHaveURL(/&stock=1$/);
  if (!isDesktop(page)) {
    await page.keyboard.press("Escape");
    await expect(panel).not.toHaveClass(/is-open/);
    await expect(page.getByRole("button", { name: /^Filters \(4\)/ })).toBeFocused();
  }
  // Active chips: 4 (women, two shapes, in stock); removing one widens the results again
  await expect(page.locator(".active-chip")).toHaveCount(4);
  await page.getByRole("button", { name: "Remove filter: In stock only" }).click();
  await expect(page.locator(".page-head__count")).toHaveText(`${want.length} frame${want.length === 1 ? "" : "s"}`);
  await page.getByRole("button", { name: "Clear all" }).click();
  await expect(page).toHaveURL(/\/frames$/);
  await expect(page.locator(".page-head__count")).toHaveText(`${items.length} frames`);
  expect(await noScroll(page), "sideways scroll").toBe(0);
});

test("the mega menu's links land filtered", async ({ page }) => {
  const frames = await live("frames"), sun = await live("sunglasses");
  test.skip(frames.length < 25 || !sun.length, "needs the seed data (npm run db:seed)");
  const n = (k: Kind, list: CatalogueItem[]) => `${list.length} ${k === "frames" ? `frame${list.length === 1 ? "" : "s"}` : `pair${list.length === 1 ? "" : "s"}`}`;
  for (const [url, kind, want] of [
    ["/frames?for=kids", "frames", frames.filter((f) => f.gender === "Kids")],
    ["/frames?tier=premium", "frames", frames.filter((f) => f.price >= 3000)],
    ["/frames?brand=" + frames[0].brand.toLowerCase().replace(/[^a-z0-9]+/g, "-"), "frames", frames.filter((f) => f.brand === frames[0].brand)],
    ["/sunglasses?lens=polarized", "sunglasses", sun.filter((f) => f.lens.includes("Polarized"))],
    ["/sunglasses?tier=everyday", "sunglasses", sun.filter((f) => f.price < 3000)],
  ] as const) {
    await open(page, url);
    await expect(page.locator(".page-head__count"), url).toHaveText(n(kind, [...want]));
  }
  // The quick chips are the same gender filter
  await open(page, "/frames");
  await page.locator(".quick-chips").getByRole("button", { name: "Men", exact: true }).click();
  await expect(page).toHaveURL(/\?for=men$/);
  await expect(page.locator(".page-head__count")).toHaveText(n("frames", frames.filter((f) => f.gender === "Men")));
});

test("sort by price, with sold out still last", async ({ page }) => {
  const items = await live("frames");
  test.skip(items.length < 25, "needs 25+ live frames (npm run db:seed)");
  await open(page, "/frames");
  await page.getByLabel("Sort frames").selectOption("price-asc");
  await expect(page).toHaveURL(/\?sort=price-asc$/);
  const want = soldLast([...items].sort((a, b) => a.price - b.price)).slice(0, 24);
  await expect(page.locator(".frames-row .fcard__price")).toHaveText(want.map((f) => rupees(f.price)));
});

test("favourites are saved on the device: they survive a reload and Saved shows only them", async ({ page }) => {
  const items = await live("frames");
  test.skip(items.length < 25, "needs 25+ live frames (npm run db:seed)");
  const [a, b] = soldLast(items);
  await open(page, "/frames");
  const saved = page.locator(".saved-toggle");
  await expect(saved).toBeDisabled();
  await expect(saved).toHaveAttribute("title", "Tap ♡ on a frame to save it");
  for (const f of [a, b]) {
    const heart = page.getByRole("button", { name: `Save ${f.brand} ${f.model} to favourites` });
    await heart.click();
    await expect(heart).toHaveAttribute("aria-pressed", "true");
  }
  await open(page, "/frames");
  await expect(saved).toHaveText("Saved (2)");
  await saved.click();
  await expect(page).toHaveURL(/\?saved=1$/);
  expect((await names(page)).sort()).toEqual([a.model, b.model].sort());
  // The detail page's heart reads the same favourites
  await page.goto(a.href);
  await expect(page.getByRole("button", { name: `Save ${a.brand} ${a.model} to favourites` })).toHaveAttribute("aria-pressed", "true");
});

test("Enquire opens the branch picker with the frame code in the WhatsApp text", async ({ page }) => {
  const items = await live("frames");
  test.skip(!items.length, "needs live frames (npm run db:seed)");
  const f = soldLast(items)[0];
  await open(page, "/frames");
  await page.getByRole("button", { name: `Enquire about ${f.brand} ${f.model} on WhatsApp` }).click();
  const picker = page.getByRole("dialog", { name: "WhatsApp which branch?" });
  await expect(picker).toBeVisible();
  // The picker fills in the message just after it opens, so keep reading until it's there
  await expect.poll(async () => {
    const href = await picker.getByRole("link").first().getAttribute("href");
    return decodeURIComponent(new URL(href!).searchParams.get("text") ?? "");
  }).toBe(`Hi VS Lens Mart, I'm interested in frame ${f.code} (${f.brand} ${f.model}). Is it available?`);
});

test("frame detail: every field, both WhatsApp actions, search-engine data", async ({ page }) => {
  const items = await live("frames");
  test.skip(!items.length, "needs live frames (npm run db:seed)");
  const f = items.find((x) => x.size && x.material) ?? items[0];
  await page.goto(f.href);
  await expect(page).toHaveTitle(`${f.brand} ${f.model} · ${rupees(f.price)} | VS Lens Mart`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(f.model);
  await expect(page.locator(".pinfo__price")).toContainText(rupees(f.price));
  await expect(page.locator(".pstatus")).toContainText(f.sold ? "Sold out" : "In stock");
  const specs = page.locator(".specs dl");
  for (const v of [f.code, f.brand, f.model, f.category, f.gender, f.colour, f.shape, f.material, f.size]) if (v) await expect(specs).toContainText(v);
  await expect(page.getByRole("button", { name: f.sold ? "Ask about similar frames" : "Enquire on WhatsApp" })).toBeVisible();
  await expect(page.locator(".pactions").getByRole("link", { name: "Book an eye test" })).toBeVisible();
  const share = await page.getByRole("link", { name: "Share this frame on WhatsApp" }).getAttribute("href");
  expect(share).toMatch(/^https:\/\/wa\.me\/\?text=/); // the customer picks the contact; not the shop's number
  expect(decodeURIComponent(share!)).toContain(`${f.brand} ${f.model}, ${rupees(f.price)}`);
  await expect(page.getByText(/try-on/i)).toHaveCount(0);
  const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
  expect(ld).toMatchObject({ "@type": "Product", sku: f.code, offers: { price: f.price, priceCurrency: "INR" } });
  expect(await noScroll(page), "sideways scroll").toBe(0);
});

test("a draft, a frame under the wrong page, or an unknown address shows the not-found page", async ({ page }) => {
  const c = await connect("owner");
  await c.query("select set_config('app.role', 'admin', false)");
  const draft = (await c.query("select slug from frames where status <> 'approved' and category <> 'sunglasses' limit 1")).rows[0]?.slug as string | undefined;
  await c.end();
  const frames = await live("frames");
  const paths = [
    ["/frames/no-such-frame-vsf-0000", "This frame isn’t available."],
    ...(draft ? [[`/frames/${draft}`, "This frame isn’t available."]] : []),
    ...(frames[0] ? [[`/sunglasses/${frames[0].href.split("/").pop()}`, "These sunglasses aren’t available."]] : []),
  ];
  // The production server streams the not-found page (status 200), so check what it shows and that search engines skip it
  page.removeAllListeners("console"); // in development the browser logs the 404 response itself
  for (const [p, heading] of paths) {
    await page.goto(p);
    await expect(page.getByRole("heading", { level: 1 }), p).toHaveText(heading);
    expect(await page.locator('meta[name="robots"][content*="noindex"]').count(), p).toBeGreaterThan(0);
    await expect(page.locator(".pinfo"), p).toHaveCount(0);
  }
  await expect(page.getByRole("link", { name: /^See all sunglasses/ })).toHaveAttribute("href", "/sunglasses");
});
