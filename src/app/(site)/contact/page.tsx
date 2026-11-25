import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BranchCard } from "@/components/contact/branch-card";
import { EnquiryForm, EnquiryFormPlain } from "@/components/contact/enquiry-form";
import { PickerButton } from "@/components/site/branch-picker";
import { Icon } from "@/components/site/icons";
import { Reveal } from "@/components/site/reveal";
import { hoursLine } from "@/components/site/site-chrome";
import { replyTime, shopEmail, time12 } from "@/lib/site-config";
import { getBranches, getClosures } from "@/lib/site-data";
import { storeData } from "@/lib/store-data";

export const metadata: Metadata = {
  title: { absolute: "Contact | VS Lens Mart, Indresham and Patelguda" },
  description: "Visit VS Lens Mart in Indresham or Patelguda, open 7 days. Call, WhatsApp or send us a message.",
  alternates: { canonical: "/contact" },
};

/* Contact (Requirements_Contact.md), from mockups/contact.html: hero, quick
   actions, both branches with maps, the enquiry form, FAQ and the book band.
   Every shop fact comes from the branches table. */

export default async function ContactPage() {
  const [branches, closures] = await Promise.all([getBranches(), getClosures()]);
  const hours = hoursLine(branches);
  const formProps = { branches, email: shopEmail, replyTime, hours };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(storeData(branches)).replace(/</g, "\\u003c") }} />

      <section className="hero hero--page" aria-labelledby="contact-title">
        <div className="container hero__inner">
          <nav aria-label="Breadcrumb"><ol className="crumbs"><li><Link href="/">Home</Link></li><li aria-current="page">Contact</li></ol></nav>
          <p className="eyebrow"><span>CONTACT</span></p>
          <h1 className="hero__title" id="contact-title">Visit us or <span className="gold">say hello.</span></h1>
          <p className="hero__sub">{branches.length === 2 ? "Two branches" : `${branches.length} branches`}, {hours.replace(/^Open/, "open")}.</p>
        </div>
      </section>

      <section className="quick" aria-label="Quick contact">
        <div className="container">
          <div className="quick__grid quick__grid--3">
            <PickerButton kind="whatsapp" className="quick__card">
              <span className="quick__icon"><Icon name="wa" /></span>
              <span><span className="quick__title">WhatsApp us</span><span className="quick__text">The quickest way to reach us.</span></span>
              <Icon name="arrow" />
            </PickerButton>
            <PickerButton kind="call" className="quick__card">
              <span className="quick__icon"><Icon name="phone" /></span>
              <span><span className="quick__title">Call us</span><span className="quick__text">Talk to the branch{branches[0] ? `, ${time12(branches[0].opens)}–${time12(branches[0].closes)}` : ""}.</span></span>
              <Icon name="arrow" />
            </PickerButton>
            <Link className="quick__card" href="/book-eye-test">
              <span className="quick__icon"><Icon name="eye" /></span>
              <span><span className="quick__title">Book an eye test</span><span className="quick__text">Pick a branch, a day and a time.</span></span>
              <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="branches-title" id="branches">
        <Reveal className="container">
          <div className="section__head">
            <div>
              <p className="caps section__eyebrow">Visit us</p>
              <h2 className="section__title" id="branches-title">Our branches</h2>
            </div>
          </div>
          <div className="branches">{branches.map((b) => <BranchCard key={b.slug} b={b} closures={closures} />)}</div>
        </Reveal>
      </section>

      <section className="section section--white" aria-labelledby="msg-title" id="message">
        <div className="container">
          <div className="section__head">
            <div>
              <p className="caps section__eyebrow">Write to us</p>
              <h2 className="section__title" id="msg-title">Send us a message</h2>
            </div>
          </div>
          {/* ?topic=&frame= apply as soon as the address is read */}
          <Suspense fallback={<EnquiryFormPlain {...formProps} />}>
            <EnquiryForm {...formProps} />
          </Suspense>
        </div>
      </section>

      <section className="section" aria-labelledby="faq-title" id="faq">
        <Reveal className="container">
          <div className="section__head"><div><h2 className="section__title" id="faq-title">Before you visit</h2></div></div>
          <div className="faq">
            <details><summary>Do I need an appointment?</summary><div className="faq__answer"><p>Booking a time means less waiting. You can <Link href="/book-eye-test">book an eye test online</Link> or on WhatsApp.</p></div></details>
            <details><summary>Can I get my frame repaired?</summary><div className="faq__answer"><p>Yes. Both branches do frame repairs and adjustments.</p></div></details>
            <details><summary>Do both branches have the same frames?</summary><div className="faq__answer"><p>Many frames are at both, but some are at one branch only. Each frame&apos;s page shows where it&apos;s available, or ask us before you visit.</p></div></details>
            <details><summary>How can I pay?</summary><div className="faq__answer"><p>Cash and UPI.</p></div></details>
          </div>
        </Reveal>
      </section>

      <section className="book-band" aria-labelledby="cta-title">
        <div className="container book-band__inner">
          <div>
            <h2 id="cta-title">Ready for an eye test?</h2>
            <p>It takes 5–20 minutes, at either branch.</p>
          </div>
          <div className="hero__actions">
            <Link className="btn btn--navy" href="/book-eye-test">Book an eye test</Link>
            <Link className="btn btn--outline-dark" href="/frames">Explore our frames</Link>
          </div>
        </div>
      </section>
    </>
  );
}
