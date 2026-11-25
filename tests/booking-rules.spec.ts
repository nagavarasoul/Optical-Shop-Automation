/* Booking rules (Requirements_Booking.md 2–3, DUMMY C18), as the server and the
   browser both use them: opening hours, notice, the 30-day window, closed
   days, full slots, and the form's checks. */
import { expect, test } from "@playwright/test";
import { addDays, bookingFields, BOOKING, cleanPhone, dayLabel, isDay, isOffered, newReference, nowInIndia, slotsFor, timeLabel } from "../src/lib/booking-rules";
import { enquiryFields, frameFromUrl, topicFromUrl } from "../src/lib/enquiry-rules";
import { campSlug, isUpcoming as campUpcoming, longDate, timeRange } from "../src/lib/camp-rules";

const HOURS = { opens: "09:00", closes: "21:30", openDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] };
const NOW = { day: "2026-10-24", minutes: 10 * 60 + 5 }; // Sat 24 Oct, 10:05 AM in India

test("slots run every 20 minutes from opening to 30 minutes before closing", () => {
  const r = slotsFor("2026-10-25", HOURS, [], {}, NOW);
  expect(r.state).toBe("open");
  if (r.state !== "open") return;
  expect(r.slots[0].time).toBe("09:00");
  expect(r.slots.at(-1)!.time).toBe("21:00");
  expect(r.slots).toHaveLength(37);
});

test("today: nothing sooner than 2 hours from now", () => {
  const r = slotsFor(NOW.day, HOURS, [], {}, NOW);
  expect(r.state === "open" && r.slots[0].time).toBe("12:20"); // 10:05 + 2 h = 12:05, next slot 12:20
  expect(slotsFor(NOW.day, HOURS, [], {}, { day: NOW.day, minutes: 20 * 60 }).state, "too late today").toBe("none");
});

test("the window: from today up to 30 days ahead, never the past", () => {
  expect(slotsFor(addDays(NOW.day, BOOKING.windowDays), HOURS, [], {}, NOW).state).toBe("open");
  expect(slotsFor(addDays(NOW.day, BOOKING.windowDays + 1), HOURS, [], {}, NOW).state).toBe("outside");
  expect(slotsFor(addDays(NOW.day, -1), HOURS, [], {}, NOW).state).toBe("outside");
  expect(slotsFor("2026-02-30", HOURS, [], {}, NOW).state, "not a real date").toBe("outside");
});

test("closed days and days the branch doesn't open have no slots", () => {
  expect(slotsFor("2026-11-08", HOURS, ["2026-11-08"], {}, NOW).state).toBe("closed");
  expect(slotsFor("2026-10-25", { ...HOURS, openDays: ["Mon"] }, [], {}, NOW).state, "25 Oct is a Sunday").toBe("closed");
});

test("a slot with 2 bookings is full and can't be taken", () => {
  const r = slotsFor("2026-10-25", HOURS, [], { "16:20": BOOKING.capacity, "16:40": 1 }, NOW);
  expect(r.state === "open" && r.slots.find((s) => s.time === "16:20")?.full).toBe(true);
  expect(r.state === "open" && r.slots.find((s) => s.time === "16:40")?.full).toBe(false);
  expect(isOffered(r, "16:20")).toBe(false);
  expect(isOffered(r, "16:40")).toBe(true);
  expect(isOffered(r, "16:30"), "not on the 20-minute grid").toBe(false);
});

test("India time, labels and references", () => {
  expect(nowInIndia(new Date("2026-10-24T18:45:00Z"))).toEqual({ day: "2026-10-25", minutes: 15 }); // 00:15 IST next day
  expect(dayLabel("2026-10-17")).toBe("Sat 17 Oct");
  expect(timeLabel("16:20")).toBe("4:20 PM");
  expect(timeLabel("09:00")).toBe("9:00 AM");
  expect(isDay("2026-10-24") && !isDay("24-10-2026") && !isDay("2026-13-01")).toBe(true);
  expect(newReference()).toMatch(/^VS-[A-HJKMNP-Z2-9]{4}$/);
});

test("the form's checks: name, Indian mobile, lengths and consent", () => {
  const ok = { branch: "indresham", day: "2026-10-25", time: "16:20", name: "Asha", phone: "+91 98765 43210", forWhom: "myself", address: "", note: "", consent: "yes" };
  const r = bookingFields.safeParse(ok);
  expect(r.success && r.data.phone).toBe("9876543210");
  expect(r.success && r.data.address).toBeNull();
  expect(cleanPhone("09876543210")).toBe("9876543210");
  const bad = (patch: Record<string, string>) => {
    const p = bookingFields.safeParse({ ...ok, ...patch });
    return p.success ? null : p.error.issues[0].message;
  };
  expect(bad({ name: " A " })).toBe("Enter your full name");
  expect(bad({ phone: "12345" })).toBe("Enter a 10-digit mobile number starting with 6, 7, 8 or 9");
  expect(bad({ phone: "5876543210" })).toBe("Enter a 10-digit mobile number starting with 6, 7, 8 or 9");
  expect(bad({ consent: "" })).toBe("Tick the box to agree, so we can manage your booking");
  expect(bad({ note: "x".repeat(301) })).toMatch(/up to 300 characters/);
  expect(bad({ address: "x".repeat(151) })).toMatch(/up to 150 characters/);
  expect(bad({ forWhom: "boss" })).not.toBeNull();
});

test("the contact form's checks (Requirements_Contact.md 4)", () => {
  const ok = { name: "Asha", phone: "98765 43210", address: "", branch: "either", topic: "eye_test", message: "Do you test children's eyes?", frameCode: "", replyBy: "whatsapp", consent: "yes" };
  const r = enquiryFields.safeParse(ok);
  expect(r.success && r.data.phone).toBe("9876543210");
  const bad = (patch: Record<string, string>) => {
    const p = enquiryFields.safeParse({ ...ok, ...patch });
    return p.success ? null : p.error.issues[0].message;
  };
  expect(bad({ name: "" })).toBe("Enter your name");
  expect(bad({ topic: "" })).toBe("Choose a topic");
  expect(bad({ message: "Hi" })).toBe("Write a message of at least 10 characters");
  expect(bad({ message: "x".repeat(501) })).toMatch(/up to 500 characters/);
  expect(bad({ consent: "" })).toBe("Tick the box to agree, so we can reply to you");
  expect(bad({ branch: "mumbai" })).not.toBeNull();
  expect(bad({ frameCode: "VSF-1024", message: "About frame VSF-1024:" }), "only the prefilled words").toBe("Write a message of at least 10 characters");
  expect(topicFromUrl("eye-test")).toBe("eye_test");
  expect(topicFromUrl("<script>")).toBe("");
  expect(frameFromUrl("VSF-1024")).toBe("VSF-1024");
  expect(frameFromUrl("vsf-1024'><b>")).toBe("");
});

test("eye camp wording and dates (Requirements_EyeCamps.md 5)", () => {
  expect(longDate("2026-11-15")).toBe("Sun, 15 Nov 2026");
  expect(timeRange("09:00", "13:00")).toBe("9:00 AM–1:00 PM");
  expect(campSlug("Free Eye Camp, Patelguda!", "2026-11-15")).toBe("free-eye-camp-patelguda-2026-11-15");
  expect(campUpcoming("2026-10-24", "2026-10-24"), "upcoming on its own day").toBe(true);
  expect(campUpcoming("2026-10-23", "2026-10-24"), "past from the next day").toBe(false);
});

