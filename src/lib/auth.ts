import "server-only";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";
import { authOptions } from "./auth-options";

/* Staff login (Better Auth). Connects as vslm_auth, which can reach only the
   login tables (db/security.sql). nextCookies() lets server actions such as
   "Sign out" set and clear the session cookie. */

const globalForAuth = globalThis as unknown as { vslmAuthPool?: Pool };
/** The login tables' connection (vslm_auth). Also used by staff-directory.ts for names. */
export const authPool =
  globalForAuth.vslmAuthPool ??
  new Pool({ connectionString: process.env.DATABASE_URL_AUTH, max: 5 });
if (process.env.NODE_ENV !== "production") globalForAuth.vslmAuthPool = authPool;

const options = authOptions(authPool);

export const auth = betterAuth({
  ...options,
  plugins: [...options.plugins, nextCookies()],
});
