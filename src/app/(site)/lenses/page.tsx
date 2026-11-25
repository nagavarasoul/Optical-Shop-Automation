import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LensCatalogue, LensCataloguePlain } from "@/components/lenses/lens-catalogue";
import { PickerButton } from "@/components/site/branch-picker";
import { Icon, type IconName } from "@/components/site/icons";
import { Reveal } from "@/components/site/reveal";
import { getLenses } from "@/lib/content-data";
import { LENS_TYPES } from "@/lib/lens-rules";

export const metadata: Metadata = {
  title: { absolute: "Lenses | All branded lenses at VS Lens Mart" },
  description: "Single vision, bifocal and progressive lenses from the brands you trust, tested and fitted in store at VS Lens Mart, Indresham and Patelguda.",
  alternates: { canonical: "/lenses" },
};

/* Lenses (Requirements_Lenses.md), from mockups/lenses.html. Types, brands and the
   catalogue come from active lenses in the database; a type or brand with none is
   left out, and with no lenses at all the page still explains the types. */
export default async function LensesPage() {
  const lenses = await getLenses();
  const types = LENS_TYPES.filter((t) => lenses.some((l) => l.type === t.id));
  const brands = [...new Map(lenses.map((l) => [l.brandSlug, l.brand])).entries()].map(([slug, name]) => ({ slug, name, n: lenses.filter((l) => l.brandSlug === slug).length }));
  const count = (id: string) => lenses.filter((l) => l.type === id).length;

  return (
    <>
      <section className="hero hero--page" aria-labelledby="lenses-title">
        <div className="container hero__inner">
          <nav aria-label="Breadcrumb"><ol className="crumbs"><li><Link href="/">Home</Link></li><li aria-current="page">Lenses</li></ol></nav>
          <p className="eyebrow"><span>LENSES</span></p>
          <h1 className="hero__title" id="lenses-title">All branded lenses, <span className="gold">fitted in store.</span></h1>
          <p className="hero__sub">Single vision, bifocal and progressive lenses from the brands you trust. We test your eyes, explain your options and fit your lenses at the branch.</p>
          <div className="hero__actions">
            <Link className="btn btn--primary" href="/book-eye-test">Book an eye test</Link>
            <PickerButton kind="whatsapp" className="btn btn--outline"><Icon name="wa" className="icon icon--sm" />Ask on WhatsApp</PickerButton>
          </div>
        </div>
      </section>

      {types.length > 0 && (
        <section className="section section--white" aria-labelledby="types-title" id="spectacle">
          <Reveal className="container">
            <div className="section__head"><div>
              <p className="caps section__eyebrow">Spectacle lenses</p>
              <h2 className="section__title" id="types-title">Which lens is which?</h2>
            </div></div>
            <div className="ltypes">
              {types.map((t) => (
                <article className="value ltype" key={t.id}>
                  <Icon name={t.icon as IconName} />
                  <h3>{t.name}</h3>
                  <p>{t.text}</p>
                  <Link className="link-arrow" href={`/lenses?type=${t.slug}#catalogue`} scroll={false}>See lenses ({count(t.id)}) <Icon name="arrow" /></Link>
                </article>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      <section className="section" aria-labelledby="how-title">
        <Reveal className="container">
          <div className="section__head"><div>
            <p className="caps section__eyebrow">Not sure which lens?</p>
            <h2 className="section__title" id="how-title">How we choose your lens</h2>
          </div></div>
          <ol className="steps-row">
            <li><h3>Eye test</h3><p>We check your eyes at the branch. <Link href="/book-eye-test">Book a time</Link></p></li>
            <li><h3>Your options</h3><p>We explain lens types, brands and prices for your power and daily use.</p></li>
            <li><h3>Fitting</h3><p>We fit your lenses in store. Spherical powers are fitted while you wait.</p></li>
          </ol>
        </Reveal>
      </section>

      {lenses.length > 0 && (
        <section className="section section--white" aria-labelledby="catalogue-title" id="catalogue">
          <div className="container">
            <div className="section__head"><div>
              <p className="caps section__eyebrow">Lens catalogue</p>
              <h2 className="section__title" id="catalogue-title">Lenses we fit</h2>
            </div></div>
            <Suspense fallback={<LensCataloguePlain lenses={lenses} />}>
              <LensCatalogue lenses={lenses} />
            </Suspense>
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="brands-title" id="brands">
        <Reveal className="container">
          <div className="section__head"><div>
            <p className="caps section__eyebrow">Brands</p>
            <h2 className="section__title" id="brands-title">All branded lenses available</h2>
          </div></div>
          {brands.length > 0 && (
            <div className="brand-tiles">
              {brands.map((b) => (
                <Link className="brand-tile" key={b.slug} href={`/lenses?brand=${b.slug}#catalogue`} scroll={false}>{b.name}<small>{b.n} lens{b.n === 1 ? "" : "es"}</small></Link>
              ))}
            </div>
          )}
        </Reveal>
      </section>

      <section className="section section--navy" aria-labelledby="fit-title">
        <Reveal className="container camp-band">
          <div>
            <h2 id="fit-title">Instant lens fitting</h2>
            <p>Spherical powers fitted while you wait, at both branches. For other powers we&apos;ll tell you when your glasses will be ready.</p>
          </div>
          <Link className="link-arrow" href="/contact#branches">Find a branch <Icon name="arrow" /></Link>
        </Reveal>
      </section>

      <section className="book-band" aria-labelledby="cta-title">
        <div className="container book-band__inner">
          <div>
            <h2 id="cta-title">Not sure which lens you need?</h2>
            <p>An eye test tells us your power. Then we&apos;ll show you the right lenses for your eyes and your budget.</p>
          </div>
          <div className="hero__actions">
            <Link className="btn btn--navy" href="/book-eye-test">Book an eye test</Link>
            <PickerButton kind="whatsapp" className="btn btn--outline-dark"><Icon name="wa" className="icon icon--sm" />Ask on WhatsApp</PickerButton>
          </div>
        </div>
      </section>
    </>
  );
}
