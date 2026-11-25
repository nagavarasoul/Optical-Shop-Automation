/* Lenses (Requirements_Lenses.md 2–3): the five spectacle lens types with their
   plain-language descriptions, and the staff form's rules, shared by the
   browser and the server action. No server imports. */
import { z } from "zod";

// `slug` matches the mega-menu links (/lenses?type=<slug>). TODO (client): blue-cut and photochromic.
export const LENS_TYPES = [
  { id: "single_vision", slug: "single-vision", name: "Single vision", icon: "eye", text: "One power across the whole lens, for distance or for reading." },
  { id: "bifocal", slug: "bifocal", name: "Bifocal", icon: "lens", text: "Two powers in one lens: distance on top, reading below." },
  { id: "progressive", slug: "progressive", name: "Progressive", icon: "adjust", text: "Distance, middle and reading powers in one lens, with no visible line." },
  { id: "blue_cut", slug: "blue-cut", name: "Blue-cut / computer", icon: "shield", text: "Lenses with a blue-light filtering coating, often chosen for long screen work." },
  { id: "photochromic", slug: "photochromic", name: "Photochromic", icon: "sun", text: "Clear indoors, darker outdoors in sunlight." },
] as const;
export type LensTypeId = (typeof LENS_TYPES)[number]["id"];
export const lensTypeName = (id: string) => LENS_TYPES.find((t) => t.id === id)?.name ?? id;

export const MAX_FEATURES = 6;

export const lensFields = z.object({
  brand: z.string().trim().min(2, "Choose a brand, or add a new one").max(40, "A brand name can be up to 40 characters"),
  name: z.string().trim().min(2, "Enter the lens name").max(60, "The lens name can be up to 60 characters"),
  type: z.enum(LENS_TYPES.map((t) => t.id) as [LensTypeId, ...LensTypeId[]], "Choose the lens type"),
  features: z.array(z.string().trim().min(2, "A feature needs at least 2 characters").max(30, "Keep each feature under 30 characters"))
    .max(MAX_FEATURES, `Up to ${MAX_FEATURES} features`),
  price: z.string().trim().transform((s) => s.replace(/[₹,\s]/g, "")).pipe(
    z.union([z.literal(""), z.string().regex(/^\d{1,6}$/, "Enter the price in whole rupees, or leave it empty")]),
  ).transform((s) => (s === "" ? null : Number(s))).refine((n) => n === null || (n >= 1 && n <= 200000), "Enter a price between ₹1 and ₹2,00,000"),
  isActive: z.boolean(),
});
export type LensInput = z.infer<typeof lensFields>;
