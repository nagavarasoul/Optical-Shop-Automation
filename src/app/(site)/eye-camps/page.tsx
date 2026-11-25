import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CampCard } from "@/components/camps/camp-card";
import { PastCamps, PastCampsPlain } from "@/components/camps/past-camps";
import { PickerButton } from "@/components/site/branch-picker";
import { Icon } from "@/components/site/icons";
import { campIcs, campShareUrl, directionsUrl, longDate, timeRange } from "@/lib/camp-rules";
import { getCamps } from "@/lib/content-data";
import { site } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Eye camps",
  description: "Free eye camps by VS Lens Mart in schools, villages and neighbourhoods around Indresham and Patelguda: the next camp and where we've been.",
  alternates: { canonical: "/eye-camps" },
};

/* Eye camps (Requirements_EyeCamps.md 3), from mockups/eye-camps.html. Walk-in,
   no registration (Q99). Upcoming or past comes from each camp's date. */
export default async function EyeCampsPage() {
  const { upcoming, past } = await getCamps();
  const next = upcoming[0];
  const people = past.reduce((n, c) => n + (c.people ?? 0), 0);
  const items = past.map((c) => ({ key: c.slug, year: c.day.slice(0, 4), card: <CampCard c={c} /> }));

  return (
    <>
      <section className="hero hero--page" aria-labelledby="camps-title">
        <div className="container hero__inner">
          <nav aria-label="Breadcrumb"><ol className="crumbs"><li><Link href="/">Home</Link></li><li aria-current="page">Eye camps</li></ol></nav>
          <p className="eyebrow"><span>IN THE COMMUNITY</span></p>
          <h1 className="hero__title" id="camps-title">Free eye camps, <span className="gold">close to home.</span></h1>
          <p className="hero__sub">Since {site.since} we&apos;ve taken eye checks to schools, villages and neighbourhoods around Indresham and Patelguda.</p>
          {past.length > 0 && <p className="camp-stat">{past.length} camp{past.length === 1 ? "" : "s"} · {people.toLocaleString("en-IN")} people checked</p>}
        </div>
      </section>

      <section className="section section--white" aria-labelledby="next-title" id="upcoming">
        <div className="container">
          <div className="section__head"><div>
            <p className="caps section__eyebrow">Upcoming</p>
            <h2 className="section__title" id="next-title">Next camp</h2>
          </div></div>
          {next ? (
            <article className="next-camp">
              <time className="datebox" dateTime={next.day}>
                <span>{longDate(next.day).split(",")[0]}</span>
                <b>{Number(next.day.slice(8))}</b>
                <span>{longDate(next.day).split(" ").slice(2).join(" ")}</span>
              </time>
              <div className="next-camp__body">
                <h3>{next.title}</h3>
                <div className="camp-facts">
                  <span><Icon name="cal" />{longDate(next.day)}</span>
                  <span><Icon name="clock" />{timeRange(next.starts, next.ends)}</span>
                  <span><Icon name="pin" />{next.place}</span>
                </div>
                <p>{next.description}</p>
                {next.offered.length > 0 && <ul className="pill-list" aria-label="What's offered">{next.offered.map((o) => <li key={o}>{o}</li>)}</ul>}
                <div className="camp-actions">
                  <a className="btn btn--primary" href={directionsUrl(next.place)} target="_blank" rel="noopener noreferrer"><Icon name="pin" className="icon icon--sm" />Directions</a>
                  <a className="btn btn--outline-dark" href={campIcs(next)} download={`${next.slug}.ics`}><Icon name="cal" className="icon icon--sm" />Add to calendar</a>
                  <a className="btn btn--outline-dark" href={campShareUrl(next, `${site.url}/eye-camps/${next.slug}`)} target="_blank" rel="noopener noreferrer"><Icon name="share" className="icon icon--sm" />Share on WhatsApp</a>
                  <Link className="link-arrow" href={`/eye-camps/${next.slug}`}>Details <Icon name="arrow" /></Link>
                </div>
              </div>
            </article>
          ) : (
            <div className="empty">
              <Icon name="camp" />
              <h2>No camps scheduled right now</h2>
              <p>Ask us on WhatsApp, or see our past camps below.</p>
              <div className="empty__actions"><PickerButton kind="whatsapp" className="btn btn--primary">Ask on WhatsApp</PickerButton></div>
            </div>
          )}
          {upcoming.length > 1 && (
            <div>
              <p className="caps section__eyebrow" style={{ margin: "32px 0 12px" }}>More upcoming camps</p>
              <div className="camp-rows">
                {upcoming.slice(1).map((c) => (
                  <Link className="camp-row" key={c.slug} href={`/eye-camps/${c.slug}`}>
                    <time dateTime={c.day}>{longDate(c.day)}</time>
                    <span><b>{c.title}</b><small>{c.place}</small></span>
                    <span className="link-arrow">Details <Icon name="arrow" /></span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {past.length > 0 && (
        <section className="section" aria-labelledby="past-title" id="past">
          <div className="container">
            <div className="section__head"><div>
              <p className="caps section__eyebrow">Past camps</p>
              <h2 className="section__title" id="past-title">Where we&apos;ve been</h2>
            </div></div>
            <Suspense fallback={<PastCampsPlain items={items} />}>
              <PastCamps items={items} />
            </Suspense>
          </div>
        </section>
      )}

      <section className="help-band" aria-labelledby="bring-title">
        <div className="container help-band__inner">
          <div>
            <h2 id="bring-title">Bring a camp to your community</h2>
            <p>Run a school, society or village group? We can bring an eye camp to you.</p>
          </div>
          <div className="help-band__actions">
            <PickerButton kind="whatsapp" className="btn btn--primary" waText="Hi VS Lens Mart, we'd like to organise an eye camp at "><Icon name="wa" className="icon icon--sm" />Ask on WhatsApp</PickerButton>
          </div>
        </div>
      </section>

      <section className="book-band" aria-labelledby="cta-title">
        <div className="container book-band__inner">
          <div>
            <h2 id="cta-title">Can&apos;t wait for the next camp?</h2>
            <p>Book an eye test at either branch, 7 days a week.</p>
          </div>
          <div className="hero__actions"><Link className="btn btn--navy" href="/book-eye-test">Book an eye test</Link></div>
        </div>
      </section>
    </>
  );
}
