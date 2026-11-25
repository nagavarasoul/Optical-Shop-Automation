/* The public catalogue (Requirements_Frames.md 3–4, Requirements_Sunglasses.md
   3–4): approved, active frames or sunglasses, newest first, with labels ready
   to show. Plain functions that take a transaction, like queries/site.ts; they
   filter for approved and active rows themselves as well as relying on
   row-level security, so a staff role running them still sees only live rows.
   src/lib/catalogue-data.ts caches them. */
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { brands, colours, frameImages, frames } from "../../db/schema";
import type { Tx } from "../db";
import { CATEGORIES, GENDERS } from "../frame-schema";

export type Kind = "frames" | "sunglasses";

export type CatalogueItem = {
  code: string;
  href: string;
  brand: string;
  model: string;
  category: string; // "Eyeglasses", "Computer glasses", "Sunglasses"
  gender: string; // "Men", ...
  colour: string;
  shape: string;
  material: string | null;
  size: string | null; // "52-18-140"
  price: number;
  sold: boolean;
  where: string; // "Both branches", "Indresham", "Patelguda"
  lens: string[]; // sunglasses only
  lensColour: string | null;
  photo: string | null; // the cover's stored path
};

export type FrameDetail = CatalogueItem & { photos: { path: string; kind: string }[] };

const WHERE: Record<string, string> = { indresham: "Indresham", patelguda: "Patelguda", both: "Both branches" };
const label = (list: readonly (readonly [string, string])[], v: string) => list.find((x) => x[0] === v)?.[1] ?? v;

const live = and(eq(frames.status, "approved"), eq(frames.isActive, true));
const kindWhere = (kind: Kind) =>
  kind === "sunglasses" ? eq(frames.category, "sunglasses") : inArray(frames.category, ["eyeglasses", "computer_glasses"]);
const cover = sql<string | null>`(select ${frameImages.path} from ${frameImages} where ${frameImages.frameId} = ${frames.id} order by ${frameImages.position} limit 1)`;

const columns = {
  id: frames.id, code: frames.code, slug: frames.slug, brand: brands.name, model: frames.model, category: frames.category,
  gender: frames.gender, colour: colours.name, shape: frames.shape, material: frames.material,
  sizeLens: frames.sizeLens, sizeBridge: frames.sizeBridge, sizeTemple: frames.sizeTemple, price: frames.price,
  availability: frames.availability, availableAt: frames.availableAt, lensTypes: frames.lensTypes, lensColour: frames.lensColour,
  photo: cover,
};

const base = (tx: Tx) =>
  tx.select(columns).from(frames)
    .innerJoin(brands, eq(brands.id, frames.brandId))
    .innerJoin(colours, eq(colours.id, frames.colourId));
type Row = Awaited<ReturnType<typeof base>>[number];

function toItem(r: Row): CatalogueItem {
  const sizes = [r.sizeLens, r.sizeBridge, r.sizeTemple];
  return {
    code: r.code,
    href: `/${r.category === "sunglasses" ? "sunglasses" : "frames"}/${r.slug}`,
    brand: r.brand, model: r.model, category: label(CATEGORIES, r.category), gender: label(GENDERS, r.gender),
    colour: r.colour, shape: r.shape, material: r.material,
    size: sizes.every((s) => s != null) ? sizes.join("-") : null,
    price: r.price, sold: r.availability === "sold_out", where: WHERE[r.availableAt] ?? r.availableAt,
    lens: r.lensTypes ?? [], lensColour: r.lensColour, photo: r.photo,
  };
}


/** Every live frame (or pair of sunglasses), newest on the site first. */
export async function catalogueQuery(tx: Tx, kind: Kind): Promise<CatalogueItem[]> {
  const rows = await base(tx).where(and(live, kindWhere(kind)))
    .orderBy(desc(sql`coalesce(${frames.approvedAt}, ${frames.createdAt})`), desc(frames.code));
  return rows.map((r) => toItem(r));
}

/** One live frame by its slug, with all its photos; null for drafts, hidden or unknown frames. */
export async function frameDetailQuery(tx: Tx, kind: Kind, slug: string): Promise<FrameDetail | null> {
  const [row] = await base(tx).where(and(live, kindWhere(kind), eq(frames.slug, slug)));
  if (!row) return null;
  const photos = await tx.select({ path: frameImages.path, kind: frameImages.kind }).from(frameImages)
    .where(eq(frameImages.frameId, row.id)).orderBy(asc(frameImages.position));
  return { ...toItem(row), photos };
}

/** Slugs to pre-render at build time. */
export async function liveSlugsQuery(tx: Tx, kind: Kind): Promise<string[]> {
  const rows = await tx.select({ slug: frames.slug }).from(frames).where(and(live, kindWhere(kind)));
  return rows.map((r) => r.slug);
}
