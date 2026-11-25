/* Photo uploads (Requirements_Admin.md 6.2): the rules, and /media serving a
   photo only when its database row is visible to the person asking. */
import { randomUUID } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { checkUpload, MAX_UPLOAD_BYTES, parseStoredPath, UPLOAD_ERRORS } from "../src/lib/upload-rules";
import { accounts, connect, signIn } from "./helpers";

const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
const WEBP = Buffer.from("UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=", "base64");
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);

test.describe("upload rules", () => {
  test("real JPEG, PNG and WebP photos are accepted", () => {
    for (const [bytes, ext] of [[JPEG, "jpg"], [PNG, "png"], [WEBP, "webp"]] as const) {
      const r = checkUpload(bytes);
      expect(r.ok && r.type.ext).toBe(ext);
    }
  });

  test("files that only pretend to be photos are refused", () => {
    for (const fake of [
      "plain text renamed to photo.jpg",
      "<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>",
      "<!doctype html><script>alert(1)</script>",
      "%PDF-1.7 a document",
      "GIF89a",
    ]) expect(checkUpload(Buffer.from(fake)), fake).toEqual({ ok: false, code: "not_photo" });
    // HEIC is converted in the browser; the server never accepts it
    expect(checkUpload(Buffer.from([0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63]))).toEqual({ ok: false, code: "not_photo" });
  });

  test("the size limit is exactly 10 MB, with the agreed messages", () => {
    const at = new Uint8Array(MAX_UPLOAD_BYTES); at.set(PNG);
    const over = new Uint8Array(MAX_UPLOAD_BYTES + 1); over.set(PNG);
    expect(checkUpload(at).ok).toBe(true);
    expect(checkUpload(over)).toEqual({ ok: false, code: "too_large" });
    expect(checkUpload(new Uint8Array(0))).toEqual({ ok: false, code: "empty" });
    expect(UPLOAD_ERRORS.too_large).toBe("This photo is too large (max 10 MB).");
    expect(UPLOAD_ERRORS.not_photo).toBe("This file isn't a photo. Use JPG, PNG or WebP.");
  });

  test("stored paths can't point outside the uploads folder", () => {
    const id = randomUUID(), photo = randomUUID();
    expect(parseStoredPath(`frames/${id}/${photo}.webp`)).toEqual({ bucket: "frames", ext: "webp" });
    for (const bad of [
      "../.env.local", `frames/${id}/../../../.env.local`, `frames\\${id}\\${photo}.webp`,
      `secrets/${id}/${photo}.webp`, `frames/${id}/${photo}.html`, `frames/x/${photo}.png`, `frames/${id}/${photo}.PNG`,
    ]) expect(parseStoredPath(bad), bad).toBeNull();
  });
});

test.describe("/media serves only what the visitor may see", () => {
  const uploads = path.join(process.cwd(), "uploads");
  const files: string[] = [];
  const rows = { images: [] as string[], gallery: [] as string[], frames: [] as string[], brand: "", colour: "" };
  let approvedPhoto = "", draftPhoto = "", hiddenPhoto = "", orphanPhoto = "", missingPhoto = "";

  const place = (bucket: string, owner: string, bytes: Buffer, ext: string) => {
    const stored = `${bucket}/${owner}/${randomUUID()}.${ext}`;
    mkdirSync(path.join(uploads, bucket, owner), { recursive: true });
    writeFileSync(path.join(uploads, ...stored.split("/")), bytes);
    files.push(stored);
    return stored;
  };

  test.beforeAll(async () => {
    // Committed rows (the test server reads them through its own connection); removed in afterAll
    const c = await connect("owner");
    await c.query("select set_config('app.role', 'admin', false)");
    const one = async (sql: string, v: unknown[] = []) => (await c.query(sql, v)).rows[0];
    rows.brand = (await one("insert into brands (name) values ('E2E media brand ' || gen_random_uuid()) returning id")).id;
    rows.colour = (await one("insert into colours (name) values ('E2E media colour ' || gen_random_uuid()) returning id")).id;
    const frame = async (status: string) => (await one(
      `insert into frames (code, slug, brand_id, model, category, gender, colour_id, shape, price, available_at, status)
       values ($1, lower($1), $2, 'E2E media', 'eyeglasses', 'unisex', $3, 'Round', 1500, 'both', $4) returning id`,
      [`E2E-M-${randomUUID().slice(0, 8)}`, rows.brand, rows.colour, status])).id as string;
    const approved = await frame("approved"), draft = await frame("waiting");
    rows.frames.push(approved, draft);
    approvedPhoto = place("frames", approved, PNG, "png");
    draftPhoto = place("frames", draft, WEBP, "webp");
    orphanPhoto = place("frames", approved, PNG, "png"); // file with no row
    missingPhoto = `frames/${approved}/${randomUUID()}.png`; // row with no file
    for (const [frameId, p, pos] of [[approved, approvedPhoto, 0], [draft, draftPhoto, 0], [approved, missingPhoto, 1]] as const) {
      rows.images.push((await one("insert into frame_images (frame_id, path, position) values ($1, $2, $3) returning id", [frameId, p, pos])).id);
    }
    const galleryId = randomUUID();
    hiddenPhoto = place("gallery", galleryId, PNG, "png");
    await c.query("insert into gallery_photos (id, path, tag, caption, is_visible) values ($1, $2, 'shop', 'E2E hidden photo', false)", [galleryId, hiddenPhoto]);
    rows.gallery.push(galleryId);
    await c.end();
  });

  test.afterAll(async () => {
    const c = await connect("owner");
    await c.query("select set_config('app.role', 'admin', false)");
    await c.query("delete from gallery_photos where id = any($1)", [rows.gallery]);
    await c.query("delete from frames where id = any($1)", [rows.frames]); // frame_images cascade
    await c.query("delete from brands where id = $1", [rows.brand]);
    await c.query("delete from colours where id = $1", [rows.colour]);
    await c.end();
    for (const f of files) rmSync(path.join(uploads, ...f.split("/")), { force: true });
  });

  test("public: an approved frame's photo is served, cacheable and with nosniff", async ({ request }) => {
    const res = await request.get(`/media/${approvedPhoto}`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("image/png");
    expect(Buffer.from(await res.body()).equals(PNG)).toBe(true);
    expect(res.headers()["cache-control"]).toBe("public, max-age=3600");
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  });

  test("public: drafts, hidden photos and loose files are not found", async ({ request }) => {
    for (const p of [draftPhoto, hiddenPhoto, orphanPhoto, missingPhoto]) {
      expect((await request.get(`/media/${p}`)).status(), p).toBe(404);
    }
  });

  test("tricks to reach other files are refused and leak nothing", async ({ request }) => {
    for (const p of ["../.env.local", "..%2F..%2F.env.local", "%2e%2e/%2e%2e/.env.local", "..%5C..%5C.env.local", "frames/x/y.png", "package.json"]) {
      const res = await request.get(`/media/${p}`);
      expect([400, 404], p).toContain(res.status());
      expect(await res.text(), p).not.toMatch(/DATABASE_URL|BETTER_AUTH_SECRET/);
    }
  });

  test("staff: can preview a draft's photo and a hidden photo, never cached", async ({ request }) => {
    const cookie = await signIn(request, accounts().staff);
    for (const p of [draftPhoto, hiddenPhoto]) {
      const res = await request.get(`/media/${p}`, { headers: { cookie } });
      expect(res.status(), p).toBe(200);
      expect(res.headers()["cache-control"], p).toBe("private, no-store");
    }
  });
});
