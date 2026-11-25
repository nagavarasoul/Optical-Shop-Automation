/* Shared test helpers. Test accounts are made by global-setup.ts with random
   passwords, kept in tests/.auth/accounts.json (gitignored) for this run only. */
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, type APIRequestContext } from "@playwright/test";
import pg from "pg";

try {
  process.loadEnvFile(".env.local");
} catch {
  // npm run db:setup creates it
}

export const ACCOUNTS_FILE = path.join("tests", ".auth", "accounts.json");
export type Role = "staff" | "admin" | "banned";
export type Account = { email: string; password: string; name: string };

export function accounts(): Record<Role, Account> {
  return JSON.parse(readFileSync(ACCOUNTS_FILE, "utf8"));
}

export function need(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} in .env.local (run npm run db:setup)`);
  return v;
}

/** A connection as the given database user. Close it with .end(). */
export async function connect(user: "app" | "owner" | "auth"): Promise<pg.Client> {
  const url = need({ app: "DATABASE_URL_APP", owner: "DATABASE_URL_OWNER", auth: "DATABASE_URL_AUTH" }[user]);
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  return c;
}

/** Signs in through the real HTTP endpoint and returns the session cookie header. */
export async function signIn(request: APIRequestContext, a: Account): Promise<string> {
  const res = await request.post("/api/auth/sign-in/email", { data: { email: a.email, password: a.password } });
  expect(res.status(), `sign in as ${a.email}`).toBe(200);
  const cookies = res.headersArray().filter((h) => h.name.toLowerCase() === "set-cookie").map((h) => h.value.split(";")[0]);
  return cookies.join("; ");
}
