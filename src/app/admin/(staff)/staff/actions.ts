"use server";

/* Staff accounts (Requirements_Admin.md section 3). Only an admin may call
   these; the safety rules (own account, last admin, samples) are in
   src/lib/staff-admin.ts. Passwords arrive here, are hashed there, and are
   never sent back or logged. */
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { fieldErrors } from "@/lib/booking-rules";
import { withRole } from "@/lib/db";
import { branchesAdmin } from "@/lib/queries/admin";
import { requireStaff, type Staff } from "@/lib/session";
import * as accounts from "@/lib/staff-admin";
import type { Done } from "@/lib/staff-admin";
import { accountFields, newAccountFields, passwordFields } from "@/lib/staff-rules";

const id = z.string().min(1).max(64);
const notAdmin: Done = { ok: false, errors: { form: "Only an admin can manage staff accounts." } };
const text = (fd: FormData, k: string) => String(fd.get(k) ?? "");

async function admin(): Promise<Staff | null> {
  const staff = await requireStaff();
  return staff.role === "admin" ? staff : null;
}

async function realBranch(staff: Staff, slug: string) {
  const rows = await withRole(staff.role, (tx) => branchesAdmin(tx), staff.id);
  return rows.some((b) => b.slug === slug);
}

function refresh() {
  revalidatePath("/admin", "layout"); // names also show as "Added by …"
}

export async function addAccount(fd: FormData): Promise<Done> {
  const staff = await admin();
  if (!staff) return notAdmin;
  const parsed = newAccountFields.safeParse({ name: text(fd, "name"), email: text(fd, "email"), role: text(fd, "role"), branch: text(fd, "branch"), password: text(fd, "password"), again: text(fd, "again") });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  if (!(await realBranch(staff, parsed.data.branch))) return { ok: false, errors: { branch: "Choose a home branch." } };
  const r = await accounts.createAccount(parsed.data);
  if (r.ok) refresh();
  return r;
}

export async function saveAccount(accountId: string, fd: FormData): Promise<Done> {
  const staff = await admin();
  if (!staff) return notAdmin;
  const parsed = accountFields.safeParse({ name: text(fd, "name"), role: text(fd, "role"), branch: text(fd, "branch") });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  if (!(await realBranch(staff, parsed.data.branch))) return { ok: false, errors: { branch: "Choose a home branch." } };
  const r = await accounts.updateAccount(staff, id.parse(accountId), parsed.data);
  if (r.ok) refresh();
  return r;
}

/** `signedOut`: the admin changed their own password, so this session has ended too. */
export async function resetPassword(accountId: string, fd: FormData): Promise<Done & { signedOut?: boolean }> {
  const staff = await admin();
  if (!staff) return notAdmin;
  const parsed = passwordFields.safeParse({ password: text(fd, "password"), again: text(fd, "again") });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const target = id.parse(accountId);
  const r = await accounts.setPassword(target, parsed.data.password);
  if (r.ok) refresh();
  return r.ok ? { ok: true, signedOut: target === staff.id } : r;
}

export async function switchAccount(accountId: string, off: boolean): Promise<Done> {
  const staff = await admin();
  if (!staff) return notAdmin;
  const r = await accounts.setSwitchedOff(staff, id.parse(accountId), off === true);
  if (r.ok) refresh();
  return r;
}

export async function removeSample(accountId: string): Promise<Done> {
  const staff = await admin();
  if (!staff) return notAdmin;
  const r = await accounts.deleteSample(staff, id.parse(accountId));
  if (r.ok) refresh();
  return r;
}
