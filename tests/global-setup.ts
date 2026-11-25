/* Creates this run's throwaway accounts (staff, admin, a switched-off one).
   Random passwords, written only to tests/.auth/accounts.json (gitignored). */
import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { betterAuth } from "better-auth";
import pg from "pg";
import { authOptions } from "../src/lib/auth-options";
import { ACCOUNTS_FILE, need, type Account, type Role } from "./helpers";

export const E2E_EMAIL = /^e2e-(staff|admin|banned)-[0-9a-f]{8}@example\.test$/;

export default async function globalSetup() {
  const pool = new pg.Pool({ connectionString: need("DATABASE_URL_AUTH") });
  const ctx = await betterAuth(authOptions(pool)).$context;
  const run = randomBytes(4).toString("hex");
  const out = {} as Record<Role, Account>;
  for (const role of ["staff", "admin", "banned"] as const) {
    const email = `e2e-${role}-${run}@example.test`;
    const password = randomBytes(18).toString("base64url");
    const name = `E2E ${role}`;
    const user = await ctx.internalAdapter.createUser(
      { email, name, emailVerified: true, role: role === "admin" ? "admin" : "staff", branch: "indresham", banned: role === "banned" },
      { method: "admin" },
    );
    await ctx.internalAdapter.linkAccount({ userId: user.id, providerId: "credential", accountId: user.id, password: await ctx.password.hash(password) });
    out[role] = { email, password, name };
  }
  await pool.end();
  mkdirSync(path.dirname(ACCOUNTS_FILE), { recursive: true });
  writeFileSync(ACCOUNTS_FILE, JSON.stringify(out));
}
