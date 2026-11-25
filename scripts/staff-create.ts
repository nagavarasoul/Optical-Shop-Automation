/* Creates a staff-area account, or sets a new password for an existing one.
   Run: npm run staff:create
   There's no sign-up page (Requirements_Admin.md section 3), so the first admin
   is made here. You type the details in the terminal; the password is hidden,
   never saved in the project, and stored only as a hash in the database.
   Connects as vslm_auth (the login tables only). */
import { betterAuth } from "better-auth";
import pg from "pg";
import { authOptions } from "../src/lib/auth-options.ts";
import { loadEnv, need } from "./env.ts";
import { ask, askHidden } from "./prompt.ts";

loadEnv();
const pool = new pg.Pool({ connectionString: need("DATABASE_URL_AUTH") });
const auth = betterAuth(authOptions(pool));

async function choose(question: string, options: string[]): Promise<string> {
  for (;;) {
    const a = (await ask(`${question} (${options.join(" / ")}): `)).toLowerCase();
    if (options.includes(a)) return a;
    console.log(`  Please type one of: ${options.join(", ")}`);
  }
}

async function newPassword(min: number): Promise<string> {
  for (;;) {
    const p1 = await askHidden(`Password (at least ${min} characters, hidden): `);
    if (p1.length < min) { console.log(`  Too short. Use at least ${min} characters.`); continue; }
    const p2 = await askHidden("Type it again: ");
    if (p1 !== p2) { console.log("  They don't match. Try again."); continue; }
    return p1;
  }
}

async function main() {
  const ctx = await auth.$context;
  const min = ctx.password.config.minPasswordLength;
  console.log("VS Lens Mart: create a staff-area account\n");

  const email = (await ask("Email (used to sign in): ")).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("That doesn't look like an email address.");

  const existing = await ctx.internalAdapter.findUserByEmail(email, { includeAccounts: true });
  if (existing) {
    const existingRole = (existing.user as { role?: string }).role ?? "staff";
    console.log(`\n${email} already has an account (${existing.user.name}, ${existingRole}).`);
    if ((await choose("Set a new password for it?", ["yes", "no"])) === "no") return;
    const hash = await ctx.password.hash(await newPassword(min));
    const hasPassword = existing.accounts?.some((a) => a.providerId === "credential");
    if (hasPassword) await ctx.internalAdapter.updatePassword(existing.user.id, hash);
    else await ctx.internalAdapter.linkAccount({ userId: existing.user.id, providerId: "credential", accountId: existing.user.id, password: hash });
    await ctx.internalAdapter.deleteUserSessions(existing.user.id); // signs them out everywhere
    console.log("\nPassword changed. They've been signed out on every device.");
    return;
  }

  const name = await ask("Name shown in the staff area (e.g. Admin, Staff 1): ");
  if (name.length < 2) throw new Error("Please enter a name.");
  const role = await choose("Role", ["admin", "staff"]);
  const branch = await choose("Home branch", ["indresham", "patelguda"]);
  const hash = await ctx.password.hash(await newPassword(min));

  const user = await ctx.internalAdapter.createUser({ email, name, emailVerified: true, role, branch }, { method: "admin" });
  await ctx.internalAdapter.linkAccount({ userId: user.id, providerId: "credential", accountId: user.id, password: hash });
  console.log(`\nCreated ${role} account for ${name} <${email}>, ${branch} branch. Sign in at http://localhost:3000/admin/login`);
}

main()
  .catch((e) => { console.error(`\n${(e as Error).message}`); process.exitCode = 1; })
  .finally(() => pool.end());
