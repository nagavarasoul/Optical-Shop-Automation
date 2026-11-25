"use client";

/* Add / edit an eye camp (Requirements_Admin.md 7.2), from mockups/admin-camps.html.
   No approval step: it shows on the site when saved and visible. "After the camp"
   (people checked and up to 12 photos) opens once the camp's date has passed. */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { deleteCamp, saveCamp } from "@/app/admin/(staff)/eye-camps/actions";
import { fieldErrors, nowInIndia } from "@/lib/booking-rules";
import { campFields, isUpcoming, MAX_CAMP_PHOTOS, OFFER_OPTIONS } from "@/lib/camp-rules";
import { photoName } from "@/lib/client-photo";
import { PhotoPicker, type PickedPhoto } from "./photo-picker";

export type CampFormProps = {
  role: "admin" | "staff";
  branches: { slug: string; name: string }[];
  defaultBranch: string;
  camp: null | {
    id: string; slug: string; title: string; day: string; starts: string; ends: string; branch: string | null; place: string;
    organisedWith: string | null; description: string; offered: string[]; people: number | null; isVisible: boolean;
    photos: { id: string; path: string; showsPeople: boolean; consent: boolean }[];
  };
};
const noop = () => () => {};

export function CampForm({ role, branches, defaultBranch, camp }: CampFormProps) {
  const router = useRouter();
  const today = useSyncExternalStore(noop, () => nowInIndia().day, () => null);
  const [f, setF] = useState({
    title: camp?.title ?? "", day: camp?.day ?? "", starts: camp?.starts.slice(0, 5) ?? "09:00", ends: camp?.ends.slice(0, 5) ?? "13:00",
    branch: camp?.branch ?? defaultBranch, place: camp?.place ?? "", organisedWith: camp?.organisedWith ?? "", description: camp?.description ?? "",
    offered: camp?.offered ?? [], people: camp?.people != null ? String(camp.people) : "", isVisible: camp?.isVisible ?? true,
  });
  const [photos, setPhotos] = useState<PickedPhoto[]>(camp?.photos.map((p) => ({ key: `existing:${p.id}`, url: `/media/${p.path}`, showsPeople: p.showsPeople, consent: p.consent })) ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  // A new camp opens its own edit page after saving; ?saved=1 carries the message there
  const [saved, setSaved] = useState(useSearchParams().get("saved") === "1" ? "Saved. It's on the Eye camps page now." : "");
  const [asking, setAsking] = useState(false);
  const summary = useRef<HTMLDivElement>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (Object.keys(errors).length) summary.current?.focus(); }, [errors]);
  useEffect(() => {
    if (asking && !dlg.current?.open) dlg.current?.showModal();
    if (!asking && dlg.current?.open) dlg.current.close();
  }, [asking]);

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const after = !!f.day && !!today && !isUpcoming(f.day, today);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const check = campFields.safeParse({ ...f, people: after ? f.people : "" });
    const errs = check.success ? {} : fieldErrors(check.error);
    if (after && photos.some((p) => p.showsPeople && !p.consent)) errs.photos = "Tick the permission box for every photo that shows people, or remove it.";
    if (Object.keys(errs).length) return setErrors(errs);
    setErrors({}); setBusy(true); setSaved("");
    const fd = new FormData();
    if (camp) fd.set("id", camp.id);
    for (const [k, v] of Object.entries(f)) if (k !== "offered" && k !== "isVisible" && k !== "people") fd.set(k, String(v));
    f.offered.forEach((o) => fd.append("offered", o));
    fd.set("isVisible", f.isVisible ? "yes" : "");
    fd.set("people", after ? f.people : "");
    let n = 0;
    const meta = (after ? photos : []).map((p) => {
      if (p.file) { fd.append("newPhotos", p.file, photoName(p.file, n)); return { key: `new:${n++}`, showsPeople: p.showsPeople, consent: p.consent }; }
      return { key: p.key, showsPeople: p.showsPeople, consent: p.consent };
    });
    fd.set("photos", JSON.stringify(meta));
    try {
      const r = await saveCamp(fd);
      if (!r.ok) return setErrors(r.errors);
      setSaved(f.isVisible ? "Saved. It's on the Eye camps page now." : "Saved. It's hidden from the site.");
      if (!camp) router.replace(`/admin/eye-camps/${r.slug}?saved=1`);
      else router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const err = (k: string) => errors[k] && <span className="ferr">{errors[k]}</span>;
  const box = (k: string, extra = "") => `ffield ${extra} ${errors[k] ? "has-error" : ""}`;
  const errorList = Object.entries(errors);
  return (
    <>
      <header className="adm-head">
        <nav aria-label="Breadcrumb"><ol className="crumbs"><li><Link href="/admin">Dashboard</Link></li><li><Link href="/admin/eye-camps">Eye camps</Link></li><li aria-current="page">{camp ? "Edit camp" : "Add an eye camp"}</li></ol></nav>
        <h1>{camp ? camp.title : "Add an eye camp"}</h1>
        <p>{!camp ? "It shows on the Eye camps page as soon as you save. No approval needed." : after ? "This camp has happened. Add the people count and photos so it shows in \"Past camps\"." : "Changes show on the site straight away."}</p>
      </header>
      {saved && <div className="fbanner" role="status"><b>{saved}</b></div>}
      <form className="fform cf" noValidate onSubmit={submit}>
        {errorList.length > 0 && (
          <div className="esummary" ref={summary} role="alert" tabIndex={-1}>
            <h2>Please fix {errorList.length === 1 ? "this" : `these ${errorList.length} things`}:</h2>
            <ul>{errorList.map(([k, m]) => <li key={k}><a href={`#f-${k}`}>{m}</a></li>)}</ul>
          </div>
        )}
        <section className="fsec" aria-labelledby="sec-when">
          <h2 className="fsec__title" id="sec-when">Camp details</h2>
          <div className={box("title")} id="f-title">
            <label htmlFor="title">Camp name</label>
            <input id="title" type="text" maxLength={80} placeholder="For example: Free Eye Camp, Patelguda" value={f.title} onChange={(e) => set("title", e.target.value)} />
            {err("title")}
          </div>
          <div className="fgrid">
            <div className={box("day")} id="f-day">
              <label htmlFor="day">Date</label>
              <input id="day" type="date" value={f.day} onChange={(e) => set("day", e.target.value)} aria-describedby="day-hint" />
              <span className="ffield__hint" id="day-hint">Moves to &quot;Past camps&quot; by itself after this day.</span>
              {err("day")}
            </div>
            <div className={box("ends")} id="f-ends">
              <span className="ffield__label" id="time-label">Time</span>
              <div className="size3" role="group" aria-labelledby="time-label" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <label>Starts<input type="time" value={f.starts} onChange={(e) => set("starts", e.target.value)} /></label>
                <label>Ends<input type="time" value={f.ends} onChange={(e) => set("ends", e.target.value)} /></label>
              </div>
              {err("ends")}
            </div>
          </div>
          <fieldset className="fchips">
            <legend>Nearest branch</legend>
            <div className="chips-pick">
              {branches.map((b) => <label className="rchoice" key={b.slug}><input type="radio" name="branch" value={b.slug} checked={f.branch === b.slug} onChange={() => set("branch", b.slug)} /><span>{b.name}</span></label>)}
            </div>
          </fieldset>
          <div className={box("place")} id="f-place">
            <label htmlFor="place">Location and address</label>
            <textarea id="place" maxLength={200} placeholder="For example: Community hall, Citizens Colony, Indresham" value={f.place} onChange={(e) => set("place", e.target.value)} aria-describedby="place-hint" />
            <span className="ffield__hint" id="place-hint">Customers get a &quot;Directions&quot; button for this address.</span>
            {err("place")}
          </div>
          <div className={box("organisedWith")} id="f-organisedWith">
            <label htmlFor="with">Organised with <span className="ffield__hint">(optional)</span></label>
            <input id="with" type="text" maxLength={80} placeholder="For example: a school or residents' association" value={f.organisedWith} onChange={(e) => set("organisedWith", e.target.value)} />
            {err("organisedWith")}
          </div>
          <div className={box("description")} id="f-description">
            <label htmlFor="description">Description</label>
            <textarea id="description" maxLength={400} value={f.description} onChange={(e) => set("description", e.target.value)} aria-describedby="text-count" />
            <span className="ffield__hint" id="text-count">{f.description.length} / 400</span>
            {err("description")}
          </div>
          <fieldset className="fchips">
            <legend>What&apos;s offered</legend>
            <div className="chips-pick">
              {[...new Set([...OFFER_OPTIONS, ...f.offered])].map((o) => (
                <label className="rchoice" key={o}><input type="checkbox" checked={f.offered.includes(o)} onChange={(e) => set("offered", e.target.checked ? [...f.offered, o] : f.offered.filter((x) => x !== o))} /><span>{o}</span></label>
              ))}
            </div>
            <span className="ffield__hint">Short labels only. No medical promises.</span>
          </fieldset>
        </section>

        <section className="fsec" aria-labelledby="sec-after" id="f-photos">
          <h2 className="fsec__title" id="sec-after">After the camp</h2>
          {!after ? (
            <p className="ffield__hint">Fill this in after the camp day. It opens by itself once the date has passed.</p>
          ) : (
            <>
              <p className="ffield__hint" style={{ marginBottom: 12 }}>Shown on the camp page under &quot;Past camps&quot;.</p>
              <div className={box("people")} id="f-people" style={{ maxWidth: "16rem" }}>
                <label htmlFor="people">People checked</label>
                <input id="people" type="text" inputMode="numeric" maxLength={6} value={f.people} onChange={(e) => set("people", e.target.value)} />
                {err("people")}
              </div>
              <span className="ffield__label">Photos <span className="ffield__hint">{photos.length} of {MAX_CAMP_PHOTOS}</span></span>
              <PhotoPicker photos={photos} onChange={setPhotos} max={MAX_CAMP_PHOTOS} people noun="Camp" error={errors.photos} />
              <p className="photo-tip">Up to {MAX_CAMP_PHOTOS} photos, the first is the cover. Photos that show people only with everyone&apos;s permission.</p>
            </>
          )}
        </section>

        <section className="fsec" aria-labelledby="sec-pub">
          <h2 className="fsec__title" id="sec-pub">On the website</h2>
          <label className="switch">
            <span className="switch__text"><b>Visible on the site</b><span>Turn off to hide it from the Eye camps page.</span></span>
            <input type="checkbox" role="switch" checked={f.isVisible} onChange={(e) => set("isVisible", e.target.checked)} />
          </label>
        </section>

        {camp && (
          <div className="danger">
            {role === "admin" ? (
              <>
                <p><b>Delete this camp</b>Removes it and its photos for good. Staff can only hide camps.</p>
                <button className="btn btn--outline-dark" type="button" onClick={() => setAsking(true)}>Delete camp</button>
              </>
            ) : (
              <p><b>Take it off the site</b>Turn off &quot;Visible on the site&quot; and save. Only an admin can delete it.</p>
            )}
          </div>
        )}

        <div className="factions">
          <span className="factions__note" aria-live="polite">{busy ? "Saving…" : ""}</span>
          <Link className="btn btn--outline-dark" href="/admin/eye-camps">Cancel</Link>
          <button className="btn btn--primary" type="submit" disabled={busy}>{camp ? "Save changes" : "Save camp"}</button>
        </div>
      </form>
      {camp && role === "admin" && (
        <dialog className="adm-dialog" ref={dlg} onClose={() => setAsking(false)} aria-labelledby="del-title">
          <h2 id="del-title">Delete &quot;{camp.title}&quot; permanently?</h2>
          <p>Its photos are deleted too. This can&apos;t be undone.</p>
          <div className="adm-dialog__actions">
            <button className="btn btn--outline-dark" type="button" onClick={() => setAsking(false)}>Cancel</button>
            <button className="btn btn--primary" type="button" onClick={async () => { setAsking(false); await deleteCamp(camp.id); router.replace("/admin/eye-camps"); }}>Delete camp</button>
          </div>
        </dialog>
      )}
    </>
  );
}
