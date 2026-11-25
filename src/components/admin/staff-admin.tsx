/* Staff accounts (Requirements_Admin.md section 3; not mocked up): admin only.
   The add form, or one account's settings with ?id=, then every account.
   Until the client names the staff (Q102), the demo database holds sample
   accounts (DUMMY C22) that can't sign in; delete them once real ones exist. */
import Link from "next/link";
import { withRole } from "@/lib/db";
import { branchesAdmin } from "@/lib/queries/admin";
import { requireStaff } from "@/lib/session";
import { listAccounts } from "@/lib/staff-admin";
import { DummyTag } from "@/components/site/dummy-tag";
import { StaffAddForm, StaffManage } from "./staff-forms";

type SP = Promise<Record<string, string | string[] | undefined>>;

export async function StaffAdmin({ searchParams }: { searchParams: SP }) {
  const staff = await requireStaff();
  const head = (
    <header className="adm-head">
      <nav aria-label="Breadcrumb"><ol className="crumbs"><li><Link href="/admin">Dashboard</Link></li><li aria-current="page">Staff accounts</li></ol></nav>
      <h1>Staff accounts</h1>
      <p>Who can sign in to the staff area. Admins can also approve frames, delete content and change settings.</p>
    </header>
  );
  if (staff.role !== "admin") return <>{head}<p className="adm-readonly">Only an admin can manage staff accounts. Ask the admin to add someone or change a password.</p></>;

  const sp = await searchParams;
  const [rows, branchRows] = await Promise.all([listAccounts(), withRole(staff.role, (tx) => branchesAdmin(tx), staff.id)]);
  const branches = branchRows.map((b) => ({ slug: b.slug, name: b.name }));
  const branchName = (slug: string | null) => branches.find((b) => b.slug === slug)?.name ?? "No branch";
  const editing = typeof sp.id === "string" ? rows.find((r) => r.id === sp.id) ?? null : null;
  const samples = rows.filter((r) => r.sample).length;
  return (
    <>
      {head}
      {editing ? <StaffManage key={editing.id} account={editing} self={editing.id === staff.id} branches={branches} />
        : <StaffAddForm branches={branches} />}
      <section className="apanel" aria-labelledby="st-title" style={{ marginTop: 24 }}>
        <div className="apanel__head"><h2 id="st-title"><span>Accounts ({rows.length})</span></h2></div>
        <div className="apanel__body">
          {samples > 0 && <p className="apanel__empty">{samples} sample account{samples === 1 ? "" : "s"} <DummyTag id="C22" /> show{samples === 1 ? "s" : ""} how the list looks. They can&apos;t sign in. Delete them once the real staff are added.</p>}
          <div className="bk-list st-list">
            {rows.map((r) => (
              <div className="bk-row" key={r.id}>
                <span className="bk-row__time">{r.role === "admin" ? "Admin" : "Staff"}</span>
                <span className="bk-row__who">
                  <b>{r.name}{r.id === staff.id ? " (you)" : ""}</b>
                  <span>{r.email}</span>
                  <span>
                    {r.role === "admin" ? <span className="adm-badge adm-badge--gold">Admin</span> : <span className="adm-badge adm-badge--muted">Staff</span>}{" "}
                    <span className="adm-badge adm-badge--muted">{branchName(r.branch)}</span>
                    {r.banned && <> <span className="adm-badge adm-badge--alert">Switched off</span></>}
                    {r.sample && <> <span className="adm-badge adm-badge--muted">Sample, can&apos;t sign in</span></>}
                  </span>
                </span>
                <Link className="btn btn--outline-dark" href={`/admin/staff?id=${r.id}`} aria-label={`Manage ${r.name}`}>Manage</Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
