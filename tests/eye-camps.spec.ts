/* Eye camps pages (Requirements_EyeCamps.md 6), at 360 / 768 / 1440 px. Expected
   results come from the database with the site's own query and the same India-time
   rule, so the tests hold whatever camps are stored (they need the seed's camps). */
import { expect, test, type Page } from "@playwright/test";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/db/schema";
import { isUpcoming, longDate } from "../src/lib/camp-rules";
import type { Tx } from "../src/lib/db";
import { campsQuery, type CampItem } from "../src/lib/queries/content";
import { connect } from "./helpers";

async function camps(): Promise<{ upcoming: CampItem[]; past: CampItem[] }> {
  const c = await connect("app");
  try {
    await c.query("select set_config('app.role', 'public', false)");
    const all = await campsQuery(drizzle(c, { schema }) as unknown as Tx);
    return { upcoming: all.filter((x) => isUpcoming(x.day)), past: all.filter((x) => !isUpcoming(x.day)).reverse() };
  } finally {
    await c.end();
  }
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

test("/eye-camps: the soonest camp first, then more upcoming, then past newest first, with the totals", async ({ page }) => {
  const { upcoming, past } = await camps();
  test.skip(!upcoming.length || !past.length, "needs the seed's camps (npm run db:seed)");
  await page.goto("/eye-camps");
  await expect(page.locator(".next-camp h3")).toHaveText(upcoming[0].title);
  await expect(page.locator(".camp-rows .camp-row b")).toHaveText(upcoming.slice(1).map((c) => c.title));
  const people = past.reduce((n, c) => n + (c.people ?? 0), 0);
  await expect(page.locator(".camp-stat")).toHaveText(`${past.length} camp${past.length === 1 ? "" : "s"} · ${people.toLocaleString("en-IN")} people checked`);
  await expect(page.locator(".past-grid .ccard h3")).toHaveText(past.slice(0, 9).map((c) => c.title));
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), "sideways scroll").toBe(0);
});

test("next camp: Add to calendar is a real calendar file and Share on WhatsApp names the camp", async ({ page }) => {
  const { upcoming } = await camps();
  test.skip(!upcoming.length, "needs an upcoming camp");
  const c = upcoming[0];
  await page.goto("/eye-camps");
  const ics = await page.getByRole("link", { name: "Add to calendar" }).getAttribute("href");
  const text = decodeURIComponent(ics!.split(",").slice(1).join(","));
  expect(text).toContain("BEGIN:VCALENDAR");
  expect(text).toContain(`DTSTART:${c.day.replaceAll("-", "")}T${c.starts.replace(":", "")}00`);
  const share = await page.getByRole("link", { name: "Share on WhatsApp" }).getAttribute("href");
  expect(share).toMatch(/^https:\/\/wa\.me\/\?text=/);
  expect(decodeURIComponent(share!)).toContain(`${c.title}: ${longDate(c.day)}`);
  await expect(page.getByRole("link", { name: "Directions" })).toHaveAttribute("target", "_blank");
});

test("past camps: year chips filter and live in the address", async ({ page }) => {
  const { past } = await camps();
  const years = [...new Set(past.map((c) => c.day.slice(0, 4)))];
  test.skip(years.length < 2, "needs past camps in two years");
  await page.goto("/eye-camps");
  await page.waitForFunction(() => { const b = document.querySelector(".year-chips button"); return !!b && Object.keys(b).some((k) => k.startsWith("__react")); });
  const y = years[1];
  await page.getByRole("group", { name: "Filter by year" }).getByRole("button", { name: y, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`\\?year=${y}`));
  await expect(page.locator(".past-grid .ccard")).toHaveCount(Math.min(9, past.filter((c) => c.day.startsWith(y)).length));
  await page.goto(`/eye-camps?year=${years[0]}`);
  await expect(page.getByRole("button", { name: years[0], exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.goto("/eye-camps?year=1900");
  await expect(page.getByRole("button", { name: "All", exact: true }), "an unknown year is ignored").toHaveAttribute("aria-pressed", "true");
});

test("camp detail: upcoming shows what's offered and what to bring; past shows people checked; unknown is not available", async ({ page }) => {
  const { upcoming, past } = await camps();
  test.skip(!upcoming.length || !past.length, "needs the seed's camps");
  const u = upcoming[0];
  await page.goto(`/eye-camps/${u.slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(u.title);
  await expect(page.locator(".status")).toHaveText("Upcoming");
  await expect(page.getByRole("heading", { name: "What to bring" })).toBeVisible();
  const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
  expect(ld).toMatchObject({ "@type": "Event", name: u.title, startDate: `${u.day}T${u.starts}:00+05:30` });

  const p = past.find((c) => c.people != null) ?? past[0];
  await page.goto(`/eye-camps/${p.slug}`);
  await expect(page.locator(".status")).toHaveText("Past camp");
  if (p.people != null) await expect(page.locator(".people-big")).toHaveText(p.people.toLocaleString("en-IN"));
  await expect(page.locator('script[type="application/ld+json"]'), "no Event data for past camps").toHaveCount(0);

  page.removeAllListeners("console"); // in development the browser logs the 404 response itself
  await page.goto("/eye-camps/no-such-camp");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This camp isn’t available.");
  await expect(page.getByRole("navigation", { name: "Where to next" }).getByRole("link").first()).toHaveAttribute("href", "/eye-camps");
});
