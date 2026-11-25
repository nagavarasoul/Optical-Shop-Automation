/* Gallery photos and testimonials (Requirements_Gallery.md 2, Requirements_Admin.md 7):
   tags, and the staff forms' rules, shared by the browser and the server. No server imports. */
import { z } from "zod";
import { isDay, nowInIndia } from "./booking-rules";

// DUMMY C20 (TODO (client): confirm the tags). The address uses the label's dashed form (?tag=eye-camps).
export const GALLERY_TAGS = [
  ["shop", "Shop"], ["frames", "Frames on display"], ["eye_camps", "Eye camps"],
  ["team", "Team"], ["customers", "Customers"], ["celebrations", "Celebrations"],
] as const;
export type GalleryTag = (typeof GALLERY_TAGS)[number][0];
export const tagLabel = (t: string) => GALLERY_TAGS.find(([v]) => v === t)?.[1] ?? t;
export const tagSlug = (t: string) => tagLabel(t).toLowerCase().replace(/[^a-z0-9]+/g, "-");

/** Customer photos stay off until the client confirms permission to publish them (Q146). */
export const CUSTOMER_PHOTOS_ALLOWED = false;
export const allowedTags = () => GALLERY_TAGS.filter(([t]) => t !== "customers" || CUSTOMER_PHOTOS_ALLOWED);

export const GALLERY_BRANCHES = [["indresham", "Indresham"], ["patelguda", "Patelguda"], ["both", "Both branches"], ["none", "Not at a branch"]] as const;
export const MAX_GALLERY_UPLOAD = 10;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "Sep 2026" from "2026-09-01" */
export const monthLabel = (day: string | null) => (day ? `${MONTHS[Number(day.slice(5, 7)) - 1]} ${day.slice(0, 4)}` : "");

export const galleryPhotoFields = z.object({
  tag: z.enum(GALLERY_TAGS.map(([t]) => t) as [GalleryTag, ...GalleryTag[]], "Choose a tag")
    .refine((t) => t !== "customers" || CUSTOMER_PHOTOS_ALLOWED, "Customer photos can't be added until the shop confirms permission (Q146)."),
  caption: z.string().trim().min(4, "Add a short caption: it's also what screen readers read out.").max(120, "Keep the caption under 120 characters."),
  branch: z.enum(GALLERY_BRANCHES.map(([b]) => b) as ["indresham", "patelguda", "both", "none"]),
  month: z.string().trim().refine((m) => m === "" || /^\d{4}-\d{2}$/.test(m), "Pick the month it was taken, or leave it empty")
    .transform((m) => (m ? `${m}-01` : null)),
  showsPeople: z.boolean(),
  consent: z.boolean(),
}).refine((p) => !p.showsPeople || p.consent, { path: ["consent"], message: "Tick the permission box for a photo that shows people, or remove it." });
export type GalleryPhotoInput = z.infer<typeof galleryPhotoFields>;

export const testimonialFields = z.object({
  firstName: z.string().trim().min(2, "Enter the customer's first name (and initial if they like).").max(40, "Up to 40 characters."),
  branch: z.string().regex(/^[a-z0-9-]*$/).transform((s) => s || null),
  quote: z.string().trim().min(10, "Enter what the customer said, in their words.").max(300, "Keep the quote under 300 characters."),
  agreedOn: z.string().refine(isDay, "Enter the date the customer agreed to be quoted.")
    .refine((d) => d <= nowInIndia().day, "The date they agreed can't be in the future."),
  isVisible: z.boolean(),
});
export type TestimonialInput = z.infer<typeof testimonialFields>;
