/* Book an eye test (Requirements_Booking.md 8), at 360 / 768 / 1440 px: the
   three steps, prefill, slot rules, validation, "just filled up", the
   confirmation's WhatsApp link to the right branch, and nothing personal in
   what the browser receives. Test bookings use the name "E2E Booking" and are
   removed afterwards. */
import { expect, test, type Page } from "@playwright/test";
import { addDays, dayLabel, nowInIndia } from "../src/lib/booking-rules";
import { connect } from "./helpers";

const NAME = "E2E Booking Customer";
const tomorrow = addDays(nowInIndia().day, 1);
const isPhone = (p: Page) => (p.viewportSize()?.width ?? 0) < 768;

async function owner() {
  const c = await connect("owner");
  await c.query("select set_config('app.role', 'admin', false)");
  return c;
}
async function branch(slug: string) {
  const c = await owner();
  const b = (await c.query("select id, name, whatsapp from branches where slug = $1", [slug])).rows[0] as { id: string; name: string; whatsapp: string };
  await c.end();
  return b;
}
async function fill(slug: string, day: string, time: string, n: number) {
  const b = await branch(slug), c = await owner();
  for (let i = 0; i < n; i++) {
    await c.query(`insert into appointments (reference, branch_id, day, slot_start, name, phone, consent_at)
                   values ('E2E-' || substr(md5(random()::text), 1, 6), $1, $2, $3, $4, '9000000009', now())`, [b.id, day, time, `${NAME} filler`]);
  }
  await c.end();
}

test.afterEach(async () => {
  const c = await owner();
  await c.query("delete from appointments where name like 'E2E Booking%'");
  await c.end();
});

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

/** Opens the page and waits until React has attached, so a tap isn't lost. */
async function open(page: Page, query = "") {
  await page.goto(`/book-eye-test${query}`);
  await page.waitForFunction(() => {
    const el = document.querySelector("#name");
    return !!el && Object.keys(el).some((k) => k.startsWith("__react")) && document.querySelectorAll("input[name=day-choice]").length > 0;
  });
}
const chip = (page: Page, group: string, value: string) => page.locator(`label.rchoice:has(input[name="${group}"][value="${value}"])`);
const slot = (page: Page, time: string) => chip(page, "time-choice", time);

async function pickBranchDayTime(page: Page, slug: string, day: string, time: string) {
  await chip(page, "branch-choice", slug).click();
  await chip(page, "day-choice", day).click();
  await expect(slot(page, time)).toBeVisible();
  await slot(page, time).click();
}
async function details(page: Page, phone = "+91 98765 43210") {
  await page.getByLabel("Full name").fill(NAME);
  await page.getByLabel("Mobile number").fill(phone);
  await expect(page.getByLabel("Mobile number"), "the whole number fits").toHaveValue(phone);
  await page.getByLabel(/I agree that VS Lens Mart/).check();
}

test("book in three steps; the confirmation sends the reference to the chosen branch on WhatsApp", async ({ page }) => {
  const b = await branch("indresham");
  await open(page);
  if (isPhone(page)) await expect(page.locator(".stickybar"), "the sticky bar would repeat the form").toHaveCount(0);
  await expect(page.locator("#step2"), "step 2 waits for a branch and day").toHaveAttribute("disabled");
  await pickBranchDayTime(page, "indresham", tomorrow, "16:20");
  await expect(page.locator(".bsubmit__sum")).toHaveText(`${b.name} · ${dayLabel(tomorrow)} · 4:20 PM`);
  await details(page);
  await page.getByRole("button", { name: "Confirm booking" }).click();

  await expect(page.getByRole("heading", { name: "You're booked!" })).toBeVisible();
  const ref = (await page.locator(".bdone__ref").textContent())!;
  expect(ref).toMatch(/^VS-[A-Z2-9]{4}$/);
  await expect(page.locator(".bdone dl")).toContainText("•••••• 3210");
  const wa = await page.getByRole("link", { name: /Send to the branch on WhatsApp/ }).getAttribute("href");
  expect(wa!.startsWith(`https://wa.me/91${b.whatsapp}?text=`)).toBe(true);
  expect(decodeURIComponent(wa!.split("?text=")[1])).toBe(`Hi VS Lens Mart, I've booked an eye test at ${b.name} on ${dayLabel(tomorrow)} at 4:20 PM. Ref ${ref}. Name: ${NAME}.`);
  await expect(page.getByText("Need to change or cancel?")).toBeVisible();
  expect(await page.locator(".bdone a[download]").getAttribute("href")).toMatch(/^data:text\/calendar/);

  const c = await owner();
  const row = (await c.query("select day::text, to_char(slot_start, 'HH24:MI') t, phone, status, consent_at from appointments where reference = $1", [ref])).rows[0];
  await c.end();
  expect(row).toMatchObject({ day: tomorrow, t: "16:20", phone: "9876543210", status: "booked" });
  expect(row.consent_at, "consent stored with a time").not.toBeNull();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), "sideways scroll").toBe(0);
});

test("?branch= and ?date= from the home page are applied; nonsense is ignored", async ({ page }) => {
  await open(page, `?branch=patelguda&date=${tomorrow}`);
  await expect(page.locator('input[name="branch-choice"][value="patelguda"]')).toBeChecked();
  await expect(page.locator(`input[name="day-choice"][value="${tomorrow}"]`)).toBeChecked();
  await expect(slot(page, "12:00")).toBeVisible();

  await open(page, "?branch=mumbai&date=1999-01-01");
  await expect(page.locator('input[name="branch-choice"]:checked')).toHaveCount(0);
  await expect(page.locator('input[name="day-choice"]:checked')).toHaveCount(0);
});

test("full slots show Full and can't be picked; the browser never receives who booked", async ({ page }) => {
  await fill("indresham", tomorrow, "11:00", 2);
  const bodies: string[] = [];
  page.on("response", async (r) => { if (r.request().method() === "POST") bodies.push(await r.text().catch(() => "")); });
  await open(page);
  await chip(page, "branch-choice", "indresham").click();
  await chip(page, "day-choice", tomorrow).click();
  await expect(slot(page, "11:00")).toContainText("Full");
  await expect(page.locator('input[name="time-choice"][value="11:00"]')).toBeDisabled();
  await expect(page.locator('input[name="time-choice"][value="11:20"]')).toBeEnabled();
  expect(bodies.length, "slots came from the server").toBeGreaterThan(0);
  expect(bodies.join(" ")).not.toMatch(/E2E Booking|9000000009/);
});

test("missing details are caught with clear messages, and focus moves to the summary", async ({ page }) => {
  await open(page);
  await pickBranchDayTime(page, "indresham", tomorrow, "12:20");
  await page.getByLabel("Mobile number").fill("12345");
  await page.getByRole("button", { name: "Confirm booking" }).click();
  const summary = page.getByRole("alert").filter({ hasText: "Please check your booking" });
  await expect(summary).toBeFocused();
  await expect(summary).toContainText("Enter your full name");
  await expect(summary).toContainText("Enter a 10-digit mobile number starting with 6, 7, 8 or 9");
  await expect(summary).toContainText("Tick the box to agree, so we can manage your booking");
  const c = await owner();
  expect((await c.query("select count(*)::int n from appointments where name like 'E2E Booking%'")).rows[0].n).toBe(0);
  await c.end();
});

test("if the slot fills while the customer is typing, they're told and keep their details", async ({ page }) => {
  await open(page);
  await pickBranchDayTime(page, "indresham", tomorrow, "13:00");
  await details(page);
  await fill("indresham", tomorrow, "13:00", 2); // someone else takes both places
  await page.getByRole("button", { name: "Confirm booking" }).click();
  await expect(page.locator(".esummary")).toContainText("Sorry, 1:00 PM just filled up");
  await expect(page.getByLabel("Full name")).toHaveValue(NAME);
  await expect(slot(page, "13:00")).toContainText("Full");
});

test("a filled-in spam trap looks like success but saves nothing", async ({ page }) => {
  await open(page);
  await pickBranchDayTime(page, "indresham", tomorrow, "14:00");
  await details(page);
  await page.locator('input[name="website"]').evaluate((el: HTMLInputElement) => { el.value = "http://spam.example"; });
  await page.getByRole("button", { name: "Confirm booking" }).click();
  await expect(page.getByRole("heading", { name: "You're booked!" })).toBeVisible();
  const c = await owner();
  expect((await c.query("select count(*)::int n from appointments where name = $1", [NAME])).rows[0].n).toBe(0);
  await c.end();
});
