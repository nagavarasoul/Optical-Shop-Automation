"use client";

/* Add or edit a testimonial (Requirements_Admin.md 7): only a real customer's
   words, with the date they agreed to be quoted. */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { deleteTestimonial, saveTestimonial } from "@/app/admin/(staff)/testimonials/actions";
import { fieldErrors, nowInIndia } from "@/lib/booking-rules";
import { testimonialFields } from "@/lib/gallery-rules";

export type TestimonialFormProps = {
  role: "admin" | "staff";
  branches: { slug: string; name: string }[];
  item: null | { id: string; firstName: string; branch: string | null; quote: string; agreedOn: string; isVisible: boolean };
};
const noop = () => () => {};

export function TestimonialForm({ role, branches, item }: TestimonialFormProps) {
  const router = useRouter();
  const today = useSyncExternalStore(noop, () => nowInIndia().day, () => "");
  const blank = { firstName: "", branch: "", quote: "", agreedOn: "", isVisible: true };
  const [f, setF] = useState(item ? { firstName: item.firstName, branch: item.branch ?? "", quote: item.quote, agreedOn: item.agreedOn, isVisible: item.isVisible } : blank);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState("");
  const [asking, setAsking] = useState(false);
  const summary = useRef<HTMLDivElement>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (Object.keys(errors).length) summary.current?.focus(); }, [errors]);
  useEffect(() => {
    if (asking && !dlg.current?.open) dlg.current?.showModal();
    if (!asking && dlg.current?.open) dlg.current.close();
  }, [asking]);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    const check = testimonialFields.safeParse(f);
    if (!check.success) return setErrors(fieldErrors(check.error));
    setErrors({}); setBusy(true); setSaved("");
    const fd = new FormData();
    if (item) fd.set("id", item.id);
    fd.set("firstName", f.firstName); fd.set("branch", f.branch); fd.set("quote", f.quote); fd.set("agreedOn", f.agreedOn); fd.set("isVisible", f.isVisible ? "yes" : "");
    try {
      const r = await saveTestimonial(fd);
      if (!r.ok) return setErrors(r.errors);
      setSaved(f.isVisible ? "Saved. It shows with the reviews on the site." : "Saved. It's hidden from the site.");
      if (!item) setF(blank);
      router.refresh();
    } finally { setBusy(false); }
  }

  const err = (k: string) => errors[k] && <span className="ferr">{errors[k]}</span>;
  const box = (k: string) => `ffield ${errors[k] ? "has-error" : ""}`;
  const errorList = Object.entries(errors);
  return (
    <form className="fform" noValidate onSubmit={submit} aria-labelledby="t-title">
      <section className="fsec">
        <h2 className="fsec__title" id="t-title">{item ? `Edit ${item.firstName}'s testimonial` : "Add a testimonial"}</h2>
        {saved && <div className="fbanner" role="status"><b>{saved}</b></div>}
        {errorList.length > 0 && (
          <div className="esummary" ref={summary} role="alert" tabIndex={-1}>
            <h2>Please fix {errorList.length === 1 ? "this" : `these ${errorList.length} things`}:</h2>
            <ul>{errorList.map(([k, m]) => <li key={k}><a href={`#t-${k}`}>{m}</a></li>)}</ul>
          </div>
        )}
        <div className="fgrid">
          <div className={box("firstName")}>
            <label htmlFor="t-firstName">Customer&apos;s first name</label>
            <input id="t-firstName" type="text" maxLength={40} placeholder="For example: Lakshmi R." value={f.firstName} onChange={(e) => set("firstName", e.target.value)} />
            {err("firstName")}
          </div>
          <div className={box("branch")}>
            <label htmlFor="t-branch">Branch <span className="ffield__hint">(optional)</span></label>
            <select id="t-branch" value={f.branch} onChange={(e) => set("branch", e.target.value)}>
              <option value="">Not said</option>
              {branches.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
            </select>
          </div>
        </div>
        <div className={box("quote")}>
          <label htmlFor="t-quote">What they said</label>
          <textarea id="t-quote" maxLength={300} value={f.quote} onChange={(e) => set("quote", e.target.value)} aria-describedby="t-count" />
          <span className="ffield__hint" id="t-count">{f.quote.length} / 300. Their own words; don&apos;t add to them.</span>
          {err("quote")}
        </div>
        <div className={box("agreedOn")} style={{ maxWidth: "16rem" }}>
          <label htmlFor="t-agreedOn">Date they agreed to be quoted</label>
          <input id="t-agreedOn" type="date" max={today || undefined} value={f.agreedOn} onChange={(e) => set("agreedOn", e.target.value)} />
          {err("agreedOn")}
        </div>
        <label className="consent"><input type="checkbox" checked={f.isVisible} onChange={(e) => set("isVisible", e.target.checked)} /><span>Show it on the site</span></label>
        <div className="factions">
          <span className="factions__note" aria-live="polite">{busy ? "Saving…" : ""}</span>
          {item && <Link className="btn btn--outline-dark" href="/admin/testimonials">Cancel</Link>}
          {item && role === "admin" && <button className="btn btn--outline-dark" type="button" onClick={() => setAsking(true)}>Delete</button>}
          <button className="btn btn--primary" type="submit" disabled={busy}>{item ? "Save changes" : "Add testimonial"}</button>
        </div>
      </section>
      {item && role === "admin" && (
        <dialog className="adm-dialog" ref={dlg} onClose={() => setAsking(false)} aria-labelledby="del-title">
          <h2 id="del-title">Delete {item.firstName}&apos;s testimonial permanently?</h2>
          <p>This can&apos;t be undone.</p>
          <div className="adm-dialog__actions">
            <button className="btn btn--outline-dark" type="button" onClick={() => setAsking(false)}>Cancel</button>
            <button className="btn btn--primary" type="button" onClick={async () => { setAsking(false); await deleteTestimonial(item.id); router.replace("/admin/testimonials"); }}>Delete testimonial</button>
          </div>
        </dialog>
      )}
    </form>
  );
}
