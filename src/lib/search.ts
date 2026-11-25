/* Site search (Requirements_Search.md 3): matching and order, over the live
   lists the site already loads. Plain functions with no database access, so
   the page and the tests use exactly the same rules.
   - Case, accents, spaces, hyphens and dots don't matter.
   - Every word must match. A word matches the start of a word in the item;
     a word with a digit in it (a code or a model number) may also match
     anywhere inside a field written without its spaces, so "rb 5154" and
     "vsf0012" find RB5154 and VSF-0012. Letters-only words don't, or "men"
     would find "women". */
import type { CatalogueItem } from "./queries/catalogue";
import type { LensItem } from "./queries/content";
import { lensTypeName } from "./lens-rules";

export const MAX_QUERY = 60;
export const GROUP_LIMIT = 24;
const SMALL = new Set(["a", "an", "the", "for", "and", "with", "glasses", "frame", "frames", "specs"]);

const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
const tokens = (s: string) => fold(s).split(/[^a-z0-9]+/).filter(Boolean);
const compact = (s: string) => fold(s).replace(/[^a-z0-9]/g, "");

/** The trimmed search as typed (for showing back), and the words that count. */
export function parseQuery(raw: string | string[] | undefined): { text: string; words: string[] } {
  const text = (Array.isArray(raw) ? raw[0] ?? "" : raw ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_QUERY);
  const words = [...new Set(tokens(text))].filter((w) => !SMALL.has(w));
  return { text, words };
}

type Fields = { main: string[]; other: string[] };

function wordMatches(w: string, fieldTokens: string[], fieldCompact: string[]): boolean {
  if (fieldTokens.some((t) => t.startsWith(w))) return true;
  return /\d/.test(w) && fieldCompact.some((c) => c.includes(w));
}

/** 0 = exact code, 1 = brand or model matches, 2 = something else matches, null = no match. */
function rank(f: Fields, words: string[], code: string | null, query: string): 0 | 1 | 2 | null {
  if (!words.length) return null;
  const all = [...f.main, ...f.other];
  const allTokens = all.flatMap(tokens);
  const allCompact = all.map(compact);
  if (!words.every((w) => wordMatches(w, allTokens, allCompact))) return null;
  if (code && compact(code) === compact(query)) return 0;
  const mainTokens = f.main.flatMap(tokens);
  const mainCompact = f.main.map(compact);
  return words.some((w) => wordMatches(w, mainTokens, mainCompact)) ? 1 : 2;
}

const frameFields = (f: CatalogueItem): Fields => ({
  main: [f.brand, f.model, f.code],
  other: [f.category, f.gender, f.colour, f.shape, f.material ?? "", ...f.lens, f.lensColour ?? ""],
});

const lensFields = (l: LensItem): Fields => ({
  main: [l.brand, l.name],
  other: [lensTypeName(l.type), ...l.features],
});

/** Matching frames or sunglasses: exact code, then brand/model, then the rest;
    within each, in stock before sold out, then the listing's order (newest first). */
export function searchFrames(items: CatalogueItem[], q: { text: string; words: string[] }): CatalogueItem[] {
  return items
    .map((f, i) => ({ f, i, r: rank(frameFields(f), q.words, f.code, q.text) }))
    .filter((x) => x.r !== null)
    .sort((a, b) => a.r! - b.r! || Number(a.f.sold) - Number(b.f.sold) || a.i - b.i)
    .map((x) => x.f);
}

/** Matching lenses: brand/name matches first, then the rest, in the lens page's order. */
export function searchLenses(items: LensItem[], q: { text: string; words: string[] }): LensItem[] {
  return items
    .map((l, i) => ({ l, i, r: rank(lensFields(l), q.words, null, q.text) }))
    .filter((x) => x.r !== null)
    .sort((a, b) => a.r! - b.r! || a.i - b.i)
    .map((x) => x.l);
}
