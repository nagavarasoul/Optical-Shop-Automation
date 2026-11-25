import type { Metadata } from "next";
import Link from "next/link";
import { PickerButton } from "@/components/site/branch-picker";
import { DummyTag } from "@/components/site/dummy-tag";
import { Icon, type IconName } from "@/components/site/icons";
import { Reveal } from "@/components/site/reveal";
import { EYE_TEST_FREE } from "@/lib/site-config";
import { getBranches } from "@/lib/site-data";

export const metadata: Metadata = {
  title: { absolute: "Eye care and eye testing | VS Lens Mart, Indresham and Patelguda" },
  description: "Eye testing, instant lens fitting, frame adjustment and repair at both VS Lens Mart branches, 7 days a week.",
  alternates: { canonical: "/eye-care" },
};

/* Eye care (Requirements_EyeCare.md), from mockups/eye-care.html. Services are the
   client's (Q92). The eye-test steps, "when to get checked" and tips are DUMMY C17
   until the shop's optometrist approves them; the safety note always shows. */

// Every answer is marked: confirmed ones go into the FAQ data for search engines, the rest don't
const FAQ: { q: string; a: React.ReactNode; text: string; confirmed: boolean; tag?: "D7" | "C17" }[] = [
  { q: "How long does an eye test take?", a: "Usually 5 to 20 minutes.", text: "Usually 5 to 20 minutes.", confirmed: true },
  ...(EYE_TEST_FREE ? [{ q: "Is the eye test free?", a: "Yes, free at both branches.", text: "Yes, free at both branches.", confirmed: false, tag: "D7" as const }] : []),
  { q: "Do I need an appointment?", a: <>Booking a time means less waiting. You can <Link href="/book-eye-test">book online</Link> or on WhatsApp.</>, text: "Booking a time means less waiting. You can book online or on WhatsApp.", confirmed: false },
  { q: "How soon can I get my glasses?", a: "Spherical powers are fitted while you wait. For other powers we'll tell you the date when you order.", text: "Spherical powers are fitted while you wait. For other powers we'll tell you the date when you order.", confirmed: true },
  { q: "Which lens brands do you have?", a: <>All branded lenses are available. <Link href="/lenses">See lenses</Link></>, text: "All branded lenses are available.", confirmed: true },
  { q: "Can you repair my frame?", a: "Yes, at both branches: screws, nose pads, hinges and adjustments.", text: "Yes, at both branches: screws, nose pads, hinges and adjustments.", confirmed: true },
  { q: "How can I pay?", a: "Cash or UPI.", text: "Cash or UPI.", confirmed: true },
  { q: "Can I use a prescription from another doctor?", a: "Bring it with you and we'll check it.", text: "Bring it with you and we'll check it.", confirmed: false },
];

const TIPS: [IconName, string, string][] = [
  ["clock", "Take screen breaks", "Look away from the screen every so often and rest your eyes."],
  ["sun", "Read in good light", "Use bright, even light for reading and close work."],
  ["glasses", "Wear sunglasses in bright sun", "Shade your eyes outdoors on bright days."],
  ["lens", "Keep your glasses clean", "Clean lenses with a soft cloth, not your shirt."],
  ["shield", "Regular check-ups", "Children and older family members benefit from regular eye tests."],
  ["eye", "Don't ignore changes", "If your vision changes, come in for a test."],
];

export default async function EyeCarePage() {
  const branches = await getBranches();
  const names = branches.map((b) => b.name).join(" and ");
  const faqData = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: FAQ.filter((f) => f.confirmed).map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.text } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData).replace(/</g, "\\u003c") }} />
      <section className="hero hero--page" aria-labelledby="care-title">
        <div className="container hero__inner">
          <nav aria-label="Breadcrumb"><ol className="crumbs"><li><Link href="/">Home</Link></li><li aria-current="page">Eye care</li></ol></nav>
          <p className="eyebrow"><span>EYE CARE</span></p>
          <h1 className="hero__title" id="care-title">Eye care for the <span className="gold">whole family.</span></h1>
          <p className="hero__sub">Eye testing, instant lens fitting, frame adjustment and repair, at both our branches, 7 days a week.</p>
          <div className="hero__actions">
            <Link className="btn btn--primary" href="/book-eye-test">Book an eye test</Link>
            <PickerButton kind="whatsapp" className="btn btn--outline"><Icon name="wa" className="icon icon--sm" />Ask on WhatsApp</PickerButton>
          </div>
        </div>
      </section>

      <section className="section section--white" aria-labelledby="services-title">
        <Reveal className="container">
          <div className="section__head"><div>
            <p className="caps section__eyebrow">Our services</p>
            <h2 className="section__title" id="services-title">At both branches, 7 days a week</h2>
          </div></div>
          <div className="services-grid">
            <article className="svc" id="eye-testing">
              <span className="svc__icon"><Icon name="eye" /></span>
              <div className="svc__body">
                <h3>Eye testing</h3>
                <p>A careful eye test takes 5–20 minutes. We check your distance and near vision and explain your prescription.</p>
                <div className="svc__meta"><span className="pill"><Icon name="clock" />5–20 minutes</span>{EYE_TEST_FREE && <span className="pill">Free <DummyTag id="D7" /></span>}</div>
                <div className="svc__actions"><Link className="btn btn--primary" href="/book-eye-test">Book an eye test</Link></div>
              </div>
            </article>
            <article className="svc" id="lens-fitting">
              <span className="svc__icon"><Icon name="lens" /></span>
              <div className="svc__body">
                <h3>Instant lens fitting</h3>
                <p>Spherical powers fitted while you wait. For other powers we&apos;ll tell you when your glasses will be ready.</p>
                <div className="svc__actions"><Link className="link-arrow" href="/lenses">See lenses <Icon name="arrow" /></Link></div>
              </div>
            </article>
            <article className="svc" id="frame-adjustment">
              <span className="svc__icon"><Icon name="adjust" /></span>
              <div className="svc__body">
                <h3>Frame adjustment</h3>
                <p>Glasses slipping or pressing? We adjust them for a comfortable fit.</p>
                <div className="svc__actions"><Link className="link-arrow" href="/contact#branches">Visit a branch <Icon name="arrow" /></Link></div>
              </div>
            </article>
            <article className="svc" id="frame-repair">
              <span className="svc__icon"><Icon name="tool" /></span>
              <div className="svc__body">
                <h3>Frame repair</h3>
                <p>Loose screws, nose pads and hinges fixed. Ask us about your frame.</p>
                <div className="svc__actions"><PickerButton kind="whatsapp" className="btn btn--outline-dark" waText="Hi VS Lens Mart, can you repair my frame?"><Icon name="wa" className="icon icon--sm" />Ask about a repair</PickerButton></div>
              </div>
            </article>
          </div>
        </Reveal>
      </section>

      <section className="section" aria-labelledby="test-title" id="eye-test">
        <Reveal className="container">
          <div className="section__head"><div>
            <p className="caps section__eyebrow">Your eye test</p>
            <h2 className="section__title" id="test-title">What happens at your eye test</h2>
          </div></div>
          <ol className="steps-row" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))" }}>
            <li><h3>We talk</h3><p>We ask about your eyes, your work and any glasses you use now.</p></li>
            <li><h3>We test</h3><p>We check your vision for distance and near.</p></li>
            <li><h3>We explain</h3><p>We explain your prescription in plain words.</p></li>
            <li><h3>You choose</h3><p>We help you choose lenses and frames, with exact prices.</p></li>
          </ol>
          <p style={{ marginTop: 16, color: "var(--text-muted)" }}>Bring your current glasses and any old prescription. <DummyTag id="C17" /></p>
        </Reveal>
      </section>

      <section className="section section--white" aria-labelledby="when-title" id="when">
        <Reveal className="container">
          <div className="section__head"><div>
            <p className="caps section__eyebrow">Good to know</p>
            <h2 className="section__title" id="when-title">When to get your eyes checked</h2>
          </div></div>
          <div className="when">
            <div>
              <ul className="checklist">
                <li>Distance or reading looks blurred</li>
                <li>Headaches after reading or screen work</li>
                <li>You find yourself squinting</li>
                <li>It&apos;s been a while since your last eye test</li>
                <li>A child holds books or phones very close</li>
              </ul>
              <p style={{ marginTop: 12 }}><DummyTag id="C17" /></p>
            </div>
            <aside className="alert" role="note" aria-label="When to see a doctor">
              <Icon name="alert" />
              <div><b>Need urgent help?</b><p>Sudden loss of vision, eye pain, flashes of light or an eye injury? See a doctor or hospital straight away.</p></div>
            </aside>
          </div>
        </Reveal>
      </section>

      <section className="section" aria-labelledby="tips-title" id="tips">
        <Reveal className="container">
          <div className="section__head"><div>
            <p className="caps section__eyebrow">Everyday habits</p>
            <h2 className="section__title" id="tips-title">Eye care tips</h2>
          </div></div>
          <div className="tips">
            {TIPS.map(([icon, title, text]) => <article className="value tip" key={title}><Icon name={icon} /><h3>{title}</h3><p>{text}</p></article>)}
          </div>
          <p className="disclaimer">General information only, not medical advice. <DummyTag id="C17" /></p>
        </Reveal>
      </section>

      <section className="section section--white" aria-labelledby="faq-title" id="faq">
        <Reveal className="container">
          <div className="section__head"><div>
            <p className="caps section__eyebrow">Questions</p>
            <h2 className="section__title" id="faq-title">Frequently asked questions</h2>
          </div></div>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q}><summary>{f.q}</summary><div className="faq__answer"><p>{f.a}{f.tag && <> <DummyTag id={f.tag} /></>}</p></div></details>
            ))}
          </div>
          <p className="disclaimer">General information only, not medical advice.</p>
        </Reveal>
      </section>

      <section className="section" aria-label="Quick links">
        <Reveal className="container">
          <div className="cards">
            <Link className="card" href="/book-eye-test">
              <div className="ph" aria-hidden="true"><Icon name="eye" className="icon icon--lg" /></div>
              <span className="card__title">Book an eye test <Icon name="arrow" /></span>
              <span className="card__text">Pick a branch, date and time.</span>
            </Link>
            <Link className="card" href="/contact#branches">
              <div className="ph" aria-hidden="true"><Icon name="store" className="icon icon--lg" /></div>
              <span className="card__title">Our branches <Icon name="arrow" /></span>
              <span className="card__text">{names}, open 7 days.</span>
            </Link>
            <Link className="card" href="/eye-camps">
              <div className="ph" aria-hidden="true"><Icon name="camp" className="icon icon--lg" /></div>
              <span className="card__title">Eye camps <Icon name="arrow" /></span>
              <span className="card__text">Upcoming camps near you, and photos from past ones.</span>
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="book-band" aria-labelledby="cta-title">
        <div className="container book-band__inner">
          <div>
            <h2 id="cta-title">Book your eye test today</h2>
            <p>It takes 5–20 minutes, at either branch, 7 days a week.</p>
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
