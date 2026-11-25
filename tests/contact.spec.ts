/* Contact (Requirements_Contact.md 7), at 360 / 768 / 1440 px: each branch card
   uses its own number, maps wait until they're needed, the enquiry form saves
   (public: insert only) with prefill and clear messages, and search engines
   get no placeholder phone. Test enquiries use the name "E2E Contact" and are
   removed afterwards. Google Maps is answered locally, so tests don't depend on it. */
import { expect, test, type Page } from "@playwright/test";
import { connect } from "./helpers";

const NAME = "E2E Contact Customer";

async function owner() {
  const c = await connect("owner");
  await c.query("select set_config('app.role', 'admin', false)");
  return c;
}

test.beforeEach(async ({ page }) => {
  await page.route(/maps\.google\.com|google\.com\/maps/, (r) => r.fulfill({ contentType: "text/html", body: "<p>map</p>" }));
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(e.message));
  (page as Page & { errors: string[] }).errors = errors;
});
test.afterEach(async ({ page }) => {
  expect((page as Page & { errors: string[] }).errors, "console errors").toEqual([]);
  const c = await owner();
  await c.query("delete from enquiries where name = $1", [NAME]);
  await c.end();
});

async function open(page: Page, query = "") {
  await page.goto(`/contact${query}`);
  await page.waitForFunction(() => {
    const el = document.querySelector("#message-text");
    return !!el && Object.keys(el).some((k) => k.startsWith("__react"));
  });
}

test("both branch cards: their own number for Call and WhatsApp, hours, services, open status", async ({ page }) => {
  const c = await owner();
  const rows = (await c.query("select slug, name, phone, whatsapp from branches where is_visible order by sort, name")).rows as { slug: string; name: string; phone: string; whatsapp: string }[];
  await c.end();
  await open(page);
  for (const b of rows) {
    const card = page.locator(`article#${b.slug}`);
    await expect(card.getByRole("heading", { name: b.name })).toBeVisible();
    await expect(card.getByRole("link", { name: `Call the ${b.name} branch` })).toHaveAttribute("href", `tel:+91${b.phone}`);
    const wa = await card.getByRole("link", { name: `WhatsApp the ${b.name} branch` }).getAttribute("href");
    expect(wa!.startsWith(`https://wa.me/91${b.whatsapp}?text=`)).toBe(true);
    expect(decodeURIComponent(wa!)).toContain(`I have a question for the ${b.name} branch.`);
    await expect(card.getByRole("link", { name: `Directions to the ${b.name} branch` })).toHaveAttribute("target", "_blank");
    await expect(card).toContainText("Mon–Sun · 9 AM–9:30 PM");
    await expect(card.getByRole("list", { name: `Services at ${b.name}` }).getByRole("listitem")).toHaveCount(4);
    await expect(card.locator(".status")).toHaveText(/^(Open now · until 9:30 PM|Closed now · opens 9 AM( tomorrow)?|Closed today)$/);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), "sideways scroll").toBe(0);
});

test("maps load only when scrolled to (or on Show map), with a title", async ({ page }) => {
  let mapRequests = 0;
  page.on("request", (r) => { if (/maps\.google\.com/.test(r.url())) mapRequests++; });
  await page.setViewportSize({ width: page.viewportSize()!.width, height: 500 });
  await open(page);
  expect(mapRequests, "no Google request on load").toBe(0);
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.locator("#indresham").scrollIntoViewIfNeeded();
  await expect(page.locator('iframe[title="Map of the Indresham branch"]')).toBeAttached();
  await expect.poll(() => mapRequests).toBeGreaterThan(0);
});

test("send a message: saved for staff, the thank-you shows only what was sent", async ({ page }) => {
  await open(page);
  await page.getByLabel("Name", { exact: true }).fill(NAME);
  await page.getByLabel("Mobile number").fill("+91 98765 43210");
  await page.getByLabel(/Your area or address/).fill("E2E Colony");
  await page.locator('label.rchoice:has(input[name="branch"][value="indresham"])').click();
  await page.getByLabel("Topic").selectOption("repair");
  await page.getByLabel("Message", { exact: true }).fill("My frame's hinge is loose. Can you fix it?");
  await page.locator('label.rchoice:has(input[name="replyBy"][value="call"])').click();
  await page.getByLabel(/I agree that VS Lens Mart/).check();
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByRole("heading", { name: "Thanks, we've got your message." })).toBeVisible();
  await expect(page.locator(".bdone")).toContainText("We'll call you back within a day.");
  await expect(page.locator(".bdone dl")).toContainText("Repair or adjustment");
  await expect(page.locator(".bdone dl")).toContainText("•••••• 3210");
  const c = await owner();
  const row = (await c.query("select phone, address, branch, topic, reply_by, status, consent_at from enquiries where name = $1", [NAME])).rows[0];
  await c.end();
  expect(row).toMatchObject({ phone: "9876543210", address: "E2E Colony", branch: "indresham", topic: "repair", reply_by: "call", status: "new" });
  expect(row.consent_at).not.toBeNull();
});

test("?topic=&frame= prefill the form; nonsense is ignored", async ({ page }) => {
  await open(page, "?topic=frames&frame=VSF-1024");
  await expect(page.getByLabel("Topic")).toHaveValue("frames");
  await expect(page.getByLabel("Message", { exact: true })).toHaveValue("About frame VSF-1024: ");
  await open(page, "?topic=weapons&frame=%3Cb%3Ex%3C/b%3E");
  await expect(page.getByLabel("Topic")).toHaveValue("");
  await expect(page.getByLabel("Message", { exact: true })).toHaveValue("");
});

test("missing details are caught with clear messages; nothing is saved", async ({ page }) => {
  await open(page);
  await page.getByLabel("Name", { exact: true }).fill(NAME);
  await page.getByLabel("Message", { exact: true }).fill("short");
  await page.getByRole("button", { name: "Send message" }).click();
  const summary = page.locator(".esummary");
  await expect(summary).toBeFocused();
  for (const msg of ["Enter a 10-digit mobile number starting with 6, 7, 8 or 9", "Choose a topic", "Write a message of at least 10 characters", "Tick the box to agree, so we can reply to you"]) {
    await expect(summary).toContainText(msg);
  }
  const c = await owner();
  expect((await c.query("select count(*)::int n from enquiries where name = $1", [NAME])).rows[0].n).toBe(0);
  await c.end();
});

test("search engines get both branches, without the placeholder phone", async ({ page }) => {
  const c = await owner();
  const dummy = (await c.query("select name from branches where phone ~ '^0+$'")).rows.map((r) => r.name as string);
  await c.end();
  await open(page);
  const data = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!) as { "@type": string; name: string; telephone?: string; openingHours: string }[];
  expect(data.length).toBeGreaterThan(0);
  for (const d of data) {
    expect(d["@type"]).toBe("OpticianStore");
    expect(d.openingHours).toBe("Mo-Su 09:00-21:30");
    if (dummy.some((n) => d.name.endsWith(n))) expect(d.telephone).toBeUndefined();
    else expect(d.telephone).toMatch(/^\+91[6-9]\d{9}$/);
  }
  await expect(page.locator('.consent a[href="/privacy"]')).toHaveText("Privacy policy");
});
