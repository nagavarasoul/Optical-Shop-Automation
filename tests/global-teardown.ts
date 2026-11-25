/* Deletes every throwaway test account (this run's and any left by a crashed run)
   and forgets their passwords. */
import { writeFileSync } from "node:fs";
import { betterAuth } from "better-auth";
import pg from "pg";
import { authOptions } from "../src/lib/auth-options";
import { E2E_EMAIL } from "./global-setup";
import { ACCOUNTS_FILE, need } from "./helpers";

export default async function globalTeardown() {
  const pool = new pg.Pool({ connectionString: need("DATABASE_URL_AUTH") });
  const ctx = await betterAuth(authOptions(pool)).$context;
  const { rows } = await pool.query<{ id: string; email: string }>(`select id, email from "user" where email like 'e2e-%@example.test'`);
  for (const u of rows) if (E2E_EMAIL.test(u.email)) await ctx.internalAdapter.deleteUser(u.id);
  await pool.end();
  writeFileSync(ACCOUNTS_FILE, "{}");
}
