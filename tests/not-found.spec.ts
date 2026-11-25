/* Page not found (Requirements_NotFound.md 5), at 360 / 768 / 1440 px: any
   unknown address gets the site's own 404 page with the shared header, footer
   and sticky bar, HTTP 404 and noindex; the search form, the four cards,
   WhatsApp (with the missing address) and "Back to home" work.
   The frame, sunglasses and camp hints are in catalogue.spec.ts and
   eye-camps.spec.ts. The error page can't be triggered on purpose in a
   production build, so it was checked by hand (changelog 2026-11-09). */
import { expect, test, type Page } from "@playwright/test";
import { connect } from "./helpers";

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  // The browser reports the 404 status of the page itself; anything else is a real error.
  page.on("console", (m) => { if (m.type() === "error" && !/status of 404/.test(m.text())) errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(e.message));
  (page as Page & { errors: string[] }).errors = errors;
});
test.afterEach(async ({ page }) => {
  expect((page as Page & { errors: string[] }).errors, "console errors").toEqual([]);
});

async function open(page: Page, path: string) {
  const res = await page.goto(path);
  await page.waitForFunction(() => {
    const el = document.querySelector(".nf-help button");
    return !!el && Object.keys(el).some((k) => k.startsWith("__react"));
  });
  return res;
}

test("an unknown address: the site's 404 page, HTTP 404, noindex, inside the normal layout", async ({ page }) => {
  const res = await open(page, "/old-offers-page");
  expect(res?.status()).toBe(404);
  await expect(page).toHaveTitle("Page not found | VS Lens Mart");
  expect(await page.locator('meta[name="robots"][content*="noindex"]').count()).toBeGreaterThan(0);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This page is a little out of focus.");
  await expect(page.locator(".site-header")).toBeVisible();
  await expect(page.locator(".footer")).toBeVisible();
  await expect(page.locator(".stickybar")).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), "sideways scroll").toBe(0);
});

test("search, the four cards and Back to home", async ({ page }) => {
  await open(page, "/no-such-page");
  const search = page.locator(".nf-search");
  await expect(search).toHaveAttribute("action", "/search");
  await expect(search.getByRole("searchbox", { name: "Search frames, sunglasses and lenses" })).toBeVisible();
  await expect(search.getByRole("searchbox")).not.toBeFocused(); // would open the phone keyboard
  const cards = page.getByRole("navigation", { name: "Where to next" }).getByRole("link");
  await expect(cards).toHaveCount(4);
  const hrefs = await cards.evaluateAll((a) => a.map((x) => x.getAttribute("href")));
  expect(hrefs).toEqual(["/frames", "/sunglasses", "/book-eye-test", "/contact#branches"]);
  const c = await connect("owner");
  const names = (await c.query("select name from branches where is_visible order by sort, name")).rows.map((r) => r.name as string);
  await c.end();
  await expect(cards.nth(3), "branch names from the branches table").toContainText(names.join(" and "));
  await page.locator(".nf-help").getByRole("link", { name: "Back to home" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("Ask us on WhatsApp: the branch picker, with the missing address in the message", async ({ page }) => {
  await open(page, "/old-offers-page");
  await page.locator(".nf-help").getByRole("button", { name: "Ask us on WhatsApp" }).click();
  const link = page.locator("#picker a").first();
  await expect(link).toBeVisible();
  const href = decodeURIComponent((await link.getAttribute("href"))!);
  expect(href).toMatch(/^https:\/\/wa\.me\/91\d+\?text=/);
  expect(href).toContain(`I was looking for a page on your website: ${new URL(page.url()).origin}/old-offers-page`);
});
