/* Gallery page (Requirements_Gallery.md 5), at 360 / 768 / 1440 px: the hero,
   the photos or the "coming soon" state, the consent note with its WhatsApp
   link, and the CTA. Photo behaviour (chips, viewer, hiding) is tested with
   real uploads in staff-content.spec.ts. */
import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(e.message));
  (page as Page & { errors: string[] }).errors = errors;
});
test.afterEach(async ({ page }) => {
  expect((page as Page & { errors: string[] }).errors, "console errors").toEqual([]);
});

test("gallery: photos or 'coming soon', the consent note asks on WhatsApp, linked from the footer", async ({ page }) => {
  await page.goto("/gallery");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Inside VS Lens Mart.");
  const tiles = await page.locator(".gtile").count();
  if (!tiles) await expect(page.getByRole("heading", { name: "Photos coming soon" })).toBeVisible();
  await expect(page.locator(".consent-note")).toContainText("Photos of people are shared with their permission.");
  const ask = page.locator(".consent-note").getByRole("button", { name: "Ask us on WhatsApp" });
  await ask.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await ask.click();
  const picker = page.getByRole("dialog", { name: "WhatsApp which branch?" });
  await expect(picker.getByRole("link").first()).toHaveAttribute("href", /text=Hi%20VS%20Lens%20Mart%2C%20I'd%20like%20a%20photo%20removed/);
  await expect(page.getByRole("link", { name: "Find a branch" }).last()).toHaveAttribute("href", "/contact#branches");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), "sideways scroll").toBe(0);
});
