/* Staff Bookings and Enquiries lists, and retention (sprint 5.4 part C;
   Requirements_Admin.md 7, Requirements_Privacy.md 4.5): staff see and update
   customer rows, only an admin deletes, logged-out visitors get nothing, and
   old rows are deleted after the retention period (DUMMY D9). Test rows use
   names starting "E2E List" and are removed afterwards. */
import { expect, test, type Browser, type Page } from "@playwright/test";
import { nowInIndia } from "../src/lib/booking-rules";
import { RETENTION_DAYS } from "../src/lib/site-config";
import { accounts, connect, type Role } from "./helpers";

const today = nowInIndia().day;
const STAMP = String(Date.now()).slice(-6);
const BOOKED = `E2E List Booking ${STAMP}`;
const ASKED = `E2E List Enquiry ${STAMP}`;

async function owner() {
  const c = await connect("owner");
  await c.query("select set_config('app.role', 'admin', false)");
  return c;
}
async function as(browser: Browser, role: Role): Promise<Page> {
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  const a = accounts()[role];
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(a.email);
  await page.getByLabel("Password").fill(a.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: /^Good (morning|afternoon|evening)/ })).toBeVisible();
  return page;
}

test.beforeAll(async () => {
  const c = await owner();
  const branch = (await c.query("select id from branches where slug = 'indresham'")).rows[0].id;
  await c.query(`insert into appointments (reference, branch_id, day, slot_start, name, phone, note, address, consent_at)
                 values ('E2E-' || substr(md5(random()::text), 1, 6), $1, $2, '18:40', $3, '9000000011', 'Reading glasses', 'E2E Colony', now())`, [branch, today, BOOKED]);
  await c.query(`insert into enquiries (name, phone, branch, topic, message, frame_code, reply_by, consent_at)
                 values ($1, '9000000012', 'patelguda', 'frames', 'About frame VSF-1024: is it in stock?', 'VSF-1024', 'call', now())`, [ASKED]);
  await c.end();
});
test.afterAll(async () => {
  const c = await owner();
  await c.query("delete from appointments where name like 'E2E List%'");
  await c.query("delete from enquiries where name like 'E2E List%'");
  await c.end();
});
test.describe.configure({ mode: "serial" });

test("logged out: the lists send you to sign in and show no customer", async ({ request }) => {
  for (const path of ["/admin/bookings", "/admin/enquiries"]) {
    const res = await request.get(path, { maxRedirects: 0 });
    expect([302, 303, 307, 308], path).toContain(res.status());
    expect(res.headers()["location"], path).toMatch(/\/admin\/login/);
    expect(await res.text()).not.toContain("E2E List");
  }
});

test("staff see today's booking with its details, change its status, and can't delete", async ({ browser }) => {
  const page = await as(browser, "staff");
  await page.goto(`/admin/bookings?day=${today}&branch=both`);
  const row = page.locator(".bk-row", { hasText: BOOKED });
  await expect(row).toContainText("9000000011");
  await expect(row).toContainText("Note: Reading glasses");
  await expect(row).toContainText("Address: E2E Colony");
  await expect(row.getByRole("link", { name: `Call ${BOOKED}` })).toHaveAttribute("href", "tel:+919000000011");
  await expect(row.getByRole("button", { name: /^Delete/ }), "staff can't delete").toHaveCount(0);
  await row.getByRole("combobox", { name: /Status for/ }).selectOption("attended");
  await expect.poll(async () => {
    const c = await owner();
    const s = (await c.query("select status from appointments where name = $1", [BOOKED])).rows[0]?.status;
    await c.end();
    return s;
  }).toBe("attended");
});

test("enquiries: new ones listed with the message; marking Replied moves it", async ({ browser }) => {
  const page = await as(browser, "staff");
  await page.goto("/admin/enquiries");
  const row = page.locator(".bk-row", { hasText: ASKED });
  await expect(row).toContainText("Frames (VSF-1024)");
  await expect(row).toContainText("About frame VSF-1024: is it in stock?");
  await expect(row).toContainText("prefers a call");
  await row.getByRole("combobox", { name: /Status for/ }).selectOption("replied");
  await expect.poll(async () => {
    await page.goto("/admin/enquiries?status=replied");
    return page.locator(".bk-row", { hasText: ASKED }).count();
  }).toBe(1);
  await page.goto("/admin/enquiries");
  await expect(page.locator(".bk-row", { hasText: ASKED })).toHaveCount(0);
});

test("an admin deletes a booking after confirming", async ({ browser }) => {
  const page = await as(browser, "admin");
  await page.goto(`/admin/bookings?day=${today}&branch=both`);
  const row = page.locator(".bk-row", { hasText: BOOKED });
  await row.getByRole("button", { name: `Delete ${BOOKED}, 6:40 PM` }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete booking" }).click();
  await expect(page.locator(".bk-row", { hasText: BOOKED })).toHaveCount(0);
  const c = await owner();
  expect((await c.query("select count(*)::int n from appointments where name = $1", [BOOKED])).rows[0].n).toBe(0);
  await c.end();
});

test("retention: rows older than the period are deleted, newer ones kept; a short period is refused", async () => {
  const c = await owner();
  const branch = (await c.query("select id from branches where slug = 'patelguda'")).rows[0].id;
  const old = `now() - interval '${RETENTION_DAYS + 1} days'`;
  await c.query(`insert into appointments (reference, branch_id, day, slot_start, name, phone, consent_at, created_at)
                 values ('E2E-' || substr(md5(random()::text), 1, 6), $1, current_date - ${RETENTION_DAYS + 1}, '10:00', 'E2E List Old booking', '9000000013', ${old}, ${old})`, [branch]);
  await c.query(`insert into enquiries (name, phone, topic, message, consent_at, created_at)
                 values ('E2E List Old enquiry', '9000000014', 'other', 'An old message from long ago', ${old}, ${old})`);
  await c.end();

  // The website's own user, as the public role (as after a booking)
  const app = await connect("app");
  await app.query("select set_config('app.role', 'public', false)");
  const n = (await app.query("select purge_expired($1) as n", [RETENTION_DAYS])).rows[0].n;
  expect(n).toBeGreaterThanOrEqual(2);
  await expect(app.query("select purge_expired(10)"), "a period under 30 days is refused").rejects.toThrow(/under 30 days/);
  expect((await app.query("select count(*)::int n from appointments")).rows[0].n, "and the public role still reads nothing").toBe(0);
  await app.end();

  const c2 = await owner();
  expect((await c2.query("select count(*)::int n from appointments where name = 'E2E List Old booking'")).rows[0].n).toBe(0);
  expect((await c2.query("select count(*)::int n from enquiries where name = 'E2E List Old enquiry'")).rows[0].n).toBe(0);
  expect((await c2.query("select count(*)::int n from enquiries where name = $1", [ASKED])).rows[0].n, "recent rows stay").toBe(1);
  await c2.end();
});
