"use client";

/* Listing cards fade in one after another as they scroll into view. Cards on
   screen when they appear keep the load fade (catalogue.css "card-in"); only
   cards below the screen are hidden, and only by the script, so nothing
   flickers or goes missing. Cards that arrive together (a row) follow 80 ms
   apart, at most 4 steps. None of this with reduced motion. */
import { useEffect, type RefObject } from "react";

export function useCardsOnScroll(grid: RefObject<HTMLElement | null>, key: string) {
  useEffect(() => {
    const el = grid.current;
    if (!el || !("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).forEach((e, i) => {
        const card = e.target as HTMLElement;
        card.style.transitionDelay = `${Math.min(i, 3) * 80}ms`;
        card.classList.add("is-in");
        io.unobserve(card);
      });
    }, { rootMargin: "0px 0px -5% 0px" });
    el.querySelectorAll<HTMLElement>(".fcard:not(.is-in)").forEach((card) => {
      // A new card on screen now: the load fade covers it. Cards hidden on an earlier run are watched again.
      if (!card.classList.contains("is-armed")) {
        const r = card.getBoundingClientRect();
        // Not laid out yet (still behind the loading placeholder) counts as below the screen
        if (r.width > 0 && r.top < innerHeight) return;
        card.classList.add("is-armed");
      }
      io.observe(card);
    });
    return () => io.disconnect();
  }, [grid, key]);
}
