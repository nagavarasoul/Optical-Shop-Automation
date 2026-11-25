import { defineConfig, devices } from "@playwright/test";

/* Automated tests (Phase 4 step 6). Run: npm test
   - Starts its OWN production build on port 3100, so tests never depend on (or
     disturb) the dev server, and the sign-in rate limiter starts empty each run.
   - Uses the local vslm_dev database. Tests make their own rows and accounts
     and remove them afterwards; database checks run inside rolled-back transactions.
   - One worker, in order: tests share the database and the sign-in limit. */

try {
  process.loadEnvFile(".env.local");
} catch {
  // npm run db:setup creates it
}

const PORT = 3100;
const BASE = `http://localhost:${PORT}`;
export const E2E_SIGNIN_LIMIT = 60; // the whole run signs in ~35 times within a minute

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  reporter: [["list"]],
  globalSetup: "./tests/global-setup.ts",
  globalTeardown: "./tests/global-teardown.ts",
  use: { baseURL: BASE, trace: "retain-on-failure" },
  projects: [
    { name: "security", testMatch: /(db-security|admin-auth|uploads|menu-data|catalogue-query|booking-rules|booking-race|staff-lists|staff-content|staff-settings|frame-form|seo)\.spec\.ts/ },
    // Layout checks at the CLAUDE.md test widths
    { name: "phone-360", testMatch: /(ui|layout|admin-shell|catalogue|booking|contact|privacy|lenses|eye-camps|gallery|about-eye-care|home|not-found|search)\.spec\.ts/, use: { ...devices["Desktop Chrome"], viewport: { width: 360, height: 780 } } },
    { name: "tablet-768", testMatch: /(ui|layout|admin-shell|catalogue|booking|contact|privacy|lenses|eye-camps|gallery|about-eye-care|home|not-found|search)\.spec\.ts/, use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } } },
    { name: "desktop-1440", testMatch: /(ui|layout|admin-shell|catalogue|booking|contact|privacy|lenses|eye-camps|gallery|about-eye-care|home|not-found|search)\.spec\.ts/, use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    // Last, because it uses up the sign-in limit for a minute
    { name: "rate-limit", testMatch: /rate-limit\.spec\.ts/, dependencies: ["security", "phone-360", "tablet-768", "desktop-1440"] },
  ],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `${BASE}/admin/login`,
    reuseExistingServer: false,
    timeout: 300_000,
    // Forms: tests fill them in well under the 3-second spam check, and send many a minute
    env: { BETTER_AUTH_URL: BASE, E2E_SIGNIN_LIMIT: String(E2E_SIGNIN_LIMIT), E2E_FORM_MIN_FILL_MS: "0", E2E_FORM_LIMIT: "500" },
  },
});
