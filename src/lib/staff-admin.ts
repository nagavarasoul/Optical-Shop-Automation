import "server-only";
import { auth, authPool } from "./auth";
import { isSample, type AccountInput, type NewAccountInput } from "./staff-rules";

/* Staff accounts (Requirements_Admin.md section 3), for /admin/staff. Works on
   the login tables through their own connection (vslm_auth), never the
   website's database user. The actions check the admin first; the safety rules
   live here so nothing can skip them:
   - nobody changes their own role, switches themselves off or deletes themselves;
   - there is always at least one admin who can sign in;
   - only sample accounts (DUMMY C22) can be deleted. Real ones are switched
     off instead, so "Added by …" keeps their name;
   - passwords are stored only as a hash, and changing one signs that person out. */

export type Account = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
  branch: string | null;
  banned: boolean;
  /** Has a password (sample accounts don't, so they can't sign in). */
  canSignIn: boolean;
  sample: boolean;
};
export type Done = { ok: true } | { ok: false; errors: Record<string, string> };
type Actor = { id: string };

const fail = (form: string, field = "form"): Done => ({ ok: false, errors: { [field]: form } });

export async function listAccounts(): Promise<Account[]> {
  const { rows } = await authPool.query<{ id: string; name: string; email: string; role: string | null; branch: string | null; banned: boolean | null; has_password: boolean }>(
    `select u.id, u.name, u.email, u.role, u.branch, u.banned,
            exists (select 1 from account a where a."userId" = u.id and a."providerId" = 'credential' and a.password is not null) as has_password
       from "user" u
      order by (u.role = 'admin') desc, u.name`,
  );
  return rows.map((r) => ({
    id: r.id, name: r.name, email: r.email, role: r.role === "admin" ? "admin" : "staff", branch: r.branch,
    banned: !!r.banned, canSignIn: r.has_password, sample: isSample(r.email),
  }));
}

async function find(id: string): Promise<Account | undefined> {
  return (await listAccounts()).find((a) => a.id === id);
}

/** Admins other than `id` who can sign in (not switched off, with a password). */
function otherAdmins(all: Account[], id: string) {
  return all.filter((a) => a.id !== id && a.role === "admin" && !a.banned && a.canSignIn).length;
}

export async function createAccount(f: NewAccountInput): Promise<Done> {
  const ctx = await auth.$context;
  if (await ctx.internalAdapter.findUserByEmail(f.email)) return fail("An account with this email already exists.", "email");
  const user = await ctx.internalAdapter.createUser({ email: f.email, name: f.name, emailVerified: true, role: f.role, branch: f.branch }, { method: "admin" });
  await ctx.internalAdapter.linkAccount({ userId: user.id, providerId: "credential", accountId: user.id, password: await ctx.password.hash(f.password) });
  return { ok: true };
}

export async function updateAccount(actor: Actor, id: string, f: AccountInput): Promise<Done> {
  const all = await listAccounts();
  const target = all.find((a) => a.id === id);
  if (!target) return fail("That account no longer exists.");
  if (target.role !== f.role) {
    if (id === actor.id) return fail("You can't change your own role. Ask another admin.", "role");
    if (target.role === "admin" && target.canSignIn && !target.banned && otherAdmins(all, id) === 0) return fail("This is the only admin who can sign in. Make someone else admin first.", "role");
  }
  const ctx = await auth.$context;
  await ctx.internalAdapter.updateUser(id, { name: f.name, role: f.role, branch: f.branch });
  return { ok: true };
}

/** A new password; the person is signed out on every device. */
export async function setPassword(id: string, password: string): Promise<Done> {
  const target = await find(id);
  if (!target) return fail("That account no longer exists.");
  if (target.sample) return fail("Sample accounts can't sign in. Add a real account instead.");
  const ctx = await auth.$context;
  const hash = await ctx.password.hash(password);
  const accounts = await ctx.internalAdapter.findAccounts(id);
  if (accounts.some((a) => a.providerId === "credential")) await ctx.internalAdapter.updatePassword(id, hash);
  else await ctx.internalAdapter.linkAccount({ userId: id, providerId: "credential", accountId: id, password: hash });
  await ctx.internalAdapter.deleteUserSessions(id);
  return { ok: true };
}

/** Switch off (can't sign in, signed out at once) or back on. */
export async function setSwitchedOff(actor: Actor, id: string, off: boolean): Promise<Done> {
  const all = await listAccounts();
  const target = all.find((a) => a.id === id);
  if (!target) return fail("That account no longer exists.");
  if (off && id === actor.id) return fail("You can't switch off your own account.");
  if (off && target.role === "admin" && target.canSignIn && otherAdmins(all, id) === 0) return fail("This is the only admin who can sign in, so it can't be switched off.");
  const ctx = await auth.$context;
  await ctx.internalAdapter.updateUser(id, { banned: off, banReason: null, banExpires: null });
  if (off) await ctx.internalAdapter.deleteUserSessions(id);
  return { ok: true };
}

/** Only sample accounts; real ones are switched off instead. */
export async function deleteSample(actor: Actor, id: string): Promise<Done> {
  const target = await find(id);
  if (!target) return fail("That account no longer exists.");
  if (!target.sample || id === actor.id) return fail("Only sample accounts can be deleted. Switch this account off instead.");
  const ctx = await auth.$context;
  await ctx.internalAdapter.deleteUser(id);
  return { ok: true };
}
