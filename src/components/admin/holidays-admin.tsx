/* Branch holidays (Requirements_Admin.md settings; not mocked up): the admin adds
   and removes closed days; staff see the list read-only. Upcoming days first,
   past ones folded away. The real days are still a question for the client
   (Q91); the seed's Diwali day is DUMMY D3. */
import Link from "next/link";
import { dayLabel, nowInIndia } from "@/lib/booking-rules";
import { withRole } from "@/lib/db";
import { closuresAdmin } from "@/lib/queries/admin";
import { requireStaff } from "@/lib/session";
import { getBranches } from "@/lib/site-data";
import { DummyTag } from "@/components/site/dummy-tag";
import { HolidayDelete, HolidayForm } from "./holiday-form";

export async function HolidaysAdmin() {
  const staff = await requireStaff();
  const [rows, branches] = await Promise.all([withRole(staff.role, (tx) => closuresAdmin(tx), staff.id), getBranches()]);
  const admin = staff.role === "admin";
  const today = nowInIndia().day;
  const upcoming = rows.filter((r) => r.day >= today);
  const past = rows.filter((r) => r.day < today).reverse();
  const label = (r: (typeof rows)[number]) => `${dayLabel(r.day)} ${r.day.slice(0, 4)}, ${r.branch ?? "both branches"}`;
  const row = (r: (typeof rows)[number], canRemove: boolean) => (
    <div className="bk-row" key={r.id}>
      <span className="bk-row__time">{dayLabel(r.day)}<br />{r.day.slice(0, 4)}</span>
      <span className="bk-row__who">
        <b>{r.branch ?? "Both branches"}</b>
        <span>{r.note ?? "No note"}{r.note?.includes("DUMMY") && <> <DummyTag id="D3" /></>}</span>
      </span>
      {canRemove && <span className="bk-row__ctl"><HolidayDelete id={r.id} label={label(r)} /></span>}
    </div>
  );
  return (
    <>
      <header className="adm-head">
        <nav aria-label="Breadcrumb"><ol className="crumbs"><li><Link href="/admin">Dashboard</Link></li><li aria-current="page">Branch holidays</li></ol></nav>
        <h1>Branch holidays</h1>
        <p>Days a branch is closed, such as festivals. On these days the booking form shows no times, and the Contact page shows the next one.</p>
      </header>
      {admin ? <HolidayForm branches={branches.map((b) => ({ slug: b.slug, name: b.name }))} />
        : <p className="adm-readonly">Only an admin can add or remove closed days. Ask the admin if a day is missing.</p>}
      <section className="apanel" aria-labelledby="h-up" style={{ marginTop: 24 }}>
        <div className="apanel__head"><h2 id="h-up"><span>Coming up ({upcoming.length})</span></h2></div>
        <div className="apanel__body">
          <div className="bk-list">
            {upcoming.length === 0 ? <p className="apanel__empty">No closed days coming up. Both branches are open every day.</p> : upcoming.map((r) => row(r, admin))}
          </div>
        </div>
      </section>
      {past.length > 0 && (
        <details className="apanel" style={{ marginTop: 16 }}>
          <summary className="apanel__head"><h2><span>Past closed days ({past.length})</span></h2></summary>
          <div className="apanel__body"><div className="bk-list">{past.map((r) => row(r, false))}</div></div>
        </details>
      )}
    </>
  );
}
