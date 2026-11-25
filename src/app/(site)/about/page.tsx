import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BranchCard } from "@/components/contact/branch-card";
import { PickerButton } from "@/components/site/branch-picker";
import { DummyTag } from "@/components/site/dummy-tag";
import { YearsSince } from "@/components/site/footer-year";
import { Icon } from "@/components/site/icons";
import { Reveal } from "@/components/site/reveal";
import { longDate } from "@/lib/camp-rules";
import { getCamps, getGallery, getTestimonials } from "@/lib/content-data";
import { site } from "@/lib/site-config";
import { getBranches, getClosures } from "@/lib/site-data";

export const metadata: Metadata = {
  title: { absolute: "About VS Lens Mart | Family opticians since 1999" },
  description: "VS Lens Mart is a family optical shop in Indresham and Patelguda, looking after eyes since 1999: our story, our team, our branches and what customers say.",
  alternates: { canonical: "/about" },
};

/* About (Requirements_About.md), from mockups/about.html. The founder story, the
   2010 / 2016 milestones, the Patelguda year and the team are DUMMY (C1–C3, C10,
   C15) until the client sends them; Dr. N. Venkateswarlu, on the prescription card,
   is never called the founder unless the client confirms it. Branches, gallery,
   reviews and the next camp come from the database; a section with nothing to show
   is left out. */
export default async function AboutPage() {
  const [branches, closures, photos, reviews, camps] = await Promise.all([getBranches(), getClosures(), getGallery(), getTestimonials(), getCamps()]);
  const names = branches.map((b) => b.name).join(" and ");
  const next = camps.upcoming[0];
  const org = {
    "@context": "https://schema.org", "@type": "Organization", name: site.name, url: site.url, foundingDate: String(site.since),
    slogan: site.tagline, address: branches.map((b) => ({ "@type": "PostalAddress", streetAddress: b.address, addressRegion: "Telangana", addressCountry: "IN" })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org).replace(/</g, "\\u003c") }} />
      <section className="hero hero--page" aria-labelledby="about-title">
        <div className="container hero__inner">
          <nav aria-label="Breadcrumb"><ol className="crumbs"><li><Link href="/">Home</Link></li><li aria-current="page">About</li></ol></nav>
          <p className="eyebrow"><span>OUR STORY</span></p>
          <h1 className="hero__title" id="about-title">A family that cares, <span className="gold">since {site.since}.</span></h1>
          <p className="hero__sub">For <YearsSince /> years, {site.name} has helped families in {names} see clearly. Honest advice, careful eye testing and frames for every budget.</p>
        </div>
      </section>

      <section className="section section--white" aria-labelledby="family-title" id="family">
        <Reveal className="container welcome">
          <div className="ph" aria-hidden="true"><Icon name="store" className="icon icon--lg" /></div>
          <div className="welcome__body">
            <p className="caps section__eyebrow">Our family</p>
            <h2 className="section__title" id="family-title">{site.tagline}</h2>
            <p>{site.name} was started in {site.since} by <strong>[Founder name]</strong> with one small counter in Indresham and a simple promise: honest advice and careful eye testing for every family. <DummyTag id="C1" /></p>
            <p>Over the years the shop grew with its customers, and in <strong>2022</strong> <DummyTag id="C3" /> opened its second branch in Patelguda. Today, three generations of customers still come back to us, and we still treat every one of them like family.</p>
            <figure className="pullquote">
              &ldquo;Every customer who walks in is family. That has been our promise since the first day.&rdquo;
              <figcaption>[Founder name], founder <DummyTag id="C2" /></figcaption>
            </figure>
          </div>
        </Reveal>
      </section>

      <section className="section" aria-labelledby="journey-title" id="journey">
        <Reveal className="container">
          <div className="section__head"><div>
            <p className="caps section__eyebrow">Since {site.since}</p>
            <h2 className="section__title" id="journey-title">Our journey</h2>
          </div></div>
          <ol className="timeline">
            <li><span className="timeline__year">{site.since}</span><div className="timeline__body"><h3>{site.name} opens</h3><p>One counter in Indresham, a few frames, and a promise of honest advice.</p></div></li>
            <li><span className="timeline__year">2010</span><div className="timeline__body"><h3>[Milestone]</h3><p>For example: new eye-testing equipment. <DummyTag id="C15" /></p></div></li>
            <li><span className="timeline__year">2016</span><div className="timeline__body"><h3>First community eye camp</h3><p>Free vision checks for neighbours who couldn&apos;t come to the shop. <DummyTag id="C15" /></p></div></li>
            <li><span className="timeline__year">2022</span><div className="timeline__body"><h3>Second branch in Patelguda</h3><p>Falcon One Shopping Plaza, near Ellenki College. <DummyTag id="C3" /></p></div></li>
            <li className="is-now"><span className="timeline__year">Today</span><div className="timeline__body"><h3>{branches.length === 2 ? "Two" : branches.length} branches, <YearsSince /> years</h3><p>Three generations of customers, all branded lenses and frames for every budget.</p></div></li>
          </ol>
        </Reveal>
      </section>

      <section className="section section--white" aria-labelledby="values-title">
        <Reveal className="container">
          <div className="section__head"><div>
            <p className="caps section__eyebrow">What we stand for</p>
            <h2 className="section__title" id="values-title">Trust, care and innovation</h2>
          </div></div>
          <div className="values">
            <article className="value"><Icon name="shield" /><h3>Trust</h3><p>Honest advice and the exact price on every frame. No surprises at the counter.</p></article>
            <article className="value"><Icon name="eye" /><h3>Care</h3><p>Careful eye testing, plus frame adjustment and repair whenever you need it.</p></article>
            <article className="value"><Icon name="lens" /><h3>Innovation</h3><p>All branded lenses, and instant lens fitting for spherical powers.</p></article>
          </div>
        </Reveal>
      </section>

      <section className="section" aria-labelledby="team-title" id="team">
        <Reveal className="container">
          <div className="section__head"><div>
            <p className="caps section__eyebrow">The people behind the counter</p>
            <h2 className="section__title" id="team-title">Our team</h2>
          </div></div>
          <div className="team">
            {[["Optometrist", "Eye tests at both branches."], ["Frame stylist", "Helps you find a frame that suits your face."], ["Branch manager", "Orders, fittings and everything in between."]].map(([role, text]) => (
              <article className="member" key={role}><div className="ph" aria-hidden="true"><Icon name="eye" className="icon icon--lg" /></div><h3>{role}</h3><p>{text}</p></article>
            ))}
          </div>
          <p style={{ marginTop: 16 }}><DummyTag id="C10" /></p>
        </Reveal>
      </section>

      <section className="section section--white" aria-labelledby="branches-title" id="branches">
        <Reveal className="container">
          <div className="section__head"><div>
            <p className="caps section__eyebrow">Visit us</p>
            <h2 className="section__title" id="branches-title">Our branches</h2>
          </div></div>
          <div className="branches">{branches.map((b) => <BranchCard key={b.slug} b={b} closures={closures} />)}</div>
        </Reveal>
      </section>

      {photos.length > 0 && (
        <section className="section" aria-labelledby="gallery-title" id="gallery">
          <Reveal className="container">
            <div className="section__head">
              <div>
                <p className="caps section__eyebrow">Gallery</p>
                <h2 className="section__title" id="gallery-title">Inside {site.name}</h2>
              </div>
              <Link className="link-arrow" href="/gallery">View the gallery <Icon name="arrow" /></Link>
            </div>
            <div className="gallery-grid">
              {photos.slice(0, 5).map((p, i) => (
                <Link className="gp-tile" key={p.id} href="/gallery" aria-label={`${p.caption}. View the gallery`}>
                  <Image src={`/media/${p.path}`} alt={p.caption} fill sizes={i === 0 ? "(min-width: 768px) 33vw, 100vw" : "(min-width: 768px) 33vw, 50vw"} />
                </Link>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {reviews.length > 0 && (
        <section className="section section--white" aria-labelledby="reviews-title" id="reviews">
          <Reveal className="container">
            <div className="section__head"><div>
              <p className="caps section__eyebrow">Reviews</p>
              <h2 className="section__title" id="reviews-title">What our customers say</h2>
            </div></div>
            <div className="reviews">
              {reviews.slice(0, 6).map((r) => (
                <figure className="review-card" key={r.id}>
                  <blockquote>&ldquo;{r.quote}&rdquo;</blockquote>
                  <footer>{r.firstName}{r.branch ? `, ${r.branch}` : ""}</footer>
                </figure>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      <section className="section section--navy" aria-labelledby="camp-title">
        <Reveal className="container camp-band">
          <div>
            <h2 id="camp-title">We give back. Free eye camps in our community.</h2>
            {next && <p>Next camp: {longDate(next.day)} · {next.branch ?? next.place}</p>}
          </div>
          <Link className="link-arrow" href={next ? "/eye-camps" : "/eye-camps#past"}>{next ? "See eye camps" : "See our past camps"} <Icon name="arrow" /></Link>
        </Reveal>
      </section>

      <section className="book-band" aria-labelledby="cta-title">
        <div className="container book-band__inner">
          <div>
            <h2 id="cta-title">Come and meet the family</h2>
            <p>Visit either branch, 7 days a week, or ask us anything on WhatsApp.</p>
          </div>
          <div className="hero__actions">
            <Link className="btn btn--navy" href="/book-eye-test">Book an eye test</Link>
            <PickerButton kind="whatsapp" className="btn btn--outline-dark"><Icon name="wa" className="icon icon--sm" />WhatsApp us</PickerButton>
          </div>
        </div>
      </section>
    </>
  );
}
