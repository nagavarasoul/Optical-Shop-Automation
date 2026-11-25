"use client";

import { Icon } from "@/components/site/icons";
import type { CatalogueItem } from "@/lib/queries/catalogue";
import { FrameCard } from "./frame-card";
import { useFavourites } from "./favourites";

/** The detail page's heart (saved on this device). */
export function FavButton({ code, name }: { code: string; name: string }) {
  const { favs, toggle } = useFavourites();
  return (
    <button className="icon-pill" type="button" aria-pressed={favs.includes(code)} aria-label={`Save ${name} to favourites`} onClick={() => toggle(code)}>
      <Icon name="heart" />
    </button>
  );
}

/** A row of frame cards sharing the device's favourites (related frames). */
export function CardRow({ items }: { items: CatalogueItem[] }) {
  const { favs, toggle } = useFavourites();
  return (
    <div className="frames-row">
      {items.map((f) => <FrameCard key={f.code} f={f} saved={favs.includes(f.code)} onToggle={toggle} />)}
    </div>
  );
}
