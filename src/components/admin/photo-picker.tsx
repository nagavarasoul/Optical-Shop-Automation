"use client";

/* Photos for lenses, eye camps and the gallery (Requirements_Admin.md 6.2 and 7.2),
   in the frame form's style: take or choose, resized in the browser, reorder,
   remove, and, where photos may show people, "Shows people" with the
   written-permission tick (the server and the database check it again). */
import { useRef, useState } from "react";
import { shrink } from "@/lib/client-photo";

export type PickedPhoto = { key: string; url: string; file?: Blob; note?: string; showsPeople: boolean; consent: boolean };

const ICONS = {
  left: "M15 6l-6 6 6 6",
  bin: "M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5",
  right: "M9 6l6 6-6 6",
};
const Svg = ({ d }: { d: string }) => <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d={d} /></svg>;

export function PhotoPicker({ photos, onChange, max, people, noun, error, testId = "photo-input" }: {
  photos: PickedPhoto[]; onChange: (next: PickedPhoto[]) => void; max: number; people: boolean; noun: string; error?: string; testId?: string;
}) {
  const cam = useRef<HTMLInputElement>(null);
  const pick = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState("");
  const [problem, setProblem] = useState("");
  const counter = useRef(0);

  async function add(list: FileList | null) {
    if (!list?.length) return;
    setProblem("");
    const room = max - photos.length;
    const files = [...list].slice(0, room);
    const added: PickedPhoto[] = [];
    for (const [n, file] of files.entries()) {
      setStatus(`Preparing photo ${n + 1} of ${files.length}…`);
      try {
        const { blob, note } = await shrink(file);
        added.push({ key: `new-${++counter.current}`, url: URL.createObjectURL(blob), file: blob, note, showsPeople: false, consent: false });
      } catch (e) {
        setProblem(`${file.name}: ${(e as Error).message}`);
      }
    }
    setStatus(list.length > room ? `Only ${max} photo${max === 1 ? "" : "s"} allowed; the rest weren't added.` : "");
    onChange([...photos, ...added]);
  }
  const set = (i: number, patch: Partial<PickedPhoto>) => onChange(photos.map((p, k) => (k === i ? { ...p, ...patch } : p)));
  const move = (i: number, by: number) => { const next = [...photos]; [next[i], next[i + by]] = [next[i + by], next[i]]; onChange(next); };

  return (
    <div>
      <div className="photos">
        {photos.map((p, i) => (
          <div className={`ptile ${p.showsPeople && !p.consent && error ? "has-error" : ""}`} key={p.key}>
            <div className="ptile__img">
              {/* eslint-disable-next-line @next/next/no-img-element -- a local preview or a /media photo */}
              <img src={p.url} alt={`${noun} photo ${i + 1}`} />
              {i === 0 && max > 1 && <span className="adm-badge adm-badge--gold ptile__cover">Cover</span>}
            </div>
            {p.note && <span className="ptile__size">{p.note}</span>}
            {people && (
              <>
                <label className="consent"><input type="checkbox" checked={p.showsPeople} onChange={(e) => set(i, { showsPeople: e.target.checked, consent: e.target.checked && p.consent })} /><span>Shows people</span></label>
                {p.showsPeople && (
                  <label className="consent"><input type="checkbox" checked={p.consent} onChange={(e) => set(i, { consent: e.target.checked })} /><span>The people shown gave written permission to publish it</span></label>
                )}
              </>
            )}
            <div className="ptile__tools">
              {max > 1 && <button type="button" aria-label={`Move photo ${i + 1} earlier`} disabled={i === 0} onClick={() => move(i, -1)}><Svg d={ICONS.left} /></button>}
              <button type="button" aria-label={`Remove photo ${i + 1}`} onClick={() => onChange(photos.filter((_, k) => k !== i))}><Svg d={ICONS.bin} /></button>
              {max > 1 && <button type="button" aria-label={`Move photo ${i + 1} later`} disabled={i === photos.length - 1} onClick={() => move(i, 1)}><Svg d={ICONS.right} /></button>}
            </div>
          </div>
        ))}
        {photos.length < max && (
          <div className="padd">
            <button className="btn btn--primary" type="button" onClick={() => cam.current?.click()}>Take photo</button>
            <button className="btn btn--outline-dark" type="button" onClick={() => pick.current?.click()}>Choose photo{max > 1 ? "s" : ""}</button>
            <p>JPG, PNG, WebP or HEIC, up to 10 MB</p>
          </div>
        )}
      </div>
      <input ref={cam} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      <input ref={pick} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" multiple={max > 1} hidden data-testid={testId} onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      {status && <p className="photo-status" aria-live="polite">{status}</p>}
      {(problem || error) && <span className="ferr" role="alert">{problem || error}</span>}
    </div>
  );
}
