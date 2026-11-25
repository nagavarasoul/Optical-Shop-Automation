"use client";

/* The lens catalogue (Requirements_Lenses.md 3.4), from the signed-off mockup
   (mockups/lenses.html): Type and Brand chips, OR within a group and AND across,
   kept in the address (?type=progressive&brand=zeiss) so the mega menu's links
   and the type cards and brand tiles land filtered. */
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { PickerButton } from "@/components/site/branch-picker";
import { Icon } from "@/components/site/icons";
import { rupees } from "@/components/site/menu-links";
import { LENS_TYPES, lensTypeName } from "@/lib/lens-rules";
import type { LensItem } from "@/lib/queries/content";

type Props = { lenses: LensItem[] };

/** Reads the filters from the address (needs <Suspense>). */
export function LensCatalogue(props: Props) {
  return <CatalogueView {...props} search={useSearchParams().toString()} />;
}
/** Unfiltered, before the address is read (pre-rendered). */
export function LensCataloguePlain(props: Props) {
  return <CatalogueView {...props} search="" />;
}

function CatalogueView({ lenses, search: url }: Props & { search: string }) {
  // A tap shows at once; the address follows. A change of address from outside (a link) wins.
  const [local, setLocal] = useState({ url, search: url });
  let search = local.search;
  if (local.url !== url) { setLocal({ url, search: url }); search = url; }

  const types = LENS_TYPES.filter((t) => lenses.some((l) => l.type === t.id));
  const brands = [...new Map(lenses.map((l) => [l.brandSlug, l.brand])).entries()].map(([slug, name]) => ({ slug, name }));
  const q = new URLSearchParams(search);
  const want = (k: string) => (q.get(k) ?? "").split(",").filter(Boolean);
  const sel = {
    type: want("type").filter((s) => types.some((t) => t.slug === s)),
    brand: want("brand").filter((s) => brands.some((b) => b.slug === s)),
  };
  const list = lenses.filter((l) =>
    (!sel.type.length || sel.type.includes(LENS_TYPES.find((t) => t.id === l.type)!.slug)) && (!sel.brand.length || sel.brand.includes(l.brandSlug)));

  const write = (next: typeof sel) => {
    const p = new URLSearchParams();
    if (next.type.length) p.set("type", next.type.join(","));
    if (next.brand.length) p.set("brand", next.brand.join(","));
    const s = p.toString().replace(/%2C/g, ",");
    window.history.replaceState(null, "", (s ? `?${s}` : location.pathname) + location.hash);
    setLocal((l) => ({ ...l, search: p.toString() }));
  };
  const toggle = (group: "type" | "brand", v: string) =>
    write({ ...sel, [group]: sel[group].includes(v) ? sel[group].filter((x) => x !== v) : [...sel[group], v] });
  const clear = () => write({ type: [], brand: [] });
  const chip = (group: "type" | "brand", v: string, label: string) => (
    <button className="chip-toggle" type="button" key={v} aria-pressed={sel[group].includes(v)} onClick={() => toggle(group, v)}>{label}</button>
  );

  return (
    <>
      <div className="chipbar">
        <div className="chipbar__row" role="group" aria-label="Lens type"><span className="chipbar__label">Type</span>{types.map((t) => chip("type", t.slug, t.name))}</div>
        <div className="chipbar__row" role="group" aria-label="Brand"><span className="chipbar__label">Brand</span>{brands.map((b) => chip("brand", b.slug, b.name))}</div>
        <div className="chipbar__meta">
          <span aria-live="polite">{list.length} lens{list.length === 1 ? "" : "es"}</span>
          {(sel.type.length > 0 || sel.brand.length > 0) && <button className="clear-all" type="button" onClick={clear}>Clear</button>}
        </div>
      </div>
      {list.length ? (
        <div className="lens-grid">
          {list.map((l) => {
            const type = lensTypeName(l.type);
            return (
              <article className="lcard" key={l.id}>
                <span className="caps lcard__brand">{l.brand}</span>
                <h3>{l.name}</h3>
                <span className="lcard__type">{type}</span>
                {l.features.length > 0 && <ul className="pill-list" aria-label="Features">{l.features.slice(0, 3).map((f) => <li key={f}>{f}</li>)}</ul>}
                <div className="lcard__foot">
                  {l.price != null ? <span className="lcard__price">{rupees(l.price)}</span> : <span className="lcard__price lcard__price--ask">Ask for price</span>}
                  <PickerButton kind="whatsapp" className="btn btn--outline-dark fcard__enquire" label={`Enquire about the ${l.brand} ${l.name} lens on WhatsApp`}
                    waText={`Hi VS Lens Mart, I'd like to know about the ${l.brand} ${l.name} (${type}) lens.`}>Enquire</PickerButton>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <Icon name="lens" />
          <h2>No lenses match</h2>
          <p>We have all branded lenses in store. Ask us on WhatsApp and we&apos;ll tell you what fits your power.</p>
          <div className="empty__actions">
            <button className="btn btn--outline-dark" type="button" onClick={clear}>Clear filters</button>
            <PickerButton kind="whatsapp" className="btn btn--primary">Ask on WhatsApp</PickerButton>
          </div>
        </div>
      )}
    </>
  );
}
