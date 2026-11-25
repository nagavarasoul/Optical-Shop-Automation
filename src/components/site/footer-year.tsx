"use client";

import { useSyncExternalStore } from "react";
import { site } from "@/lib/site-config";

/* The current year for the footer. The server sends nothing (it never reads the
   clock while pre-rendering, and a cached page must not show last year); the
   browser fills it in straight after loading, without a hydration mismatch. */
const noop = () => () => {};
export function FooterYear() {
  return useSyncExternalStore(noop, () => String(new Date().getFullYear()), () => "");
}

/** Years since 1999 (CLAUDE.md: computed, never hard-coded), filled in the same way. */
export function YearsSince() {
  return useSyncExternalStore(noop, () => String(new Date().getFullYear() - site.since), () => "");
}
