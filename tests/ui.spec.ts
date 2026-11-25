/* Staff login in a real browser, at 360 / 768 / 1440 px (playwright.config.ts projects). */
import { expect, test } from "@playwright/test";
import { accounts } from "./helpers";

test("login page fits the screen and uses the design fonts and colours", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin$/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  const look = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    heading: getComputedStyle(document.querySelector("h1")!).fontFamily,
    body: getComputedStyle(document.body).fontFamily,
    button: getComputedStyle(document.querySelector("button[type=submit]")!).backgroundColor,
    buttonHeight: document.querySelector("button[type=submit]")!.getBoundingClientRect().height,
  }));
  expect(look.overflow, "sideways scroll").toBe(0);
  expect(look.heading).toContain("Plus Jakarta Sans");
  expect(look.body).toContain("Inter");
  expect(look.button).toBe("rgb(245, 200, 66)"); // gold
  expect(look.buttonHeight).toBe(48);
});

test("wrong password shows a plain message; right password opens the dashboard; sign out returns to login", async ({ page }) => {
  const a = accounts().staff;
  await page.goto("/admin/login?next=%2Fadmin");
  await page.getByLabel("Email").fill(a.email);
  await page.getByLabel("Password").fill("definitely-wrong");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator("form [role=alert]")).toHaveText("That email and password don't match. Check them and try again.");

  await page.getByLabel("Password").fill(a.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: new RegExp(`Good (morning|afternoon|evening), ${a.name}[.]`) })).toBeVisible();
  await expect(page).toHaveURL(/\/admin$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);

  // A second visit, so Back after signing out really lands on a dashboard history entry
  await page.goto("/admin?second-visit=1");
  await expect(page.getByRole("heading", { name: new RegExp(`Good (morning|afternoon|evening), ${a.name}[.]`) })).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.goBack();
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByText("On the site now")).toHaveCount(0);
  await expect(page.getByText(a.name)).toHaveCount(0);
});

test("the login page can't send you to another website after signing in", async ({ page }) => {
  const a = accounts().staff;
  await page.goto("/admin/login?next=https%3A%2F%2Fevil.example%2F");
  await page.getByLabel("Email").fill(a.email);
  await page.getByLabel("Password").fill(a.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/admin");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
});
