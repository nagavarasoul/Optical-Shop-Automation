/* Pre-launch check: fails while any DUMMY value (docs/dummy-data.md) is still in
   use. Run: npm run check:launch. Not part of `npm test`: during development the
   placeholders are expected, so this only has to pass before going live.
   Checks:
   1. the DUMMY register in src/lib/site-config.ts (code-level placeholders);
   2. placeholder values in the shop facts (phone numbers, example.com links);
   3. the database: placeholder branch numbers, and the mockups' DUMMY frames,
      lenses, camps and testimonials that `npm run db:seed` loads, and its sample staff accounts. */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import pg from "pg";
import { branches, DUMMY, isDummyPhone, socials } from "../src/lib/site-config.ts";
import { loadEnv, need } from "./env.ts";

loadEnv();
const problems: string[] = [];

// 1. Code
for (const [id, what] of Object.entries(DUMMY)) problems.push(`Code: DUMMY ${id} still in use: ${what}`);
// 2. Shop facts
for (const b of branches) if (isDummyPhone(b.phone) || isDummyPhone(b.whatsapp)) problems.push(`site-config.ts: ${b.name} phone is a placeholder`);
for (const s of socials) if (/example\.(com|test)/.test(s.url)) problems.push(`site-config.ts: ${s.name} link is a placeholder (${s.url})`);
// DUMMY images (AI-generated, development only) must not be deployed
if (existsSync("public/dummy") && readdirSync("public/dummy", { recursive: true }).some((f) => /\.(jpe?g|png|webp|svg)$/i.test(String(f)))) {
  problems.push("public/dummy: DUMMY images (C12 hero, C24 category photos) are still in the project. Delete the folder");
}

// 3. Database
const seedCodes = [...readFileSync("mockups/frames-data.js", "utf8").matchAll(/\['((?:VSF|SG)-\d{4})'/g)].map((m) => m[1]);
const client = new pg.Client({ connectionString: need("DATABASE_URL_OWNER") });
await client.connect();
await client.query("select set_config('app.role', 'admin', false)");
const n = async (sql: string, v: unknown[] = []) => Number((await client.query(sql, v)).rows[0].n);
const checks: [string, string, unknown[]][] = [
  ["Database: branches with a placeholder phone or WhatsApp", "select count(*) n from branches where phone ~ '^0+$' or whatsapp ~ '^0+$'", []],
  ["Database: DUMMY frames and sunglasses from the mockups (C4, C5, C13, C14)", "select count(*) n from frames where code = any($1)", [seedCodes]],
  ["Database: DUMMY lenses from the mockups (C16)", "select count(*) n from lenses where name = any($1)", [["Crizal Rock", "Hilux", "SmartLife Progressive", "BlueControl", "Transitions Signature"]]],
  ["Database: DUMMY eye camps (C19)", "select count(*) n from eye_camps where slug = any($1)", [["free-eye-camp-patelguda", "community-eye-camp-indresham", "school-vision-day"]]],
  ["Database: DUMMY testimonials (C8)", "select count(*) n from testimonials where first_name like 'Sample Customer%'", []],
  ["Database: DUMMY closed day (D3)", "select count(*) n from branch_closures where note like '%DUMMY%'", []],
];
for (const [label, sql, v] of checks) {
  const count = await n(sql, v);
  if (count) problems.push(`${label}: ${count}`);
}
await client.end();
// Sample staff accounts live in the login tables, reachable only as vslm_auth
const authClient = new pg.Client({ connectionString: need("DATABASE_URL_AUTH") });
await authClient.connect();
const samples = Number((await authClient.query(`select count(*) n from "user" where email like '%@vslensmart.example'`)).rows[0].n);
await authClient.end();
if (samples) problems.push(`Database: sample staff accounts (C22), delete them at /admin/staff: ${samples}`);

if (problems.length) {
  console.log(`Not ready to launch: ${problems.length} placeholder item(s) left.\n`);
  for (const p of problems) console.log(`  - ${p}`);
  console.log("\nReplace them with the client's real values (see docs/dummy-data.md), then run this again.");
  process.exitCode = 1;
} else {
  console.log("No DUMMY values found. Ready for the launch checklist.");
}
