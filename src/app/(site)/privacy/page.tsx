import type { Metadata } from "next";
import Link from "next/link";
import { PolicyContents } from "@/components/privacy/contents";
import { PickerButton } from "@/components/site/branch-picker";
import { DummyTag } from "@/components/site/dummy-tag";
import { Icon } from "@/components/site/icons";
import { privacyContact, privacyUpdated, retentionText, shopEmail, site, time12 } from "@/lib/site-config";
import { getBranches } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What VS Lens Mart's website collects, why, who can see it, how long it's kept, and how to ask for it to be corrected or deleted.",
  alternates: { canonical: "/privacy" },
};

/* Privacy policy (Requirements_Privacy.md), from mockups/privacy.html. Plain-English
   draft for the client's legal review before launch. Every item in "What we collect"
   must match a real form field or browser storage key: change this page before a new
   field or tracking tool goes live. The retention period and contact details come from
   the same settings the site uses (DUMMY D9, C23, D1). */

const SECTIONS: [string, string][] = [
  ["who", "Who we are"], ["collect", "What we collect, and why"], ["use", "How we use it"], ["share", "Who can see it"],
  ["keep", "How long we keep it"], ["rights", "Your rights"], ["children", "Children"], ["security", "Keeping it safe"],
  ["changes", "Changes to this policy"], ["contact", "Contact us"],
];
const updatedLabel = new Date(`${privacyUpdated}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default async function PrivacyPage() {
  const branches = await getBranches();
  const names = branches.map((b) => b.name).join(" and ");
  return (
    <>
      <section className="hero hero--page" aria-labelledby="privacy-title">
        <div className="container hero__inner">
          <nav aria-label="Breadcrumb"><ol className="crumbs"><li><Link href="/">Home</Link></li><li aria-current="page">Privacy</li></ol></nav>
          <p className="eyebrow"><span>PRIVACY</span></p>
          <h1 className="hero__title" id="privacy-title">Your details, <span className="gold">looked after.</span></h1>
          <p className="updated">Last updated: <time dateTime={privacyUpdated}>{updatedLabel}</time></p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="policy">
            <PolicyContents sections={SECTIONS} />
            <div>
              <div className="inshort" role="note" aria-labelledby="inshort-title">
                <h2 id="inshort-title">In short</h2>
                <ul>
                  <li>We only ask for your name and number when you book an eye test or send us a message.</li>
                  <li>We use them only to manage your booking or reply to you. No marketing, no selling.</li>
                  <li>Only our staff can see them.</li>
                  <li>We delete them after {retentionText}. <DummyTag id="D9" /></li>
                  <li>Ask us any time to see, correct or delete them.</li>
                </ul>
              </div>

              <div className="prose">
                <section aria-labelledby="who">
                  <h2 id="who">Who we are</h2>
                  <p>{site.name} is a family optical shop, looking after eyes since {site.since}, with branches in {names}. We decide how the details you give us on this website are used, and we&apos;re responsible for looking after them. <DummyTag id="C23" /></p>
                </section>

                <section aria-labelledby="collect">
                  <h2 id="collect">What we collect, and why</h2>
                  <div className="table-wrap">
                    <table className="ptable">
                      <thead><tr><th scope="col">When</th><th scope="col">What we collect</th><th scope="col">Why</th></tr></thead>
                      <tbody>
                        <tr><th scope="row">You book an eye test</th><td data-label="What we collect">Your name, mobile number, branch, date and time, who the test is for, your area or address and your note if you add them, and when you agreed to this policy</td><td data-label="Why">To hold your slot and contact you about it</td></tr>
                        <tr><th scope="row">You send us a message</th><td data-label="What we collect">Your name, mobile number, your area or address if you add it, branch, topic, message, how you&apos;d like us to reply, the frame code if you came from a frame, and when you agreed</td><td data-label="Why">To reply to you</td></tr>
                        <tr><th scope="row">You WhatsApp or call us</th><td data-label="What we collect">Whatever you choose to send us</td><td data-label="Why">To reply. WhatsApp is run by Meta under its own terms</td></tr>
                        <tr><th scope="row">You save favourites or pick light or dark mode</th><td data-label="What we collect">Nothing is sent to us. Your choices are saved only in your own browser (<code>vslm-favourites</code>, <code>vslm-theme</code>)</td><td data-label="Why">So the site remembers them on that device. Clear your browser data to remove them</td></tr>
                        <tr><th scope="row">Photos of people on our gallery and eye-camp pages</th><td data-label="What we collect">Photos only with that person&apos;s written permission</td><td data-label="Why">To show our shops and our community work</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <p><b>We don&apos;t collect</b> passwords or accounts (you don&apos;t log in), payment details, prescriptions, your email address or your location. There&apos;s no advertising and no visitor tracking on this website.</p>
                </section>

                <section aria-labelledby="use">
                  <h2 id="use">How we use it</h2>
                  <p>Only for the reason you gave it to us: to manage your booking or answer your message. We don&apos;t sell your details, use them for advertising or send you marketing messages. If we ever want to send reminders or offers, we&apos;ll ask you first.</p>
                </section>

                <section aria-labelledby="share">
                  <h2 id="share">Who can see it, and who helps us</h2>
                  <ul className="dots">
                    <li><b>Our staff.</b> Only signed-in {site.name} staff can see bookings and messages.</li>
                    <li><b>Companies that run the website for us</b> and store the details on our behalf: our website hosting provider, which also runs our database.</li>
                    <li><b>Google Maps.</b> The maps on our contact page come from Google. They load only when you scroll to them or tap &quot;Show map&quot;, and Google may then set its own cookies.</li>
                    <li><b>Anyone else</b> only if the law requires it.</li>
                  </ul>
                </section>

                <section aria-labelledby="keep">
                  <h2 id="keep">How long we keep it</h2>
                  <p>Booking and message details are deleted automatically <b>{retentionText}</b> after they&apos;re made. <DummyTag id="D9" /></p>
                </section>

                <section aria-labelledby="rights">
                  <h2 id="rights">Your rights</h2>
                  <p>Under the Digital Personal Data Protection Act, 2023, you can ask us to:</p>
                  <ul className="dots">
                    <li>tell you what details we hold about you;</li>
                    <li>correct or complete them;</li>
                    <li>delete them;</li>
                    <li>stop using them. Withdrawing your consent doesn&apos;t affect anything we did before you asked.</li>
                  </ul>
                  <p>You can also name someone to act for you if you&apos;re unable to.</p>
                  <p><b>How to ask:</b> WhatsApp or call either branch, email us, or visit a branch (see <a href="#contact">Contact us</a>). We&apos;ll reply within <b>{privacyContact.replyDays} days</b>. <DummyTag id="C23" /> If you&apos;re not happy with our answer, you can complain to the Data Protection Board of India.</p>
                </section>

                <section aria-labelledby="children">
                  <h2 id="children">Children</h2>
                  <p>Parents and guardians can book an eye test for a child using their own name and number. Please don&apos;t send us a child&apos;s details through the website beyond what&apos;s needed for the booking.</p>
                </section>

                <section aria-labelledby="security">
                  <h2 id="security">Keeping it safe</h2>
                  <p>The website uses a secure connection (HTTPS). Our forms can only add a booking or a message; nobody outside our staff can read them back. Staff sign in to see them, and we remove access when someone leaves.</p>
                </section>

                <section aria-labelledby="changes">
                  <h2 id="changes">Changes to this policy</h2>
                  <p>If we change this policy, we&apos;ll update this page and the &quot;Last updated&quot; date. Big changes, such as adding visitor statistics, will be shown on the website before they happen.</p>
                </section>

                <section aria-labelledby="contact">
                  <h2 id="contact">Contact us</h2>
                  <p>Questions about your details? Ask <b>{privacyContact.who}</b> <DummyTag id="C23" />, through any of these:</p>
                  <div className="pcontact">
                    <div className="cnote">
                      <h3>WhatsApp or call</h3>
                      <p>Either branch{branches[0] ? `, ${time12(branches[0].opens)}–${time12(branches[0].closes)}` : ""}{branches.every((b) => b.openDays.length === 7) ? ", every day" : ""}.</p>
                      <div className="branch__actions">
                        <PickerButton kind="whatsapp" className="btn btn--primary" waText="Hi VS Lens Mart, I have a question about my details on your website."><Icon name="wa" className="icon icon--sm" />WhatsApp</PickerButton>
                        <PickerButton kind="call" className="btn btn--outline-dark"><Icon name="phone" className="icon icon--sm" />Call</PickerButton>
                      </div>
                    </div>
                    <div className="cnote">
                      <h3>Email or visit</h3>
                      <p><a href={`mailto:${shopEmail}`}>{shopEmail}</a> <DummyTag id="D1" /></p>
                      <p>{branches.map((b, i) => <span key={b.slug}>{i > 0 && <br />}{b.name}: {b.address}.</span>)}</p>
                      <p><Link href="/contact#branches">Full addresses and maps</Link></p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
