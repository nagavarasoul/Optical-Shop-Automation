/* Staff eye camps list (Requirements_Admin.md 7.2), from mockups/admin-camps.html:
   Upcoming / Past, each row with date, name, time, place and status; past camps
   missing a people count or photos are flagged. */
import Link from "next/link";
import { nowInIndia } from "@/lib/booking-rules";
import { longDate, timeRange } from "@/lib/camp-rules";
import { withRole } from "@/lib/db";
import { campsAdminList } from "@/lib/queries/admin";
import { requireStaff } from "@/lib/session";
import { AdminIcon } from "./admin-icons";

type SP = Promise<Record<string, string | string[] | undefined>>;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function CampsList({ searchParams }: { searchParams: SP }) {
  const staff = await requireStaff();
  const when = (await searchParams).when === "past" ? "past" : "upcoming";
  const rows = await withRole(staff.role, (tx) => campsAdminList(tx, when, nowInIndia().day), staff.id);

  return (
    <>
      <header className="adm-head">
        <nav aria-label="Breadcrumb"><ol className="crumbs"><li><Link href="/admin">Dashboard</Link></li><li aria-current="page">Eye camps</li></ol></nav>
        <h1>Eye camps</h1>
        <p>Add upcoming camps so customers can find them. After a camp, add how many people came and the photos.</p>
      </header>
      <div className="adm-tools">
        <nav aria-label="Show camps" className="branch__actions">
          {(["upcoming", "past"] as const).map((w) => (
            <Link key={w} className={`btn ${w === when ? "btn--primary" : "btn--outline-dark"}`} href={`/admin/eye-camps?when=${w}`} aria-current={w === when ? "page" : undefined}>{w === "upcoming" ? "Upcoming" : "Past"}</Link>
          ))}
        </nav>
        <Link className="btn btn--primary" href="/admin/eye-camps/new"><AdminIcon name="plus" className="icon icon--sm" />Add eye camp</Link>
      </div>
      <section className="apanel" aria-labelledby="camps-title">
        <div className="apanel__head"><h2 id="camps-title"><AdminIcon name="camp" /><span>{when === "upcoming" ? "Upcoming" : "Past"} camps ({rows.length})</span></h2></div>
        <div className="apanel__body">
          <div className="camp-list">
            {rows.length === 0 ? <p className="apanel__empty">{when === "upcoming" ? "No upcoming camps. Tap \"Add eye camp\" to add one." : "No past camps yet."}</p> : rows.map((c) => {
              const needs = when === "past" && (c.people == null || c.photos === 0);
              return (
                <div className="camp-row" key={c.id}>
                  <span className="camp-row__date" aria-hidden="true"><span><b>{Number(c.day.slice(8))}</b><br /><span>{MONTHS[Number(c.day.slice(5, 7)) - 1]} {c.day.slice(2, 4)}</span></span></span>
                  <span className="camp-row__text">
                    <b>{c.title}</b>
                    <span>{longDate(c.day)} · {timeRange(c.starts, c.ends)}</span>
                    <span>{c.place}</span>
                    <span>
                      {!c.isVisible ? <span className="adm-badge adm-badge--muted">Hidden</span>
                        : when === "upcoming" ? <span className="adm-badge adm-badge--ok">On the site</span>
                        : needs ? <span className="adm-badge adm-badge--alert">Add people count and photos</span>
                        : `${c.people} people checked · ${c.photos} photo${c.photos === 1 ? "" : "s"}`}
                    </span>
                  </span>
                  <Link className={`btn btn--sm ${needs ? "btn--primary" : "btn--outline-dark"}`} href={`/admin/eye-camps/${c.slug}`} aria-label={`Edit ${c.title}`}>Edit</Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
