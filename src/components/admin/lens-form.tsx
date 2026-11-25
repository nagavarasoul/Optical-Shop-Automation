"use client";

/* Add / edit a lens (Requirements_Admin.md 7, Requirements_Lenses.md 2), in the
   frame form's style. Features are short tags the brand or shop states; the
   site adds no claims of its own. Price is optional ("Ask for price"). */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { deleteLens, saveLens } from "@/app/admin/(staff)/lenses/actions";
import { fieldErrors } from "@/lib/booking-rules";
import { LENS_TYPES, lensFields, MAX_FEATURES } from "@/lib/lens-rules";
import { photoName } from "@/lib/client-photo";
import { PhotoPicker, type PickedPhoto } from "./photo-picker";

export type LensFormProps = {
  role: "admin" | "staff";
  brands: string[];
  lens: null | { id: string; brand: string; name: string; type: string; features: string[]; price: number | null; isActive: boolean; photo: string | null };
};
const NEW = "__new__";

export function LensForm({ role, brands, lens }: LensFormProps) {
  const router = useRouter();
  const [brand, setBrand] = useState(lens?.brand ?? "");
  const [newBrand, setNewBrand] = useState(false);
  const [name, setName] = useState(lens?.name ?? "");
  const [type, setType] = useState(lens?.type ?? "");
  const [features, setFeatures] = useState<string[]>(lens?.features ?? []);
  const [feature, setFeature] = useState("");
  const [price, setPrice] = useState(lens?.price != null ? String(lens.price) : "");
  const [active, setActive] = useState(lens?.isActive ?? true);
  const [photos, setPhotos] = useState<PickedPhoto[]>(lens?.photo ? [{ key: "existing", url: `/media/${lens.photo}`, showsPeople: false, consent: false }] : []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  // A new lens opens its own edit page after saving; ?saved=1 carries the message there
  const [saved, setSaved] = useState(useSearchParams().get("saved") === "1" ? "Saved. It's on the Lenses page now." : "");
  const [asking, setAsking] = useState(false);
  const summary = useRef<HTMLDivElement>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (Object.keys(errors).length) summary.current?.focus(); }, [errors]);
  useEffect(() => {
    if (asking && !dlg.current?.open) dlg.current?.showModal();
    if (!asking && dlg.current?.open) dlg.current.close();
  }, [asking]);

  const addFeature = () => {
    const v = feature.trim();
    if (v && !features.includes(v) && features.length < MAX_FEATURES) setFeatures([...features, v]);
    setFeature("");
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const check = lensFields.safeParse({ brand, name, type, features, price, isActive: active });
    if (!check.success) return setErrors(fieldErrors(check.error));
    setErrors({}); setBusy(true); setSaved("");
    const fd = new FormData();
    if (lens) fd.set("id", lens.id);
    fd.set("brand", brand); fd.set("name", name); fd.set("type", type); fd.set("price", price); fd.set("isActive", active ? "yes" : "");
    features.forEach((x) => fd.append("features", x));
    const p = photos[0];
    if (p?.file) fd.set("photo", p.file, photoName(p.file, 1));
    else if (p?.key === "existing") fd.set("keepPhoto", "yes");
    try {
      const r = await saveLens(fd);
      if (!r.ok) return setErrors(r.errors);
      setSaved(active ? "Saved. It's on the Lenses page now." : "Saved. It's hidden from the site.");
      if (!lens) router.replace(`/admin/lenses/${r.id}?saved=1`);
      else router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const err = (k: string) => errors[k] && <span className="ferr">{errors[k]}</span>;
  const box = (k: string) => `ffield ${errors[k] ? "has-error" : ""}`;
  const errorList = Object.entries(errors);
  return (
    <>
      <header className="adm-head">
        <nav aria-label="Breadcrumb"><ol className="crumbs"><li><Link href="/admin">Dashboard</Link></li><li><Link href="/admin/lenses">Lenses</Link></li><li aria-current="page">{lens ? lens.name : "Add a lens"}</li></ol></nav>
        <h1>{lens ? `${lens.brand} ${lens.name}` : "Add a lens"}</h1>
        <p>Lenses show on the Lenses page as soon as they&apos;re saved and active. No approval step.</p>
      </header>
      {saved && <div className="fbanner" role="status"><b>{saved}</b></div>}
      <form className="fform" noValidate onSubmit={submit}>
        {errorList.length > 0 && (
          <div className="esummary" ref={summary} role="alert" tabIndex={-1}>
            <h2>Please fix {errorList.length === 1 ? "this" : `these ${errorList.length} things`}:</h2>
            <ul>{errorList.map(([k, m]) => <li key={k}><a href={`#f-${k}`}>{m}</a></li>)}</ul>
          </div>
        )}
        <section className="fsec" aria-labelledby="sec-lens">
          <h2 className="fsec__title" id="sec-lens">Lens</h2>
          <div className="fgrid">
            <div className={box("brand")} id="f-brand">
              <label htmlFor="brand">Brand</label>
              {!newBrand ? (
                <select id="brand" value={brand} onChange={(e) => (e.target.value === NEW ? (setNewBrand(true), setBrand("")) : setBrand(e.target.value))}>
                  <option value="">Choose</option>
                  {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                  <option value={NEW}>Add a new brand…</option>
                </select>
              ) : (
                <input id="brand" type="text" maxLength={40} placeholder="New brand name" value={brand} onChange={(e) => setBrand(e.target.value)} />
              )}
              {err("brand")}
            </div>
            <div className={box("name")} id="f-name">
              <label htmlFor="name">Lens name</label>
              <input id="name" type="text" maxLength={60} placeholder="For example: Crizal Rock" value={name} onChange={(e) => setName(e.target.value)} />
              {err("name")}
            </div>
            <div className={box("type")} id="f-type">
              <label htmlFor="type">Type</label>
              <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">Choose</option>
                {LENS_TYPES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {err("type")}
            </div>
            <div className={box("price")} id="f-price">
              <label htmlFor="price">Price <span className="ffield__hint">(optional)</span></label>
              <input id="price" type="text" inputMode="numeric" maxLength={8} value={price} onChange={(e) => setPrice(e.target.value)} />
              <span className="ffield__hint">Whole rupees. Leave empty to show &quot;Ask for price&quot;.</span>
              {err("price")}
            </div>
          </div>
          <div className={box("features")} id="f-features">
            <label htmlFor="feature">Features <span className="ffield__hint">(up to {MAX_FEATURES}; only what the brand or shop states)</span></label>
            <div className="fgrid">
              <input id="feature" type="text" maxLength={30} placeholder="For example: Anti-glare" value={feature} onChange={(e) => setFeature(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }} />
              <button className="btn btn--outline-dark" type="button" onClick={addFeature} disabled={!feature.trim() || features.length >= MAX_FEATURES}>Add feature</button>
            </div>
            {features.length > 0 && (
              <ul className="pill-list" aria-label="Features added">
                {features.map((x) => <li key={x}>{x} <button type="button" className="clear-all" aria-label={`Remove ${x}`} onClick={() => setFeatures(features.filter((y) => y !== x))}>×</button></li>)}
              </ul>
            )}
            {err("features")}
          </div>
        </section>
        <section className="fsec" aria-labelledby="sec-photo" id="f-photo">
          <h2 className="fsec__title" id="sec-photo">Photo <span className="ffield__hint">(optional)</span></h2>
          <PhotoPicker photos={photos} onChange={setPhotos} max={1} people={false} noun="Lens" error={errors.photo} />
          <p className="photo-tip">A product or packaging photo. Brand logos only with the brand&apos;s permission.</p>
        </section>
        <section className="fsec" aria-labelledby="sec-pub">
          <h2 className="fsec__title" id="sec-pub">On the website</h2>
          <label className="consent"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /><span>Show this lens on the Lenses page</span></label>
        </section>
        <div className="factions">
          <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Saving…" : lens ? "Save changes" : "Add lens"}</button>
          <Link className="btn btn--outline-dark" href="/admin/lenses">Back to lenses</Link>
        </div>
      </form>
      {lens && role === "admin" && (
        <div className="danger">
          <p><b>Delete this lens</b>Removes it and its photo for good. Staff can only hide lenses.</p>
          <button className="btn btn--outline-dark" type="button" onClick={() => setAsking(true)}>Delete lens</button>
          <dialog className="adm-dialog" ref={dlg} onClose={() => setAsking(false)} aria-labelledby="del-title">
            <h2 id="del-title">Delete {lens.name} permanently?</h2>
            <p>This can&apos;t be undone.</p>
            <div className="adm-dialog__actions">
              <button className="btn btn--outline-dark" type="button" onClick={() => setAsking(false)}>Cancel</button>
              <button className="btn btn--primary" type="button" onClick={async () => { setAsking(false); await deleteLens(lens.id); router.replace("/admin/lenses"); }}>Delete lens</button>
            </div>
          </dialog>
        </div>
      )}
    </>
  );
}
