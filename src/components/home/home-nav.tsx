"use client";

import { useEffect } from "react";

/* Home only (Requirements_HomePage.md 3.1): the see-through nav bar turns more
   navy once the page scrolls past the hero, so the white menu text stays
   readable over light sections. The look itself is CSS (pages.css 7.2). */
export function HomeNav() {
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(".nav");
    const hero = document.querySelector<HTMLElement>(".hero--home");
    if (!nav || !hero) return;
    const onScroll = () => nav.classList.toggle("is-past-hero", hero.getBoundingClientRect().bottom <= nav.getBoundingClientRect().bottom);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      nav.classList.remove("is-past-hero"); // the next page has a solid bar
    };
  }, []);
  return null;
}
