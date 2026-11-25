"use client";

/* Today's bookings on the dashboard (Requirements_Admin.md section 5, block 4):
   time, name, branch, Call / WhatsApp for the customer, and the status.
   Customer details appear only here, for signed-in staff. */
import { useState, useTransition } from "react";
import { setBookingStatus } from "@/app/admin/(staff)/actions";
import { AdminIcon } from "./admin-icons";

export type Booking = {
  id: string; time: string; name: string; phone: string; branch: string; branchSlug: string;
  status: string; note: string | null; address: string | null;
};
const STATUSES = [["booked", "Booked"], ["attended", "Attended"], ["no_show", "No-show"], ["cancelled", "Cancelled"]] as const;
const time12 = (t: string) => { const [h, m] = t.split(":").map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };

export function BookingsPanel({ bookings, branches, defaultBranch }: {
  bookings: Booking[]; branches: { slug: string; name: string }[]; defaultBranch: string;
}) {
  const [filter, setFilter] = useState(defaultBranch);
  const [, startTransition] = useTransition();
  const list = bookings.filter((b) => !filter || b.branchSlug === filter);
  return (
    <div className="apanel__body">
      <div className="chips-pick bk-filter" role="radiogroup" aria-label="Show bookings for">
        {[{ slug: "", name: "Both branches" }, ...branches].map((b) => (
          <label className="rchoice" key={b.slug || "both"}>
            <input type="radio" name="bk-branch" value={b.slug} checked={filter === b.slug} onChange={() => setFilter(b.slug)} />
            <span>{b.name}</span>
          </label>
        ))}
      </div>
      <div className="bk-list">
        {list.length === 0 ? <p className="apanel__empty">No bookings today.</p> : list.map((b) => {
          const digits = b.phone.replace(/\D/g, "").slice(-10);
          return (
            <div className="bk-row" key={b.id}>
              <span className="bk-row__time">{time12(b.time)}</span>
              <span className="bk-row__who">
                <b>{b.name}</b>
                <span>{b.branch} · {b.phone}{b.note ? ` · ${b.note}` : ""}</span>
                {b.address && <span>Address: {b.address}</span>}
              </span>
              <span className="bk-row__act">
                <a href={`tel:+91${digits}`} aria-label={`Call ${b.name}`}><AdminIcon name="phone" className="icon icon--sm" /></a>
                <a href={`https://wa.me/91${digits}`} target="_blank" rel="noopener" aria-label={`WhatsApp ${b.name}`}><AdminIcon name="wa" className="icon icon--sm" /></a>
              </span>
              <select
                className="adm-select"
                aria-label={`Status for ${b.name}, ${time12(b.time)}`}
                defaultValue={b.status}
                onChange={(e) => { const s = e.target.value; startTransition(() => setBookingStatus(b.id, s)); }}
              >
                {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
