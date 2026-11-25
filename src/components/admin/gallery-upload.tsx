"use client";

/* Upload gallery photos (Requirements_Gallery.md 2): choose or take up to 10,
   each resized in the browser, then give each a tag, a caption (also its alt
   text), the branch and month, and "Shows people" with the permission tick. */
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { uploadGalleryPhotos } from "@/app/admin/(staff)/gallery/actions";
import { photoName, shrink } from "@/lib/client-photo";
import { allowedTags, GALLERY_BRANCHES, galleryPhotoFields, MAX_GALLERY_UPLOAD } from "@/lib/gallery-rules";
import { fieldErrors } from "@/lib/booking-rules";

type Pending = { key: number; url: string; blob: Blob; note: string; tag: string; caption: string; branch: string; month: string; showsPeople: boolean; consent: boolean };

export function GalleryUpload({ defaultBranch }: { defaultBranch: string }) {
  const router = useRouter();
  const cam = useRef<HTMLInputElement>(null);
  const pick = useRef<HTMLInputElement>(null);
  const counter = useRef(0);
  const [items, setItems] = useState<Pending[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(list: FileList | null) {
    if (!list?.length) return;
    const room = MAX_GALLERY_UPLOAD - items.length;
    const added: Pending[] = [];
    const problems: string[] = [];
    for (const file of [...list].slice(0, room)) {
      try {
        const { blob, note } = await shrink(file);
        added.push({ key: ++counter.current, url: URL.createObjectURL(blob), blob, note, tag: "", caption: "", branch: defaultBranch, month: "", showsPeople: false, consent: false });
      } catch (e) { problems.push(`${file.name}: ${(e as Error).message}`); }
    }
    setItems((x) => [...x, ...added]);
    setStatus([...problems, list.length > room ? `Up to ${MAX_GALLERY_UPLOAD} photos at a time; the rest weren't added.` : ""].filter(Boolean).join(" "));
  }
  const set = (key: number, patch: Partial<Pending>) => setItems((x) => x.map((p) => (p.key === key ? { ...p, ...patch } : p)));

  async function upload() {
    const errs: Record<string, string> = {};
    items.forEach((p, i) => {
      const r = galleryPhotoFields.safeParse(p);
      if (!r.success) for (const [k, v] of Object.entries(fieldErrors(r.error))) errs[`${i}.${k}`] = v;
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true); setStatus("");
    const fd = new FormData();
    items.forEach((p, i) => fd.append("photos", p.blob, photoName(p.blob, i)));
    fd.set("meta", JSON.stringify(items.map(({ tag, caption, branch, month, showsPeople, consent }) => ({ tag, caption, branch, month, showsPeople, consent }))));
    try {
      const r = await uploadGalleryPhotos(fd);
      if (!r.ok) return setErrors(r.errors);
      setItems([]);
      setStatus(`${r.added} photo${r.added === 1 ? "" : "s"} added to the gallery.`);
      router.refresh();
    } finally { setBusy(false); }
  }

  const err = (i: number, k: string) => errors[`${i}.${k}`] && <span className="ferr">{errors[`${i}.${k}`]}</span>;
  return (
    <section className="fsec" aria-labelledby="up-title">
      <h2 className="fsec__title" id="up-title">Add photos <span className="ffield__hint">up to {MAX_GALLERY_UPLOAD} at a time</span></h2>
      {errors.form && <span className="ferr" role="alert">{errors.form}</span>}
      <div className="gup">
        {items.map((p, i) => (
          <div className="gup__item" key={p.key}>
            <div className="ptile__img">
              {/* eslint-disable-next-line @next/next/no-img-element -- a local preview */}
              <img src={p.url} alt={`New photo ${i + 1}`} />
            </div>
            <span className="ptile__size">{p.note}</span>
            <div className={`ffield ${errors[`${i}.tag`] ? "has-error" : ""}`}>
              <label htmlFor={`tag-${p.key}`}>Tag</label>
              <select id={`tag-${p.key}`} value={p.tag} onChange={(e) => set(p.key, { tag: e.target.value })}>
                <option value="">Choose</option>
                {allowedTags().map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              {err(i, "tag")}
            </div>
            <div className={`ffield ${errors[`${i}.caption`] ? "has-error" : ""}`}>
              <label htmlFor={`cap-${p.key}`}>Caption</label>
              <input id={`cap-${p.key}`} type="text" maxLength={120} placeholder="For example: The frame wall at Indresham" value={p.caption} onChange={(e) => set(p.key, { caption: e.target.value })} />
              {err(i, "caption")}
            </div>
            <div className="fgrid">
              <div className="ffield">
                <label htmlFor={`br-${p.key}`}>Branch</label>
                <select id={`br-${p.key}`} value={p.branch} onChange={(e) => set(p.key, { branch: e.target.value })}>
                  {GALLERY_BRANCHES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className={`ffield ${errors[`${i}.month`] ? "has-error" : ""}`}>
                <label htmlFor={`mo-${p.key}`}>Month taken <span className="ffield__hint">(optional)</span></label>
                <input id={`mo-${p.key}`} type="month" value={p.month} onChange={(e) => set(p.key, { month: e.target.value })} />
                {err(i, "month")}
              </div>
            </div>
            <label className="consent"><input type="checkbox" checked={p.showsPeople} onChange={(e) => set(p.key, { showsPeople: e.target.checked, consent: e.target.checked && p.consent })} /><span>Shows people</span></label>
            {p.showsPeople && (
              <label className="consent"><input type="checkbox" checked={p.consent} onChange={(e) => set(p.key, { consent: e.target.checked })} /><span>The people shown gave written permission to publish it</span></label>
            )}
            {err(i, "consent")}
            <button className="clear-all" type="button" onClick={() => setItems((x) => x.filter((y) => y.key !== p.key))}>Remove this photo</button>
          </div>
        ))}
        {items.length < MAX_GALLERY_UPLOAD && (
          <div className="padd">
            <button className="btn btn--primary" type="button" onClick={() => cam.current?.click()}>Take photo</button>
            <button className="btn btn--outline-dark" type="button" onClick={() => pick.current?.click()}>Choose photos</button>
            <p>JPG, PNG, WebP or HEIC, up to 10 MB</p>
          </div>
        )}
      </div>
      <input ref={cam} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      <input ref={pick} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" multiple hidden data-testid="gallery-input" onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      {status && <p className="photo-status" role="status">{status}</p>}
      <p className="photo-tip">Real photos of the shops, team, frames and camps. Photos of people only with their written permission. Customer photos stay off until the shop confirms permission.</p>
      {items.length > 0 && (
        <div className="factions">
          <span className="factions__note" aria-live="polite">{busy ? "Uploading…" : ""}</span>
          <button className="btn btn--primary" type="button" disabled={busy} onClick={upload}>Add {items.length} photo{items.length === 1 ? "" : "s"} to the gallery</button>
        </div>
      )}
    </section>
  );
}
