"use client";

/* Frames and Sunglasses listings (Requirements_Frames.md 3, Requirements_Sunglasses.md 3),
   ported from the signed-off mockup (mockups/listing.js). The server sends every
   live frame of the page (a few hundred is small); filtering, counts, sort and
   "Load more" run here, so they're instant. The address bar holds the state
   (?for=women&shape=round&price=1000-2999), so links can be shared and the mega
   menu's links land filtered. OR within a filter, AND across filters; sold out
   always sorts last. */
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PickerButton } from "@/components/site/branch-picker";
import { Icon } from "@/components/site/icons";
import type { CatalogueItem, Kind } from "@/lib/queries/catalogue";
import { slugify } from "@/lib/site-config";
import { useCardsOnScroll } from "./cards-on-scroll";
import { FrameCard } from "./frame-card";
import { useFavourites } from "./favourites";

const PAGE = 24;

const PRICES = [
  { id: "0-999", label: "Under ₹1,000", min: 0, max: 999 },
  { id: "1000-2999", label: "₹1,000–2,999", min: 1000, max: 2999 },
  { id: "3000-4999", label: "₹3,000–4,999", min: 3000, max: 4999 },
  { id: "5000+", label: "₹5,000 and above", min: 5000, max: Infinity },
];
// Swatches show the product's own colour, so these are content colours, not design tokens (as in the mockup)
const SWATCH: Record<string, string> = {
  Black: "#1A1A1A", Blue: "#2F5FA8", Brown: "#6B4426", Burgundy: "#6D1F2F", Gold: "#C9A227", Gunmetal: "#4A4F57",
  Pink: "#E7A3B8", Red: "#B03030", Silver: "#C0C4C8", Tortoise: "#7A4A24", Transparent: "#EEF2F4", White: "#F4F4F2",
};
const SWATCH_UNKNOWN = "#CCCCCC";

type Key = "gender" | "category" | "lens" | "brand" | "price" | "colour" | "shape";
type GroupDef = { param: string; legend: string; options?: string[]; order?: string[]; label?: (v: string) => string; swatch?: true };
const GROUP_DEFS: Record<Key, GroupDef> = {
  gender: { param: "for", legend: "Gender", options: ["Men", "Women", "Unisex", "Kids"] },
  category: { param: "category", legend: "Category" },
  lens: { param: "lens", legend: "Lens type", order: ["Polarized", "UV protection", "Tinted", "Power sunglasses"] },
  brand: { param: "brand", legend: "Brand" },
  price: { param: "price", legend: "Price", options: PRICES.map((p) => p.id), label: (id) => PRICES.find((p) => p.id === id)!.label },
  colour: { param: "colour", legend: "Colour", swatch: true },
  shape: { param: "shape", legend: "Shape" },
};

// What differs between the two pages (the mockups' cfg). Tiers are the mega menu's ?tier= links (DUMMY C7).
const CONFIG: Record<Kind, { groups: Key[]; tiers: Record<string, string[]>; noun: (n: number) => string; plural: string }> = {
  frames: {
    groups: ["gender", "category", "brand", "price", "colour", "shape"],
    tiers: { everyday: ["0-999", "1000-2999"], premium: ["3000-4999", "5000+"] },
    noun: (n) => `${n} frame${n === 1 ? "" : "s"}`,
    plural: "frames",
  },
  sunglasses: {
    groups: ["gender", "lens", "brand", "price", "colour", "shape"], // no Category: everything here is sunglasses
    tiers: { everyday: ["0-999", "1000-2999"], branded: ["3000-4999", "5000+"] },
    noun: (n) => `${n} pair${n === 1 ? "" : "s"}`,
    plural: "sunglasses",
  },
};

const values = (f: CatalogueItem, key: Key): string[] =>
  key === "lens" ? f.lens : key === "price" ? [] : [f[key]];

type Group = { key: Key; param: string; legend: string; options: string[]; label?: (v: string) => string; swatch?: true };
type State = { sel: Record<string, string[]>; stock: boolean; saved: boolean; sort: "new" | "price-asc" | "price-desc" };

function buildGroups(kind: Kind, items: CatalogueItem[]): Group[] {
  return CONFIG[kind].groups.map((key) => {
    const def = GROUP_DEFS[key];
    const have = [...new Set(items.flatMap((f) => values(f, key)))].sort();
    // A fixed order (the mega menu's lens types) keeps that order but lists only values on the site
    const options = def.options ?? (def.order ? def.order.filter((o) => have.includes(o)) : have);
    return { key, ...def, options };
  });
}

function readState(q: URLSearchParams, groups: Group[], kind: Kind): State {
  const sel: Record<string, string[]> = {};
  for (const g of groups) {
    const wanted = (q.get(g.param) ?? "").split(",").filter(Boolean);
    sel[g.key] = g.options.filter((o) => wanted.includes(slugify(o)) || wanted.includes(o));
  }
  const tier = CONFIG[kind].tiers[q.get("tier") ?? ""];
  if (tier && !sel.price.length) sel.price = tier;
  const sort = q.get("sort");
  return {
    sel, stock: q.get("stock") === "1", saved: q.get("saved") === "1",
    sort: sort === "price-asc" || sort === "price-desc" ? sort : "new",
  };
}

function writeState(s: State, groups: Group[]): string {
  const q = new URLSearchParams();
  for (const g of groups) if (s.sel[g.key].length) q.set(g.param, s.sel[g.key].map((v) => (g.key === "price" ? v : slugify(v))).join(","));
  if (s.stock) q.set("stock", "1");
  if (s.saved) q.set("saved", "1");
  if (s.sort !== "new") q.set("sort", s.sort);
  const qs = q.toString().replace(/%2C/g, ",");
  // Replace, not push: filters don't fill the Back button's history (as in the mockup)
  window.history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
  return q.toString();
}

const matchOne = (key: Key, f: CatalogueItem, v: string) => {
  if (key !== "price") return values(f, key).includes(v);
  const p = PRICES.find((x) => x.id === v)!;
  return f.price >= p.min && f.price <= p.max;
};

type Props = { kind: Kind; items: CatalogueItem[]; title: string; intro: string };

/** The listing for the address bar's filters. Reading the address needs <Suspense>; see ListingUnfiltered. */
export function Listing(props: Props) {
  return <ListingView {...props} search={useSearchParams().toString()} />;
}
/** The same listing with no filters: the pre-rendered page shown until the address is read. */
export function ListingUnfiltered(props: Props) {
  return <ListingView {...props} search="" />;
}

function ListingView({ kind, items, title, intro, search: url }: Props & { search: string }) {
  const cfg = CONFIG[kind];
  // A change shows at once from local state; the address bar catches up a moment later.
  // When the address changes from outside (a mega-menu link), it wins.
  const [local, setLocal] = useState({ url, search: url });
  let search = local.search;
  if (local.url !== url) {
    setLocal({ url, search: url });
    search = url;
  }
  const groups = buildGroups(kind, items);
  const state = readState(new URLSearchParams(search), groups, kind);
  const { favs, toggle } = useFavourites();

  // "Load more" count, back to one page whenever the filters change
  const [shown, setShown] = useState({ search, n: PAGE });
  const n = shown.search === search ? shown.n : PAGE;
  if (shown.search !== search) setShown({ search, n: PAGE });

  const set = (patch: Partial<State>) => {
    const next = writeState({ ...state, ...patch }, groups);
    setLocal((l) => ({ ...l, search: next }));
  };
  const setSel = (key: Key, list: string[]) => set({ sel: { ...state.sel, [key]: list } });
  const toggleIn = (key: Key, v: string) => {
    const s = state.sel[key];
    setSel(key, s.includes(v) ? s.filter((x) => x !== v) : [...s, v]);
  };
  const clearAll = () => set({ sel: Object.fromEntries(groups.map((g) => [g.key, []])), stock: false, saved: false });

  const passes = (f: CatalogueItem, skip?: Key) => {
    if (state.stock && f.sold) return false;
    if (state.saved && !favs.includes(f.code)) return false;
    return groups.every((g) => g.key === skip || !state.sel[g.key].length || state.sel[g.key].some((v) => matchOne(g.key, f, v)));
  };
  const list = items.filter((f) => passes(f));
  const order = new Map(items.map((f, i) => [f.code, i]));
  const by = {
    new: (a: CatalogueItem, b: CatalogueItem) => order.get(a.code)! - order.get(b.code)!,
    "price-asc": (a: CatalogueItem, b: CatalogueItem) => a.price - b.price,
    "price-desc": (a: CatalogueItem, b: CatalogueItem) => b.price - a.price,
  }[state.sort];
  list.sort((a, b) => Number(a.sold) - Number(b.sold) || by(a, b)); // sold out always last
  const total = list.length;
  const visible = list.slice(0, n);
  const grid = useRef<HTMLDivElement>(null);
  useCardsOnScroll(grid, `${search}|${visible.length}`);

  const chips = groups.flatMap((g) => state.sel[g.key].map((v) => ({ key: g.key as Key | "stock", v, text: g.label ? g.label(v) : v })));
  if (state.stock) chips.push({ key: "stock", v: "", text: "In stock only" });
  const savedCount = favs.filter((c) => items.some((f) => f.code === c)).length;

  /* ---------- The filter panel below 1180px ---------- */
  const [panelOpen, setPanelOpen] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const openBtn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const setPanel = (on: boolean) => {
    setPanelOpen(on);
    if (!on) openBtn.current?.focus();
  };
  useEffect(() => {
    if (!panelOpen) return;
    document.documentElement.style.overflow = "hidden";
    const t = setTimeout(() => closeBtn.current?.focus(), 50);
    const wide = matchMedia("(min-width: 1180px)");
    const onWide = (e: MediaQueryListEvent) => { if (e.matches) setPanelOpen(false); };
    wide.addEventListener("change", onWide);
    return () => { document.documentElement.style.overflow = ""; clearTimeout(t); wide.removeEventListener("change", onWide); };
  }, [panelOpen]);
  const onPanelKey = (e: React.KeyboardEvent) => {
    if (!panelOpen) return;
    if (e.key === "Escape") { e.stopPropagation(); return setPanel(false); }
    if (e.key !== "Tab" || !panel.current) return;
    const f = [...panel.current.querySelectorAll<HTMLElement>("button, input:not(:disabled)")].filter((el) => el.offsetParent !== null);
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  };

  const head = (
    <header className="page-head">
      <h1>{title} <span className="page-head__count" aria-live="polite">{cfg.noun(total)}</span></h1>
      <p>{intro}</p>
      {items.length > 0 && (
        <div className="quick-chips" role="group" aria-label="Shop for">
          {["Men", "Women", "Kids", "Unisex"].map((v) => (
            <button className="chip-toggle" type="button" key={v} aria-pressed={state.sel.gender.includes(v)} onClick={() => toggleIn("gender", v)}>{v}</button>
          ))}
        </div>
      )}
    </header>
  );

  if (!items.length) {
    return (
      <>
      {head}
      <div className="empty">
        <Icon name="glasses" />
        <h2>New {cfg.plural} are coming soon</h2>
        <p>Visit a branch to see the full collection.</p>
        <div className="empty__actions">
          <a className="btn btn--primary" href="/contact#branches">Find a branch</a>
          <PickerButton kind="whatsapp" className="btn btn--outline-dark">Ask on WhatsApp</PickerButton>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      {head}

      <div className="listing">
        <aside className={`filters${panelOpen ? " is-open" : ""}`} id="filters" aria-label="Filters" ref={panel} onKeyDown={onPanelKey}>
          <div className="filters__head">
            <h2>Filters</h2>
            <button className="icon-btn" type="button" aria-label="Close filters" ref={closeBtn} onClick={() => setPanel(false)}><Icon name="x" className="icon icon--lg" /></button>
          </div>
          <form className="filters__body" onSubmit={(e) => e.preventDefault()}>
            {groups.map((g) => (
              <fieldset className="fgroup" key={g.key}>
                <legend>{g.legend}</legend>
                {g.options.map((o) => {
                  const count = items.filter((f) => passes(f, g.key) && matchOne(g.key, f, o)).length;
                  const checked = state.sel[g.key].includes(o);
                  return (
                    <label className={`fopt${!count && !checked ? " is-empty" : ""}`} key={o}>
                      <input type="checkbox" checked={checked} disabled={!count && !checked} onChange={() => toggleIn(g.key, o)} />
                      {g.swatch && <span className="swatch" style={{ background: SWATCH[o] ?? SWATCH_UNKNOWN }} />}
                      <span>{g.label ? g.label(o) : o}</span>
                      <span className="fopt__count">{count}</span>
                    </label>
                  );
                })}
              </fieldset>
            ))}
            <fieldset className="fgroup">
              <legend>Availability</legend>
              <label className="fswitch">In stock only <input type="checkbox" checked={state.stock} onChange={(e) => set({ stock: e.target.checked })} /></label>
            </fieldset>
          </form>
          <div className="filters__foot">
            <button className="btn btn--outline-dark" type="button" onClick={clearAll}>Clear</button>
            <button className="btn btn--primary" type="button" onClick={() => setPanel(false)}>Show {cfg.noun(total)}</button>
          </div>
        </aside>

        <section aria-label="Results">
          <div className="toolbar">
            <button className="btn btn--outline-dark filters-btn" type="button" aria-controls="filters" aria-expanded={panelOpen} ref={openBtn} onClick={() => setPanel(true)}>
              <Icon name="adjust" className="icon icon--sm" />Filters {chips.length ? `(${chips.length})` : ""}
            </button>
            <div className="toolbar__chips" role="group" aria-label="Active filters">
              {chips.map((c) => (
                <button className="active-chip" type="button" key={`${c.key}|${c.v}`} aria-label={`Remove filter: ${c.text}`}
                  onClick={() => (c.key === "stock" ? set({ stock: false }) : setSel(c.key, state.sel[c.key].filter((x) => x !== c.v)))}>
                  {c.text}<Icon name="x" />
                </button>
              ))}
              {chips.length > 0 && <button className="clear-all" type="button" onClick={clearAll}>Clear all</button>}
            </div>
            <button className="saved-toggle" type="button" aria-pressed={state.saved} disabled={!savedCount && !state.saved}
              title={savedCount || state.saved ? undefined : "Tap ♡ on a frame to save it"} onClick={() => set({ saved: !state.saved })}>
              <Icon name="heart" /><span>Saved ({savedCount})</span>
            </button>
            <label className="sort"><span>Sort</span>
              <select aria-label={`Sort ${cfg.plural}`} value={state.sort} onChange={(e) => set({ sort: e.target.value as State["sort"] })}>
                <option value="new">Newest</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </label>
          </div>

          {total ? (
            <>
              <div className="frames-row" ref={grid}>
                {visible.map((f, i) => <FrameCard key={f.code} f={f} saved={favs.includes(f.code)} onToggle={toggle} eager={i < 4} />)}
              </div>
              <div className="results-foot">
                <span>Showing {visible.length} of {total}</span>
                {visible.length < total && (
                  <button className="btn btn--outline-dark" type="button" onClick={() => setShown({ search, n: n + PAGE })}>Load more</button>
                )}
              </div>
            </>
          ) : (
            <div className="empty">
              <Icon name="glasses" />
              <h2>No {cfg.plural} match these filters</h2>
              <p>We may still have it in store. Clear a filter, or ask us on WhatsApp.</p>
              <div className="empty__actions">
                <button className="btn btn--outline-dark" type="button" onClick={clearAll}>Clear filters</button>
                <PickerButton kind="whatsapp" className="btn btn--primary">Ask on WhatsApp</PickerButton>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

