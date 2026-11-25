import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "./auth";

/* Who is signed in (the Data Access Layer). Admin pages and server actions call
   requireStaff(); its role is what they pass to withRole(). The proxy's cookie
   check is only a shortcut; this is the real check, against the database. */

export type Staff = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
  branch: string | null;
};

export const getStaff = cache(async (): Promise<Staff | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const { user } = session;
  const role = user.role === "admin" ? "admin" : user.role === "staff" ? "staff" : null;
  // A disabled account (banned by an admin) loses access at once
  if (!role || user.banned) return null;
  return { id: user.id, name: user.name, email: user.email, role, branch: user.branch ?? null };
});

export async function requireStaff(): Promise<Staff> {
  const staff = await getStaff();
  if (!staff) redirect("/admin/login");
  return staff;
}
