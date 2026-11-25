/* Eye camps (Requirements_EyeCamps.md 2–5, Requirements_Admin.md 7.2): dates in
   India time, wording, links, and the staff form's rules, shared by the browser
   and the server. No server imports. Upcoming or past is decided by the date,
   so camps move to "Past" on their own. */
import { z } from "zod";
import { addDays, isDay, nowInIndia, timeLabel, weekday } from "./booking-rules";

/* DUMMY C19: the client hasn't confirmed these. */
export const OFFER_OPTIONS = ["Vision check", "Advice on glasses", "Eye pressure check", "Frame adjustment"] as const;
export const CAMP_BRING = "Your current glasses, if you have them.";
export const MAX_CAMP_PHOTOS = 12;

/** A camp is upcoming on its own day and before; past from the next day (India time). */
export const isUpcoming = (day: string, today = nowInIndia().day) => day >= today;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "Sun, 15 Nov 2026" (built by hand: the en-IN format adds a comma before the year) */
export const longDate = (day: string) => `${weekday(day)}, ${Number(day.slice(8))} ${MONTHS[Number(day.slice(5, 7)) - 1]} ${day.slice(0, 4)}`;
export const timeRange = (starts: string, ends: string) => `${timeLabel(starts.slice(0, 5))}–${timeLabel(ends.slice(0, 5))}`;

/** A URL name from the title and date, e.g. "free-eye-camp-patelguda-2026-11-15". */
export const campSlug = (title: string, day: string) =>
  `${title} ${day}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);

export const directionsUrl = (place: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;

/** An .ics calendar file for the camp, as a data link (no server round trip). */
export function campIcs(c: { slug: string; title: string; day: string; starts: string; ends: string; place: string; description: string }) {
  const stamp = (t: string) => `${c.day.replaceAll("-", "")}T${t.slice(0, 5).replace(":", "")}00`;
  const esc = (s: string) => s.replace(/[\\,;]/g, (x) => `\\${x}`).replace(/\n/g, "\\n");
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//VS Lens Mart//Eye camps//EN", "BEGIN:VEVENT",
    `UID:${c.slug}@vslensmart`, `DTSTART:${stamp(c.starts)}`, `DTEND:${stamp(c.ends)}`,
    `SUMMARY:${esc(c.title)}`, `LOCATION:${esc(c.place)}`, `DESCRIPTION:${esc(`${c.description} Bring: ${CAMP_BRING}`)}`,
    "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

/** Share on WhatsApp: the customer picks the contact (it doesn't go to the shop). */
export const campShareUrl = (c: { title: string; day: string; starts: string; ends: string; place: string }, pageUrl: string) =>
  `https://wa.me/?text=${encodeURIComponent(`${c.title}: ${longDate(c.day)}, ${timeRange(c.starts, c.ends)} at ${c.place}. ${pageUrl}`)}`;

/* ---------- The staff form ---------- */
const time = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Pick a time").transform((t) => t.slice(0, 5));
export const campFields = z.object({
  title: z.string().trim().min(4, "Enter the camp name.").max(80, "The camp name can be up to 80 characters."),
  day: z.string().refine(isDay, "Pick the date."),
  starts: time,
  ends: time,
  branch: z.string().regex(/^[a-z0-9-]*$/).transform((s) => s || null),
  place: z.string().trim().min(6, "Enter where the camp is.").max(200, "The place can be up to 200 characters."),
  organisedWith: z.string().trim().max(80, "Up to 80 characters.").transform((s) => s || null),
  description: z.string().trim().min(10, "Add a short description.").max(400, "The description can be up to 400 characters."),
  offered: z.array(z.string().trim().min(2).max(30)).max(8),
  people: z.string().trim().transform((s) => s.replace(/[,\s]/g, "")).pipe(
    z.union([z.literal(""), z.string().regex(/^\d{1,5}$/, "Enter how many people were checked, as a number.")]),
  ).transform((s) => (s === "" ? null : Number(s))),
  isVisible: z.boolean(),
}).refine((c) => c.ends > c.starts, { path: ["ends"], message: "The end time must be after the start time." })
  .refine((c) => c.day >= addDays(nowInIndia().day, -3650), { path: ["day"], message: "Pick a date in the last ten years or later." });
export type CampInput = z.infer<typeof campFields>;
