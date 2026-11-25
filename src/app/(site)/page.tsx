import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BranchCard } from "@/components/contact/branch-card";
import { BookDate } from "@/components/home/book-date";
import { FeaturedFrames } from "@/components/home/featured-frames";
import { HeroSlides } from "@/components/home/hero-slides";
import { HomeNav } from "@/components/home/home-nav";
import { QuoteBand } from "@/components/home/quote-band";
import { PickerButton } from "@/components/site/branch-picker";
import { DummyTag } from "@/components/site/dummy-tag";
import { YearsSince } from "@/components/site/footer-year";
import { Icon, type IconName } from "@/components/site/icons";
import { Reveal } from "@/components/site/reveal";
import { hoursLine } from "@/components/site/site-chrome";
import { getCatalogue } from "@/lib/catalogue-data";
import { longDate, timeRange } from "@/lib/camp-rules";
import { getCamps, getLenses, getTestimonials } from "@/lib/content-data";
import { dummyPhoto, dummyPhotos, shopForPhoto } from "@/lib/dummy-photos";
import { EYE_TEST_FREE, site } from "@/lib/site-config";
import { getBranches, getClosures } from "@/lib/site-data";
import { storeJson } from "@/lib/store-data";

export const metadata: Metadata = {
  title: { absolute: "VS Lens Mart | Opticians in Indresham and Patelguda since 1999" },
  description: "VS Lens Mart, a family optical shop since 1999 in Indresham and Patelguda: frames, sunglasses, all branded lenses and eye testing. Open 7 days.",
  alternates: { canonical: "/" },
};

/** Label, link, placeholder icon, and its DUMMY C24 photo while developing. */
const categories = (): [string, string, IconName, string | null][] => [
  ["Men", "/frames?for=men", "glasses", shopForPhoto("Men", "frames")],
  ["Women", "/frames?for=women", "glasses", shopForPhoto("Women", "frames")],
  ["Kids", "/frames?for=kids", "glasses", shopForPhoto("Kids", "frames")],
  ["Sunglasses", "/sunglasses", "sun", dummyPhoto("naiv", "woman-sunglasses")],
];

/* Home (Requirements_HomePage.md), from the signed-off mockups/home.html.
   The hero's photos are DUMMY C12 (AI-generated people): a slideshow while
   developing, nothing in production, until the client's real shop photos arrive. The founder
   story is DUMMY (C1, C3), as on About. Category tiles wait for the client's
   product photos. Hours, branch names and numbers come from the database, and
   so do featured frames, lens brands, camps, reviews and branches: each of those
   sections is left out when it has nothing to show. */
export default async function HomePage() {
  const [branches, closures, frames, lenses, camps, reviews] = await Promise.all([
    getBranches(), getClosures(), getCatalogue("frames"), getLenses(), getCamps(), getTestimonials(),
  ]);
  const featured = frames.slice(0, 8);
  const lensBrands = [...new Set(lenses.map((l) => l.brand))].slice(0, 5);
  const next = camps.upcoming[0];
  const past = camps.past.slice(0, 4);
  const names = branches.map((b) => b.name);
  const hours = hoursLine(branches);
  const slides = dummyPhotos("hero"); // DUMMY C12, development only

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: storeJson(branches) }} />
      <HomeNav />
      <section className="hero hero--home" aria-labelledby="hero-title"
        style={slides[0] ? ({ "--hero-img": `url(${slides[0]})` } as CSSProperties) : undefined}>
        {slides.length > 0 && <HeroSlides srcs={slides} />}
        <div className="container hero__inner">
          <p className="eyebrow"><span>TRUST</span><i>/</i><span>CARE</span><i>/</i><span>INNOVATION</span></p>
          <h1 className="hero__title" id="hero-title">
            <span><YearsSince /> Years of Trust.</span>
            <span className="gold">A Clearer Vision</span>
            <span>for Tomorrow.</span>
          </h1>
          <p className="hero__sub">Premium eyewear, expert eye care and a commitment to your vision, for every generation.</p>
          <div className="hero__actions">
            <Link className="btn btn--primary" href="/frames">Explore our frames <Icon name="arrow" className="icon icon--sm" /></Link>
            <Link className="btn btn--outline" href="/book-eye-test">Book an eye test</Link>
          </div>
          <p className="caps hero__legacy">Since {site.since} · {names.join(" & ")} <DummyTag id="C12" /></p>
        </div>
      </section>

      <section className="quick" id="quick" aria-label="Quick contact">
        <div className="container">
          <div className="quick__grid">
            <PickerButton kind="whatsapp" className="quick__card">
              <span className="quick__icon"><Icon name="wa" /></span>
              <span><span className="quick__title">WhatsApp us</span><span className="quick__text">Ask about a frame, a lens or your order.</span></span>
              <Icon name="arrow" />
            </PickerButton>
            <Link className="quick__card" href="/contact#branches">
              <span className="quick__icon"><Icon name="store" /></span>
              <span><span className="quick__title">Visit a store</span><span className="quick__text">{names.join(" and ")}, {hours.charAt(0).toLowerCase() + hours.slice(1)}.</span></span>
              <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      <section className="trust" aria-label="Why VS Lens Mart">
        <div className="container">
          <ul className="trust__list">
            <li className="trust__item"><Icon name="shield" />Since {site.since}</li>
            <li className="trust__item"><Icon name="pin" />{branches.length} branches: {names.join(" & ")}</li>
            <li className="trust__item"><Icon name="lens" />All branded lenses</li>
            <li className="trust__item"><Icon name="clock" />{hours}</li>
          </ul>
        </div>
      </section>

      <section className="section section--white" aria-labelledby="welcome-title">
        <Reveal className="container welcome">
          <div className="ph" aria-hidden="true"><Icon name="store" className="icon icon--lg" /></div>
          <div className="welcome__body">
            <p className="caps section__eyebrow">Our story</p>
            <h2 className="section__title" id="welcome-title">{site.tagline}</h2>
            <p>{site.name} was started in {site.since} by <strong>[Founder name]</strong> with one small counter in Indresham and a simple promise: honest advice and careful eye testing for every family. Over the years the shop grew with its customers, and in <strong>2022</strong> opened its second branch in Patelguda. <DummyTag id="C1" /> <DummyTag id="C3" /></p>
            <p>Today, three generations of customers still come back to us, and we still treat every one of them like family.</p>
            <Link className="link-arrow" href="/about">Read our journey <Icon name="arrow" /></Link>
          </div>
        </Reveal>
      </section>

      <section className="section" aria-labelledby="cats-title">
        <Reveal className="container">
          <div className="section__head"><div>
            <p className="caps section__eyebrow">Shop by category</p>
            <h2 className="section__title" id="cats-title">Find your frame</h2>
          </div></div>
          <div className="cats">
            {categories().map(([label, href, icon, photo]) => (
              <Link className="cat" key={label} href={href}>
                {photo ? <div className="cat__img"><Image src={photo} alt="" fill sizes="(min-width: 768px) 25vw, 50vw" /></div>
                  : <div className="ph" aria-hidden="true"><Icon name={icon} className="icon icon--lg" /></div>}
                <span className="cat__name">{label} <Icon name="arrow" /></span>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      {featured.length > 0 && (
        <section className="section section--white" aria-labelledby="featured-title">
          <Reveal className="container">
            <div className="section__head">
              <div>
                <p className="caps section__eyebrow">New in store</p>
                <h2 className="section__title" id="featured-title">Featured frames</h2>
                <p className="section__lead">Premium frames at honest prices. Ask us on WhatsApp or try them on in store.</p>
              </div>
              <Link className="link-arrow" href="/frames">View all frames <Icon name="arrow" /></Link>
            </div>
            <FeaturedFrames items={featured} />
          </Reveal>
        </section>
      )}

      <section className="section" aria-labelledby="care-title">
        <Reveal className="container">
          <div className="section__head"><div>
            <p className="caps section__eyebrow">Lenses and eye care</p>
            <h2 className="section__title" id="care-title">Every lens, checked by experts</h2>
          </div></div>
          <div className="split">
            <div className="panel">
              <h3 className="panel__title">All branded lenses available</h3>
              <p>Single vision, bifocal and progressive lenses from the brands you trust, fitted to your prescription.</p>
              <ul className="pill-list" aria-label="Lens types"><li>Single vision</li><li>Bifocal</li><li>Progressive</li></ul>
              {lensBrands.length > 0 && <ul className="pill-list" aria-label="Lens brands">{lensBrands.map((b) => <li key={b}>{b}</li>)}</ul>}
              <Link className="link-arrow" href="/lenses">View lenses <Icon name="arrow" /></Link>
            </div>
            <div className="panel panel--navy">
              <h3 className="panel__title">Our services, at both branches</h3>
              <div className="services">
                <div className="service"><Icon name="eye" /><div><b>Eye testing</b><span>{EYE_TEST_FREE ? <>Free eye test <DummyTag id="D7" /> in</> : "Takes"} 5–20 minutes.</span></div></div>
                <div className="service"><Icon name="lens" /><div><b>Instant lens fitting</b><span>Spherical powers fitted while you wait.</span></div></div>
                <div className="service"><Icon name="adjust" /><div><b>Frame adjustment</b><span>A comfortable fit, any time you visit.</span></div></div>
                <div className="service"><Icon name="tool" /><div><b>Frame repair</b><span>Screws, nose pads and hinges fixed.</span></div></div>
              </div>
              <div><Link className="btn btn--primary" href="/book-eye-test">Book an eye test</Link></div>
            </div>
          </div>
        </Reveal>
      </section>

      {(next || past.length > 0) && (
        <section className="section section--white" aria-labelledby="camps-title">
          <Reveal className="container">
            <div className="section__head">
              <div>
                <p className="caps section__eyebrow">In the community</p>
                <h2 className="section__title" id="camps-title">Eye camps</h2>
              </div>
              <Link className="link-arrow" href="/eye-camps">All eye camps <Icon name="arrow" /></Link>
            </div>
            <div className={next && past.length ? "camps" : undefined}>
              {next && (
                <article className="camp-next">
                  <p className="caps">Next camp</p>
                  <p className="camp-next__date"><Icon name="cal" /><span><time dateTime={next.day}>{longDate(next.day)}</time> · {timeRange(next.starts, next.ends)}</span></p>
                  <h3>{next.title}</h3>
                  <p>{next.description}</p>
                  <Link className="link-arrow" href={`/eye-camps/${next.slug}`}>Details <Icon name="arrow" /></Link>
                </article>
              )}
              {past.length > 0 && (
                <div className="camp-past">
                  {past.map((c) => (
                    <figure key={c.slug}>
                      <Link className="camp-past__img" href={`/eye-camps/${c.slug}`} aria-label={`${c.title}: details`}>
                        {c.cover ? <Image src={`/media/${c.cover}`} alt={`${c.title}, ${longDate(c.day)}`} fill sizes="(min-width: 1024px) 280px, 50vw" />
                          : <span className="ph" aria-hidden="true"><Icon name="camp" /></span>}
                      </Link>
                      <figcaption>{c.title} · {longDate(c.day).slice(5)}{c.people != null ? ` · ${c.people.toLocaleString("en-IN")} people checked` : ""}</figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        </section>
      )}

      <QuoteBand />

      {reviews.length > 0 && (
        <section className="section" aria-labelledby="reviews-title">
          <Reveal className="container">
            <div className="section__head">
              <div>
                <p className="caps section__eyebrow">Reviews</p>
                <h2 className="section__title" id="reviews-title">What our customers say</h2>
              </div>
              <Link className="link-arrow" href="/about#reviews">Read more reviews <Icon name="arrow" /></Link>
            </div>
            <div className="reviews">
              {reviews.slice(0, 3).map((r) => (
                <figure className="review-card" key={r.id}>
                  <blockquote>&ldquo;{r.quote}&rdquo;</blockquote>
                  <footer>{r.firstName}{r.branch ? `, ${r.branch}` : ""}</footer>
                </figure>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      <section className="section section--white" aria-labelledby="branches-title" id="branches">
        <Reveal className="container">
          <div className="section__head"><div>
            <p className="caps section__eyebrow">Visit us</p>
            <h2 className="section__title" id="branches-title">Our branches</h2>
          </div></div>
          <div className="branches">{branches.map((b) => <BranchCard key={b.slug} b={b} closures={closures} />)}</div>
        </Reveal>
      </section>

      <section className="book-band" aria-labelledby="book-title">
        <div className="container book-band__inner">
          <div>
            <h2 id="book-title">Book your eye test</h2>
            <p>Choose a branch and a day. You&apos;ll pick a time on the next step.</p>
          </div>
          {/* Hands the branch and day to the booking page; nothing is saved here */}
          <form className="book-form" action="/book-eye-test" method="get">
            <label className="field">Branch
              <select name="branch" required>{branches.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}</select>
            </label>
            <label className="field">Preferred date
              <BookDate />
            </label>
            <button className="btn btn--navy" type="submit">Continue <Icon name="arrow" className="icon icon--sm" /></button>
          </form>
        </div>
      </section>
    </>
  );
}
