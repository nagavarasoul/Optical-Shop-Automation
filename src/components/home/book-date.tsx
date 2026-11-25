"use client";

/* The home book band's date box: today or later, in India time. The page is
   pre-rendered, so "today" is filled in by the browser (as the holiday form
   does). The booking page checks the date again. */
import { useSyncExternalStore } from "react";
import { nowInIndia } from "@/lib/booking-rules";

const noop = () => () => {};

export function BookDate() {
  const today = useSyncExternalStore(noop, () => nowInIndia().day, () => "");
  return <input type="date" name="date" required min={today || undefined} />;
}
