/* The frame form end to end (sprint 5.3 part B, Requirements_Admin.md section 6):
   staff add a frame with photos on a phone and send it for approval; it isn't
   public until an admin approves it; send back shows the note; errors are
   plain; staff hide, only an admin deletes (and the photo files go too). */
import { existsSync } from "node:fs";
import path from "node:path";
import { expect, test, type Browser, type Page } from "@playwright/test";
import { accounts, connect, type Role } from "./helpers";

const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
const run = String(Math.floor(Math.random() * 90000) + 10000);
const CODE_A = `QA-${run}`, CODE_B = `QB-${run}`;

async function as(browser: Browser, role: Role, width = 1280): Promise<Page> {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  const a = accounts()[role];
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(a.email);
  await page.getByLabel("Password").fill(a.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: /^Good (morning|afternoon|evening)/ })).toBeVisible();
  return page;
}

/** Waits until React has attached to the form, so a chosen file isn't lost. */
async function formReady(page: Page) {
  await page.waitForFunction(() => {
    const el = document.querySelector("[data-testid=photo-input]");
    return !!el && Object.keys(el).some((k) => k.startsWith("__react"));
  });
}

async function fillFrame(page: Page, code: string) {
  await page.getByLabel("Frame code").fill(code);
  await page.getByLabel("Category").selectOption("eyeglasses");
  await page.getByLabel("Brand").selectOption({ index: 1 });
  await page.getByLabel("Model").fill(`E2E Form Model ${code}`);
  await page.getByText("Unisex", { exact: true }).click();
  await page.getByLabel("Colour").selectOption({ index: 1 });
  await page.getByLabel("Shape").selectOption("Round");
  await page.getByLabel("Price", { exact: true }).fill("2450");
}

const db = async () => {
  const c = await connect("owner");
  await c.query("select set_config('app.role', 'admin', false)");
  return c;
};
const frameRow = async (code: string) => {
  const c = await db();
  const r = await c.query("select f.id, f.status, f.review_note, f.is_active, (select array_agg(path order by position) from frame_images i where i.frame_id = f.id) as paths from frames f where code = $1", [code]);
  await c.end();
  return r.rows[0] as { id: string; status: string; review_note: string | null; is_active: boolean; paths: string[] | null } | undefined;
};

test.afterAll(async () => {
  const c = await db();
  await c.query("delete from frames where code = any($1)", [[CODE_A, CODE_B]]);
  await c.end();
});

test.describe.configure({ mode: "serial" });

test("staff add a frame with 2 photos on a phone and send it; it stays off the site", async ({ browser, request }) => {
  const page = await as(browser, "staff", 360);
  await page.goto("/admin/frames/new");
  await expect(page.getByRole("heading", { name: "Add a frame" })).toBeVisible();
  await formReady(page);
  await page.getByTestId("photo-input").setInputFiles([
    { name: "front.png", mimeType: "image/png", buffer: PNG },
    { name: "side.png", mimeType: "image/png", buffer: PNG },
  ]);
  await expect(page.locator(".ptile")).toHaveCount(2);
  await expect(page.locator(".ptile__cover")).toHaveCount(1);
  await fillFrame(page, CODE_A);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), "sideways scroll").toBe(0);
  await page.getByRole("button", { name: "Send for approval" }).click();
  await expect(page.getByRole("heading", { name: "Sent for approval" })).toBeVisible();

  const row = await frameRow(CODE_A);
  expect(row?.status).toBe("waiting");
  expect(row?.paths).toHaveLength(2);
  expect(row!.paths!.every((p) => p.startsWith(`frames/${row!.id}/`) && p.endsWith(".webp"))).toBe(true); // resized to WebP in the browser
  expect((await request.get(`/media/${row!.paths![0]}`)).status(), "a waiting frame's photo is not public").toBe(404);
});

test("an admin approves it from the review page; then it's public", async ({ browser, request }) => {
  const page = await as(browser, "admin");
  await page.goto(`/admin/frames/${CODE_A}`);
  await expect(page.getByText(/Check the photos and details/)).toBeVisible();
  await page.getByRole("button", { name: "Approve and publish" }).click();
  await expect(page.getByRole("heading", { name: "Published" })).toBeVisible();
  const row = await frameRow(CODE_A);
  expect(row?.status).toBe("approved");
  const photo = await request.get(`/media/${row!.paths![0]}`);
  expect(photo.status()).toBe(200);
  expect(photo.headers()["content-type"]).toBe("image/webp");
});

test("send back: the admin's note reaches the staff member", async ({ browser }) => {
  const staff = await as(browser, "staff");
  await staff.goto("/admin/frames/new");
  await formReady(staff);
  await staff.getByTestId("photo-input").setInputFiles([{ name: "front.png", mimeType: "image/png", buffer: PNG }]);
  await expect(staff.locator(".ptile")).toHaveCount(1);
  await fillFrame(staff, CODE_B);
  await staff.getByRole("button", { name: "Send for approval" }).click();
  await expect(staff.getByRole("heading", { name: "Sent for approval" })).toBeVisible();

  const admin = await as(browser, "admin");
  await admin.goto(`/admin/frames/${CODE_B}`);
  await admin.getByRole("button", { name: "Send back with a note" }).click();
  await admin.getByLabel("Note").fill("Please add a side photo.");
  await admin.getByRole("button", { name: "Send back", exact: true }).click();
  await expect(admin.getByRole("heading", { name: "Sent back" })).toBeVisible();
  expect((await frameRow(CODE_B))?.status).toBe("sent_back");

  await staff.goto(`/admin/frames/${CODE_B}`);
  await expect(staff.getByText("Sent back by the admin:")).toBeVisible();
  await expect(staff.getByText("Please add a side photo.")).toBeVisible();
});

test("plain error messages: not a photo, a used code, missing fields", async ({ browser }) => {
  const page = await as(browser, "staff");
  await page.goto("/admin/frames/new");
  await formReady(page);
  await page.getByTestId("photo-input").setInputFiles([{ name: "fake.jpg", mimeType: "image/jpeg", buffer: Buffer.from("just text pretending to be a photo") }]);
  await expect(page.getByText(/fake\.jpg: This file isn't a photo\. Use JPG, PNG or WebP\./)).toBeVisible();
  await expect(page.locator(".ptile")).toHaveCount(0);

  await page.getByLabel("Frame code").fill("VSF-1024");
  await page.getByLabel("Model").click(); // leave the code field
  await expect(page.getByText(/Code already used by/)).toBeVisible();

  await page.getByRole("button", { name: "Send for approval" }).click();
  const summary = page.getByRole("alert").filter({ hasText: "Please fix" });
  await expect(summary).toBeFocused();
  await expect(summary).toContainText("Add at least one photo.");
  await expect(summary).toContainText("Choose a shape.");
});

test("staff can only hide; an admin's delete removes the frame and its photo files", async ({ browser }) => {
  const staff = await as(browser, "staff");
  await staff.goto(`/admin/frames/${CODE_A}`);
  await expect(staff.getByRole("button", { name: "Hide from site" })).toBeVisible();
  await expect(staff.getByRole("button", { name: /^Delete/ })).toHaveCount(0);

  const row = await frameRow(CODE_A);
  const files = row!.paths!.map((p) => path.join(process.cwd(), "uploads", ...p.split("/")));
  expect(files.every((f) => existsSync(f))).toBe(true);

  const admin = await as(browser, "admin");
  await admin.goto(`/admin/frames/${CODE_A}`);
  await admin.getByRole("button", { name: "Delete frame" }).click();
  await admin.getByRole("dialog").getByRole("button", { name: "Delete frame" }).click();
  await expect(admin).toHaveURL(/\/admin\/frames$/);
  expect(await frameRow(CODE_A)).toBeUndefined();
  expect(files.some((f) => existsSync(f)), "photo files removed").toBe(false);
});
