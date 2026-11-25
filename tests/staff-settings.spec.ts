/* Staff settings (Requirements_Admin.md 3, 7.1 and settings): Branches,
   Branch holidays and Staff accounts. Every change made
   here is put back through the same page, so the site's cache refreshes too. */
import { randomBytes } from "node:crypto";
import { expect, test, type Browser, type Page } from "@playwright/test";
import { betterAuth } from "better-auth";
import pg from "pg";
import { authOptions } from "../src/lib/auth-options";
import { addDays, dayLabel, nowInIndia } from "../src/lib/booking-rules";
import { branches as seedBranches } from "../src/lib/site-config";
import { PASSWORD_MIN } from "../src/lib/staff-rules";
import { accounts, connect, need, type Role } from "./helpers";

/** Tries to sign in, in a fresh browser; the caller checks the outcome. */
async function signInWith(browser: Browser, email: string, password: string, width = 1280): Promise<Page> {
  const page = await (await browser.newContext({ viewport: { width, height: 900 } })).newPage();
  await page.goto("/admin/login");
  await ready(page, "form");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  return page;
}
const greeting = (page: Page) => page.getByRole("heading", { name: /^Good (morning|afternoon|evening)/ });
async function as(browser: Browser, role: Role, width = 1280): Promise<Page> {
  const a = accounts()[role];
  const page = await signInWith(browser, a.email, a.password, width);
  await expect(greeting(page)).toBeVisible();
  return page;
}
/** The login tables, as global-setup.ts reaches them. Close the pool with .end(). */
async function loginTables() {
  const pool = new pg.Pool({ connectionString: need("DATABASE_URL_AUTH") });
  return { pool, ctx: await betterAuth(authOptions(pool)).$context };
}
async function ready(page: Page, selector: string) {
  await page.waitForFunction((s) => { const el = document.querySelector(s); return !!el && Object.keys(el).some((k) => k.startsWith("__react")); }, selector);
}
test.describe.configure({ mode: "serial" });

test("branches: staff see them read-only, and the database refuses a staff change", async ({ browser }) => {
  const page = await as(browser, "staff", 360);
  await page.goto("/admin/branches");
  await expect(page.getByText("Only an admin can change branch details.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Save changes" })).toHaveCount(0);
  await expect(page.locator("#indresham-address")).toHaveAttribute("readonly", "");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), "sideways scroll").toBe(0);

  const c = await connect("app");
  await c.query("select set_config('app.role', 'staff', false)");
  const r = await c.query("update branches set address = 'E2E hack' where slug = 'indresham'");
  await c.end();
  expect(r.rowCount, "staff can't write branch details").toBe(0);
});

test("branches: the admin's change reaches the footer and the booking times at once; bad values get plain messages", async ({ browser }) => {
  const admin = await as(browser, "admin");
  await admin.goto("/admin/branches");
  await ready(admin, "#indresham-closes");
  const closes = admin.locator("#indresham-closes");
  // Restore the seed value, not the one found, so a run stopped halfway doesn't leave 8:30 PM behind
  const original = seedBranches.find((b) => b.slug === "indresham")!.closes;

  // Plain messages first
  await admin.locator("#indresham-phone").fill("12345");
  await closes.fill("08:00");
  await admin.getByRole("button", { name: "Save changes" }).click();
  await expect(admin.locator(".esummary")).toContainText("Indresham: Enter a 10-digit phone number.");
  await expect(admin.locator(".esummary")).toContainText("Indresham: Closing time must be after opening time.");
  await admin.getByRole("button", { name: "Undo changes" }).click();

  // A real change: close at 8:30 PM
  await closes.fill("20:30");
  await admin.getByRole("button", { name: "Save changes" }).click();
  await expect(admin.getByText("Saved. The website shows the new details now.")).toBeVisible();
  try {
    const site = await (await browser.newContext()).newPage();
    await site.goto("/contact");
    await expect(site.locator(".footer")).toContainText("9 AM–8:30 PM");
    const tomorrow = addDays(nowInIndia().day, 1);
    await site.goto(`/book-eye-test?branch=indresham&date=${tomorrow}`);
    await expect(site.locator('input[name="time-choice"]').last()).toHaveValue("20:00"); // last start 30 minutes before closing
  } finally {
    // Put it back through the page, so the cache refreshes too
    await admin.goto("/admin/branches");
    await ready(admin, "#indresham-closes");
    await admin.locator("#indresham-closes").fill(original);
    await admin.getByRole("button", { name: "Save changes" }).click();
    await expect(admin.getByText("Saved. The website shows the new details now.")).toBeVisible();
  }
});

test("holidays: staff see them read-only, and the database refuses a staff closed day", async ({ browser }) => {
  const page = await as(browser, "staff");
  await page.goto("/admin/holidays");
  await expect(page.getByText("Only an admin can add or remove closed days.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Add closed day" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Remove/ })).toHaveCount(0);
  const c = await connect("app");
  await c.query("select set_config('app.role', 'staff', false)");
  await expect(c.query("insert into branch_closures (day, note) values (current_date + 40, 'E2E staff')"), "staff can't add").rejects.toThrow(/row-level security/);
  await c.end();
});

test("holidays: the admin closes a day; bookings on it are flagged; the booking form and Contact show it; removing opens it again", async ({ browser }) => {
  const day = addDays(nowInIndia().day, 3);
  const c = await connect("owner");
  await c.query("select set_config('app.role', 'admin', false)");
  const branch = (await c.query("select id from branches where slug = 'indresham'")).rows[0].id;
  await c.query(`insert into appointments (reference, branch_id, day, slot_start, name, phone, consent_at)
                 values ('E2E-' || substr(md5(random()::text), 1, 6), $1, $2, '11:00', 'E2E Settings booking', '9000000021', now())`, [branch, day]);
  await c.end();
  try {
    const admin = await as(browser, "admin");
    await admin.goto("/admin/holidays");
    await ready(admin, "#h-day");
    await admin.locator("#h-day").fill(day);
    await admin.locator("#h-branch").selectOption("indresham");
    await admin.getByLabel(/^Note/).fill("E2E festival");
    await admin.getByRole("button", { name: "Add closed day" }).click();
    const banner = admin.getByRole("status").filter({ hasText: "is now closed" });
    await expect(banner).toContainText(`${dayLabel(day)} is now closed.`);
    await expect(banner).toContainText("1 booking is already on this day");
    await expect(banner.getByRole("link", { name: "See the bookings" })).toHaveAttribute("href", `/admin/bookings?day=${day}&branch=both`);

    await admin.locator("#h-day").fill(day);
    await admin.getByRole("button", { name: "Add closed day" }).click();
    await expect(admin.getByText("That day is already closed for this branch.")).toBeVisible();

    const site = await (await browser.newContext()).newPage();
    await site.goto(`/book-eye-test?branch=indresham&date=${day}`);
    await expect(site.locator("#slots")).toContainText(`Closed on ${dayLabel(day)}`);
    await site.goto("/contact");
    await expect(site.locator("article#indresham")).toContainText(`Closed on ${dayLabel(day)} (E2E festival)`);

    const row = admin.locator(".bk-row", { hasText: "E2E festival" });
    await row.getByRole("button", { name: /^Remove/ }).click();
    await admin.getByRole("dialog").getByRole("button", { name: "Open this day" }).click();
    await expect(row).toHaveCount(0);
    await site.goto(`/book-eye-test?branch=indresham&date=${day}`);
    await expect(site.locator('input[name="time-choice"]').first(), "bookable again").toBeAttached();
  } finally {
    const c2 = await connect("owner");
    await c2.query("select set_config('app.role', 'admin', false)");
    await c2.query("delete from appointments where name = 'E2E Settings booking'");
    await c2.query("delete from branch_closures where note = 'E2E festival'");
    await c2.end();
  }
});

test("staff accounts: staff are refused and see no accounts; the password rule matches sign-in", async ({ browser }) => {
  const page = await as(browser, "staff", 360);
  await page.goto("/admin/staff");
  await expect(page.getByText("Only an admin can manage staff accounts.")).toBeVisible();
  await expect(page.getByText(/@(vslensmart\.example|example\.test)/)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Add account" })).toHaveCount(0);
  expect(PASSWORD_MIN, "the form's minimum is Better Auth's").toBe(authOptions({} as pg.Pool).emailAndPassword.minPasswordLength);
});

test("staff accounts: the admin adds someone who can sign in; a new password signs them out; switching off locks them out", async ({ browser }) => {
  const run = randomBytes(4).toString("hex");
  const email = `e2e-staff-${run}@example.test`; // global-teardown.ts removes it if this run stops halfway
  const name = `E2E New ${run}`;
  const [p1, p2] = [randomBytes(12).toString("base64url"), randomBytes(12).toString("base64url")];
  try {
    const admin = await as(browser, "admin", 360);
    await admin.goto("/admin/staff");
    await ready(admin, "#st-name");
    await admin.locator("#st-name").fill(name);
    await admin.locator("#st-email").fill(email);
    await admin.locator("#st-branch").selectOption("patelguda");
    await admin.locator("#st-password").fill(p1);
    await admin.locator("#st-again").fill(`${p1}x`);
    await admin.getByRole("button", { name: "Add account" }).click();
    await expect(admin.getByText("The two passwords don't match.")).toBeVisible();
    await admin.locator("#st-again").fill(p1);
    await admin.getByRole("button", { name: "Add account" }).click();
    await expect(admin.getByRole("status")).toContainText(`can now sign in with ${email}`);
    await expect(admin.locator(".bk-row", { hasText: name })).toContainText("Patelguda");
    expect(await admin.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), "sideways scroll").toBe(0);

    const person = await signInWith(browser, email, p1);
    await expect(greeting(person)).toBeVisible();

    // A new password signs them out everywhere
    await admin.getByRole("link", { name: `Manage ${name}` }).click();
    await ready(admin, "#sm-password");
    await admin.locator("#sm-password").fill(p2);
    await admin.locator("#sm-again").fill(p2);
    await admin.getByRole("button", { name: "Set new password" }).click();
    await expect(admin.getByRole("status")).toContainText("Password changed.");
    await person.goto("/admin");
    await expect(person).toHaveURL(/\/admin\/login/);
    const again = await signInWith(browser, email, p2);
    await expect(greeting(again)).toBeVisible();

    // Switching off ends the session and blocks sign-in; real accounts can't be deleted
    await expect(admin.getByRole("button", { name: "Delete sample" })).toHaveCount(0);
    await admin.getByRole("button", { name: "Switch off" }).click();
    await admin.getByRole("dialog").getByRole("button", { name: "Switch off" }).click();
    await expect(admin.getByRole("status")).toContainText("is switched off");
    await expect(admin.locator(".bk-row", { hasText: name })).toContainText("Switched off");
    await again.goto("/admin");
    await expect(again).toHaveURL(/\/admin\/login/);
    const blocked = await signInWith(browser, email, p2);
    await expect(blocked.getByText("This account is switched off. Ask the admin.")).toBeVisible();
    await admin.getByRole("button", { name: "Switch on" }).click();
    await expect(admin.getByRole("status")).toContainText("can sign in again");
  } finally {
    const { pool, ctx } = await loginTables();
    const u = await ctx.internalAdapter.findUserByEmail(email);
    if (u) await ctx.internalAdapter.deleteUser(u.user.id);
    await pool.end();
  }
});

test("staff accounts: you can't change your own role or switch yourself off; samples can't sign in and only they can be deleted", async ({ browser }) => {
  const sample = { email: "sample-staff-4@vslensmart.example", name: "Staff 4 · Patelguda" };
  const { pool, ctx } = await loginTables();
  const seeded = await ctx.internalAdapter.findUserByEmail(sample.email);
  await pool.end();
  test.skip(!seeded, "needs the sample staff (npm run db:seed)");
  try {
    const admin = await as(browser, "admin");
    await admin.goto("/admin/staff");
    await admin.getByRole("link", { name: `Manage ${accounts().admin.name}`, exact: true }).click();
    await expect(admin.getByRole("heading", { name: `${accounts().admin.name} (you)` })).toBeVisible();
    await expect(admin.locator("#sm-role")).toBeDisabled();
    await expect(admin.getByText("You can't switch off or delete your own account.")).toBeVisible();
    await expect(admin.getByRole("button", { name: "Switch off" })).toHaveCount(0);

    const tried = await signInWith(browser, sample.email, randomBytes(12).toString("base64url"));
    await expect(tried.getByText("That email and password don't match.")).toBeVisible();

    await admin.goto("/admin/staff");
    await expect(admin.locator(".bk-row", { hasText: sample.name })).toContainText("Sample, can't sign in");
    await admin.getByRole("link", { name: `Manage ${sample.name}` }).click();
    await expect(admin.getByText("Sample accounts can't sign in, so they have no password.")).toBeVisible();
    await ready(admin, "#sm-name");
    await admin.getByRole("button", { name: "Delete sample" }).click();
    await admin.getByRole("dialog").getByRole("button", { name: "Delete" }).click();
    await expect(admin).toHaveURL(/\/admin\/staff$/);
    await expect(admin.locator(".bk-row", { hasText: sample.name })).toHaveCount(0);
  } finally {
    // Put the sample back, as db:seed makes it
    const { pool: p, ctx: c } = await loginTables();
    if (!(await c.internalAdapter.findUserByEmail(sample.email))) {
      await c.internalAdapter.createUser({ email: sample.email, name: sample.name, emailVerified: true, role: "staff", branch: "patelguda" }, { method: "admin" });
    }
    await p.end();
  }
});
