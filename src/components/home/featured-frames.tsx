"use client";

/* Home "Featured frames" (Requirements_HomePage.md 3.6): the newest live frames
   in the shared frame card, with the device-only hearts and Enquire. A row
   that scrolls inside itself on phones (catalogue.css). */
import { useRef } from "react";
import { useCardsOnScroll } from "@/components/catalogue/cards-on-scroll";
import { FrameCard } from "@/components/catalogue/frame-card";
import { useFavourites } from "@/components/catalogue/favourites";
import type { CatalogueItem } from "@/lib/queries/catalogue";

export function FeaturedFrames({ items }: { items: CatalogueItem[] }) {
  const { favs, toggle } = useFavourites();
  const row = useRef<HTMLDivElement>(null);
  useCardsOnScroll(row, "featured");
  return (
    <div className="frames-row" id="frames-row" ref={row}>
      {items.map((f) => <FrameCard key={f.code} f={f} saved={favs.includes(f.code)} onToggle={toggle} />)}
    </div>
  );
}
