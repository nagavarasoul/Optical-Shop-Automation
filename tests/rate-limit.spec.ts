/* Runs last (playwright.config.ts "rate-limit" project): it uses up the sign-in
   limit for a minute. The test server allows E2E_SIGNIN_LIMIT attempts a minute
   instead of 5, so the rest of the run fits; the real limit is checked in
   admin-auth.spec.ts. */
import { expect, test } from "@playwright/test";
import { E2E_SIGNIN_LIMIT } from "../playwright.config";

test("too many sign-in attempts are blocked, even when each claims a different IP", async ({ request }) => {
  const statuses: number[] = [];
  // Earlier tests already used some attempts, so the block must come within the limit
  for (let i = 0; i <= E2E_SIGNIN_LIMIT; i++) {
    const res = await request.post("/api/auth/sign-in/email", {
      headers: { "x-forwarded-for": `203.0.113.${(i % 250) + 1}` }, // a fake IP on every try
      data: { email: "nobody@example.test", password: `wrong-password-${i}` },
    });
    statuses.push(res.status());
    if (res.status() === 429) break;
  }
  expect(statuses, statuses.join(",")).toContain(429);
  expect(statuses.filter((s) => s === 401).length).toBeLessThanOrEqual(E2E_SIGNIN_LIMIT);
});
