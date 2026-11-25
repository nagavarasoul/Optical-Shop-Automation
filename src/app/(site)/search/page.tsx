import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PickerButton } from "@/components/site/branch-picker";
import { Icon } from "@/components/site/icons";
import { rupees } from "@/components/site/menu-links";
import { FrameResults, SearchForm } from "@/components/search/search-client";
import { getCatalogue } from "@/lib/catalogue-data";
import { getLenses } from "@/lib/content-data";
import { lensTypeName, LENS_TYPES } from "@/lib/lens-rules";
import type { CatalogueItem } from "@/lib/queries/catalogue";
import type { LensItem } from "@/lib/queries/content";
import { GROUP_LIMIT, parseQuery, searchFrames, searchLenses } from "@/lib/search";

/* Search (Requirements_Search.md): /search?q=, from the header's search panel
   and the 404 page. Searches the cached live lists in memory; the words never
   reach the database and aren't stored. Results depend on the address, so they
   render at request time behind <Suspense>; the page around them is static. */

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const { text } = parseQuery((await searchParams).q);
  return { title: text ? `Search: ${text}` : "Search", robots: { index: false } };
}

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <div className="container search-page">
      <nav aria-label="Breadcrumb" className="crumbs-nav"><ol className="crumbs"><li><Link href="/">Home</Link></li><li aria-current="page">Search</li></ol></nav>
      <Suspense fallback={<Head text="" count="loading" />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

/** `count`: the number of results, "loading" while they come in, or null for nothing to count. */
function Head({ text, count }: { text: string; count: number | "loading" | null }) {
  return (
    <header className="page-head" data-loading={count === "loading" || undefined}>
      <h1>{text ? <>Search results for “{text}”</> : "Search"}</h1>
      <SearchForm text={text} />
      <p className="search-page__count" aria-live="polite">{count === "loading" ? "Searching…" : count === null ? "" : `${count} result${count === 1 ? "" : "s"}`}</p>
    </header>
  );
}

async function Results({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  const q = parseQuery((await searchParams).q);
  if (!q.words.length) {
    return (
      <>
        <Head text={q.text} count={null} />
        <Empty title={q.text ? "Try something more specific." : "What are you looking for?"} text="Search by brand, model, frame code, colour or lens type." />
      </>
    );
  }
  const [frames, sunglasses, lenses] = await Promise.all([getCatalogue("frames"), getCatalogue("sunglasses"), getLenses()]);
  const found = { frames: searchFrames(frames, q), sunglasses: searchFrames(sunglasses, q), lenses: searchLenses(lenses, q) };
  const total = found.frames.length + found.sunglasses.length + found.lenses.length;
  return (
    <>
      <Head text={q.text} count={total} />
      {total === 0 ? (
        <Empty
          title={`No results for “${q.text}”.`}
          text="Check the spelling, use fewer words, or try a brand or a frame code. We may still have it in store."
          waText={`Hi VS Lens Mart, I'm looking for: ${q.text}`}
        />
      ) : (
        <>
          <FrameGroup id="frames" title="Frames" items={found.frames} all="/frames" query={q.text} />
          <FrameGroup id="sunglasses" title="Sunglasses" items={found.sunglasses} all="/sunglasses" query={q.text} />
          <LensGroup items={found.lenses} />
        </>
      )}
    </>
  );
}

function GroupHead({ id, title, n }: { id: string; title: string; n: number }) {
  return <h2 id={`results-${id}`}>{title} <span className="page-head__count">({n})</span></h2>;
}

function TooMany({ n, all, what }: { n: number; all: string; what: string }) {
  if (n <= GROUP_LIMIT) return null;
  return (
    <p className="results-foot">
      <span>Showing {GROUP_LIMIT} of {n}. Add a word, such as a brand, colour or shape, to narrow it down.</span>
      <Link className="link-arrow" href={all}>See all {what} <Icon name="arrow" /></Link>
    </p>
  );
}

function FrameGroup({ id, title, items, all, query }: { id: string; title: string; items: CatalogueItem[]; all: string; query: string }) {
  if (!items.length) return null;
  return (
    <section className="search-group" aria-labelledby={`results-${id}`}>
      <GroupHead id={id} title={title} n={items.length} />
      <FrameResults items={items.slice(0, GROUP_LIMIT)} query={query} />
      <TooMany n={items.length} all={all} what={title.toLowerCase()} />
    </section>
  );
}

function LensGroup({ items }: { items: LensItem[] }) {
  if (!items.length) return null;
  return (
    <section className="search-group" aria-labelledby="results-lenses">
      <GroupHead id="lenses" title="Lenses" n={items.length} />
      <div className="lens-grid">
        {items.slice(0, GROUP_LIMIT).map((l) => {
          const type = lensTypeName(l.type);
          const slug = LENS_TYPES.find((t) => t.id === l.type)?.slug ?? "";
          return (
            <article className="lcard" key={l.id}>
              <span className="caps lcard__brand">{l.brand}</span>
              <h3><Link href={`/lenses?brand=${l.brandSlug}&type=${slug}`}>{l.name}</Link></h3>
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
      <TooMany n={items.length} all="/lenses" what="lenses" />
    </section>
  );
}

function Empty({ title, text, waText }: { title: string; text: string; waText?: string }) {
  return (
    <div className="empty search-page__empty">
      <Icon name="search" />
      <h2>{title}</h2>
      <p>{text}</p>
      <div className="empty__actions">
        <Link className="btn btn--outline-dark" href="/frames">Frames</Link>
        <Link className="btn btn--outline-dark" href="/sunglasses">Sunglasses</Link>
        <Link className="btn btn--outline-dark" href="/lenses">Lenses</Link>
        {waText && <PickerButton kind="whatsapp" className="btn btn--primary" waText={waText}>Ask us on WhatsApp</PickerButton>}
      </div>
    </div>
  );
}
