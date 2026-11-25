/* Staff area shell, dashboard and frames list (sprint 5.3 part A,
   Requirements_Admin.md sections 4, 5 and 7). Runs at 360 / 768 / 1440 px. */
import { expect, test, type Page } from "@playwright/test";
import { accounts, connect, type Role } from "./helpers";

const isDesktop = (p: Page) => (p.viewportSize()?.width ?? 0) >= 1024;

async function signInUI(page: Page, role: Role) {
  const a = accounts()[role];
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(a.email);
  await page.getByLabel("Password").fill(a.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: new RegExp(`Good (morning|afternoon|evening), ${a.name}[.]`) })).toBeVisible();
  return a;
}

// A frame made for these tests (committed, so the server sees it) and removed after
const fixture = { id: "", code: "", brand: "", colour: "" };
test.beforeAll(async () => {
  const c = await connect("owner");
  await c.query("select set_config('app.role', 'admin', false)");
  const one = async (sql: string, v: unknown[] = []) => (await c.query(sql, v)).rows[0];
  fixture.brand = (await one("insert into brands (name) values ('E2E Shell Brand ' || gen_random_uuid()) returning id")).id;
  fixture.colour = (await one("insert into colours (name) values ('E2E shell colour ' || gen_random_uuid()) returning id")).id;
  fixture.code = `E2E-S${Math.floor(Math.random() * 1e6)}`;
  fixture.id = (await one(
    `insert into frames (code, slug, brand_id, model, category, gender, colour_id, shape, price, available_at, status)
     values ($1, lower($1), $2, 'Shell Test Model', 'eyeglasses', 'unisex', $3, 'Round', 2222, 'both', 'approved') returning id`,
    [fixture.code, fixture.brand, fixture.colour])).id;
  await c.end();
});
test.afterAll(async () => {
  const c = await connect("owner");
  await c.query("select set_config('app.role', 'admin', false)");
  await c.query("delete from frames where id = $1", [fixture.id]);
  await c.query("delete from brands where id = $1", [fixture.brand]);
  await c.query("delete from colours where id = $1", [fixture.colour]);
  await c.end();
});

test("admin dashboard: to-do cards, approval queue, settings, and it fits the screen", async ({ page }) => {
  await signInUI(page, "admin");
  await expect(page.locator(".adm-todo a")).toHaveCount(3);
  await expect(page.getByRole("heading", { name: "Waiting for your approval" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "On the site now" })).toBeVisible();
  if (!isDesktop(page)) await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.locator("#adm-side").getByRole("link", { name: "Staff accounts" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test("staff dashboard: their own frames, no approval queue and no settings", async ({ page }) => {
  await signInUI(page, "staff");
  await expect(page.getByRole("heading", { name: "Your frames in progress" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Waiting for your approval" })).toHaveCount(0);
  await expect(page.locator("#adm-side").getByRole("link", { name: "Staff accounts" })).toHaveCount(0);
  await expect(page.locator("#adm-side")).toContainText("Your branch");
});

test("the admin's branch choice changes the shell and survives a reload", async ({ page }) => {
  await signInUI(page, "admin");
  if (!isDesktop(page)) await page.getByRole("button", { name: "Menu" }).click();
  await page.locator("#adm-branch").selectOption("patelguda");
  await expect(page.locator(".adm-branch__addr")).toContainText("Falcon One Shopping Plaza");
  await page.reload();
  await expect(page.locator("#adm-branch")).toHaveValue("patelguda");
  await page.locator("#adm-branch").selectOption("indresham"); // leave it as it was
  await expect(page.locator(".adm-branch__addr")).toContainText("Citizens Colony");
});

test("frames list: search finds a frame, and Sold out saves to the database", async ({ page }) => {
  await signInUI(page, "staff");
  await page.goto(`/admin/frames?q=${fixture.code}`);
  const row = page.locator(".dq-row", { hasText: fixture.code });
  await expect(row).toHaveCount(1);
  const toggle = row.getByRole("switch");
  await expect(toggle).not.toBeChecked();
  await toggle.click();
  await expect(row.locator(".switch__text b")).toHaveText("Sold out");

  const c = await connect("owner");
  await c.query("select set_config('app.role', 'admin', false)");
  await expect.poll(async () => (await c.query("select availability from frames where id = $1", [fixture.id])).rows[0].availability).toBe("sold_out");
  await page.reload();
  await expect(page.locator(".dq-row", { hasText: fixture.code }).getByRole("switch")).toBeChecked();
  await c.end();
});

test("unknown staff pages show not found", async ({ page }) => {
  await signInUI(page, "staff");
  // The staff shell streams in after the sign-in check, so the status line is already
  // sent (200) when a page turns out not to exist; the content still says so.
  await page.goto("/admin/not-a-real-section");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
  await expect(page.getByRole("link", { name: "Back to the dashboard" })).toHaveAttribute("href", "/admin");
  await expect(page.locator(".adm-top"), "inside the staff shell, not the public page").toBeVisible();
  await expect(page.locator(".site-header")).toHaveCount(0);
});

test("phones and tablets: Add frame floats on lists, but never over a form's Save bar", async ({ page }) => {
  test.skip(isDesktop(page), "the floating button is for screens under 1024 px");
  await signInUI(page, "staff");
  const fab = page.locator(".adm-fab");
  await expect(fab, "dashboard").toBeVisible();
  for (const path of ["/admin/eye-camps/new", "/admin/lenses/new", "/admin/frames/new"]) {
    await page.goto(path);
    await expect(page.locator(".factions").first(), path).toBeVisible();
    await expect(fab, path).toBeHidden();
  }
  await page.goto("/admin/eye-camps");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(fab, "camps list").toBeVisible();
});
