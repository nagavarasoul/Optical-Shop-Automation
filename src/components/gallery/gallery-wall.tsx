"use client";

/* The gallery wall (Requirements_Gallery.md 3–4), from mockups/gallery.html: tag
   chips with counts (only tags that have photos, kept in the address as ?tag=),
   the first photo larger, 24 at a time, and the shared large view, which stays
   within the current tag. */
import Image from "next/image";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { PhotoViewer } from "@/components/site/photo-viewer";
import { GALLERY_BRANCHES, GALLERY_TAGS, monthLabel, tagLabel, tagSlug } from "@/lib/gallery-rules";
import type { GalleryItem } from "@/lib/queries/content";

const PAGE = 24;
type Props = { photos: GalleryItem[] };

export function GalleryWall(props: Props) {
  return <WallView {...props} url={useSearchParams().get("tag") ?? ""} />;
}
export function GalleryWallPlain(props: Props) {
  return <WallView {...props} url="" />;
}

function WallView({ photos, url }: Props & { url: string }) {
  const present = GALLERY_TAGS.filter(([t]) => photos.some((p) => p.tag === t)).map(([t]) => t);
  const [local, setLocal] = useState({ url, slug: url });
  let slug = local.slug;
  if (local.url !== url) { setLocal({ url, slug: url }); slug = url; }
  const tag = present.find((t) => tagSlug(t) === slug) ?? "";
  const [shown, setShown] = useState({ tag, n: PAGE });
  const n = shown.tag === tag ? shown.n : PAGE;
  const [index, setIndex] = useState<number | null>(null);
  const [opener, setOpener] = useState<HTMLElement | null>(null);

  const choose = (t: string) => {
    window.history.replaceState(null, "", t ? `?tag=${tagSlug(t)}` : location.pathname);
    setLocal((l) => ({ ...l, slug: t ? tagSlug(t) : "" }));
  };
  const list = photos.filter((p) => !tag || p.tag === tag);
  const branchName = (b: string) => (b === "none" ? "" : GALLERY_BRANCHES.find(([v]) => v === b)?.[1] ?? "");
  const viewer = list.map((p) => ({ path: p.path, caption: p.caption, meta: [branchName(p.branch), monthLabel(p.month)].filter(Boolean).join(" · ") }));
  const visible = Math.min(n, list.length);

  return (
    <>
      <div className="year-chips" role="group" aria-label="Filter photos">
        {["", ...present].map((t) => (
          <button className="chip-toggle" type="button" key={t || "all"} aria-pressed={tag === t} onClick={() => choose(t)}>
            {t ? tagLabel(t) : "All"} ({t ? photos.filter((p) => p.tag === t).length : photos.length})
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">{list.length} photo{list.length === 1 ? "" : "s"}</p>
      <div className="gallery-wall">
        {list.slice(0, n).map((p, i) => (
          <button className="gtile" type="button" key={p.id} aria-label={p.caption} onClick={(e) => { setOpener(e.currentTarget); setIndex(i); }}>
            <span className="gtile__img">
              <Image src={`/media/${p.path}`} alt={p.caption} fill sizes={i === 0 ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 33vw, 50vw"} priority={i === 0} />
            </span>
            <span className="gtile__tag">{tagLabel(p.tag)}</span>
          </button>
        ))}
      </div>
      <div className="results-foot">
        <span>Showing {visible} of {list.length}</span>
        {visible < list.length && <button className="btn btn--outline-dark" type="button" onClick={() => setShown({ tag, n: n + PAGE })}>Load more</button>}
      </div>
      <PhotoViewer photos={viewer} index={index} onIndex={setIndex} onClose={() => setIndex(null)} opener={opener} />
    </>
  );
}
