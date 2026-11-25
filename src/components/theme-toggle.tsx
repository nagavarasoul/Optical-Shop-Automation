"use client";

/* Light / dark toggle (Requirements_Navigation.md 4.3), shared by the public
   header and the staff area. Follows the device until the visitor chooses; the
   choice is saved on this device as "vslm-theme" (applied in <head> before the
   page draws, by the root layout's script). */
import { useEffect, useState } from "react";
import { Icon } from "./site/icons";

export function ThemeToggle({ className = "icon-btn icon-btn--theme" }: { className?: string }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const system = matchMedia("(prefers-color-scheme: dark)");
    const paint = () => setDark(root.dataset.theme ? root.dataset.theme === "dark" : system.matches);
    paint();
    system.addEventListener("change", paint);
    return () => system.removeEventListener("change", paint);
  }, []);
  const toggle = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("vslm-theme", next); } catch { /* private mode: still switches */ }
    setDark(!dark);
  };
  return (
    <button
      className={className}
      type="button"
      id="theme-toggle"
      aria-pressed={dark}
      aria-label="Dark mode"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
    >
      <Icon name="moon" className="icon theme-icon--moon" />
      <Icon name="sun" className="icon theme-icon--sun" />
    </button>
  );
}
