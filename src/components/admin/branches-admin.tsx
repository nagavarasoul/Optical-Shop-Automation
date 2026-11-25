/* Branches (Requirements_Admin.md 7.1): the admin edits; staff see it read-only. */
import Link from "next/link";
import { workingBranch } from "@/lib/admin-branch";
import { withRole } from "@/lib/db";
import { branchesAdmin } from "@/lib/queries/admin";
import { requireStaff } from "@/lib/session";
import { BranchesForm } from "./branches-form";

export async function BranchesAdmin() {
  const staff = await requireStaff();
  const [rows, working] = await Promise.all([withRole(staff.role, (tx) => branchesAdmin(tx), staff.id), workingBranch(staff)]);
  const admin = staff.role === "admin";
  return (
    <>
      <header className="adm-head">
        <nav aria-label="Breadcrumb"><ol className="crumbs"><li><Link href="/admin">Dashboard</Link></li><li aria-current="page">Branches</li></ol></nav>
        <h1>Branches</h1>
        <p>Address, phone, WhatsApp and opening hours for each branch. Changes show on the website straight away: footer, Contact page, branch picker and booking form.</p>
      </header>
      {!admin && <p className="adm-readonly">Only an admin can change branch details. Ask the admin if something here is wrong.</p>}
      <BranchesForm admin={admin} workingBranch={working}
        branches={rows.map((r) => ({ ...r, openDays: r.openDays }))} />
    </>
  );
}
