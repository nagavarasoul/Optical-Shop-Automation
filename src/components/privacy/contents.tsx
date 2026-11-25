"use client";

/* The privacy policy's contents (Requirements_Privacy.md 3 and 5), from the
   mockup's script: always open on desktop, a collapsed "On this page" on
   phones that closes after a tap, and the section being read marked. */
import { useEffect, useRef } from "react";

export function PolicyContents({ sections }: { sections: [string, string][] }) {
  const toc = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const el = toc.current;
    if (!el) return;
    const wide = matchMedia("(min-width: 1024px)");
    const sync = () => { el.open = wide.matches; };
    sync();
    wide.addEventListener("change", sync);
    const links = [...el.querySelectorAll<HTMLAnchorElement>("a")];
    const heads = links.map((a) => document.getElementById(a.hash.slice(1)));
    const header = document.querySelector(".site-header");
    let ticking = false;
    const mark = () => {
      ticking = false;
      const line = (header?.getBoundingClientRect().bottom ?? 0) + 48;
      let i = -1;
      heads.forEach((h, n) => { if (h && h.getBoundingClientRect().top <= line) i = n; });
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) i = heads.length - 1;
      links.forEach((a, n) => a.setAttribute("aria-current", String(n === i)));
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(mark); } };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("hashchange", mark);
    mark();
    return () => { wide.removeEventListener("change", sync); removeEventListener("scroll", onScroll); removeEventListener("hashchange", mark); };
  }, []);
  return (
    <details className="toc" id="toc" ref={toc} onClick={(e) => { if ((e.target as HTMLElement).closest("a") && !matchMedia("(min-width: 1024px)").matches && toc.current) toc.current.open = false; }}>
      <summary>On this page</summary>
      <p className="caps">On this page</p>
      <nav aria-label="Privacy policy sections">
        <ol>{sections.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ol>
      </nav>
    </details>
  );
}
