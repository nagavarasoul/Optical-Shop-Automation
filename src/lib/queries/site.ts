/* Data for the shared layout: branches (utility bar, footer, branch picker) and
   the mega menus (brands, "from ₹" prices). Plain functions that take a database
   transaction, so tests can run them directly; src/lib/site-data.ts caches them.
   They filter for approved, active and visible rows themselves, as well as
   relying on row-level security, so they're right whichever role runs them. */
import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import { branchClosures, branches, brands, frames, lenses } from "../../db/schema";
import type { Tx } from "../db";
import { branches as branchSeed, isDummyPhone, PREMIUM_FROM, priceTiers, slugify } from "../site-config";

export type Branch = {
  slug: string;
  name: string;
  address: string;
  mapUrl: string | null;
  phone: string;
  whatsapp: string;
  opens: string; // "09:00"
  closes: string;
  openDays: string[];
  /** docs/dummy-data.md id while the phone is still a placeholder */
  dummy: "D2" | null;
};

export async function branchesQuery(tx: Tx): Promise<Branch[]> {
  const rows = await tx
    .select({
      slug: branches.slug, name: branches.name, address: branches.address, mapUrl: branches.mapUrl,
      phone: branches.phone, whatsapp: branches.whatsapp, opens: branches.opens, closes: branches.closes, openDays: branches.openDays,
    })
    .from(branches)
    .where(eq(branches.isVisible, true))
    .orderBy(asc(branches.sort), asc(branches.name));

  const list = rows.length
    ? rows.map((r) => ({ ...r, opens: r.opens.slice(0, 5), closes: r.closes.slice(0, 5) }))
    : // No rows yet (fresh database): the seed values, so the site still shows the shop's facts
      branchSeed.map((b) => ({ ...b, mapUrl: null, openDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] }));
  return list.map((b) => ({
    slug: b.slug, name: b.name, address: b.address, mapUrl: b.mapUrl, phone: b.phone, whatsapp: b.whatsapp,
    opens: b.opens, closes: b.closes, openDays: b.openDays,
    dummy: isDummyPhone(b.phone) || isDummyPhone(b.whatsapp) ? "D2" : null,
  }));
}

export type MenuLink = { name: string; href: string };
export type PriceLink = { label: string; href: string; from: number };
export type MenuData = {
  frameBrands: MenuLink[];
  lensBrands: MenuLink[];
  framePrices: PriceLink[];
  sunglassPrices: PriceLink[];
};

const FRAME_BRANDS_SHOWN = 4; // as in the approved mockup; "All brands" links to the rest

export async function menuQuery(tx: Tx): Promise<MenuData> {
  const live = and(eq(frames.status, "approved"), eq(frames.isActive, true));
  const notSun = inArray(frames.category, ["eyeglasses", "computer_glasses"]);

  // Frame brands with the most approved frames first
  const frameBrands = await tx
    .select({ name: brands.name, n: count() })
    .from(frames).innerJoin(brands, eq(brands.id, frames.brandId))
    .where(and(live, notSun))
    .groupBy(brands.name)
    .orderBy(desc(count()), asc(brands.name))
    .limit(FRAME_BRANDS_SHOWN);

  const lensBrands = await tx
    .selectDistinct({ name: brands.name })
    .from(lenses).innerJoin(brands, eq(brands.id, lenses.brandId))
    .where(eq(lenses.isActive, true))
    .orderBy(asc(brands.name));

  // Lowest price in each tier (DUMMY C7 boundaries in site-config.ts)
  const [p] = await tx
    .select({
      framesEveryday: sql<number | null>`min(${frames.price}) filter (where ${frames.category} <> 'sunglasses' and ${frames.price} < ${PREMIUM_FROM})`,
      framesPremium: sql<number | null>`min(${frames.price}) filter (where ${frames.category} <> 'sunglasses' and ${frames.price} >= ${PREMIUM_FROM})`,
      framesKids: sql<number | null>`min(${frames.price}) filter (where ${frames.category} <> 'sunglasses' and ${frames.gender} = 'kids')`,
      sunEveryday: sql<number | null>`min(${frames.price}) filter (where ${frames.category} = 'sunglasses' and ${frames.price} < ${PREMIUM_FROM})`,
      sunBranded: sql<number | null>`min(${frames.price}) filter (where ${frames.category} = 'sunglasses' and ${frames.price} >= ${PREMIUM_FROM})`,
    })
    .from(frames)
    .where(live);

  const from: Record<string, number | null> = {
    "frames:everyday": p?.framesEveryday ?? null, "frames:premium": p?.framesPremium ?? null, "frames:kids": p?.framesKids ?? null,
    "sunglasses:everyday": p?.sunEveryday ?? null, "sunglasses:branded": p?.sunBranded ?? null,
  };
  // A tier with no products is left out, so the menu never says "from ₹0"
  const prices = (kind: "frames" | "sunglasses") =>
    priceTiers[kind].flatMap((t) => {
      const v = from[`${kind}:${t.id}`];
      return v == null ? [] : [{ label: t.label, href: t.href, from: Number(v) }];
    });

  return {
    frameBrands: frameBrands.map((b) => ({ name: b.name, href: `/frames?brand=${slugify(b.name)}` })),
    lensBrands: lensBrands.map((b) => ({ name: b.name, href: `/lenses?brand=${slugify(b.name)}` })),
    framePrices: prices("frames"),
    sunglassPrices: prices("sunglasses"),
  };
}

export type Closure = { branchSlug: string | null; day: string; note: string | null };

/** Closed days from today on (festivals); a null branch means both branches. */
export async function closuresQuery(tx: Tx): Promise<Closure[]> {
  return tx.select({ branchSlug: branches.slug, day: branchClosures.day, note: branchClosures.note })
    .from(branchClosures).leftJoin(branches, eq(branches.id, branchClosures.branchId))
    .where(sql`${branchClosures.day} >= (now() at time zone 'Asia/Kolkata')::date`)
    .orderBy(asc(branchClosures.day));
}
