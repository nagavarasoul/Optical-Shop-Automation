"use client";

/* The parts of a branch card that depend on the visitor's moment and screen
   (Requirements_Contact.md 3.1): "Open now / Closed now" in India time, and
   the Google map, which loads only when scrolled near or on "Show map". */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { nowInIndia, toMinutes, weekday } from "@/lib/booking-rules";
import { time12 } from "@/lib/site-config";

type Hours = { opens: string; closes: string; openDays: string[]; closedDays: string[] };

function statusText(h: Hours): string {
  const now = nowInIndia();
  const closedToday = h.closedDays.includes(now.day) || !h.openDays.includes(weekday(now.day));
  if (closedToday) return "Closed today";
  if (now.minutes >= toMinutes(h.opens) && now.minutes < toMinutes(h.closes)) return `Open now · until ${time12(h.closes)}`;
  return `Closed now · opens ${time12(h.opens)}${now.minutes >= toMinutes(h.closes) ? " tomorrow" : ""}`;
}
const everyMinute = (cb: () => void) => { const t = setInterval(cb, 60_000); return () => clearInterval(t); };

/** Worked out in the browser (the page is pre-rendered), with a text label, not colour alone. */
export function OpenStatus(h: Hours) {
  const text = useSyncExternalStore(everyMinute, () => statusText(h), () => "");
  if (!text) return null;
  return <span className={`status ${text.startsWith("Open") ? "status--open" : "status--closed"}`}>{text}</span>;
}

export function BranchMap({ name, address }: { name: string; address: string }) {
  const [show, setShow] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setShow(true); io.disconnect(); } }, { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className="branch__map" ref={box}>
      {show ? (
        <iframe
          title={`Map of the ${name} branch`}
          src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="ph">
          <span>Map of the {name} branch</span>
          <button type="button" onClick={() => setShow(true)}>Show map</button>
        </div>
      )}
    </div>
  );
}
