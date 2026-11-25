/* Home page (sprint 5.2; Requirements_HomePage.md 5), at 360 / 768 / 1440 px.
   Expected content comes from the database with the site's own queries, so the
   tests hold whatever is stored (they need the seed data: frames, camps,
   reviews). Sections with nothing to show are left out by the page; the live
   data can't be emptied mid-run, so that branch is covered by the code only. */
import { expect, test, type Page } from "@playwright/test";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/db/schema";
import type { Tx } from "../src/lib/db";
import { catalogueQuery, type CatalogueItem } from "../src/lib/queries/catalogue";
import { campsQuery, testimonialsQuery, type CampItem, type TestimonialItem } from "../src/lib/queries/content";
import { branchesQuery, type Branch } from "../src/lib/queries/site";
import { addDays, nowInIndia } from "../src/lib/booking-rules";
import { connect } from "./helpers";

type Data = { frames: CatalogueItem[]; camps: CampItem[]; reviews: TestimonialItem[]; branches: Branch[] };
let data: Data | undefined;
async function db(): Promise<Data> {
  if (data) return data;
  const c = await connect("app");
  try {
    await c.query("select set_config('app.role', 'public', false)");
    const tx = drizzle(c, { schema }) as unknown as Tx;
    return (data = { frames: await catalogueQuery(tx, "frames"), camps: await campsQuery(tx), reviews: await testimonialsQuery(tx), branches: await branchesQuery(tx) });
  } finally {
    await c.end();
  }
}

const noScroll = (p: Page) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
/** Opens Home and waits until React has attached, so a click isn't lost. */
async function open(p: Page) {
  await p.goto("/");
  await p.waitForFunction(() => {
    const el = document.querySelector(".quick__card");
    return !!el && Object.keys(el).some((k) => k.startsWith("__react"));
  });
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(e.message));
  (page as Page & { errors: string[] }).errors = errors;
});
test.afterEach(async ({ page }) => {
  expect((page as Page & { errors: string[] }).errors, "console errors").toEqual([]);
});

test("hero: three lines with the years worked out from 1999, exactly two buttons, Since 1999; sections in order", async ({ page }) => {
  await open(page);
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(h1.locator(":scope > span")).toHaveText([`${new Date().getFullYear() - 1999} Years of Trust.`, "A Clearer Vision", "for Tomorrow."]);
  const buttons = page.locator(".hero__actions a");
  await expect(buttons).toHaveText(["Explore our frames", "Book an eye test"]);
  await expect(buttons.nth(0)).toHaveAttribute("href", "/frames");
  await expect(buttons.nth(1)).toHaveAttribute("href", "/book-eye-test");
  await expect(page.getByText(/try[- ]on/i)).toHaveCount(0);
  await expect(page.locator(".hero__legacy")).toContainText("Since 1999");
  // The DUMMY C12 hero slideshow (AI-generated people) shows only while developing, never in a build
  await expect(page.locator(".hero img, .hero__ctl")).toHaveCount(0);
  // Nor the DUMMY C24 photos (homepage tiles, the mega menus' Shop for tiles and Eye care cards)
  await expect(page.locator(".cat__img, .tile__img, .card__img")).toHaveCount(0);
  await expect(page.locator(".cat .ph")).toHaveCount(4);
  expect(await page.locator(".hero").getAttribute("style"), "no blurred backdrop photo either").toBeNull();
  await expect(page.locator("main h2")).toHaveText([
    "Welcome to the Optical Family", "Find your frame", "Featured frames", "Every lens, checked by experts",
    "Eye camps", "What our customers say", "Our branches", "Book your eye test",
  ]);
  expect(await noScroll(page), "sideways scroll").toBe(0);
});

test("quick cards: WhatsApp asks which branch; Visit a store goes to the branches; hours come from the database", async ({ page }) => {
  const { branches } = await db();
  await open(page);
  await page.locator(".quick__card", { hasText: "WhatsApp us" }).click();
  const picker = page.getByRole("dialog", { name: "WhatsApp which branch?" });
  await expect(picker).toBeVisible();
  await expect(picker.getByRole("link")).toHaveCount(branches.length);
  await page.keyboard.press("Escape");
  await expect(page.locator(".quick__card", { hasText: "Visit a store" })).toHaveAttribute("href", "/contact#branches");
  const hours = await page.locator(".u-hours").first().textContent(); // the utility bar's line, from the same rows
  await expect(page.locator(".trust__list")).toContainText(hours!.trim());
  await expect(page.locator(".trust__list")).toContainText(`${branches.length} branches: ${branches.map((b) => b.name).join(" & ")}`);
});

test("featured frames: the 8 newest live frames, linked; Enquire names the frame; the heart survives a reload", async ({ page }) => {
  const { frames } = await db();
  test.skip(!frames.length, "needs live frames (npm run db:seed)");
  const expected = frames.slice(0, 8);
  await open(page);
  const row = page.locator("#frames-row");
  await expect(row.locator(".fcard__name")).toHaveText(expected.map((f) => f.model));
  await expect(row.locator(".fcard__name").first()).toHaveAttribute("href", expected[0].href);
  const sold = expected.filter((f) => f.sold).length;
  await expect(row.locator(".fcard__badge", { hasText: "Sold out" })).toHaveCount(sold);

  const f = expected[0];
  const card = row.locator(".fcard").first();
  const enquire = card.getByRole("button", { name: `Enquire about ${f.brand} ${f.model} on WhatsApp` });
  await enquire.evaluate((el) => el.scrollIntoView({ block: "center" })); // clear of the bottom bar
  await enquire.click();
  const picker = page.getByRole("dialog", { name: "WhatsApp which branch?" });
  await expect(picker).toBeVisible();
  await expect.poll(async () => decodeURIComponent(new URL((await picker.getByRole("link").first().getAttribute("href"))!).searchParams.get("text") ?? ""))
    .toContain(f.code);
  await page.keyboard.press("Escape");

  const heart = card.getByRole("button", { name: `Save ${f.brand} ${f.model} to favourites` });
  await heart.click();
  await expect(heart).toHaveAttribute("aria-pressed", "true");
  await open(page);
  await expect(page.locator("#frames-row .fcard").first().locator(".fcard__fav")).toHaveAttribute("aria-pressed", "true");
  expect(await noScroll(page), "the row scrolls inside itself, not the page").toBe(0);
});

test("eye camps, reviews and branches show the database's content; each branch has its own number", async ({ page }) => {
  const { camps, reviews, branches } = await db();
  const today = nowInIndia().day;
  const next = camps.find((c) => c.day >= today);
  const past = camps.filter((c) => c.day < today).reverse().slice(0, 4);
  await open(page);
  if (next) {
    await expect(page.locator(".camp-next h3")).toHaveText(next.title);
    await expect(page.locator(".camp-next").getByRole("link", { name: "Details" })).toHaveAttribute("href", `/eye-camps/${next.slug}`);
  }
  await expect(page.locator(".camp-past figcaption")).toHaveCount(past.length);
  if (past[0]) await expect(page.locator(".camp-past figcaption").first()).toContainText(past[0].title);

  await expect(page.locator(".review-card")).toHaveCount(Math.min(3, reviews.length));
  if (reviews[0]) await expect(page.locator(".review-card").first()).toContainText(reviews[0].quote);

  for (const b of branches) {
    const card = page.locator(`article#${b.slug}`);
    await expect(card.locator(".branch__name")).toHaveText(b.name);
    if (!b.dummy) await expect(card.getByRole("link", { name: /^Call/ })).toHaveAttribute("href", `tel:+91${b.phone}`);
  }
});

test("the book band hands the branch and day to the booking page and saves nothing", async ({ page }) => {
  const { branches } = await db();
  const branch = branches[branches.length - 1];
  const day = addDays(nowInIndia().day, 2);
  await open(page);
  const form = page.locator(".book-form");
  await form.getByLabel("Branch").selectOption(branch.slug);
  await form.getByLabel("Preferred date").fill(day);
  await expect(form.getByLabel("Preferred date")).toHaveAttribute("min", nowInIndia().day);
  await form.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL((u) => u.pathname === "/book-eye-test" && u.searchParams.get("branch") === branch.slug && u.searchParams.get("date") === day);
});

test("nav: see-through navy with white text on Home in light mode, more solid past the hero; other pages keep their bar", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await open(page);
  const look = () => page.evaluate(() => {
    const nav = document.querySelector(".nav")!;
    return { bg: getComputedStyle(nav).backgroundColor, ink: getComputedStyle(nav.querySelector(".brand__name")!).color, past: nav.classList.contains("is-past-hero") };
  });
  const top = await look();
  expect(top.bg, "see-through navy").toMatch(/^rgba\(13, 27, 42, 0\.[0-9]+\)$/);
  expect(top.ink, "white text").toBe("rgb(255, 255, 255)");
  expect(top.past).toBe(false);
  await page.locator("#branches").scrollIntoViewIfNeeded();
  await expect.poll(async () => (await look()).past).toBe(true);

  await page.goto("/contact");
  const other = await page.evaluate(() => getComputedStyle(document.querySelector(".nav")!).backgroundColor);
  expect(other, "solid white bar elsewhere in light mode").toBe("rgb(255, 255, 255)");
});

test("quote band: changes slowly, pauses on request, and stays still with reduced motion", async ({ page }) => {
  await page.clock.install();
  await open(page);
  const text = page.locator("#quote-text");
  const first = await text.textContent();
  await page.clock.runFor(8000);
  await expect(text).not.toHaveText(first!);
  await page.getByRole("button", { name: "Pause quotes" }).click();
  const paused = await text.textContent();
  await page.clock.runFor(16000);
  await expect(text).toHaveText(paused!);
  await page.getByRole("button", { name: "Quote 3" }).click();
  await page.clock.runFor(1000);
  await expect(text).toHaveText("Quality you can see. Trust you can feel.");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  const still = await text.textContent();
  await page.clock.runFor(16000);
  await expect(text).toHaveText(still!);
  await expect(page.getByRole("button", { name: /^(Pause|Play) quotes$/ })).toHaveCount(0);
});
