import "server-only";
import { cookies } from "next/headers";
import { branches } from "./site-config";
import type { Staff } from "./session";

/* The branch a staff member is working on (Requirements_Admin.md section 4).
   An admin picks it in the sidebar (saved in a cookie, so server pages can use
   it); staff always work on their home branch. */
export const BRANCH_COOKIE = "vslm-admin-branch";
export const branchSlugs = branches.map((b) => b.slug) as string[];

export async function workingBranch(staff: Staff): Promise<string> {
  const home = staff.branch && branchSlugs.includes(staff.branch) ? staff.branch : branchSlugs[0];
  if (staff.role !== "admin") return home;
  const picked = (await cookies()).get(BRANCH_COOKIE)?.value;
  return picked && branchSlugs.includes(picked) ? picked : home;
}
