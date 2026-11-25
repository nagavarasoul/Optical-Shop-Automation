/* Privacy policy (Requirements_Privacy.md 7), at 360 / 768 / 1440 px: reachable
   from the footer and both consent boxes, matches what the site really stores,
   shows the retention period the deletion uses, contents links work, and
   nothing loads from another site. */
import { expect, test, type Page } from "@playwright/test";
import { RETENTION_DAYS, retentionText } from "../src/lib/site-config";

const isDesktop = (p: Page) => (p.viewportSize()?.width ?? 0) >= 1024;

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(e.message));
  (page as Page & { errors: string[] }).errors = errors;
});
test.afterEach(async ({ page }) => {
  expect((page as Page & { errors: string[] }).errors, "console errors").toEqual([]);
});

test("linked from the footer and from the consent box on both forms", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".footer").getByRole("link", { name: "Privacy policy" })).toHaveAttribute("href", "/privacy");
  for (const path of ["/book-eye-test", "/contact"]) {
    await page.goto(path);
    await expect(page.locator(".consent a"), path).toHaveAttribute("href", "/privacy");
  }
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your details, looked after.");
});

test("says only what's true: the fields and browser keys the site uses, and the real retention period", async ({ page }) => {
  const outside: string[] = [];
  page.on("request", (r) => { if (!r.url().startsWith("http://localhost")) outside.push(r.url()); });
  await page.goto("/privacy");
  const collect = page.locator("#collect").locator("..");
  for (const fact of ["mobile number", "area or address", "frame code", "vslm-favourites", "vslm-theme"]) await expect(collect).toContainText(fact);
  expect(RETENTION_DAYS === 365 ? retentionText : "1 year", "the words come from the number purge_expired() uses").toBe("1 year");
  await expect(page.locator("#keep").locator("..")).toContainText(`deleted automatically ${retentionText} after`);
  await expect(page.locator(".inshort")).toContainText(`We delete them after ${retentionText}.`);
  expect(outside, "no third-party requests on load (fonts are self-hosted, no tracking)").toEqual([]);
});

test("contents: open beside the text on desktop, a tap-to-open list on phones; links jump to sections", async ({ page }) => {
  await page.goto("/privacy");
  const toc = page.locator("#toc");
  if (isDesktop(page)) await expect(toc).toHaveAttribute("open", "");
  else {
    await expect(toc).not.toHaveAttribute("open", "");
    await toc.locator("summary").click();
  }
  await toc.getByRole("link", { name: "Your rights" }).click();
  await expect(page).toHaveURL(/#rights$/);
  await expect(page.locator("#rights")).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), "sideways scroll").toBe(0);
});
