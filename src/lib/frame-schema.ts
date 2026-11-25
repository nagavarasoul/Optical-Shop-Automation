/* Frame form rules (Requirements_Admin.md 6.1–6.3), shared by the browser
   (instant messages) and the server action (which checks everything again,
   because anything a browser sends can be faked). No server-only imports. */
import { z } from "zod";

export const CATEGORIES = [["eyeglasses", "Eyeglasses"], ["computer_glasses", "Computer glasses"], ["sunglasses", "Sunglasses"]] as const; // DUMMY C13
export const GENDERS = [["men", "Men"], ["women", "Women"], ["unisex", "Unisex"], ["kids", "Kids"]] as const;
export const SHAPES = ["Rectangle", "Square", "Round", "Cat-eye", "Aviator", "Wayfarer"] as const; // TODO (client): shapes stocked
export const MATERIALS = ["Acetate", "Metal", "TR90", "Titanium", "O Matter"] as const;
export const LENS_TYPES = ["Polarized", "UV protection", "Tinted", "Power sunglasses"] as const; // DUMMY C14
export const LENS_COLOURS = ["Grey", "Green", "Brown", "Gradient blue"] as const;
export const WHERE = [["indresham", "Indresham"], ["patelguda", "Patelguda"], ["both", "Both"]] as const;
export const PHOTO_KINDS = [["front", "Front"], ["side", "Side"], ["closeup", "Close-up"], ["model", "Model wearing it"]] as const;
export const MAX_PHOTOS = 5;

/** What the save button means. Which ones a person may use depends on role and status (server-checked). */
export const INTENTS = ["draft", "send", "publish", "approve", "save", "sendback"] as const;
export type Intent = (typeof INTENTS)[number];

const optionalInt = (min: number, max: number, label: string) =>
  z.union([z.literal(""), z.coerce.number().int(`${label}: whole millimetres`).min(min, `${label}: at least ${min}`).max(max, `${label}: at most ${max}`)])
    .transform((v) => (v === "" ? null : v));

export const photoMeta = z.object({
  key: z.string().regex(/^(existing:[0-9a-f-]{36}|new:\d+)$/),
  kind: z.enum(["front", "side", "closeup", "model"]),
  consent: z.boolean(),
}).refine((p) => p.kind !== "model" || p.consent, { message: "Tick that this person gave written permission to show the photo.", path: ["consent"] });

export const frameFields = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z]{2,4}-\d{3,5}$/, "Use the code on the tag, like VSF-1024 (sunglasses SG-2017)."), // format DUMMY C13
  category: z.enum(["eyeglasses", "computer_glasses", "sunglasses"], "Choose a category."),
  brand: z.string().trim().min(1, "Choose or add a brand.").max(40),
  model: z.string().trim().min(1, "Enter the model name.").max(60, "Keep the model under 60 characters."),
  gender: z.enum(["men", "women", "unisex", "kids"], "Choose who it's for."),
  colour: z.string().trim().min(1, "Choose or add a colour.").max(30),
  shape: z.enum(SHAPES, "Choose a shape."),
  material: z.string().trim().max(30).optional().transform((v) => v || null),
  sizeLens: optionalInt(30, 160, "Lens width"),
  sizeBridge: optionalInt(0, 30, "Bridge"),
  sizeTemple: optionalInt(100, 160, "Temple"),
  lensTypes: z.array(z.enum(LENS_TYPES)).default([]),
  lensColour: z.union([z.literal(""), z.enum(LENS_COLOURS)]).transform((v) => v || null),
  price: z.coerce.number({ error: "Enter the price in rupees." }).int("Whole rupees only, as on the tag.").min(1, "Enter the price in rupees.").max(100000, "That's more than ₹1,00,000. Check the price."),
  availability: z.enum(["in_stock", "sold_out"]),
  availableAt: z.enum(["indresham", "patelguda", "both"], "Choose where it's available."),
  isActive: z.boolean(),
  photos: z.array(photoMeta).max(MAX_PHOTOS, `Up to ${MAX_PHOTOS} photos.`),
});
export type FrameFields = z.input<typeof frameFields>;

/** Rules that depend on the button pressed: anything going live or for approval needs a photo. */
export function intentProblems(intent: Intent, f: { photos: unknown[] }): Record<string, string> {
  return intent !== "draft" && f.photos.length === 0 ? { photos: "Add at least one photo." } : {};
}

/** Field-by-field messages, for the form and the server's reply. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] === "photos" ? "photos" : String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

export const frameSlug = (brand: string, model: string, code: string) =>
  `${brand} ${model} ${code}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
