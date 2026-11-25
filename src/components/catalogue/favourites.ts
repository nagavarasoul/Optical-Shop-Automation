"use client";

/* Favourites (Requirements_Frames.md 3.5): frame codes saved on this device
   only, with no login. Same key as the mockups. Every heart on the page reads
   the same store, so the card, the detail page and "Saved (n)" stay in step,
   and another tab's change arrives through the storage event. */
import { useCallback, useMemo, useSyncExternalStore } from "react";

const KEY = "vslm-favourites";
const EVENT = "vslm-favourites";

function read(): string {
  try { return localStorage.getItem(KEY) ?? "[]"; } catch { return "[]"; }
}
function subscribe(onChange: () => void) {
  addEventListener("storage", onChange);
  addEventListener(EVENT, onChange);
  return () => { removeEventListener("storage", onChange); removeEventListener(EVENT, onChange); };
}
function parse(raw: string): string[] {
  try {
    const v: unknown = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch { return []; }
}

export function useFavourites() {
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  const favs = useMemo(() => parse(raw), [raw]);
  const toggle = useCallback((code: string) => {
    const list = parse(read());
    const next = list.includes(code) ? list.filter((c) => c !== code) : [...list, code];
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode: nothing saved */ }
    dispatchEvent(new Event(EVENT));
  }, []);
  return { favs, toggle };
}
