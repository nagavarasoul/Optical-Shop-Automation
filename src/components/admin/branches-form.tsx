"use client";

/* Branches (Requirements_Admin.md 7.1), from mockups/admin-branches.html: one
   card per branch, saved together. Only an admin saves; staff see it read-only.
   "Leave without saving?" guards unsaved changes when leaving the page. */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { saveBranches } from "@/app/admin/(staff)/branches/actions";
import { DummyTag } from "@/components/site/dummy-tag";
import { cleanPhone, fieldErrors } from "@/lib/booking-rules";
import { branchFields, WEEK } from "@/lib/branch-rules";
import { AdminIcon } from "./admin-icons";

export type BranchCardData = {
  slug: string; name: string; address: string; mapUrl: string | null; phone: string; whatsapp: string;
  opens: string; closes: string; openDays: string[]; isVisible: boolean;
};
type Card = Omit<BranchCardData, "mapUrl"> & { mapUrl: string; same: boolean };
const isPlaceholder = (n: string) => /^0+$/.test(n.replace(/\D/g, ""));

export function BranchesForm({ branches, admin, workingBranch }: { branches: BranchCardData[]; admin: boolean; workingBranch: string }) {
  const router = useRouter();
  const initial = () => branches.map((b): Card => ({
    ...b, mapUrl: b.mapUrl ?? "", opens: b.opens.slice(0, 5), closes: b.closes.slice(0, 5), same: b.phone === b.whatsapp,
  }));
  const [cards, setCards] = useState<Card[]>(initial);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [note, setNote] = useState("No changes yet.");
  const [busy, setBusy] = useState(false);
  const summary = useRef<HTMLDivElement>(null);
  useEffect(() => { if (Object.keys(errors).length) summary.current?.focus(); }, [errors]);
  // Leaving the page (reload, close, typed address) with unsaved changes asks first
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = (slug: string, patch: Partial<Card>) => {
    setCards((x) => x.map((c) => {
      if (c.slug !== slug) return c;
      const next = { ...c, ...patch };
      return next.same ? { ...next, whatsapp: next.phone } : next;
    }));
    setDirty(true); setNote("Unsaved changes");
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const payload = cards.map((c) => ({ slug: c.slug, address: c.address, mapUrl: c.mapUrl, phone: c.phone, whatsapp: c.whatsapp,
      opens: c.opens, closes: c.closes, openDays: c.openDays, isVisible: c.isVisible }));
    payload.forEach((c, i) => {
      const r = branchFields.safeParse(c);
      if (!r.success) for (const [k, v] of Object.entries(fieldErrors(r.error))) errs[`${cards[i].slug}.${k}`] = v;
    });
    if (Object.keys(errs).length) return setErrors(errs);
    setErrors({}); setBusy(true);
    try {
      const r = await saveBranches(payload);
      if (!r.ok) return setErrors(r.errors);
      setDirty(false);
      setNote("Saved. The website shows the new details now.");
      router.refresh();
    } finally { setBusy(false); }
  }

  const nameOf = (key: string) => cards.find((c) => c.slug === key.split(".")[0])?.name ?? "";
  const errorList = Object.entries(errors);
  return (
    <form className="br-forms" noValidate onSubmit={submit}>
      {errorList.length > 0 && (
        <div className="esummary" role="alert" tabIndex={-1} ref={summary} style={{ gridColumn: "1 / -1" }}>
          <p><b>Please fix {errorList.length === 1 ? "this" : `these ${errorList.length} things`}:</b></p>
          <ul>{errorList.map(([k, m]) => <li key={k}><a href={`#${k.replace(".", "-")}`}>{k === "form" ? m : `${nameOf(k)}: ${m}`}</a></li>)}</ul>
        </div>
      )}
      {cards.map((b) => {
        const id = (f: string) => `${b.slug}-${f}`;
        const err = (f: string) => errors[`${b.slug}.${f}`];
        const box = (f: string) => `ffield ${err(f) ? "has-error" : ""}`;
        return (
          <section className="fsec" aria-labelledby={id("title")} key={b.slug}>
            <h2 className="fsec__title" id={id("title")}><AdminIcon name="pin" />{b.name}{b.slug === workingBranch && <span className="adm-badge adm-badge--gold">You&apos;re working here</span>}</h2>
            <div className={box("address")}>
              <label htmlFor={id("address")}>Address</label>
              <textarea id={id("address")} maxLength={200} readOnly={!admin} value={b.address} onChange={(e) => set(b.slug, { address: e.target.value })} />
              {err("address") && <span className="ferr">{err("address")}</span>}
            </div>
            <div className={box("mapUrl")}>
              <label htmlFor={id("mapUrl")}>Google Maps link <span className="ffield__hint">(optional)</span></label>
              <input id={id("mapUrl")} type="url" placeholder="https://maps.app.goo.gl/…" readOnly={!admin} value={b.mapUrl} onChange={(e) => set(b.slug, { mapUrl: e.target.value })} />
              <span className="ffield__hint">Used for &quot;Directions&quot;. If empty, the site searches Maps for the address.</span>
              {err("mapUrl") && <span className="ferr">{err("mapUrl")}</span>}
            </div>
            <div className="fgrid">
              <div className={box("phone")}>
                <label htmlFor={id("phone")}>Phone</label>
                <div className="phone"><span className="phone__pre" aria-hidden="true">+91</span>
                  <input id={id("phone")} type="tel" inputMode="numeric" maxLength={16} readOnly={!admin} value={b.phone}
                    onChange={(e) => set(b.slug, { phone: e.target.value })} onBlur={(e) => set(b.slug, { phone: cleanPhone(e.target.value) || e.target.value })} />
                </div>
                <span className="ffield__hint">10 digits.{isPlaceholder(b.phone) && <> <DummyTag id="D2" /></>}</span>
                {err("phone") && <span className="ferr">{err("phone")}</span>}
              </div>
              <div className={box("whatsapp")}>
                <label htmlFor={id("whatsapp")}>WhatsApp number</label>
                <div className="phone"><span className="phone__pre" aria-hidden="true">+91</span>
                  <input id={id("whatsapp")} type="tel" inputMode="numeric" maxLength={16} readOnly={!admin || b.same} value={b.whatsapp} onChange={(e) => set(b.slug, { whatsapp: e.target.value })} />
                </div>
                <label className="consent" style={{ marginTop: 6 }}><input type="checkbox" checked={b.same} disabled={!admin} onChange={(e) => set(b.slug, { same: e.target.checked })} /><span>Same as phone</span></label>
                {err("whatsapp") && <span className="ferr">{err("whatsapp")}</span>}
              </div>
              <div className={box("opens")}>
                <label htmlFor={id("opens")}>Opens</label>
                <input id={id("opens")} type="time" readOnly={!admin} value={b.opens} onChange={(e) => set(b.slug, { opens: e.target.value })} />
              </div>
              <div className={box("closes")}>
                <label htmlFor={id("closes")}>Closes</label>
                <input id={id("closes")} type="time" readOnly={!admin} value={b.closes} onChange={(e) => set(b.slug, { closes: e.target.value })} />
                {err("closes") && <span className="ferr">{err("closes")}</span>}
              </div>
            </div>
            <fieldset className={`fchips ${err("openDays") ? "has-error" : ""}`} id={id("openDays")}>
              <legend>Open on</legend>
              <div className="chips-pick">
                {WEEK.map((d) => (
                  <label className="rchoice" key={d}><input type="checkbox" checked={b.openDays.includes(d)} disabled={!admin}
                    onChange={(e) => set(b.slug, { openDays: e.target.checked ? WEEK.filter((x) => x === d || b.openDays.includes(x)) : b.openDays.filter((x) => x !== d) })} /><span>{d}</span></label>
                ))}
              </div>
              <span className="ffield__hint">Closed days for festivals go in <Link href="/admin/holidays">Branch holidays</Link>.</span>
              {err("openDays") && <span className="ferr">{err("openDays")}</span>}
            </fieldset>
            <label className="switch">
              <span className="switch__text"><b>Show this branch on the site</b><span>Turn off only if the branch closes for good.</span></span>
              <input type="checkbox" role="switch" checked={b.isVisible} disabled={!admin} onChange={(e) => set(b.slug, { isVisible: e.target.checked })} />
            </label>
          </section>
        );
      })}
      {admin && (
        <div className="factions">
          <span className="factions__note" aria-live="polite">{busy ? "Saving…" : note}</span>
          {dirty && <button className="btn btn--outline-dark" type="button" onClick={() => { setCards(initial()); setDirty(false); setErrors({}); setNote("No changes yet."); }}>Undo changes</button>}
          <button className="btn btn--primary" type="submit" disabled={busy}>Save changes</button>
        </div>
      )}
    </form>
  );
}
