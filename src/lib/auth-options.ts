import type { BetterAuthOptions } from "better-auth";
import { admin } from "better-auth/plugins";
import type { Pool } from "pg";

/* Staff login settings (Requirements_Admin.md section 3), shared by the app
   (src/lib/auth.ts, connecting as vslm_auth) and scripts/db-migrate.ts
   (connecting as vslm_owner to create the login tables). No path aliases or
   server-only import here, so plain Node can load it. */
/** Sign-in attempts allowed per minute. The automated tests' own server raises it
 *  (E2E_SIGNIN_LIMIT, set only in playwright.config.ts) so a test run fits in one minute. */
export const SIGNIN_LIMIT = 5;

export function authOptions(pool: Pool) {
  const signinLimit = Number(process.env.E2E_SIGNIN_LIMIT) || SIGNIN_LIMIT;
  // Which request header holds the visitor's real IP. Only a proxy in front of the
  // site can be trusted to set it: a browser can send any X-Forwarded-For it likes,
  // which would let someone dodge the sign-in limit (found and fixed 2026-10-23).
  // Locally there's no proxy, so none is trusted and all attempts share one bucket.
  // At deployment, set TRUSTED_IP_HEADER to the header the host's proxy overwrites.
  const ipHeader = process.env.TRUSTED_IP_HEADER?.trim();
  return {
    appName: "VS Lens Mart staff area",
    database: pool,
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    emailAndPassword: {
      enabled: true,
      disableSignUp: true, // accounts are created by an admin only
      minPasswordLength: 10,
    },
    session: {
      expiresIn: 60 * 60 * 12, // signed out after 12 hours (DUMMY C22)
      updateAge: 60 * 60, // a session in use is extended hourly
    },
    user: {
      additionalFields: {
        branch: { type: "string", required: false, input: false }, // home branch slug
      },
    },
    rateLimit: {
      enabled: true, // also on the laptop, so it's tested
      window: 60,
      max: 100,
      customRules: { "/sign-in/email": { window: 60, max: signinLimit } },
    },
    advanced: {
      ipAddress: { ipAddressHeaders: ipHeader ? [ipHeader] : [] },
    },
    plugins: [admin({ defaultRole: "staff", adminRoles: ["admin"] })],
  } satisfies BetterAuthOptions;
}
