import { AdminLoading } from "@/components/admin/admin-loading";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminIcon } from "@/components/admin/admin-icons";
import { BookingsPanel } from "@/components/admin/bookings-panel";
import { workingBranch } from "@/lib/admin-branch";
import { withRole } from "@/lib/db";
import { counts, myOpenFrames, recentChanges, todaysBookings, waitingFrames, type FrameRow } from "@/lib/queries/admin";
import { requireStaff } from "@/lib/session";
import { time12 } from "@/lib/site-config";
import { getBranches } from "@/lib/site-data";
import { staffNames } from "@/lib/staff-directory";

// Absolute: the admin layout's title template only applies to pages below /admin
export const metadata: Metadata = { title: { absolute: "Dashboard | VS Lens Mart staff area" } };

/* Staff dashboard (Requirements_Admin.md section 5), ported from the signed-off
   mockup (mockups/admin.html). "What needs doing today?" Every number and list
   is read with the signed-in role, so row-level security decides what shows. */
export default function Dashboard() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <DashboardContent />
    </Suspense>
  );
}

const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const STATUS: Record<string, [string, string]> = {
  draft: ["Draft", "adm-badge--muted"], waiting: ["Waiting for approval", "adm-badge--gold"],
  sent_back: ["Sent back", "adm-badge--alert"], approved: ["Approved", "adm-badge--ok"],
};
const ago = (d: Date | string, now: Date) => {
  const mins = Math.round((now.getTime() - new Date(d).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} hr ago`;
  return mins < 60 * 48 ? "yesterday" : new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
};
const editHref = (f: FrameRow) => `/admin/${f.category === "sunglasses" ? "sunglasses" : "frames"}/${f.code}`;

async function DashboardContent() {
  const staff = await requireStaff();
  const admin = staff.role === "admin";
  const [slug, branches] = await Promise.all([workingBranch(staff), getBranches()]);
  const data = await withRole(staff.role, async (tx) => ({
    n: await counts(tx, staff.id),
    bookings: await todaysBookings(tx),
    queue: admin ? await waitingFrames(tx) : await myOpenFrames(tx, staff.id),
    changes: await recentChanges(tx),
  }), staff.id);
  const names = await staffNames([...data.queue.map((f) => f.createdBy), ...data.changes.map((c) => c.by)]);
  const now = new Date();
  const hour = Number(now.toLocaleString("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }));
  const branch = branches.find((b) => b.slug === slug) ?? branches[0];
  const { n } = data;
  const perBranch = (s: string) => data.bookings.filter((b) => b.branchSlug === s && b.status !== "cancelled").length;
  const toCome = data.bookings.filter((b) => b.status === "booked").length;

  const todo = [
    admin
      ? { n: n.waitingFrames + n.waitingSunglasses, label: "Waiting for approval", sub: "New frames from staff", href: "/admin/frames?status=waiting" }
      : { n: n.myOpen, label: "Your frames in progress", sub: `${n.mySentBack} sent back to you`, href: "/admin/frames?mine=1" },
    { n: n.bookingsToday, label: "Bookings today", sub: `${branches.map((b) => `${b.name} ${perBranch(b.slug)}`).join(" · ")} · ${toCome} still to come`, href: "/admin/bookings" },
    { n: n.newEnquiries, label: "New enquiries", sub: "From the contact form", href: "/admin/enquiries" },
  ];

  return (
    <>
      <header className="adm-head">
        <p className="caps section__eyebrow">{now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" })}</p>
        <h1>Good {hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"}, {staff.name}.</h1>
        <p>{admin ? "Admin" : "Staff"} · {branch.name} branch · {branch.address}</p>
      </header>

      <div className="adm-todo">
        {todo.map((c) => (
          <Link key={c.label} href={c.href} className={c.n ? "is-due" : ""}>
            <span className="adm-todo__num">{c.n}</span>
            <span className="adm-todo__label">{c.label}</span>
            <span className="adm-todo__sub">{c.sub}</span>
          </Link>
        ))}
      </div>

      <div className="adm-quick" role="group" aria-label="Quick actions">
        <Link className="btn btn--primary" href="/admin/frames/new"><AdminIcon name="plus" className="icon icon--sm" />Add frame</Link>
        <Link className="btn btn--outline-dark" href="/admin/sunglasses/new"><AdminIcon name="sun" className="icon icon--sm" />Add sunglasses</Link>
        <Link className="btn btn--outline-dark" href="/admin/eye-camps"><AdminIcon name="camp" className="icon icon--sm" />Add eye camp</Link>
        <Link className="btn btn--outline-dark" href="/admin/gallery"><AdminIcon name="image" className="icon icon--sm" />Add gallery photo</Link>
      </div>

      <div className="adm-grid">
        <div className="adm-col">
          <section className="apanel" aria-labelledby="bk-title">
            <div className="apanel__head">
              <h2 id="bk-title"><AdminIcon name="cal" />Today&apos;s bookings</h2>
              <Link href="/admin/bookings">All bookings</Link>
            </div>
            <BookingsPanel
              bookings={data.bookings.map((b) => ({ ...b, time: b.time.slice(0, 5) }))}
              branches={branches.map((b) => ({ slug: b.slug, name: b.name }))}
              defaultBranch={slug}
            />
          </section>

          <section className="apanel" aria-labelledby="dq-title">
            <div className="apanel__head">
              <h2 id="dq-title"><AdminIcon name={admin ? "shield" : "glasses"} />{admin ? "Waiting for your approval" : "Your frames in progress"}</h2>
              <Link href={admin ? "/admin/frames?status=waiting" : "/admin/frames"}>See all</Link>
            </div>
            <div className="apanel__body">
              <div className="dq-list">
                {data.queue.length === 0 ? (
                  <p className="apanel__empty">{admin ? "Nothing waiting. All caught up." : "No drafts. Tap \"Add frame\" to start one."}</p>
                ) : data.queue.map((f) => {
                  const by = f.createdBy ? names.get(f.createdBy) : undefined;
                  const [label, cls] = STATUS[f.status];
                  return (
                    <div className="dq-row" key={f.id}>
                      <span className="dq-thumb" aria-hidden="true"><AdminIcon name="glasses" /></span>
                      <span className="dq-row__text">
                        <b>{f.brand} {f.model}</b>
                        <span>{f.code} · {rupees(f.price)} · {f.category === "sunglasses" ? "Sunglasses" : "Frame"} · {f.photos} photo{f.photos === 1 ? "" : "s"}</span>
                        <span>{admin ? `Added by ${by?.name ?? "staff"}, ${ago(f.updatedAt, now)}` : <span className={`adm-badge ${cls}`}>{label}</span>}</span>
                        {!admin && f.reviewNote && <span className="dq-note"><b>Admin&apos;s note:</b> {f.reviewNote}</span>}
                      </span>
                      <Link className={`btn btn--sm ${admin || f.status === "sent_back" ? "btn--primary" : "btn--outline-dark"}`} href={editHref(f)}>
                        {admin ? "Review" : f.status === "sent_back" ? "Fix and resend" : "Open"}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        <div className="adm-col">
          <section className="apanel" aria-labelledby="br-title">
            <div className="apanel__head">
              <h2 id="br-title"><AdminIcon name="pin" />{branch.name} branch</h2>
              {admin && <Link href="/admin/branches">Edit branches</Link>}
            </div>
            <div className="apanel__body">
              <div className="br-info">
                <div><AdminIcon name="pin" className="icon icon--sm" /><address>{branch.address}</address></div>
                <div><AdminIcon name="phone" className="icon icon--sm" /><span>{branch.dummy ? "+91 00000 00000 (placeholder, DUMMY D2)" : branch.phone}</span></div>
                <div><AdminIcon name="clock" className="icon icon--sm" /><span>{branch.openDays.length === 7 ? "Monday–Sunday" : branch.openDays.join(", ")}, {time12(branch.opens)}–{time12(branch.closes)}</span></div>
              </div>
            </div>
          </section>

          <section className="apanel" aria-labelledby="rc-title">
            <div className="apanel__head"><h2 id="rc-title"><AdminIcon name="clock" />Recent changes</h2></div>
            <div className="apanel__body">
              {data.changes.length === 0 ? <p className="apanel__empty">No changes yet.</p> : (
                <ul className="rc-list">
                  {data.changes.map((c, i) => (
                    <li key={i}><time>{ago(c.at, now)}</time><span>{(c.by && names.get(c.by)?.name) || "Staff"} updated <b>{c.what}</b></span></li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="apanel" aria-labelledby="gl-title">
            <div className="apanel__head"><h2 id="gl-title"><AdminIcon name="eye" />On the site now</h2></div>
            <div className="apanel__body">
              <div className="glance">
                {[[n.framesLive, "Frames live"], [n.sunglassesLive, "Sunglasses live"], [n.soldOut, "Sold out (still shown)"],
                  [n.notApproved, "Not yet approved"], [n.upcomingCamps, "Upcoming eye camps"], [n.galleryPhotos, "Gallery photos"]].map(([v, l]) => (
                  <div key={l}><b>{v}</b><span>{l}</span></div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
