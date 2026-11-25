"use client";

/* Add / edit / review a frame or sunglasses (Requirements_Admin.md section 6),
   ported from the signed-off mockup (mockups/admin-frame.html). Built for a
   phone first: staff photograph the frame and fill this in at the counter.
   - Photos: up to 5, camera or gallery, resized here to 1600 px WebP before
     upload (fast on mobile data); the server checks type and size again.
   - The same Zod rules as the server (src/lib/frame-schema.ts).
   - Buttons depend on role and status; the server and database check again. */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { checkCode, deleteFrame, hideFrame, saveFrame, suggestCode, type SaveResult } from "@/app/admin/(staff)/frames/actions";
import {
  CATEGORIES, GENDERS, LENS_COLOURS, LENS_TYPES, MATERIALS, MAX_PHOTOS, PHOTO_KINDS, SHAPES, WHERE,
  fieldErrors, frameFields, intentProblems, type Intent,
} from "@/lib/frame-schema";
import { shrink } from "@/lib/client-photo";
import { AdminIcon } from "./admin-icons";

type Kind = "front" | "side" | "closeup" | "model";
type Photo = { key: string; url: string; kind: Kind; consent: boolean; file?: Blob; note?: string };
export type FrameFormProps = {
  kind: "frames" | "sunglasses";
  role: "admin" | "staff";
  defaultBranch: string;
  brands: string[];
  colours: string[];
  frame: null | {
    id: string; status: "draft" | "waiting" | "sent_back" | "approved"; reviewNote: string | null; addedBy: string | null;
    fields: Fields; photos: { id: string; path: string; kind: Kind; consent: boolean }[];
  };
};
type Fields = {
  code: string; category: string; brand: string; model: string; gender: string; colour: string; shape: string; material: string;
  sizeLens: string; sizeBridge: string; sizeTemple: string; lensTypes: string[]; lensColour: string; price: string;
  availability: "in_stock" | "sold_out"; availableAt: string; isActive: boolean;
};
const NEW = "__new__";
const blank = (kind: FrameFormProps["kind"], branch: string): Fields => ({
  code: "", category: kind === "sunglasses" ? "sunglasses" : "", brand: "", model: "", gender: "", colour: "", shape: "", material: "",
  sizeLens: "", sizeBridge: "", sizeTemple: "", lensTypes: [], lensColour: "", price: "", availability: "in_stock", availableAt: branch, isActive: true,
});

export function FrameForm({ kind, role, defaultBranch, brands, colours, frame }: FrameFormProps) {
  const router = useRouter();
  const admin = role === "admin";
  const sun = kind === "sunglasses";
  const noun = sun ? "sunglasses" : "frame";
  const status = frame?.status ?? null;
  const draftKey = `vslm-frame-draft-${kind}`;

  const [f, setF] = useState<Fields>(frame?.fields ?? blank(kind, defaultBranch));
  const [photos, setPhotos] = useState<Photo[]>(
    frame?.photos.map((p) => ({ key: `existing:${p.id}`, url: `/media/${p.path}`, kind: p.kind, consent: p.consent })) ?? [],
  );
  const [newBrand, setNewBrand] = useState(false);
  const [newColour, setNewColour] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [codeNote, setCodeNote] = useState<string | null>(null);
  const [photoNote, setPhotoNote] = useState("");
  // A problem with a photo just chosen shows beside the photos, not in the save summary
  const [photoError, setPhotoError] = useState("");
  const [pending, setPending] = useState<Intent | "delete" | "hide" | null>(null);
  const [done, setDone] = useState<Extract<SaveResult, { ok: true }> | null>(null);
  const [dialog, setDialog] = useState<null | "sendback" | "delete">(null);
  const [note, setNote] = useState("");
  // An unfinished new frame saved on this device (read after hydration, so no mismatch)
  const savedRaw = useSyncExternalStore(
    () => () => {},
    () => { if (frame) return null; try { return localStorage.getItem(draftKey); } catch { return null; } },
    () => null,
  );
  const [restoreDismissed, setRestoreDismissed] = useState(false);
  const restore = useMemo<Fields | null>(() => {
    try { const saved = JSON.parse(savedRaw || "null"); return saved?.fields?.model || saved?.fields?.code ? saved.fields : null; } catch { return null; }
  }, [savedRaw]);
  const dirty = useRef(false);
  const nextNew = useRef(0);
  const summary = useRef<HTMLDivElement>(null);
  const cam = useRef<HTMLInputElement>(null), pick = useRef<HTMLInputElement>(null);
  const dlg = useRef<HTMLDialogElement>(null);

  // Autosave the fields (not photos) of a new frame every few seconds
  useEffect(() => {
    if (frame || done) return;
    const t = setInterval(() => {
      if (!dirty.current) return;
      try { localStorage.setItem(draftKey, JSON.stringify({ fields: f, at: Date.now() })); } catch { /* storage full or blocked */ }
    }, 4000);
    return () => clearInterval(t);
  }, [f, frame, done, draftKey]);
  // "Leave without saving?"
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty.current) { e.preventDefault(); } };
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, []);
  useEffect(() => {
    if (!dlg.current) return;
    if (dialog && !dlg.current.open) dlg.current.showModal();
    if (!dialog && dlg.current.open) dlg.current.close();
  }, [dialog]);

  const set = <K extends keyof Fields>(k: K, v: Fields[K]) => { dirty.current = true; setF((x) => ({ ...x, [k]: v })); };
  const err = (k: string) => errors[k];
  const fieldsForCheck = useMemo(() => ({
    ...f, sizeLens: f.sizeLens, price: f.price,
    photos: photos.map((p) => ({ key: p.key, kind: p.kind, consent: p.consent })),
  }), [f, photos]);

  /* ---------- Photos ---------- */
  async function addFiles(list: FileList | null) {
    if (!list?.length) return;
    const room = MAX_PHOTOS - photos.length;
    const files = [...list].slice(0, room);
    if (list.length > room) setPhotoNote(`Only ${MAX_PHOTOS} photos fit; the extra ones were left out.`);
    for (const file of files) {
      try {
        const { blob, note: n } = await shrink(file);
        const key = `new:${nextNew.current++}`;
        dirty.current = true;
        setPhotos((ps) => [...ps, { key, url: URL.createObjectURL(blob), kind: "front", consent: false, file: blob, note: n }]);
        setPhotoError("");
        setErrors((e) => ({ ...e, photos: "" }));
      } catch (e) {
        setPhotoError(`${file.name}: ${(e as Error).message}`);
      }
    }
  }
  const move = (i: number, d: number) => setPhotos((ps) => {
    const n = [...ps]; const [p] = n.splice(i, 1); n.splice(i + d, 0, p); dirty.current = true; return n;
  });
  const remove = (i: number) => {
    if (!confirm("Remove this photo?")) return;
    dirty.current = true;
    setPhotos((ps) => ps.filter((_, j) => j !== i));
  };
  const setPhoto = (i: number, patch: Partial<Photo>) => { dirty.current = true; setPhotos((ps) => ps.map((p, j) => (j === i ? { ...p, ...patch } : p))); };

  /* ---------- Save ---------- */
  async function submit(intent: Intent, sendNote = "") {
    const parsed = frameFields.safeParse(fieldsForCheck);
    const errs = { ...(parsed.success ? {} : fieldErrors(parsed.error)), ...intentProblems(intent, fieldsForCheck) };
    if (codeNote) errs.code = codeNote;
    if (Object.keys(errs).length) {
      setErrors(errs);
      requestAnimationFrame(() => summary.current?.focus());
      return;
    }
    setErrors({});
    setPending(intent);
    const fd = new FormData();
    fd.set("intent", intent);
    if (frame) fd.set("id", frame.id);
    if (sendNote) fd.set("note", sendNote);
    // New photos are numbered in the order they're sent
    let n = 0;
    const meta = photos.map((p) => {
      if (p.file) { fd.append("newPhotos", p.file, `photo-${n}.${p.file.type === "image/webp" ? "webp" : "jpg"}`); return { key: `new:${n++}`, kind: p.kind, consent: p.consent }; }
      return { key: p.key, kind: p.kind, consent: p.consent };
    });
    fd.set("fields", JSON.stringify({ ...f, photos: meta }));
    try {
      const r = await saveFrame(fd);
      if (!r.ok) { setErrors(r.errors); requestAnimationFrame(() => summary.current?.focus()); return; }
      dirty.current = false;
      try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
      setDone(r);
      router.refresh();
    } catch {
      setErrors({ form: "Couldn't save. Check your connection and try again." });
    } finally {
      setPending(null);
    }
  }

  async function addAnother() {
    const prefix = f.code.split("-")[0] || (sun ? "SG" : "VSF");
    const code = await suggestCode(prefix);
    const keep = { brand: f.brand, category: f.category, gender: f.gender, availableAt: f.availableAt };
    router.push(`/admin/${kind}/new`);
    setDone(null); setPhotos([]); setF({ ...blank(kind, defaultBranch), ...keep, code });
  }

  /* ---------- Buttons by role and status (Requirements_Admin.md 6.3) ---------- */
  const actions: { intent: Intent; label: string; primary?: boolean }[] =
    status === "approved" ? [{ intent: "save", label: "Save changes", primary: true }]
    : status === "waiting" ? (admin ? [{ intent: "sendback", label: "Send back with a note" }, { intent: "approve", label: "Approve and publish", primary: true }] : [{ intent: "save", label: "Save changes", primary: true }])
    : admin ? [{ intent: "draft", label: "Save as draft" }, { intent: "publish", label: "Save and publish", primary: true }]
    : [{ intent: "draft", label: "Save as draft" }, { intent: "send", label: "Send for approval", primary: true }];

  const title = frame ? (status === "waiting" && admin ? `Review ${f.brand} ${f.model}` : `${f.brand} ${f.model}`) : `Add ${sun ? "sunglasses" : "a frame"}`;
  const errorList = Object.entries(errors).filter(([, m]) => m);
  const label = (k: string) => ({ code: "Frame code", category: "Category", brand: "Brand", model: "Model", gender: "Gender", colour: "Colour", shape: "Shape", price: "Price", availableAt: "Available at", photos: "Photos", note: "Note", form: "Form", sizeLens: "Lens width", sizeBridge: "Bridge", sizeTemple: "Temple" } as Record<string, string>)[k] ?? k;

  if (done) {
    return (
      <section className="bdone" tabIndex={-1} aria-labelledby="done-title" style={{ marginTop: 0 }}>
        <span className="bdone__tick" aria-hidden="true">✓</span>
        <h2 id="done-title">{{ draft: "Saved as draft", waiting: "Sent for approval", sent_back: "Sent back", approved: "Published" }[done.status] ?? "Saved"}</h2>
        <p>{done.message}</p>
        <div className="bdone__actions">
          <button className="btn btn--primary" type="button" onClick={addAnother}><AdminIcon name="plus" className="icon icon--sm" />Add another {noun}</button>
          <Link className="btn btn--outline-dark" href={`/admin/${kind}`}>Back to {sun ? "sunglasses" : "frames"}</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <header className="adm-head">
        <nav aria-label="Breadcrumb"><ol className="crumbs"><li><Link href="/admin">Dashboard</Link></li><li><Link href={`/admin/${kind}`}>{sun ? "Sunglasses" : "Frames"}</Link></li><li aria-current="page">{frame ? f.code : `Add ${noun}`}</li></ol></nav>
        <h1>{title}</h1>
      </header>

      <div className="fform">
        {restore && !restoreDismissed && (
          <div className="fbanner">
            <b>You have an unfinished {noun} on this device{restore.code ? ` (${restore.code})` : ""}.</b>
            <div className="fbanner__actions">
              <button className="btn btn--sm btn--primary" type="button" onClick={() => { setF(restore); setRestoreDismissed(true); dirty.current = true; }}>Continue it</button>
              <button className="btn btn--sm btn--outline-dark" type="button" onClick={() => { setRestoreDismissed(true); try { localStorage.removeItem(draftKey); } catch { /* ignore */ } }}>Start fresh</button>
            </div>
          </div>
        )}
        {status === "waiting" && <div className="fbanner"><b>{admin ? `Added by ${frame?.addedBy ?? "staff"}.` : "Waiting for an admin to approve."}</b>{admin ? "Check the photos and details, fix anything small yourself, then approve. It goes on the site straight away." : "You can still make changes; the admin sees the latest version."}</div>}
        {status === "sent_back" && frame?.reviewNote && <div className="fbanner"><b>Sent back by the admin:</b>{frame.reviewNote}</div>}
        {status === "approved" && <div className="fbanner"><b>This {noun} is live.</b>Changes go on the site as soon as you save.{!f.isActive ? " It's hidden from the site right now." : ""}</div>}

        <form className="fform" noValidate onSubmit={(e: FormEvent) => { e.preventDefault(); const primary = actions.find((a) => a.primary) ?? actions[0]; if (primary.intent === "sendback") setDialog("sendback"); else submit(primary.intent); }}>
          {errorList.length > 0 && (
            <div className="esummary" ref={summary} role="alert" tabIndex={-1}>
              <h2>Please fix {errorList.length === 1 ? "this" : `these ${errorList.length} things`}:</h2>
              <ul>{errorList.map(([k, m]) => <li key={k}><a href={`#f-${k}`}>{label(k)}: {m}</a></li>)}</ul>
            </div>
          )}

          {/* ---------- Photos ---------- */}
          <section className="fsec" aria-labelledby="sec-photos" id="f-photos">
            <h2 className="fsec__title" id="sec-photos">Photos <span className="ffield__hint">{photos.length} of {MAX_PHOTOS}</span></h2>
            <div className="photos">
              {photos.map((p, i) => (
                <div className={`ptile ${p.kind === "model" && !p.consent && errors.photos ? "has-error" : ""}`} key={p.key}>
                  <div className="ptile__img">
                    {/* eslint-disable-next-line @next/next/no-img-element -- a local preview or a /media photo */}
                    <img src={p.url} alt={`${PHOTO_KINDS.find((k) => k[0] === p.kind)?.[1]} photo ${i + 1}`} />
                    {i === 0 && <span className="adm-badge adm-badge--gold ptile__cover">Cover</span>}
                  </div>
                  {p.note && <span className="ptile__size">{p.note}</span>}
                  <select aria-label={`Type of photo ${i + 1}`} value={p.kind} onChange={(e) => setPhoto(i, { kind: e.target.value as Kind })}>
                    {PHOTO_KINDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  {p.kind === "model" && (
                    <label className="consent"><input type="checkbox" checked={p.consent} onChange={(e) => setPhoto(i, { consent: e.target.checked })} /><span>This person gave written permission to show this photo</span></label>
                  )}
                  <div className="ptile__tools">
                    <button type="button" aria-label={`Move photo ${i + 1} earlier`} disabled={i === 0} onClick={() => move(i, -1)}><svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg></button>
                    <button type="button" aria-label={`Remove photo ${i + 1}`} onClick={() => remove(i)}><svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5" /></svg></button>
                    <button type="button" aria-label={`Move photo ${i + 1} later`} disabled={i === photos.length - 1} onClick={() => move(i, 1)}><svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg></button>
                  </div>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <div className="padd">
                  <button className="btn btn--primary" type="button" onClick={() => cam.current?.click()}>Take photo</button>
                  <button className="btn btn--outline-dark" type="button" onClick={() => pick.current?.click()}>Choose photos</button>
                  <p>JPG, PNG, WebP or HEIC, up to 10 MB</p>
                </div>
              )}
            </div>
            <input ref={cam} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
            <input ref={pick} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" multiple hidden data-testid="photo-input" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
            {photoNote && <p className="photo-status" aria-live="polite">{photoNote}</p>}
            {(photoError || err("photos")) && <span className="ferr" role="alert">{photoError || err("photos")}</span>}
            <p className="photo-tip">Plain light background, whole {noun} in view, no reflections. Product-only photos unless the person gave written permission. The first photo is the cover.</p>
          </section>

          {/* ---------- Basics ---------- */}
          <section className="fsec" aria-labelledby="sec-basics">
            <h2 className="fsec__title" id="sec-basics">Basics</h2>
            <div className="fgrid">
              <div className={`ffield ${err("code") ? "has-error" : ""}`} id="f-code">
                <label htmlFor="code">Frame code</label>
                <input id="code" type="text" autoComplete="off" maxLength={10} spellCheck={false} value={f.code}
                  onChange={(e) => { set("code", e.target.value.toUpperCase()); setCodeNote(null); }}
                  onBlur={async () => setCodeNote(await checkCode(f.code, frame?.id))} />
                <span className="ffield__hint">Like {sun ? "SG-2017" : "VSF-1024"}, as on the tag.</span>
                {(codeNote || err("code")) && <span className="ferr">{codeNote ?? err("code")}</span>}
              </div>
              <div className={`ffield ${err("category") ? "has-error" : ""}`} id="f-category">
                <label htmlFor="category">Category</label>
                <select id="category" value={f.category} onChange={(e) => set("category", e.target.value)}>
                  <option value="">Choose</option>
                  {CATEGORIES.filter(([v]) => (sun ? v === "sunglasses" : v !== "sunglasses")).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                {err("category") && <span className="ferr">{err("category")}</span>}
              </div>
              <div className={`ffield ${err("brand") ? "has-error" : ""}`} id="f-brand">
                <label htmlFor="brand">Brand</label>
                {!newBrand ? (
                  <select id="brand" value={f.brand} onChange={(e) => (e.target.value === NEW ? (setNewBrand(true), set("brand", "")) : set("brand", e.target.value))}>
                    <option value="">Choose</option>
                    {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                    <option value={NEW}>Add a new brand…</option>
                  </select>
                ) : (
                  <input id="brand" type="text" maxLength={40} placeholder="New brand name" value={f.brand} onChange={(e) => set("brand", e.target.value)} />
                )}
                {err("brand") && <span className="ferr">{err("brand")}</span>}
              </div>
              <div className={`ffield ${err("model") ? "has-error" : ""}`} id="f-model">
                <label htmlFor="model">Model</label>
                <input id="model" type="text" maxLength={60} autoComplete="off" value={f.model} onChange={(e) => set("model", e.target.value)} />
                {err("model") && <span className="ferr">{err("model")}</span>}
              </div>
            </div>
            <fieldset className="fchips" id="f-gender">
              <legend>Gender</legend>
              <div className="chips-pick">
                {GENDERS.map(([v, l]) => <label className="rchoice" key={v}><input type="radio" name="gender" value={v} checked={f.gender === v} onChange={() => set("gender", v)} /><span>{l}</span></label>)}
              </div>
              {err("gender") && <span className="ferr">{err("gender")}</span>}
            </fieldset>
          </section>

          {/* ---------- Details ---------- */}
          <section className="fsec" aria-labelledby="sec-details">
            <h2 className="fsec__title" id="sec-details">Details</h2>
            <div className="fgrid">
              <div className={`ffield ${err("colour") ? "has-error" : ""}`} id="f-colour">
                <label htmlFor="colour">Colour</label>
                {!newColour ? (
                  <select id="colour" value={f.colour} onChange={(e) => (e.target.value === NEW ? (setNewColour(true), set("colour", "")) : set("colour", e.target.value))}>
                    <option value="">Choose</option>
                    {colours.map((c) => <option key={c} value={c}>{c}</option>)}
                    <option value={NEW}>Add a new colour…</option>
                  </select>
                ) : (
                  <input id="colour" type="text" maxLength={30} placeholder="New colour" value={f.colour} onChange={(e) => set("colour", e.target.value)} />
                )}
                {err("colour") && <span className="ferr">{err("colour")}</span>}
              </div>
              <div className={`ffield ${err("shape") ? "has-error" : ""}`} id="f-shape">
                <label htmlFor="shape">Shape</label>
                <select id="shape" value={f.shape} onChange={(e) => set("shape", e.target.value)}>
                  <option value="">Choose</option>
                  {SHAPES.map((s) => <option key={s}>{s}</option>)}
                </select>
                {err("shape") && <span className="ferr">{err("shape")}</span>}
              </div>
              <div className="ffield">
                <label htmlFor="material">Material <span className="ffield__hint">(optional)</span></label>
                <select id="material" value={f.material} onChange={(e) => set("material", e.target.value)}>
                  <option value="">Choose</option>
                  {MATERIALS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className={`ffield ${err("sizeLens") || err("sizeBridge") || err("sizeTemple") ? "has-error" : ""}`} id="f-sizeLens">
                <span className="ffield__label" id="size-label">Size in mm <span className="ffield__hint">(optional)</span></span>
                <div className="size3" role="group" aria-labelledby="size-label">
                  <label>Lens<input type="number" inputMode="numeric" value={f.sizeLens} onChange={(e) => set("sizeLens", e.target.value)} /></label>
                  <label>Bridge<input type="number" inputMode="numeric" value={f.sizeBridge} onChange={(e) => set("sizeBridge", e.target.value)} /></label>
                  <label>Temple<input type="number" inputMode="numeric" value={f.sizeTemple} onChange={(e) => set("sizeTemple", e.target.value)} /></label>
                </div>
                {(err("sizeLens") || err("sizeBridge") || err("sizeTemple")) && <span className="ferr">{err("sizeLens") || err("sizeBridge") || err("sizeTemple")}</span>}
              </div>
            </div>
            {sun && (
              <>
                <fieldset className="fchips">
                  <legend>Lens type</legend>
                  <div className="chips-pick">
                    {LENS_TYPES.map((t) => (
                      <label className="rchoice" key={t}><input type="checkbox" checked={f.lensTypes.includes(t)} onChange={(e) => set("lensTypes", e.target.checked ? [...f.lensTypes, t] : f.lensTypes.filter((x) => x !== t))} /><span>{t}</span></label>
                    ))}
                  </div>
                </fieldset>
                <div className="ffield" style={{ maxWidth: "24rem" }}>
                  <label htmlFor="lens-colour">Lens colour</label>
                  <select id="lens-colour" value={f.lensColour} onChange={(e) => set("lensColour", e.target.value)}>
                    <option value="">Choose</option>
                    {LENS_COLOURS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <p className="ffield__hint">Only these labels. The site adds no protection claims of its own.</p>
              </>
            )}
          </section>

          {/* ---------- Price and stock ---------- */}
          <section className="fsec" aria-labelledby="sec-price">
            <h2 className="fsec__title" id="sec-price">Price and stock</h2>
            <div className={`ffield ${err("price") ? "has-error" : ""}`} id="f-price" style={{ maxWidth: "24rem" }}>
              <label htmlFor="price">Price</label>
              <div className="phone"><span className="phone__pre" aria-hidden="true">₹</span><input id="price" type="text" inputMode="numeric" maxLength={8} autoComplete="off" value={f.price} onChange={(e) => set("price", e.target.value.replace(/[^\d]/g, ""))} /></div>
              <span className="ffield__hint">Whole rupees, as on the tag.</span>
              {err("price") && <span className="ferr">{err("price")}</span>}
            </div>
            <fieldset className="fchips" id="f-availableAt">
              <legend>Available at</legend>
              <div className="chips-pick">
                {WHERE.map(([v, l]) => <label className="rchoice" key={v}><input type="radio" name="where" value={v} checked={f.availableAt === v} onChange={() => set("availableAt", v)} /><span>{l}</span></label>)}
              </div>
              {err("availableAt") && <span className="ferr">{err("availableAt")}</span>}
            </fieldset>
            <label className="switch">
              <span className="switch__text"><b>Sold out</b><span>Stays on the site with a &quot;Sold out&quot; label.</span></span>
              <input type="checkbox" role="switch" checked={f.availability === "sold_out"} onChange={(e) => set("availability", e.target.checked ? "sold_out" : "in_stock")} />
            </label>
          </section>

          {/* ---------- On the website ---------- */}
          <section className="fsec" aria-labelledby="sec-pub">
            <h2 className="fsec__title" id="sec-pub">On the website</h2>
            <label className="switch">
              <span className="switch__text"><b>Visible on the site</b><span>Turn off to hide it, even after approval.</span></span>
              <input type="checkbox" role="switch" checked={f.isActive} onChange={(e) => set("isActive", e.target.checked)} />
            </label>
          </section>

          {frame && (
            <div className="danger">
              {admin ? (
                <>
                  <p><b>Delete this {noun}</b>Removes it and its photos for good. Staff can only hide {sun ? "sunglasses" : "frames"}.</p>
                  <button className="btn btn--outline-dark" type="button" onClick={() => setDialog("delete")}>Delete {noun}</button>
                </>
              ) : (
                <>
                  <p><b>Take it off the site</b>Hides it straight away. Only an admin can delete it.</p>
                  <button className="btn btn--outline-dark" type="button" disabled={!f.isActive || pending !== null}
                    onClick={async () => { setPending("hide"); await hideFrame(frame.id); set("isActive", false); dirty.current = false; setPending(null); router.refresh(); }}>
                    Hide from site
                  </button>
                </>
              )}
            </div>
          )}

          <div className="factions">
            <span className="factions__note" aria-live="polite">{pending ? "Saving…" : ""}</span>
            {actions.map((a) => (
              <button key={a.intent} className={`btn ${a.primary ? "btn--primary" : "btn--outline-dark"}`} type="button" disabled={pending !== null}
                onClick={() => (a.intent === "sendback" ? setDialog("sendback") : submit(a.intent))}>
                {pending === a.intent ? "Saving…" : a.label}
              </button>
            ))}
          </div>
        </form>
      </div>

      <dialog className="adm-dialog" ref={dlg} onClose={() => setDialog(null)} aria-labelledby="dlg-title">
        {dialog === "sendback" && (
          <form method="dialog" onSubmit={(e) => { e.preventDefault(); setDialog(null); submit("sendback", note); }}>
            <h2 id="dlg-title">Send back to staff</h2>
            <p>Say what to fix. They&apos;ll see your note on their dashboard.</p>
            <div className={`ffield ${err("note") ? "has-error" : ""}`}>
              <label htmlFor="note">Note</label>
              <textarea id="note" maxLength={300} placeholder="For example: please add a side photo" value={note} onChange={(e) => setNote(e.target.value)} />
              {err("note") && <span className="ferr">{err("note")}</span>}
            </div>
            <div className="adm-dialog__actions">
              <button className="btn btn--outline-dark" type="button" onClick={() => setDialog(null)}>Cancel</button>
              <button className="btn btn--primary" type="submit" disabled={!note.trim()}>Send back</button>
            </div>
          </form>
        )}
        {dialog === "delete" && frame && (
          <>
            <h2 id="dlg-title">Delete {f.code} permanently?</h2>
            <p>Its photos are deleted too. This can&apos;t be undone.</p>
            <div className="adm-dialog__actions">
              <button className="btn btn--outline-dark" type="button" onClick={() => setDialog(null)}>Cancel</button>
              <button className="btn btn--primary" type="button" onClick={async () => {
                setPending("delete");
                await deleteFrame(frame.id);
                dirty.current = false;
                router.push(`/admin/${kind}`);
              }}>Delete {noun}</button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
