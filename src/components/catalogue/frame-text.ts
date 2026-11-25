/* Words built from a frame, shared by the card (browser) and the detail page (server). */
import type { CatalogueItem } from "@/lib/queries/catalogue";

const noun = (f: CatalogueItem) => (f.category === "Sunglasses" ? "sunglasses" : "frame");
export const enquiryText = (f: CatalogueItem) =>
  f.sold
    ? `Hi VS Lens Mart, ${noun(f)} ${f.code} (${f.brand} ${f.model}) is sold out. Do you have something similar?`
    : `Hi VS Lens Mart, I'm interested in ${noun(f)} ${f.code} (${f.brand} ${f.model}). Is it available?`;
export const photoAlt = (f: CatalogueItem) => `${f.brand} ${f.model}, ${f.colour.toLowerCase()} ${f.shape.toLowerCase()} ${noun(f)}`;
