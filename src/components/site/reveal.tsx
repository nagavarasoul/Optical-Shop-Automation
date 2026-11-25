"use client";

/* Fade and slide up on scroll (mockup section 7.1 and its pages' script):
   a block below the screen fades in and rises 16 px once it's 10% into view,
   one time only. Nothing is hidden without the script, for a block already on
   screen, or when the device asks for reduced motion, so content never goes
   missing and the layout never moves. `stagger` brings frame cards in one
   after another. */
import { useEffect, useRef, type ReactNode } from "react";

export function Reveal({ className = "", stagger = false, children }: { className?: string; stagger?: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < innerHeight * 0.9) return; // already in view: show as is
    el.classList.add("is-armed");
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { el.classList.add("is-in"); io.disconnect(); }
    }), { rootMargin: "0px 0px -10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal${stagger ? " reveal--stagger" : ""} ${className}`.trim()}>{children}</div>;
}
