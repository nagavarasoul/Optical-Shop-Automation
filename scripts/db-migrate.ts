/* Brings the local database up to date. Run: npm run db:migrate
   1. App tables: the Drizzle migrations in db/migrations (made by `npm run db:generate`)
   2. Login tables: Better Auth's own migration
   3. Security: db/security.sql (grants, forced row-level security, triggers)
   Runs as vslm_owner. Safe to re-run. */
import { readFileSync } from "node:fs";
import { getMigrations } from "better-auth/db/migration";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { authOptions } from "../src/lib/auth-options.ts";
import { loadEnv, need } from "./env.ts";

loadEnv();
const pool = new pg.Pool({ connectionString: need("DATABASE_URL_OWNER") });

async function main() {
  await migrate(drizzle(pool), { migrationsFolder: "db/migrations" });
  console.log("1/3 App tables up to date");

  const { runMigrations, toBeCreated, toBeAdded } = await getMigrations(authOptions(pool));
  await runMigrations();
  console.log(`2/3 Login tables up to date (${toBeCreated.length} created, ${toBeAdded.length} changed)`);

  await pool.query(readFileSync("db/security.sql", "utf8"));
  console.log("3/3 Security rules applied");
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => pool.end());
