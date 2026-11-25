import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PickerButton } from "@/components/site/branch-picker";
import { DummyTag } from "@/components/site/dummy-tag";
import { Icon } from "@/components/site/icons";
import { CAMP_BRING, campIcs, campShareUrl, directionsUrl, longDate, timeRange } from "@/lib/camp-rules";
import { getCamp, getCamps } from "@/lib/content-data";
import { site } from "@/lib/site-config";
import { CampCard } from "./camp-card";
import { CampPhotos } from "./camp-photos";

/* Camp detail (Requirements_EyeCamps.md 4), from mockups/camp-detail.html. Only
   visible camps have a page; anything else shows "This camp isn't available". */

export async function campMetadata(slug: string): Promise<Metadata> {
  const c = await getCamp(slug);
  if (!c) return { title: "Camp not available", robots: { index: false } };
  return {
    title: { absolute: `${c.title}, ${longDate(c.day)} | VS Lens Mart eye camps` },
    description: `${c.title} on ${longDate(c.day)}, ${timeRange(c.starts, c.ends)}, at ${c.place}.`,
    alternates: { canonical: `/eye-camps/${c.slug}` },
  };
}

export async function CampDetailPage({ slug }: { slug: string }) {
  const c = await getCamp(slug);
  if (!c) notFound();
  const { upcoming, past } = await getCamps();
  const others = [...upcoming, ...past].filter((x) => x.slug !== c.slug).slice(0, 3);
  const upcomingSlugs = new Set(upcoming.map((x) => x.slug));
  const pageUrl = `${site.url}/eye-camps/${c.slug}`;
  // Event data for upcoming camps ("free" only once the client confirms)
  const event = c.upcoming && {
    "@context": "https://schema.org", "@type": "Event", name: c.title,
    startDate: `${c.day}T${c.starts}:00+05:30`, endDate: `${c.day}T${c.ends}:00+05:30`,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: c.place, address: c.place },
    organizer: { "@type": "Organization", name: site.name, url: site.url },
  };

  return (
    <>
      {event && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(event).replace(/</g, "\\u003c") }} />}
      <div className="container">
        <nav aria-label="Breadcrumb" className="crumbs-nav"><ol className="crumbs"><li><Link href="/">Home</Link></li><li><Link href="/eye-camps">Eye camps</Link></li><li aria-current="page">{c.title}</li></ol></nav>
        <header className="page-head">
          <span className={`status ${c.upcoming ? "status--upcoming" : "status--past"}`}>{c.upcoming ? "Upcoming" : "Past camp"}</span>
          <h1>{c.title}</h1>
          <div className="camp-facts">
            <span><Icon name="cal" /><time dateTime={c.day}>{longDate(c.day)}</time></span>
            <span><Icon name="clock" />{timeRange(c.starts, c.ends)}</span>
            <span><Icon name="pin" />{c.place}</span>
            {c.organisedWith && <span><Icon name="store" />With {c.organisedWith}</span>}
          </div>
        </header>
        <div className="camp-detail">
          <div className="camp-detail__main">
            <p>{c.description}</p>
            {c.upcoming ? (
              <>
                {c.offered.length > 0 && <div><h2>What&apos;s offered</h2><ul className="pill-list" style={{ marginTop: 12 }}>{c.offered.map((o) => <li key={o}>{o}</li>)}</ul></div>}
                <div><h2>What to bring</h2><p style={{ marginTop: 8 }}>{CAMP_BRING} <DummyTag id="C19" /></p></div>
                <div className="camp-actions">
                  <a className="btn btn--primary" href={directionsUrl(c.place)} target="_blank" rel="noopener noreferrer"><Icon name="pin" className="icon icon--sm" />Directions</a>
                  <a className="btn btn--outline-dark" href={campIcs(c)} download={`${c.slug}.ics`}><Icon name="cal" className="icon icon--sm" />Add to calendar</a>
                  <a className="btn btn--outline-dark" href={campShareUrl(c, pageUrl)} target="_blank" rel="noopener noreferrer"><Icon name="share" className="icon icon--sm" />Share on WhatsApp</a>
                </div>
                <p>Questions? <PickerButton kind="whatsapp" className="clear-all" waText={`Hi VS Lens Mart, I have a question about the ${c.title} on ${longDate(c.day)}.`}>Ask on WhatsApp</PickerButton></p>
              </>
            ) : (
              <>
                {c.photos.length > 0 && (
                  <div>
                    <h2>Photos</h2>
                    <p style={{ marginTop: 8 }}>Tap a photo to see it larger.</p>
                    <CampPhotos title={c.title} meta={longDate(c.day)} paths={c.photos.map((p) => p.path)} />
                  </div>
                )}
                <p>Thank you to everyone who came{c.organisedWith ? `, and to ${c.organisedWith} for helping us organise it` : ""}.</p>
              </>
            )}
          </div>
          <aside className="camp-side">
            {c.upcoming ? (
              <div className="value"><p>Walk in on the day: there&apos;s no need to register. Ask us on WhatsApp if you have a question.</p></div>
            ) : c.people != null ? (
              <div className="value"><span className="people-big">{c.people.toLocaleString("en-IN")}</span><p>people had their eyes checked at this camp.</p></div>
            ) : null}
          </aside>
        </div>
      </div>

      {others.length > 0 && (
        <section className="section section--white" aria-labelledby="more-title">
          <div className="container">
            <div className="section__head">
              <div><h2 className="section__title" id="more-title">More camps</h2></div>
              <Link className="link-arrow" href="/eye-camps">All eye camps <Icon name="arrow" /></Link>
            </div>
            <div className="past-grid">{others.map((x) => <CampCard key={x.slug} c={x} upcoming={upcomingSlugs.has(x.slug)} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}
