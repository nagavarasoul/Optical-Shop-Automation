/* Staff login (Requirements_Admin.md section 3) over real HTTP. */
import { expect, test } from "@playwright/test";
import pg from "pg";
import { authOptions, SIGNIN_LIMIT } from "../src/lib/auth-options";
import { accounts, signIn } from "./helpers";

/** Page HTML without the empty <!-- --> markers React puts between joined text. */
const text = (html: string) => html.replace(/<!-- -->/g, "");

test("signed out, every staff page sends you to the login page", async ({ request }) => {
  for (const path of ["/admin", "/admin/frames", "/admin/sunglasses", "/admin/lenses"]) {
    const res = await request.get(path, { maxRedirects: 0 });
    expect(res.status(), path).toBe(307);
    expect(res.headers().location, path).toContain("/admin/login?next=");
  }
});

test("the staff area is hidden from search engines", async ({ request }) => {
  const login = await (await request.get("/admin/login")).text();
  expect(login).toMatch(/<meta name="robots" content="noindex, nofollow"/);
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /admin");
  expect(robots).toContain("Disallow: /api/");
});

test("nobody can sign up", async ({ request }) => {
  const res = await request.post("/api/auth/sign-up/email", {
    data: { email: "intruder@example.test", password: "a-long-password-123", name: "Intruder" },
  });
  expect(res.status()).toBeGreaterThanOrEqual(400);
});

for (const role of ["staff", "admin"] as const) {
  test(`${role}: signs in, sees their own dashboard, and signing out ends the session`, async ({ request }) => {
    const a = accounts()[role];
    const cookie = await signIn(request, a);

    const page = await request.get("/admin", { headers: { cookie } });
    const html = text(await page.text());
    expect(page.status()).toBe(200);
    expect(html).toMatch(new RegExp(`Good (morning|afternoon|evening), ${a.name}[.]`));
    expect(html).toContain(`<span class="adm-badge adm-badge--gold">${role === "admin" ? "Admin" : "Staff"}</span>`);
    expect(html).toContain("Indresham branch");
    // The approval queue is the admin's; staff see their own frames instead
    expect(html).toContain(role === "admin" ? "Waiting for your approval" : "Your frames in progress");

    // A request from another website, carrying the session cookie, is refused (CSRF protection)
    const forged = await request.post("/api/auth/sign-out", { headers: { cookie, origin: "https://evil.example" }, data: {} });
    expect(forged.status()).toBe(403);
    const out = await request.post("/api/auth/sign-out", { headers: { cookie, origin: "http://localhost:3100" }, data: {} });
    expect(out.status()).toBe(200);
    const after = text(await (await request.get("/admin", { headers: { cookie } })).text());
    expect(after).not.toContain(`, ${a.name}\.`);
    expect(after).not.toContain("On the site now");
  });
}

test("a forged session cookie gets past the gate but sees nothing", async ({ request }) => {
  const res = await request.get("/admin", { headers: { cookie: "better-auth.session_token=forged.value" } });
  const html = text(await res.text());
  expect(html).not.toContain("On the site now");
  expect(html).not.toContain("Working on branch");
});

test("a switched-off account can't sign in", async ({ request }) => {
  const a = accounts().banned;
  const res = await request.post("/api/auth/sign-in/email", { data: { email: a.email, password: a.password } });
  expect(res.status()).toBe(403);
});

test("a wrong password is refused without saying which part was wrong", async ({ request }) => {
  const a = accounts().staff;
  const wrongPassword = await request.post("/api/auth/sign-in/email", { data: { email: a.email, password: "not-the-password" } });
  const unknownEmail = await request.post("/api/auth/sign-in/email", { data: { email: "nobody@example.test", password: "not-the-password" } });
  expect(wrongPassword.status()).toBe(401);
  expect(unknownEmail.status()).toBe(401);
  expect((await wrongPassword.json()).message).toBe((await unknownEmail.json()).message);
});

test("the real sign-in limit is 5 a minute and trusts no IP header by default", () => {
  const saved = { limit: process.env.E2E_SIGNIN_LIMIT, ip: process.env.TRUSTED_IP_HEADER };
  delete process.env.E2E_SIGNIN_LIMIT;
  delete process.env.TRUSTED_IP_HEADER;
  try {
    const o = authOptions(new pg.Pool());
    expect(SIGNIN_LIMIT).toBe(5);
    expect(o.rateLimit.customRules["/sign-in/email"]).toEqual({ window: 60, max: 5 });
    expect(o.advanced.ipAddress.ipAddressHeaders).toEqual([]);
    expect(o.emailAndPassword.disableSignUp).toBe(true);
  } finally {
    if (saved.limit !== undefined) process.env.E2E_SIGNIN_LIMIT = saved.limit;
    if (saved.ip !== undefined) process.env.TRUSTED_IP_HEADER = saved.ip;
  }
});
