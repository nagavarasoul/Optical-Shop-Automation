/* One-time local database setup (Phase 4, step 1). Run: npm run db:setup
   - Asks for the PostgreSQL superuser ("postgres") password you chose when
     installing. It's used for this run only and never saved.
   - Creates the database vslm_dev and three users with generated passwords:
       vslm_owner  owns the tables, runs migrations and the seed
       vslm_app    the website's runtime user (no ownership, can't bypass security)
       vslm_auth   Better Auth's user, for the login tables only
   - Writes the connection strings and an auth secret to .env.local (gitignored).
   Safe to re-run: existing users get new passwords, and .env.local is rewritten. */
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import pg from "pg";
import { askHidden } from "./prompt.ts";

const HOST = process.env.PGHOST ?? "localhost";
const PORT = Number(process.env.PGPORT ?? 5432);
const SUPERUSER = process.env.PGUSER ?? "postgres";
const DB = "vslm_dev";

const secret = () => randomBytes(24).toString("base64url");
const ident = (s: string) => `"${s.replace(/"/g, '""')}"`;
const literal = (s: string) => `'${s.replace(/'/g, "''")}'`;

async function main() {
  console.log(`VS Lens Mart: local database setup (${SUPERUSER}@${HOST}:${PORT})`);
  const password = await askHidden(`Password for the PostgreSQL user "${SUPERUSER}": `);

  const admin = new pg.Client({ host: HOST, port: PORT, user: SUPERUSER, password, database: "postgres" });
  try {
    await admin.connect();
  } catch (e) {
    console.error(`\nCouldn't connect: ${(e as Error).message}\nIs PostgreSQL running, and is the password right?`);
    process.exit(1);
  }

  const pw = { vslm_owner: secret(), vslm_app: secret(), vslm_auth: secret() };
  for (const [role, p] of Object.entries(pw)) {
    const exists = await admin.query("select 1 from pg_roles where rolname = $1", [role]);
    const verb = exists.rowCount ? "alter" : "create";
    // NOSUPERUSER NOBYPASSRLS: none of them can switch off row-level security
    await admin.query(`${verb} role ${ident(role)} with login password ${literal(p)} nosuperuser nocreatedb nocreaterole nobypassrls`);
    console.log(`  ${verb === "create" ? "Created" : "Updated"} user ${role}`);
  }

  const dbExists = await admin.query("select 1 from pg_database where datname = $1", [DB]);
  if (!dbExists.rowCount) {
    await admin.query(`create database ${ident(DB)} owner vslm_owner encoding 'UTF8'`);
    console.log(`  Created database ${DB}`);
  }
  await admin.query(`revoke all on database ${ident(DB)} from public`);
  await admin.query(`grant connect on database ${ident(DB)} to vslm_owner, vslm_app, vslm_auth`);
  await admin.end();

  // Inside the database: vslm_owner owns the public schema, nobody else can create objects in it
  const inDb = new pg.Client({ host: HOST, port: PORT, user: SUPERUSER, password, database: DB });
  await inDb.connect();
  await inDb.query("alter schema public owner to vslm_owner");
  await inDb.query("revoke create on schema public from public");
  await inDb.end();

  // Keep an existing auth secret, so signed-in sessions survive a re-run
  const old = existsSync(".env.local") ? readFileSync(".env.local", "utf8") : "";
  const authSecret = /^BETTER_AUTH_SECRET=(.+)$/m.exec(old)?.[1] ?? randomBytes(32).toString("base64url");
  const url = (user: string, p: string) => `postgresql://${user}:${encodeURIComponent(p)}@${HOST}:${PORT}/${DB}`;
  writeFileSync(".env.local", [
    "# Written by `npm run db:setup`. Local development only; never commit.",
    `DATABASE_URL_OWNER=${url("vslm_owner", pw.vslm_owner)}`,
    `DATABASE_URL_APP=${url("vslm_app", pw.vslm_app)}`,
    `DATABASE_URL_AUTH=${url("vslm_auth", pw.vslm_auth)}`,
    `BETTER_AUTH_SECRET=${authSecret}`,
    "BETTER_AUTH_URL=http://localhost:3000",
    "",
  ].join("\n"));
  console.log("  Wrote .env.local\n\nDone. Next: npm run db:migrate && npm run db:seed");
}

main();
