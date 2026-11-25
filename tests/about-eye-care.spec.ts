/* Eye care and About (Requirements_EyeCare.md 5, Requirements_About.md 5), at
   360 / 768 / 1440 px: sections and anchors, the safety note, the FAQ by
   keyboard with confirmed answers only in the search-engine data, the years
   worked out from 1999, and the database sections shown only when they have
   something (expected counts come from the database). */
import { expect, test, type Page } from "@playwright/test";
import { connect } from "./helpers";

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(e.message));
  (page as Page & { errors: string[] }).errors = errors;
});
test.afterEach(async ({ page }) => {
  expect((page as Page & { errors: string[] }).errors, "console errors").toEqual([]);
});

const noScroll = (p: Page) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
/** The section starts below the sticky header (shared scroll-margin-top). */
async function belowHeader(page: Page, id: string) {
  const [header, top] = await page.evaluate((x) => [
    document.querySelector(".site-header")!.getBoundingClientRect().bottom,
    document.getElementById(x)!.getBoundingClientRect().top,
  ], id);
  expect(top, `#${id} is below the header`).toBeGreaterThanOrEqual(header - 1);
}

test("eye care: the four services, each mega-menu anchor lands below the header", async ({ page }) => {
  await page.goto("/eye-care");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Eye care for the whole family.");
  await expect(page.locator(".svc h3")).toHaveText(["Eye testing", "Instant lens fitting", "Frame adjustment", "Frame repair"]);
  await expect(page.locator("#eye-testing")).toContainText("5–20 minutes");
  for (const id of ["eye-testing", "lens-fitting", "frame-adjustment", "frame-repair", "faq"]) {
    await page.goto(`/eye-care#${id}`);
    await expect(page.locator(`#${id}`)).toBeInViewport();
    await belowHeader(page, id);
  }
  expect(await noScroll(page), "sideways scroll").toBe(0);
});

test("eye care: the safety note always shows; the FAQ works by keyboard; search engines get confirmed answers only", async ({ page }) => {
  await page.goto("/eye-care");
  await expect(page.getByRole("note", { name: "When to see a doctor" })).toContainText("See a doctor or hospital straight away.");
  const q = page.locator("#faq summary").first();
  await q.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#faq details").first()).toHaveAttribute("open", "");
  await expect(page.locator("#faq details").first()).toContainText("Usually 5 to 20 minutes.");
  const data = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
  const asked = data.mainEntity.map((e: { name: string }) => e.name);
  expect(data["@type"]).toBe("FAQPage");
  expect(asked).toContain("How long does an eye test take?");
  for (const unconfirmed of ["Is the eye test free?", "Do I need an appointment?", "Can I use a prescription from another doctor?"]) {
    expect(asked, unconfirmed).not.toContain(unconfirmed);
  }
  await expect(page.getByText("General information only, not medical advice.").first()).toBeVisible();
  await expect(page.getByText(/try-on/i)).toHaveCount(0);
});

test("about: years from 1999, the journey as an ordered list, anchors below the header", async ({ page }) => {
  const years = new Date().getFullYear() - 1999;
  await page.goto("/about");
  await expect(page.locator(".hero__sub")).toContainText(`For ${years} years`);
  await expect(page.locator("ol.timeline > li .timeline__year").first()).toHaveText("1999");
  await expect(page.locator("ol.timeline > li .timeline__year").last()).toHaveText("Today");
  await expect(page.locator("ol.timeline > li").last()).toContainText(`${years} years`);
  await expect(page.locator("body")).not.toContainText(/Venkateswarlu/);
  for (const id of ["family", "journey", "team", "branches"]) {
    await page.goto(`/about#${id}`);
    await expect(page.locator(`#${id}`)).toBeInViewport();
    await belowHeader(page, id);
  }
  const org = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
  expect(org).toMatchObject({ "@type": "Organization", foundingDate: "1999" });
  expect(await noScroll(page), "sideways scroll").toBe(0);
});

test("about: branches, gallery preview, reviews and the camps band follow the database", async ({ page }) => {
  const c = await connect("app");
  await c.query("select set_config('app.role', 'public', false)");
  const n = async (sql: string) => Number((await c.query(sql)).rows[0].n);
  const branches = await n("select count(*) n from branches where is_visible");
  const photos = await n("select count(*) n from gallery_photos where is_visible and tag <> 'customers'");
  const reviews = await n("select count(*) n from testimonials where is_visible");
  const upcoming = await n("select count(*) n from eye_camps where is_visible and day >= (now() at time zone 'Asia/Kolkata')::date");
  await c.end();

  await page.goto("/about");
  await expect(page.locator("#branches article.branch")).toHaveCount(branches);
  if (photos) {
    await expect(page.locator("#gallery .gp-tile")).toHaveCount(Math.min(5, photos));
    await expect(page.getByRole("link", { name: "View the gallery" })).toHaveAttribute("href", "/gallery");
  } else await expect(page.locator("#gallery"), "hidden with no photos").toHaveCount(0);
  if (reviews) await expect(page.locator("#reviews .review-card")).toHaveCount(Math.min(6, reviews));
  else await expect(page.locator("#reviews"), "hidden with no reviews").toHaveCount(0);
  await expect(page.locator(".stars"), "no invented star ratings").toHaveCount(0);
  await expect(page.locator(".camp-band .link-arrow")).toHaveText(upcoming ? /See eye camps/ : /See our past camps/);
});
