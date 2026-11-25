"use client";

/* The browser parts of the search page (Requirements_Search.md 4, 5): frame
   cards with the device's favourites and the listing's fade in, and the
   search field. */
import { useEffect, useRef } from "react";
import { useCardsOnScroll } from "@/components/catalogue/cards-on-scroll";
import { FrameCard } from "@/components/catalogue/frame-card";
import { useFavourites } from "@/components/catalogue/favourites";
import type { CatalogueItem } from "@/lib/queries/catalogue";

export function FrameResults({ items, query }: { items: CatalogueItem[]; query: string }) {
  const { favs, toggle } = useFavourites();
  const grid = useRef<HTMLDivElement>(null);
  useCardsOnScroll(grid, `${query}|${items.length}`);
  return (
    <div className="frames-row" ref={grid}>
      {items.map((f, i) => <FrameCard key={f.code} f={f} saved={favs.includes(f.code)} onToggle={toggle} eager={i < 4} />)}
    </div>
  );
}

/** The search form. Focused only when nothing has been searched yet on a
    desktop-size screen: on a phone it would open the keyboard over the page. */
export function SearchForm({ text }: { text: string }) {
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!text && matchMedia("(min-width: 1024px)").matches) input.current?.focus();
  }, [text]);
  return (
    <form className="nf-search search-page__form" role="search" action="/search">
      <label className="sr-only" htmlFor="search-q">Search frames, sunglasses and lenses</label>
      <input ref={input} type="search" id="search-q" name="q" defaultValue={text} maxLength={60}
        placeholder="Search frames, sunglasses and lenses" autoComplete="off" enterKeyHint="search" />
      <button className="btn btn--primary" type="submit">Search</button>
    </form>
  );
}
