/* The shared layout (sprint 5.1, Requirements_Navigation.md section 9), at
   360 / 768 / 1440 px (playwright.config.ts projects). */
import { expect, test, type Page } from "@playwright/test";

const ORDER = ["Home", "About", "Frames", "Sunglasses", "Lenses", "Eye care", "Contact"];
const isDesktop = (p: Page) => (p.viewportSize()?.width ?? 0) >= 1180;
const isPhone = (p: Page) => (p.viewportSize()?.width ?? 0) < 768;

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

test("7 menu items in the client's order, Home marked on the home page, no cart or account", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".menu > li > .menu__link")).toHaveText(ORDER);
  await expect(page.locator(".acc > li > :first-child")).toHaveText(ORDER);
  await expect(page.locator('.menu > li > a.menu__link[aria-current="page"]')).toHaveText("Home");
  await expect(page.locator(".nav .brand")).toHaveAttribute("href", "/");
  // Never cart, account or favourites icons in the header (hearts belong on frame cards)
  await expect(page.locator('.site-header :is([aria-label*="cart" i], [aria-label*="account" i], [aria-label*="favourite" i])')).toHaveCount(0);
  await expect(page.locator(".utility__cta a")).toHaveAttribute("href", "/book-eye-test");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), "sideways scroll").toBe(0);
});

test("Eye camps sits in the Eye care menu, which is marked current on /eye-camps", async ({ page }) => {
  await page.goto("/eye-camps");
  await expect(page.locator('.menu > li > .menu__link[aria-current="page"]')).toHaveText("Eye care");
  await expect(page.locator('#mega-eye-care a[href="/eye-camps"]')).toHaveCount(1);
  await expect(page.locator('.acc a[href="/eye-camps"]')).toHaveCount(1);
});

test("shop facts come from the database, with Since 1999 and no year count", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".utility__legacy")).toHaveText("Since 1999");
  await expect(page.locator(".u-hours")).toHaveText(/Open 7 days, 9 AM–9:30 PM/);
  await expect(page.locator(".footer")).toContainText("Plot No 30/Part Block-B");
  await expect(page.locator(".footer")).toContainText("Falcon One Shopping Plaza");
  // The shared header and footer: never a hard-coded year count, never the DUMMY D7 "free" claim
  for (const part of [".site-header", ".footer"]) {
    await expect(page.locator(part)).not.toContainText(/\b2[57] years\b/i);
    await expect(page.locator(part)).not.toContainText(/free eye test/i);
  }
  await expect(page.locator(".dummy-tag"), "DUMMY tags never show in a production build").toHaveCount(0);
});

test.describe("desktop mega menus", () => {
  test.beforeEach(async ({ page }) => { test.skip(!isDesktop(page), "desktop only"); await page.goto("/"); });

  test("open on hover and close when the mouse leaves", async ({ page }) => {
    for (const [id, label] of [["frames", "Frames"], ["sunglasses", "Sunglasses"], ["lenses", "Lenses"], ["eye-care", "Eye care"]]) {
      await page.getByRole("button", { name: label }).hover();
      await expect(page.locator(`#mega-${id}`)).toHaveClass(/is-open/);
      await expect(page.getByRole("button", { name: label })).toHaveAttribute("aria-expanded", "true");
    }
    await page.mouse.move(700, 880); // well below the header
    await expect(page.locator(".mega.is-open")).toHaveCount(0);
  });

  test("open on click, close with Esc and give focus back", async ({ page }) => {
    const lenses = page.getByRole("button", { name: "Lenses" });
    await lenses.click();
    await expect(page.locator("#mega-lenses")).toHaveClass(/is-open/);
    await page.keyboard.press("Escape");
    await expect(page.locator("#mega-lenses")).not.toHaveClass(/is-open/);
    await expect(lenses).toBeFocused();
  });

  test("work with the keyboard alone", async ({ page }) => {
    const frames = page.getByRole("button", { name: "Frames" });
    await frames.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#mega-frames")).toHaveClass(/is-open/);
    await page.keyboard.press("Tab"); // into the panel
    await expect(page.locator("#mega-frames a").first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(frames).toBeFocused();
    await expect(page.locator("#mega-frames")).not.toHaveClass(/is-open/);
  });

  test("show brands and prices from the database, never ₹0", async ({ page }) => {
    await page.getByRole("button", { name: "Frames" }).click();
    const panel = page.locator("#mega-frames");
    await expect(panel.getByRole("heading", { name: "Brands" })).toBeVisible();
    await expect(panel.locator(".mega__price").first()).toHaveText(/^from ₹[1-9]/);
    await expect(page.locator(".mega__price", { hasText: /₹0\b/ })).toHaveCount(0);
  });

  test("open without animation when reduced motion is on", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await page.getByRole("button", { name: "Frames" }).click();
    const duration = await page.locator("#mega-frames").evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(duration.split(",").every((d) => parseFloat(d) === 0), duration).toBe(true);
  });
});

test.describe("phone and tablet menu", () => {
  test.beforeEach(async ({ page }) => { test.skip(isDesktop(page), "below 1180 px only"); await page.goto("/"); });

  test("opens full screen, one section at a time, Esc closes and gives focus back", async ({ page }) => {
    const burger = page.getByRole("button", { name: "Open menu" });
    await burger.click();
    const drawer = page.getByRole("dialog", { name: "Menu" });
    await expect(drawer).toHaveClass(/is-open/);
    await expect(page.getByRole("button", { name: "Close menu" })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");

    await drawer.getByRole("button", { name: "Frames" }).click();
    await expect(page.locator("#acc-frames")).toHaveClass(/is-open/);
    await drawer.getByRole("button", { name: "Lenses" }).click();
    await expect(page.locator("#acc-lenses")).toHaveClass(/is-open/);
    await expect(page.locator("#acc-frames")).not.toHaveClass(/is-open/);
    await drawer.getByRole("button", { name: "Lenses" }).click();
    await expect(page.locator("#acc-lenses")).not.toHaveClass(/is-open/);

    await page.keyboard.press("Escape");
    await expect(drawer).not.toHaveClass(/is-open/);
    await expect(burger).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  });
});

test.describe("phone sticky bar and branch picker", () => {
  test.beforeEach(async ({ page }) => { test.skip(!isPhone(page), "below 768 px only"); await page.goto("/"); });

  test("Call, WhatsApp and Book test are always visible, and nothing hides behind the bar", async ({ page }) => {
    const bar = page.getByRole("navigation", { name: "Quick actions" });
    await expect(bar).toBeVisible();
    await expect(bar.getByRole("link", { name: "Book test" })).toHaveAttribute("href", "/book-eye-test");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const covered = await page.evaluate(() => {
      const footerEnd = document.querySelector(".footer__bottom")!.getBoundingClientRect().bottom;
      const barTop = document.querySelector(".stickybar")!.getBoundingClientRect().top;
      return footerEnd - barTop;
    });
    expect(covered, "footer hidden behind the sticky bar (px)").toBeLessThanOrEqual(0);
  });

  test("Call and WhatsApp ask which branch, then use that branch's number", async ({ page }) => {
    const bar = page.getByRole("navigation", { name: "Quick actions" });
    const picker = page.locator("#picker");
    await bar.getByRole("button", { name: "Call" }).click();
    await expect(picker).toHaveClass(/is-open/);
    await expect(picker.locator(".picker__title")).toHaveText("Call which branch?");
    await expect(picker.getByRole("link", { name: /Indresham/ })).toHaveAttribute("href", "tel:+919550685417");
    await expect(picker.getByRole("link", { name: /Indresham/ })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(picker).not.toHaveClass(/is-open/);
    await expect(bar.getByRole("button", { name: "Call" })).toBeFocused();

    await bar.getByRole("button", { name: "WhatsApp" }).click();
    await expect(picker.getByRole("link", { name: /Indresham/ })).toHaveAttribute("href", "https://wa.me/919550685417");
    // The Patelguda number is still DUMMY D2: it must not work as a link
    await expect(picker.getByRole("link", { name: /Patelguda/ })).toHaveAttribute("aria-disabled", "true");
  });
});

test("the header WhatsApp icon opens the branch picker (tablet and desktop)", async ({ page }) => {
  test.skip(isPhone(page), "the phone uses the sticky bar");
  await page.goto("/");
  await page.getByRole("button", { name: "Chat on WhatsApp" }).click();
  const picker = page.locator("#picker");
  await expect(picker).toHaveClass(/is-open/);
  await expect(picker.getByRole("link", { name: /Indresham/ })).toHaveAttribute("href", "https://wa.me/919550685417");
  await expect(picker.getByRole("link", { name: /Indresham/ })).toHaveAttribute("target", "_blank");
});

test.describe("light and dark mode", () => {
  test("follows the device until chosen, then remembers the choice with no flash", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(await bg(), "device dark").toBe("rgb(10, 22, 34)");
    const toggle = page.getByRole("button", { name: "Dark mode" });
    await expect(toggle).toHaveAttribute("aria-pressed", "true");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(await bg(), "chose light").toBe("rgb(250, 246, 238)");

    // On reload the saved choice is applied in <head>, before the page draws
    await page.goto("/", { waitUntil: "commit" });
    await page.waitForSelector("body");
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe("light");
    expect(await bg(), "remembered light, despite a dark device").toBe("rgb(250, 246, 238)");
  });
});
