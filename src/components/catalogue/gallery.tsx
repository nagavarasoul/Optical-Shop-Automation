"use client";

/* Frame photos on the detail page (Requirements_Frames.md 4), from the mockup's
   gallery: up to 5 photos with thumbnails, arrow keys, swipe on phones and
   click to zoom on desktop. Product-only photos; while a frame has none, the
   frame drawing stands in. */
import { useRef, useState } from "react";
import { FramePhoto } from "./frame-photo";

type Photo = { path: string; kind: string };
const KIND: Record<string, string> = { front: "Front", side: "Side", closeup: "Close-up", model: "Worn" };

export function Gallery({ photos, name, alt, sold }: { photos: Photo[]; name: string; alt: string; sold: boolean }) {
  const [cur, setCur] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const startX = useRef<number | null>(null);
  const slides = photos.length ? photos : [null];
  const show = (i: number) => { setCur((i + slides.length) % slides.length); setZoom(null); };
  const label = (p: Photo | null, i: number) => `${p ? KIND[p.kind] ?? "Photo" : "Frame"} view, ${i + 1} of ${slides.length}`;

  return (
    <div className="gallery">
      <div
        className={`gallery__main${zoom ? " is-zoomed" : ""}`}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label={`Photos of ${name}.${slides.length > 1 ? " Use the arrow keys to change photo." : ""}`}
        style={zoom ? ({ "--zoom-x": `${zoom.x}%`, "--zoom-y": `${zoom.y}%` } as React.CSSProperties) : undefined}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); show(cur + 1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); show(cur - 1); }
        }}
        onPointerDown={(e) => { startX.current = e.clientX; }}
        onPointerUp={(e) => {
          if (startX.current === null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (Math.abs(dx) > 40 && slides.length > 1) return show(cur + (dx < 0 ? 1 : -1)); // swipe
          if (!photos.length || !matchMedia("(min-width: 768px)").matches) return;
          const r = e.currentTarget.getBoundingClientRect(); // click to zoom (desktop)
          setZoom(zoom ? null : { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
      >
        {sold && <span className="gallery__badge">Sold out</span>}
        {slides.map((p, i) => (
          <div className={`gallery__slide${i === cur ? " is-active" : ""}`} key={p?.path ?? "drawing"} role="group" aria-roledescription="slide" aria-label={label(p, i)} aria-hidden={i !== cur}>
            <FramePhoto path={p?.path ?? null} alt={i === 0 ? alt : `${alt}, ${KIND[p?.kind ?? ""]?.toLowerCase() ?? "other"} view`} sizes="(min-width: 1180px) 640px, 100vw" priority={i === 0} />
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="thumbs" role="group" aria-label="Choose a photo">
          {photos.map((p, i) => (
            <button className="thumb" type="button" key={p.path} aria-current={i === cur} aria-label={label(p, i)} onClick={() => show(i)}>
              <FramePhoto path={p.path} alt="" sizes="120px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
