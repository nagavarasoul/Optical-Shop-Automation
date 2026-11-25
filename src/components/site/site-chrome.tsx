/* The public site's shared chrome (sprint 5.1), ported from the signed-off
   mockups: utility bar, header, phone sticky bar and footer. Shop facts come
   from the `branches` table (cached, src/lib/site-data.ts), never typed in. */
import Link from "next/link";
import type { Branch } from "@/lib/queries/site";
import { logo, site, socials, socialsDummy, time12 } from "@/lib/site-config";
import { getBranches, getMenu } from "@/lib/site-data";
import { accordionPanels } from "./accordion-panels";
import { PickerButton } from "./branch-picker";
import { DummyTag } from "./dummy-tag";
import { Icon } from "./icons";
import { FooterYear } from "./footer-year";
import { HideOn } from "./hide-on";
import { EyeCarePanel, FramesPanel, LensesPanel, SunglassesPanel } from "./mega-panels";
import { Nav } from "./nav";

/** "Open 7 days, 9 AM–9:30 PM" when every branch shares the hours, else a general line. */
export function hoursLine(branches: Branch[]): string {
  const [first] = branches;
  if (!first) return "";
  const same = branches.every((b) => b.opens === first.opens && b.closes === first.closes && b.openDays.length === first.openDays.length);
  const days = first.openDays.length === 7 ? "Open 7 days" : "Open";
  return same ? `${days}, ${time12(first.opens)}–${time12(first.closes)}` : "Open every day; hours vary by branch";
}

const tel = (n: string) => `tel:+91${n.replace(/\D/g, "")}`;
const shown = (b: Branch) => (b.dummy ? "+91 00000 00000" : b.phone);

export async function UtilityBar() {
  const branches = await getBranches();
  return (
    <div className="utility on-dark">
      <div className="container utility__inner">
        <ul className="utility__facts">
          <li className="utility__legacy">Since {site.since}</li>
          <li className="u-hours"><Icon name="clock" />{hoursLine(branches)}</li>
          {branches.map((b, i) => (
            <li className="u-phone" key={b.slug}>
              {i === 0 && <Icon name="phone" />}
              {/* A placeholder number never becomes a working link (DUMMY D2) */}
              {b.dummy ? (
                <><span>{b.name} <span className="u-num">{shown(b)}</span></span> <DummyTag id="D2" /></>
              ) : (
                <a href={tel(b.phone)}>{b.name} <span className="u-num">{shown(b)}</span></a>
              )}
            </li>
          ))}
          <li className="u-branches"><Icon name="pin" /><Link href="/contact#branches">{branches.length} branches</Link></li>
        </ul>
        <div className="utility__cta">
          <Link className="btn btn--primary btn--sm" href="/book-eye-test">Book an eye test</Link>
        </div>
      </div>
    </div>
  );
}

export async function SiteHeader() {
  const [menu, branches] = await Promise.all([getMenu(), getBranches()]);
  return (
    <Nav
      panels={{
        frames: <FramesPanel menu={menu} />,
        sunglasses: <SunglassesPanel menu={menu} />,
        lenses: <LensesPanel menu={menu} />,
        "eye-care": <EyeCarePanel />,
      }}
      accordion={accordionPanels(menu)}
      footNote={<>
        <span>Since {site.since} · {branches.map((b) => b.name).join(" and ")}</span>
        <span>{hoursLine(branches)}</span>
      </>}
    />
  );
}

export function StickyBar() {
  return (
    <HideOn paths={["/book-eye-test"]}>
    <div className="stickybar" role="navigation" aria-label="Quick actions">
      <div className="stickybar__inner">
        <PickerButton kind="call"><Icon name="phone" />Call</PickerButton>
        <PickerButton kind="whatsapp"><Icon name="wa" />WhatsApp</PickerButton>
        <Link className="stickybar__book" href="/book-eye-test"><Icon name="cal" />Book test</Link>
      </div>
    </div>
    </HideOn>
  );
}

const QUICK_LINKS = [
  ["Home", "/"], ["About us", "/about"], ["Frames", "/frames"], ["Sunglasses", "/sunglasses"], ["Lenses", "/lenses"],
  ["Book an eye test", "/book-eye-test"], ["Eye camps", "/eye-camps"], ["Gallery", "/gallery"], ["Contact", "/contact"],
] as const;

export async function SiteFooter() {
  const branches = await getBranches();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link className="brand" href="/" aria-label="VS Lens Mart, home">
              {/* eslint-disable-next-line @next/next/no-img-element -- small local SVG */}
              <img className="brand__mark" src={logo.src} alt="" width={52} height={52} />
              <span className="brand__text"><span className="brand__name"><b>VS</b> LENS MART</span><span className="brand__est">EST. {site.since}</span></span>
            </Link>
            <p>A family optical shop since {site.since}. {site.tagline}.</p>
            <div className="footer__social">
              {socials.map((s) => (
                <a key={s.name} href={s.url} aria-label={s.name} rel="noopener" target="_blank"><Icon name={s.icon} /></a>
              ))}
            </div>
            <p>{socialsDummy && <DummyTag id={socialsDummy} />} <DummyTag id={logo.dummy} /></p>
          </div>
          {branches.map((b) => (
            <div key={b.slug}>
              <h2>{b.name}</h2>
              <address>{b.address}</address>
              <ul style={{ marginTop: 12 }}>
                <li>{b.dummy ? <>{shown(b)} <DummyTag id="D2" /></> : <a href={tel(b.phone)}>{b.phone}</a>}</li>
                <li>{b.openDays.length === 7 ? "Mon–Sun" : b.openDays.join(", ")}, {time12(b.opens)}–{time12(b.closes)}</li>
              </ul>
            </div>
          ))}
          <div>
            <h2>Quick links</h2>
            <ul>
              {QUICK_LINKS.map(([label, href]) => <li key={href}><Link href={href} prefetch={false}>{label}</Link></li>)}
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© <FooterYear /> {site.name} · Since {site.since}</span>
          <Link href="/privacy">Privacy policy</Link>
        </div>
      </div>
    </footer>
  );
}
