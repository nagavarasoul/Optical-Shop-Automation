/* Fills the LOCAL database with development data. Run: npm run db:seed
   Resets every app table first (login accounts are kept).
   - Branches: real addresses and the Indresham number; Patelguda number DUMMY D2 (src/lib/site-config.ts)
   - Frames, sunglasses, drafts, eye camps: the DUMMY data of the signed-off mockups
     (mockups/frames-data.js, mockups/camps-data.js, mockups/admin.js; docs/dummy-data.md C4, C5, C13, C14, C19, C22)
   - Testimonials: DUMMY C8
   - Lenses: the lens catalogue of mockups/lenses.html (DUMMY C6 brands, C16 lenses)
   - Sample staff accounts (DUMMY C22): 1 admin and 4 staff on @vslensmart.example with no
     password, so nobody can sign in with them. Real login accounts are never touched.
   Everything except the branch facts is DUMMY and must never reach the live site.
   Runs as vslm_owner with app.role = admin (row-level security is forced even for the owner). */
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { betterAuth } from "better-auth";
import pg from "pg";
import { authOptions } from "../src/lib/auth-options.ts";
import { branches as branchSeed } from "../src/lib/site-config.ts";
import { loadEnv, need } from "./env.ts";

loadEnv();

/* Runs a mockup data file (it assigns to window.*) and returns that window. */
function loadMockup(file: string): Record<string, unknown> {
  const store = { getItem: () => null, setItem: () => {} };
  const window: Record<string, unknown> = { localStorage: store };
  const context = vm.createContext({ window, localStorage: store, document: {}, location: { search: "" }, URL, Blob: class {} });
  vm.runInContext(readFileSync(file, "utf8"), context);
  return window;
}

type MockFrame = {
  code: string; brand: string; model: string; category: string; gender: string; colour: string; shape: string;
  material?: string; size?: string; price: number; where: string; sold?: boolean; lens?: string[]; lensColour?: string;
};

type MockCamp = { slug: string; title: string; date: string; start: string; end: string; place: string; with?: string; text: string; people?: number };
const V = loadMockup("mockups/frames-data.js").VSLM as { ALL: MockFrame[] };
const CAMPS = loadMockup("mockups/camps-data.js").VSLM_CAMPS as { CAMPS: MockCamp[]; OFFERED: string[] };
// lenses.html keeps its DUMMY lens list inline: read its BRANDS and LENSES arrays as data
const lensesHtml = readFileSync("mockups/lenses.html", "utf8");
const inlineArray = (name: string) => new RegExp(`const ${name} = (\\[[\\s\\S]*?\\n {2}\\])`).exec(lensesHtml)?.[1] ?? "[]";
const LENS_BRANDS: { id: string; name: string }[] = vm.runInNewContext(`(${inlineArray("BRANDS")})`);
const LENSES: [string, string, string, string[], number | null][] = vm.runInNewContext(`(${inlineArray("LENSES")})`);

// admin.js builds the staff shell into a DOM; only its DRAFTS list is needed, so read it as data
const draftsSrc = /const DRAFTS = (\[[\s\S]*?\n {2}\]);/.exec(readFileSync("mockups/admin.js", "utf8"))?.[1];
const DRAFTS: (MockFrame & { status: string; note?: string })[] = draftsSrc ? vm.runInNewContext(`(${draftsSrc})`) : [];

const category = (c: string) => ({ Eyeglasses: "eyeglasses", "Computer glasses": "computer_glasses", Sunglasses: "sunglasses" })[c];
const where = (w: string) => (w === "Indresham" ? "indresham" : w === "Patelguda" ? "patelguda" : "both");
const slug = (f: MockFrame) => `${f.brand} ${f.model} ${f.code}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const status = (s: string) => ({ waiting: "waiting", "sent-back": "sent_back", draft: "draft" })[s] ?? "draft";

async function main() {
  const client = new pg.Client({ connectionString: need("DATABASE_URL_OWNER") });
  await client.connect();
  const q = (text: string, values: unknown[] = []) => client.query(text, values);
  try {
    await q("begin");
    await q("select set_config('app.role', 'admin', true)");
    await q(`truncate branches, branch_closures, brands, colours, frames, frame_images, lenses,
             eye_camps, camp_photos, gallery_photos, testimonials, appointments, enquiries cascade`);

    // Branches
    const branchId: Record<string, string> = {};
    for (const [i, b] of branchSeed.entries()) {
      const r = await q(
        `insert into branches (slug, name, address, phone, whatsapp, opens, closes, sort)
         values ($1, $2, $3, $4, $5, $6, $7, $8) returning id`,
        [b.slug, b.name, b.address, b.phone, b.whatsapp, b.opens, b.closes, i],
      );
      branchId[b.slug] = r.rows[0].id;
    }
    // DUMMY D3: closed on Diwali day at both branches
    await q("insert into branch_closures (branch_id, day, note) values (null, '2026-11-08', 'Diwali (DUMMY D3)')");

    // Brands and colours from the frames
    const frames: MockFrame[] = V.ALL;
    const all = [...frames, ...DRAFTS];
    const brandId: Record<string, string> = {};
    for (const name of [...new Set(all.map((f) => f.brand))]) {
      brandId[name] = (await q("insert into brands (name) values ($1) returning id", [name])).rows[0].id;
    }
    const colourId: Record<string, string> = {};
    for (const name of [...new Set(all.map((f) => f.colour))]) {
      colourId[name] = (await q("insert into colours (name) values ($1) returning id", [name])).rows[0].id;
    }

    // Frames and sunglasses: approved ones from the listings, plus the dashboard's drafts
    const insertFrame = (f: MockFrame, st: string, note: string | null, approvedAt: Date | null = null) => {
      const [lens, bridge, temple] = (f.size ?? "").split("-").map((n) => (n ? Number(n) : null));
      return q(
        `insert into frames (code, slug, brand_id, model, category, gender, colour_id, shape, material,
           size_lens, size_bridge, size_temple, lens_types, lens_colour, price, availability, available_at,
           status, review_note, approved_by, approved_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
        [f.code, slug(f), brandId[f.brand], f.model, category(f.category), f.gender.toLowerCase(), colourId[f.colour],
          f.shape, f.material ?? null, lens, bridge, temple, f.lens ?? null, f.lensColour ?? null, f.price,
          f.sold ? "sold_out" : "in_stock", where(f.where), st, note,
          st === "approved" ? "seed" : null, st === "approved" ? approvedAt : null],
      );
    };
    // The mockup lists are newest first, so each frame is dated a minute before the one above it ("Newest" sort)
    const now = Date.now();
    for (const [i, f] of frames.entries()) await insertFrame(f, "approved", null, new Date(now - i * 60_000));
    for (const d of DRAFTS) await insertFrame(d, status(d.status), d.note ?? null);

    // Eye camps (past ones carry a people count)
    for (const c of CAMPS.CAMPS) {
      const branch = /patelguda|ellenki/i.test(c.place) ? "patelguda" : "indresham";
      await q(
        `insert into eye_camps (slug, title, day, starts, ends, branch_id, place, organised_with, description, offered, people)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [c.slug, c.title, c.date, c.start, c.end, branchId[branch], c.place, c.with ?? null, c.text, CAMPS.OFFERED, c.people ?? null],
      );
    }

    // DUMMY C16 lenses with C6 brands (lens brands are separate from frame brands)
    const lensBrandId: Record<string, string> = {};
    for (const b of LENS_BRANDS) {
      lensBrandId[b.id] = (await q("insert into brands (name, for_lenses) values ($1, true) returning id", [b.name])).rows[0].id;
    }
    for (const [brand, name, type, features, price] of LENSES) {
      await q("insert into lenses (brand_id, name, type, features, price) values ($1, $2, $3, $4, $5)",
        [lensBrandId[brand], name, type.replace(/-/g, "_"), features, price]);
    }

    // DUMMY C8 testimonials (never live; the section stays hidden until real ones exist)
    const quotes = [
      ["Sample Customer 1", "indresham", "They tested my eyes carefully and explained everything simply."],
      ["Sample Customer 2", "patelguda", "Honest advice on frames, nothing pushed on me."],
      ["Sample Customer 3", "indresham", "Lenses were fitted quickly and the glasses feel right."],
    ];
    for (const [name, b, quote] of quotes) {
      await q("insert into testimonials (first_name, branch_id, quote, agreed_on) values ($1, $2, $3, current_date)", [name, branchId[b], quote]);
    }

    await q("commit");
    await q("select set_config('app.role', 'admin', false)"); // the transaction's setting ended with it
    const count = async (t: string) => (await q(`select count(*)::int as n from ${t}`)).rows[0].n;
    console.log(`Seeded: ${await count("branches")} branches, ${await count("frames")} frames (${DRAFTS.length} drafts), ` +
      `${await count("lenses")} lenses, ${await count("eye_camps")} eye camps, ${await count("testimonials")} testimonials. All DUMMY except branch facts.`);
  } catch (e) {
    await q("rollback");
    throw e;
  } finally {
    await client.end();
  }
}

/* Sample staff (DUMMY C22), named by role and branch only. Added if missing,
   through the login tables' own connection (vslm_auth). No password: they can't
   sign in. The admin deletes them at /admin/staff once real accounts exist. */
const SAMPLE_STAFF = [
  ["sample-admin", "Admin (sample)", "admin", "indresham"],
  ["sample-staff-1", "Staff 1 · Indresham", "staff", "indresham"],
  ["sample-staff-2", "Staff 2 · Indresham", "staff", "indresham"],
  ["sample-staff-3", "Staff 3 · Patelguda", "staff", "patelguda"],
  ["sample-staff-4", "Staff 4 · Patelguda", "staff", "patelguda"],
] as const;

async function seedSampleStaff() {
  const pool = new pg.Pool({ connectionString: need("DATABASE_URL_AUTH") });
  try {
    const ctx = await betterAuth(authOptions(pool)).$context;
    let added = 0;
    for (const [local, name, role, branch] of SAMPLE_STAFF) {
      const email = `${local}@vslensmart.example`;
      if (await ctx.internalAdapter.findUserByEmail(email)) continue;
      await ctx.internalAdapter.createUser({ email, name, emailVerified: true, role, branch }, { method: "admin" });
      added++;
    }
    console.log(`Sample staff accounts (DUMMY C22, can't sign in): ${added} added, ${SAMPLE_STAFF.length - added} already there.`);
  } finally {
    await pool.end();
  }
}

main().then(seedSampleStaff).catch((e) => { console.error(e); process.exitCode = 1; });
