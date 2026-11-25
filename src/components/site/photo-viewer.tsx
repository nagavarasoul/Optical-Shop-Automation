"use client";

/* The large photo view shared by camp pages and the gallery (Requirements_Gallery.md
   4, Requirements_EyeCamps.md 5), from the mockup's lightbox.js: a native <dialog>
   (focus trap and Esc built in), previous / next with buttons, arrow keys or a
   swipe, "n of m", and focus back on the photo that was opened. */
import Image from "next/image";
import { useEffect, useRef } from "react";
import { Icon } from "./icons";

export type ViewerPhoto = { path: string; caption: string; meta?: string };

export function PhotoViewer({ photos, index, onIndex, onClose, opener }: {
  photos: ViewerPhoto[]; index: number | null; onIndex: (i: number) => void; onClose: () => void; opener: HTMLElement | null;
}) {
  const dlg = useRef<HTMLDialogElement>(null);
  const startX = useRef<number | null>(null);
  const open = index !== null && photos.length > 0;
  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  const go = (by: number) => { if (index !== null) onIndex((index + by + photos.length) % photos.length); };
  const p = open ? photos[index] : null;

  return (
    <dialog
      className="lightbox"
      ref={dlg}
      aria-label={p?.caption ?? "Photo"}
      // The browser restores focus itself on close; run after it so focus lands on the photo that was opened
      onClose={() => { onClose(); setTimeout(() => opener?.focus(), 0); }}
      onClick={(e) => { if (e.target === dlg.current) dlg.current?.close(); }}
      onKeyDown={(e) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); }}
      onPointerDown={(e) => { startX.current = e.clientX; }}
      onPointerUp={(e) => {
        if (startX.current !== null && Math.abs(e.clientX - startX.current) > 40) go(e.clientX < startX.current ? 1 : -1);
        startX.current = null;
      }}
    >
      {p && (
        <div className="lightbox__inner">
          <button className="icon-btn lightbox__nav" type="button" aria-label="Previous photo" onClick={() => go(-1)}><span className="lightbox__prev"><Icon name="arrow" className="icon icon--lg" /></span></button>
          <div className="lightbox__img">
            <Image src={`/media/${p.path}`} alt={p.caption} fill sizes="(min-width: 1024px) 60rem, 92vw" />
          </div>
          <button className="icon-btn lightbox__nav" type="button" aria-label="Next photo" onClick={() => go(1)}><Icon name="arrow" className="icon icon--lg" /></button>
          <div className="lightbox__cap">
            <span><b>{p.caption}</b><br /><span>{[p.meta, `${index! + 1} of ${photos.length}`].filter(Boolean).join(" · ")}</span></span>
            <button className="icon-btn" type="button" aria-label="Close" onClick={() => dlg.current?.close()}><Icon name="x" className="icon icon--lg" /></button>
          </div>
        </div>
      )}
    </dialog>
  );
}
