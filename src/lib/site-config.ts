/* Shop facts: the seed and fallback values for the `branches` table.
   Pages read branch details from the database (the admin edits them at
   /admin/branches); this file seeds that table and covers the brief moment
   before it has rows. Never hard-code these facts in components.
   Sources: docs/client-answers.md, docs/prescription_card.jpg, docs/dummy-data.md. */

export type BranchSeed = {
  slug: "indresham" | "patelguda";
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  opens: string; // 24-hour "HH:MM"
  closes: string;
  /** Set while a value is a placeholder from docs/dummy-data.md. Never shown live. */
  dummy?: string;
};

export const site = {
  name: "VS Lens Mart",
  since: 1999, // compute "years" from this; never hard-code a year count
  tagline: "Welcome to the Optical Family",
  /** DUMMY D4: no domain yet (Q156). Used in share links and search-engine data. */
  url: "https://vslensmart.example",
} as const;

export const branches: readonly BranchSeed[] = [
  {
    slug: "indresham",
    name: "Indresham",
    address: "Plot No 30/Part Block-B, Citizens Colony, Indresham, Patancheruvu, Sangareddy",
    phone: "9550685417",
    whatsapp: "9550685417",
    opens: "09:00",
    closes: "21:30",
  },
  {
    slug: "patelguda",
    name: "Patelguda",
    address: "Falcon One Shopping Plaza, beside Apollo Pharmacy, Ellenki College, Patelguda",
    phone: "0000000000", // DUMMY D2: the client hasn't sent the Patelguda number
    whatsapp: "0000000000", // DUMMY D2
    opens: "09:00",
    closes: "21:30",
    dummy: "D2",
  },
];

export const yearsSince = (now = new Date()) => now.getFullYear() - site.since;

/* ---------- DUMMY register ----------
   Every placeholder the site uses from docs/dummy-data.md. `npm run check:launch`
   fails while any is still listed; remove an entry once the client's real value is in. */
export const DUMMY = {
  D1: "Enquiry email (info@vslensmart.example)",
  D2: "Patelguda phone / WhatsApp number",
  D3: "Holidays: closed on Diwali day at both branches (branch_closures)",
  D4: "Domain (share links and search-engine data use vslensmart.example)",
  D5: "YouTube, Facebook and Instagram links",
  D8: "Logo (placeholder until the client's new logo arrives)",
  C24: "Menu and homepage photos (Men / Women / Kids frames and sunglasses; Eye care menu cards): AI-generated, public/dummy/naiv, development only",
  C12: "Homepage hero photos: AI-generated slideshow in public/dummy/hero, development only (never in a production build)",
  C7: "Price tier names and boundaries in the menus",
  C18: "Booking rules: 20-minute slots, 2 per slot, 2 hours' notice, 30 days ahead (src/lib/booking-rules.ts)",
  D7: "Eye test price: shown as free",
  D9: "Retention: bookings and messages deleted after 1 year (RETENTION_DAYS)",
  C22: "Staff accounts: sample staff (no password, …@vslensmart.example) and sign-out after 12 hours (auth-options.ts)",
  C23: "Privacy contact: \"the shop owner\", replies within 30 days; legal owner's name",
  C21: "Enquiry reply time: within a day",
  C19: "Eye camps: what's offered and what to bring (src/lib/camp-rules.ts)",
  C17: "Eye care health copy: eye-test steps, when to get checked, tips (optometrist to review)",
  C1: "About: the founding story",
  C2: "About: the founder's name, photo and quote",
  C3: "About: the year the Patelguda branch opened (2022)",
  C10: "About: team roles (no names until each person agrees)",
  C15: "About: journey milestones 2010 and 2016",
} as const;
export type DummyId = keyof typeof DUMMY;

/** A phone value that is still the D2 placeholder. */
export const isDummyPhone = (phone: string) => /^0+$/.test(phone.replace(/\D/g, ""));

export const logo = { src: "/logo-placeholder.svg", dummy: "D8" as DummyId };

// DUMMY D5: the client hasn't sent their pages yet (Q153)
export const socials = [
  { name: "YouTube", icon: "yt", url: "https://example.com/youtube" },
  { name: "Facebook", icon: "fb", url: "https://example.com/facebook" },
  { name: "Instagram", icon: "ig", url: "https://example.com/instagram" },
] as const;
export const socialsDummy: DummyId | null = "D5";

/* DUMMY C7: menu price tiers. "from ₹…" is the lowest price of approved, active
   frames in each tier, read from the database; a tier with none is not shown. */
export const PREMIUM_FROM = 3000; // ₹: Everyday is below, Premium / Branded is this and above
export const priceTiers = {
  frames: [
    { id: "everyday", label: "Everyday", href: "/frames?tier=everyday" },
    { id: "premium", label: "Premium", href: "/frames?tier=premium" },
    { id: "kids", label: "Kids", href: "/frames?for=kids" },
  ],
  sunglasses: [
    { id: "everyday", label: "Everyday", href: "/sunglasses?tier=everyday" },
    { id: "branded", label: "Branded", href: "/sunglasses?tier=branded" },
  ],
} as const;
export const priceTiersDummy: DummyId | null = "C7";

/** "9 AM", "9:30 PM" from "09:00" / "21:30:00". */
export function time12(t: string): string {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "AM" : "PM"}`;
}

/** URL-friendly brand id, matching the mockups' ?brand= links ("Kodak Lens" → "kodak-lens"). */
export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** DUMMY D7: the client hasn't confirmed the eye test is free; shown with the tag until then. */
export const EYE_TEST_FREE = true;

/** DUMMY D1: the client hasn't sent the shop's email (answer 4). */
export const shopEmail = "info@vslensmart.example";
/** DUMMY C21: how soon the shop replies to a contact-form message. */
export const replyTime = "within a day";

/** DUMMY D9: how long bookings and messages are kept before automatic deletion
 *  (purge_expired() in db/security.sql refuses anything under 30 days). */
export const RETENTION_DAYS = 365;
/** The period in words for /privacy, from the same number ("1 year", "2 years", "180 days"). */
export const retentionText = RETENTION_DAYS % 365 === 0
  ? `${RETENTION_DAYS / 365} year${RETENTION_DAYS === 365 ? "" : "s"}`
  : `${RETENTION_DAYS} days`;
/** DUMMY C23: who answers questions about personal details, and how fast. */
export const privacyContact = { who: "the shop owner", replyDays: 30 };
/** The privacy policy's "Last updated" date. Change it whenever the policy changes. */
export const privacyUpdated = "2026-10-24";
