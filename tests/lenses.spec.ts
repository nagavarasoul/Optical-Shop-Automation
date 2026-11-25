/* Lenses page (Requirements_Lenses.md 5), at 360 / 768 / 1440 px. Expected
   results come from the database with the site's own query, so the tests hold
   whatever lenses are stored (they need the seed's lenses). */
import { expect, test, type Page } from "@playwright/test";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/db/schema";
import type { Tx } from "../src/lib/db";
import { LENS_TYPES } from "../src/lib/lens-rules";
import { lensesQuery, type LensItem } from "../src/lib/queries/content";
import { connect } from "./helpers";

let cache: LensItem[] | null = null;
async function live(): Promise<LensItem[]> {
  if (cache) return cache;
  const c = await connect("app");
  try {
    await c.query("select set_config('app.role', 'public', false)");
    return (cache = await lensesQuery(drizzle(c, { schema }) as unknown as Tx));
  } finally {
    await c.end();
  }
}
const slugOf = (type: string) => LENS_TYPES.find((t) => t.id === type)!.slug;

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(e.message));
  (page as Page & { errors: string[] }).errors = errors;
});
test.afterEach(async ({ page }) => {
  expect((page as Page & { errors: string[] }).errors, "console errors").toEqual([]);
});

async function open(page: Page, query = "") {
  await page.goto(`/lenses${query}`);
  await page.waitForFunction(() => {
    const el = document.querySelector(".chip-toggle");
    return !!el && Object.keys(el).some((k) => k.startsWith("__react"));
  });
}

test("types with lenses only, prices or Ask for price, and Enquire names the lens", async ({ page }) => {
  const lenses = await live();
  test.skip(!lenses.length, "needs lenses (npm run db:seed)");
  await open(page);
  const types = LENS_TYPES.filter((t) => lenses.some((l) => l.type === t.id));
  await expect(page.locator(".ltype h3")).toHaveText(types.map((t) => t.name));
  await expect(page.locator(".lcard")).toHaveCount(lenses.length);
  for (const l of lenses) {
    const card = page.locator(".lcard", { has: page.getByRole("heading", { name: l.name, exact: true }) });
    await expect(card.locator(".lcard__price")).toHaveText(l.price != null ? `₹${l.price.toLocaleString("en-IN")}` : "Ask for price");
  }
  const first = lenses[0];
  const enquire = page.getByRole("button", { name: `Enquire about the ${first.brand} ${first.name} lens on WhatsApp` });
  await enquire.evaluate((el) => el.scrollIntoView({ block: "center" })); // clear of the phone's bottom bar
  await enquire.click();
  const picker = page.getByRole("dialog", { name: "WhatsApp which branch?" });
  await expect(picker).toBeVisible();
  await expect(picker.getByRole("link").first()).toHaveAttribute("href", /\?text=/);
  const href = await picker.getByRole("link").first().getAttribute("href");
  expect(decodeURIComponent(new URL(href!).searchParams.get("text") ?? "")).toContain(`${first.brand} ${first.name}`);
  await expect(page.getByText(/contact lens/i)).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), "sideways scroll").toBe(0);
});

test("Type and Brand chips combine (OR within, AND across) and live in the address", async ({ page }) => {
  const lenses = await live();
  test.skip(lenses.length < 3, "needs lenses (npm run db:seed)");
  await open(page);
  const [a, b] = [...new Set(lenses.map((l) => l.type))];
  const chip = (group: string, name: string) => page.getByRole("group", { name: group }).getByRole("button", { name, exact: true });
  await chip("Lens type", LENS_TYPES.find((t) => t.id === a)!.name).click();
  await chip("Lens type", LENS_TYPES.find((t) => t.id === b)!.name).click();
  await expect(page).toHaveURL(new RegExp(`\\?type=${slugOf(a)},${slugOf(b)}`));
  const both = lenses.filter((l) => [a, b].includes(l.type));
  await expect(page.locator(".lcard")).toHaveCount(both.length);
  const brand = both[0];
  await chip("Brand", brand.brand).click();
  await expect(page).toHaveURL(new RegExp(`brand=${brand.brandSlug}`));
  await expect(page.locator(".lcard")).toHaveCount(both.filter((l) => l.brandSlug === brand.brandSlug).length);
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(page.locator(".lcard")).toHaveCount(lenses.length);
});

test("mega-menu and type-card links land filtered", async ({ page }) => {
  const lenses = await live();
  test.skip(!lenses.length, "needs lenses (npm run db:seed)");
  const l = lenses[0];
  await open(page, `?type=${slugOf(l.type)}`);
  await expect(page.locator(".lcard")).toHaveCount(lenses.filter((x) => x.type === l.type).length);
  await open(page, `?brand=${l.brandSlug}`);
  await expect(page.locator(".lcard")).toHaveCount(lenses.filter((x) => x.brandSlug === l.brandSlug).length);
  await open(page, "?type=contact-lenses&brand=nobody");
  await expect(page.locator(".lcard"), "nonsense is ignored").toHaveCount(lenses.length);
  await open(page);
  await page.locator(".ltype").first().getByRole("link").click();
  await expect(page).toHaveURL(/\?type=[a-z-]+#catalogue$/);
  await expect(page.locator(".lcard")).toHaveCount(lenses.filter((x) => slugOf(x.type) === new URL(page.url()).searchParams.get("type")).length);
});
