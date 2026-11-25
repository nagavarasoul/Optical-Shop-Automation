"use client";

/* Add a closed day (admin): date, branch (or both) and a short note. After
   adding, it says how many bookings already stand on that day, with a link to
   them, so the branch can call those customers to move. */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { addClosure, deleteClosure } from "@/app/admin/(staff)/holidays/actions";
import { dayLabel, fieldErrors, nowInIndia } from "@/lib/booking-rules";
import { closureFields } from "@/lib/branch-rules";

const noop = () => () => {};

export function HolidayForm({ branches }: { branches: { slug: string; name: string }[] }) {
  const router = useRouter();
  const today = useSyncExternalStore(noop, () => nowInIndia().day, () => "");
  const [f, setF] = useState({ day: "", branch: "", note: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<{ day: string; bookings: number } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const check = closureFields.safeParse(f);
    if (!check.success) return setErrors(fieldErrors(check.error));
    setErrors({}); setBusy(true); setDone(null);
    const fd = new FormData();
    fd.set("day", f.day); fd.set("branch", f.branch); fd.set("note", f.note);
    try {
      const r = await addClosure(fd);
      if (!r.ok) return setErrors(r.errors);
      setDone({ day: f.day, bookings: r.bookings });
      setF({ day: "", branch: f.branch, note: "" });
      router.refresh();
    } finally { setBusy(false); }
  }

  const err = (k: string) => errors[k] && <span className="ferr">{errors[k]}</span>;
  return (
    <form className="fsec" noValidate onSubmit={submit} aria-labelledby="h-add">
      <h2 className="fsec__title" id="h-add">Add a closed day</h2>
      {done && (
        <div className="fbanner" role="status">
          <b>{dayLabel(done.day)} is now closed. The booking form shows no times for it.</b>
          {done.bookings > 0 && <span>{done.bookings} booking{done.bookings === 1 ? " is" : "s are"} already on this day: call {done.bookings === 1 ? "that customer" : "them"} to move. <Link href={`/admin/bookings?day=${done.day}&branch=both`}>See the bookings</Link></span>}
        </div>
      )}
      {errors.form && <span className="ferr" role="alert">{errors.form}</span>}
      <div className="fgrid">
        <div className={`ffield ${errors.day ? "has-error" : ""}`}>
          <label htmlFor="h-day">Date</label>
          <input id="h-day" type="date" min={today || undefined} value={f.day} onChange={(e) => setF({ ...f, day: e.target.value })} />
          {err("day")}
        </div>
        <div className={`ffield ${errors.branch ? "has-error" : ""}`}>
          <label htmlFor="h-branch">Branch</label>
          <select id="h-branch" value={f.branch} onChange={(e) => setF({ ...f, branch: e.target.value })}>
            <option value="">Both branches</option>
            {branches.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
          </select>
          {err("branch")}
        </div>
      </div>
      <div className={`ffield ${errors.note ? "has-error" : ""}`}>
        <label htmlFor="h-note">Note <span className="ffield__hint">(optional, shown on the Contact page)</span></label>
        <input id="h-note" type="text" maxLength={60} placeholder="For example: Diwali" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
        {err("note")}
      </div>
      <div className="factions">
        <span className="factions__note" aria-live="polite">{busy ? "Saving…" : ""}</span>
        <button className="btn btn--primary" type="submit" disabled={busy}>Add closed day</button>
      </div>
    </form>
  );
}

/** Admin only: re-open a day, after confirming. */
export function HolidayDelete({ id, label }: { id: string; label: string }) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const dlg = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (asking && !dlg.current?.open) dlg.current?.showModal();
    if (!asking && dlg.current?.open) dlg.current.close();
  }, [asking]);
  return (
    <>
      <button className="btn btn--outline-dark" type="button" onClick={() => setAsking(true)} aria-label={`Remove ${label}`}>Remove</button>
      <dialog className="adm-dialog" ref={dlg} onClose={() => setAsking(false)} aria-labelledby={`hd-${id}`}>
        <h2 id={`hd-${id}`}>Open again on this day?</h2>
        <p>{label}. Customers will be able to book it again.</p>
        <div className="adm-dialog__actions">
          <button className="btn btn--outline-dark" type="button" onClick={() => setAsking(false)}>Cancel</button>
          <button className="btn btn--primary" type="button" onClick={async () => { setAsking(false); await deleteClosure(id); router.refresh(); }}>Open this day</button>
        </div>
      </dialog>
    </>
  );
}
