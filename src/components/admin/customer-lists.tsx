/* Staff lists of bookings and enquiries (Requirements_Admin.md 7). Customer
   details appear only here and on the dashboard, for signed-in staff; the
   pages are never cached publicly. Filters are a plain GET form, so they live
   in the address. Opening a list also deletes anything past the retention
   period (DUMMY D9). */
import Link from "next/link";
import { workingBranch } from "@/lib/admin-branch";
import { addDays, dayLabel, isDay, nowInIndia, timeLabel } from "@/lib/booking-rules";
import { withRole } from "@/lib/db";
import { TOPICS } from "@/lib/enquiry-rules";
import { BOOKING_STATUSES, bookingsList, ENQUIRY_STATUSES, enquiriesList } from "@/lib/queries/admin";
import { purgeExpired } from "@/lib/retention";
import { requireStaff } from "@/lib/session";
import { branches as branchSeed } from "@/lib/site-config";
import { AdminIcon } from "./admin-icons";
import { RowControls } from "./row-controls";

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (sp: Awaited<SP>, k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
const digits = (p: string) => p.replace(/\D/g, "").slice(-10);
const BRANCH_NAME: Record<string, string> = Object.fromEntries(branchSeed.map((b) => [b.slug, b.name]));

function Contact({ name, phone }: { name: string; phone: string }) {
  return (
    <span className="bk-row__act">
      <a href={`tel:+91${digits(phone)}`} aria-label={`Call ${name}`}><AdminIcon name="phone" className="icon icon--sm" /></a>
      <a href={`https://wa.me/91${digits(phone)}`} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${name}`}><AdminIcon name="wa" className="icon icon--sm" /></a>
    </span>
  );
}

export async function BookingsList({ searchParams }: { searchParams: SP }) {
  const staff = await requireStaff();
  const sp = await searchParams;
  const today = nowInIndia().day;
  const day = isDay(one(sp, "day") ?? "") ? one(sp, "day")! : today;
  const branchParam = one(sp, "branch");
  const branch = branchParam === "both" ? "" : branchParam && BRANCH_NAME[branchParam] ? branchParam : await workingBranch(staff);
  const status = one(sp, "status") ?? "";
  const rows = await withRole(staff.role, async (tx) => {
    await purgeExpired(tx);
    return bookingsList(tx, { day, branch: branch || undefined, status: status || undefined });
  }, staff.id);
  const link = (d: string) => `/admin/bookings?day=${d}&branch=${branch || "both"}${status ? `&status=${status}` : ""}`;

  return (
    <>
      <header className="adm-head">
        <nav aria-label="Breadcrumb"><ol className="crumbs"><li><Link href="/admin">Dashboard</Link></li><li aria-current="page">Bookings</li></ol></nav>
        <h1>Bookings</h1>
        <p>{rows.length} booking{rows.length === 1 ? "" : "s"} on {day === today ? "today, " : ""}{dayLabel(day)}{branch ? ` at ${BRANCH_NAME[branch]}` : ", both branches"}. Call or WhatsApp to confirm or move a booking.</p>
      </header>
      <form className="adm-tools" action="/admin/bookings" aria-label="Choose bookings">
        <div className="ffield" style={{ marginBottom: 0 }}>
          <label htmlFor="day">Day</label>
          <input id="day" name="day" type="date" defaultValue={day} />
        </div>
        <div className="ffield" style={{ marginBottom: 0 }}>
          <label htmlFor="branch">Branch</label>
          <select id="branch" name="branch" defaultValue={branch || "both"}>
            <option value="both">Both</option>
            {branchSeed.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
          </select>
        </div>
        <div className="ffield" style={{ marginBottom: 0 }}>
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={status}>
            <option value="">All</option>
            {BOOKING_STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <button className="btn btn--outline-dark" type="submit"><AdminIcon name="search" className="icon icon--sm" />Show</button>
        <Link className="btn btn--outline-dark" href={link(addDays(day, -1))}>Previous day</Link>
        <Link className="btn btn--outline-dark" href={link(addDays(day, 1))}>Next day</Link>
      </form>
      <section className="apanel" aria-label="Bookings list">
        <div className="apanel__body">
          <div className="bk-list">
            {rows.length === 0 ? <p className="apanel__empty">No bookings on this day.</p> : rows.map((b) => {
              const t = b.time.slice(0, 5);
              const label = `${b.name}, ${timeLabel(t)}`;
              return (
                <div className="bk-row" key={b.id}>
                  <span className="bk-row__time">{timeLabel(t)}</span>
                  <span className="bk-row__who">
                    <b>{b.name}</b>
                    <span>{b.branch} · {b.phone} · Ref {b.reference}{b.forWhom === "someone_else" ? " · for someone else" : ""}</span>
                    {b.note && <span>Note: {b.note}</span>}
                    {b.address && <span>Address: {b.address}</span>}
                  </span>
                  <Contact name={b.name} phone={b.phone} />
                  <span className="bk-row__ctl"><RowControls kind="booking" id={b.id} status={b.status} statuses={BOOKING_STATUSES} label={label} canDelete={staff.role === "admin"} /></span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

export async function EnquiriesList({ searchParams }: { searchParams: SP }) {
  const staff = await requireStaff();
  const sp = await searchParams;
  const status = ENQUIRY_STATUSES.some(([s]) => s === one(sp, "status")) ? one(sp, "status")! : "new";
  const rows = await withRole(staff.role, async (tx) => {
    await purgeExpired(tx);
    return enquiriesList(tx, status);
  }, staff.id);
  const topicName = (t: string) => TOPICS.find(([v]) => v === t)?.[1] ?? t;
  const when = (d: Date) => d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  const statusName = ENQUIRY_STATUSES.find(([v]) => v === status)![1];

  return (
    <>
      <header className="adm-head">
        <nav aria-label="Breadcrumb"><ol className="crumbs"><li><Link href="/admin">Dashboard</Link></li><li aria-current="page">Enquiries</li></ol></nav>
        <h1>Enquiries</h1>
        <p>Messages from the contact page. Reply on WhatsApp or call, then mark them Replied or Closed.</p>
      </header>
      <nav className="adm-tools" aria-label="Enquiry status">
        {ENQUIRY_STATUSES.map(([v, l]) => (
          <Link key={v} className={`btn ${v === status ? "btn--primary" : "btn--outline-dark"}`} href={`/admin/enquiries?status=${v}`} aria-current={v === status ? "page" : undefined}>{l}</Link>
        ))}
      </nav>
      <section className="apanel" aria-label={`${statusName} enquiries`}>
        <div className="apanel__body">
          <div className="bk-list">
            {rows.length === 0 ? <p className="apanel__empty">No {statusName.toLowerCase()} enquiries.</p> : rows.map((e) => {
              const label = `${e.name}, ${topicName(e.topic)}`;
              return (
                <div className="bk-row" key={e.id}>
                  <span className="bk-row__time">{when(e.createdAt)}</span>
                  <span className="bk-row__who">
                    <b>{e.name} · {topicName(e.topic)}{e.frameCode ? ` (${e.frameCode})` : ""}</b>
                    <span>{e.branch === "either" ? "Either branch" : BRANCH_NAME[e.branch] ?? e.branch} · {e.phone} · prefers {e.replyBy === "call" ? "a call" : "WhatsApp"}</span>
                    <span className="bk-row__msg">{e.message}</span>
                    {e.address && <span>Address: {e.address}</span>}
                  </span>
                  <Contact name={e.name} phone={e.phone} />
                  <span className="bk-row__ctl"><RowControls kind="enquiry" id={e.id} status={e.status} statuses={ENQUIRY_STATUSES} label={label} canDelete={staff.role === "admin"} /></span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
