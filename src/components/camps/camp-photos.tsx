"use client";

/* A past camp's photos (Requirements_EyeCamps.md 4): a grid of buttons, each
   opening the shared large view. */
import Image from "next/image";
import { useState } from "react";
import { PhotoViewer } from "@/components/site/photo-viewer";

export function CampPhotos({ title, meta, paths }: { title: string; meta: string; paths: string[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const [opener, setOpener] = useState<HTMLElement | null>(null);
  const photos = paths.map((path, i) => ({ path, caption: `${title}, photo ${i + 1}`, meta }));
  return (
    <>
      <div className="photo-grid" style={{ marginTop: 16 }}>
        {photos.map((p, i) => (
          <button type="button" key={p.path} aria-label={`Open photo ${i + 1} of ${photos.length}`} onClick={(e) => { setOpener(e.currentTarget); setIndex(i); }}>
            <span className="pg-img"><Image src={`/media/${p.path}`} alt={p.caption} fill sizes="(min-width: 1024px) 240px, 33vw" /></span>
          </button>
        ))}
      </div>
      <PhotoViewer photos={photos} index={index} onIndex={setIndex} onClose={() => setIndex(null)} opener={opener} />
    </>
  );
}
