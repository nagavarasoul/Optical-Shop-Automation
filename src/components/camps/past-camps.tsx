"use client";

/* Past camps (Requirements_EyeCamps.md 3): year chips from the data, kept in the
   address (?year=2025), newest first, 9 at a time with "Load more". */
import { useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";

const PAGE = 9;
type Item = { key: string; year: string; card: ReactNode };

export function PastCamps({ items }: { items: Item[] }) {
  return <PastView items={items} url={useSearchParams().get("year") ?? ""} />;
}
export function PastCampsPlain({ items }: { items: Item[] }) {
  return <PastView items={items} url="" />;
}

function PastView({ items, url }: { items: Item[]; url: string }) {
  const years = [...new Set(items.map((i) => i.year))];
  const [local, setLocal] = useState({ url, year: url });
  let picked = local.year;
  if (local.url !== url) { setLocal({ url, year: url }); picked = url; }
  const year = years.includes(picked) ? picked : "";
  const [shown, setShown] = useState({ year, n: PAGE });
  const n = shown.year === year ? shown.n : PAGE;

  const choose = (y: string) => {
    window.history.replaceState(null, "", (y ? `?year=${y}` : location.pathname) + location.hash);
    setLocal((l) => ({ ...l, year: y }));
  };
  const list = items.filter((i) => !year || i.year === year);
  const visible = Math.min(n, list.length);
  return (
    <>
      <div className="year-chips" role="group" aria-label="Filter by year">
        {["", ...years].map((y) => (
          <button className="chip-toggle" type="button" key={y || "all"} aria-pressed={year === y} onClick={() => choose(y)}>{y || "All"}</button>
        ))}
      </div>
      <div className="past-grid">{list.slice(0, n).map((i) => <div key={i.key} style={{ display: "contents" }}>{i.card}</div>)}</div>
      <div className="results-foot">
        <span aria-live="polite">Showing {visible} of {list.length}</span>
        {visible < list.length && <button className="btn btn--outline-dark" type="button" onClick={() => setShown({ year, n: n + PAGE })}>Load more</button>}
      </div>
    </>
  );
}
