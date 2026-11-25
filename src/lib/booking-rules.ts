/* Eye-test booking rules (Requirements_Booking.md 2–3), shared by the browser
   (instant messages, the slot chips) and the server (which checks everything
   again, because anything a browser sends can be faked). No server imports.
   "Today" and "now" are always India time, whatever the device's clock zone. */
import { z } from "zod";

/* DUMMY C18 (docs/dummy-data.md): the client hasn't confirmed these yet. */
export const BOOKING = {
  slotMinutes: 20,
  capacity: 2, // bookings per slot per branch
  noticeMinutes: 120, // no slot sooner than this
  windowDays: 30, // bookable up to this many days ahead
  lastStartBeforeClose: 30, // last slot starts this long before closing
  dayChips: 14, // day chips shown; further days through "Pick another date"
} as const;

const IST_OFFSET_MIN = 330;
const pad = (n: number) => String(n).padStart(2, "0");

/** The date ("2026-10-24") and minutes since midnight in India now. */
export function nowInIndia(now = new Date()): { day: string; minutes: number } {
  const ist = new Date(now.getTime() + IST_OFFSET_MIN * 60_000);
  return { day: `${ist.getUTCFullYear()}-${pad(ist.getUTCMonth() + 1)}-${pad(ist.getUTCDate())}`, minutes: ist.getUTCHours() * 60 + ist.getUTCMinutes() };
}

const asDate = (day: string) => new Date(`${day}T00:00:00Z`);
export const isDay = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(asDate(s).getTime()) && asDate(s).toISOString().startsWith(s);
export function addDays(day: string, n: number): string {
  const d = asDate(day);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
/** Today up to the end of the booking window. */
export const inWindow = (day: string, today: string) => isDay(day) && day >= today && day <= addDays(today, BOOKING.windowDays);
export const weekday = (day: string) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][asDate(day).getUTCDay()];
/** "Sat 17 Oct" */
export const dayLabel = (day: string) => `${weekday(day)} ${asDate(day).getUTCDate()} ${asDate(day).toLocaleString("en-IN", { month: "short", timeZone: "UTC" })}`;

export const toMinutes = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
export const toTime = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
/** "4:20 PM" */
export const timeLabel = (t: string) => { const m = toMinutes(t), h = Math.floor(m / 60); return `${((h + 11) % 12) + 1}:${pad(m % 60)} ${h < 12 ? "AM" : "PM"}`; };

export type BranchHours = { opens: string; closes: string; openDays: string[] };
export type Slot = { time: string; full: boolean };
export type DaySlots = { state: "closed" | "outside" | "none" } | { state: "open"; slots: Slot[] };

/**
 * The slots of one branch on one day: within opening hours, at least the notice
 * period from now, inside the booking window, not on a closed day. `booked`
 * holds counts only ("16:20" → 2), never who booked.
 */
export function slotsFor(day: string, hours: BranchHours, closedDays: string[], booked: Record<string, number>, now = nowInIndia()): DaySlots {
  if (!inWindow(day, now.day)) return { state: "outside" };
  if (closedDays.includes(day) || !hours.openDays.includes(weekday(day))) return { state: "closed" };
  const first = toMinutes(hours.opens), last = toMinutes(hours.closes) - BOOKING.lastStartBeforeClose;
  const earliest = day === now.day ? now.minutes + BOOKING.noticeMinutes : -1;
  const slots: Slot[] = [];
  for (let m = first; m <= last; m += BOOKING.slotMinutes) {
    if (m < earliest) continue;
    const time = toTime(m);
    slots.push({ time, full: (booked[time] ?? 0) >= BOOKING.capacity });
  }
  return slots.length ? { state: "open", slots } : { state: "none" };
}

/** A slot the server will accept: on the grid and offered (and not full) for that day. */
export function isOffered(result: DaySlots, time: string) {
  return result.state === "open" && result.slots.some((s) => s.time === time && !s.full);
}

/* ---------- The form ---------- */

/** "+91 95506 85417" → "9550685417" */
export const cleanPhone = (s: string) => s.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "").replace(/^0(?=\d{10}$)/, "");
/** Indian mobile, shared with the enquiry form. */
export const phone = z.string().transform(cleanPhone).pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number starting with 6, 7, 8 or 9"));
export const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} can be up to ${max} characters`).transform((s) => s || null);

export const FOR_WHOM = [["myself", "Myself"], ["someone_else", "Someone else"]] as const;

export const bookingFields = z.object({
  branch: z.string().regex(/^[a-z0-9-]+$/, "Choose a branch").min(1, "Choose a branch"),
  day: z.string().refine(isDay, "Choose a day"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Choose a time"),
  name: z.string().trim().min(2, "Enter your full name").max(60, "Your name can be up to 60 characters"),
  phone,
  forWhom: z.enum(["myself", "someone_else"]).default("myself"),
  address: optionalText(150, "Your area or address"),
  note: optionalText(300, "Your note"),
  consent: z.literal("yes", { error: "Tick the box to agree, so we can manage your booking" }),
});
export type BookingInput = z.infer<typeof bookingFields>;

/** Field → first message, for the form. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of error.issues) {
    const k = String(i.path[0] ?? "form");
    out[k] ??= i.message;
  }
  return out;
}

const REF_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I/L
/** A random booking reference, e.g. "VS-7K3M" (never a running number). */
export function newReference(random: (n: number) => number = (n) => crypto.getRandomValues(new Uint32Array(1))[0] % n) {
  return `VS-${Array.from({ length: 4 }, () => REF_CHARS[random(REF_CHARS.length)]).join("")}`;
}
