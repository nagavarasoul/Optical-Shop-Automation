/* Desktop mega-menu contents (Requirements_Navigation.md section 5), ported
   from the signed-off mockup. Server-rendered; nav.tsx shows and hides them.
   Brands and "from ₹" prices come from the database (approved, active rows).
   A column with nothing to show is left out, so the menu never says "₹0".
   Photo boxes stay as placeholders until the client sends real photos (no
   stock photos, no generated people); while developing, the Shop for tiles
   show the DUMMY C24 photos (src/lib/dummy-photos.ts), never in a build. The eye test is not called "free"
   until the client confirms (DUMMY D7). */
import Image from "next/image";
import Link from "next/link";
import { dummyPhoto, shopForPhoto } from "@/lib/dummy-photos";
import type { MenuData, PriceLink } from "@/lib/queries/site";
import { priceTiersDummy } from "@/lib/site-config";
import { DummyTag } from "./dummy-tag";
import { Icon, type IconName } from "./icons";
import { eyeCareServices, frameShapes, lensTypes, rupees, shopFor, sunglassLensTypes, sunglassShapes } from "./menu-links";

type L = { label: string; href: string };

function List({ items }: { items: L[] }) {
  return (
    <ul className="mega__list">
      {items.map((i) => (
        <li key={i.href}><Link href={i.href} prefetch={false}>{i.label}</Link></li>
      ))}
    </ul>
  );
}

function Prices({ items }: { items: PriceLink[] }) {
  return (
    <ul className="mega__list">
      {items.map((p) => (
        <li key={p.href}>
          <Link href={p.href} prefetch={false}>{p.label} <span className="mega__price">from {rupees(p.from)}</span></Link>
        </li>
      ))}
    </ul>
  );
}

function Col({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <div className="mega__col">
      <h3><Link href={href} prefetch={false}>{title}</Link></h3>
      {children}
    </div>
  );
}

function Tiles({ items }: { items: (L & { photo?: string | null })[] }) {
  return (
    <div className="tiles">
      {items.map((t) => (
        <Link key={t.href} className="tile" href={t.href} prefetch={false}>
          {t.photo ? <div className="tile__img"><Image src={t.photo} alt="" fill sizes="120px" /></div>
            : <div className="ph" aria-hidden="true" />}
          <span>{t.label}</span>
        </Link>
      ))}
    </div>
  );
}

function Foot({ note, href, label }: { note: string; href: string; label: string }) {
  return (
    <div className="mega__foot">
      <span className="card__text">{note}</span>
      <Link className="link-arrow" href={href} prefetch={false}>{label} <Icon name="arrow" /></Link>
    </div>
  );
}

const cols = (...widths: (string | false)[]) => ({ "--cols": widths.filter(Boolean).join(" ") }) as React.CSSProperties;

export function FramesPanel({ menu }: { menu: MenuData }) {
  const brands = menu.frameBrands.length > 0, prices = menu.framePrices.length > 0;
  return (
    <div className="container mega__inner">
      <div className="mega__grid" style={cols("1.5fr", "1fr", brands && "1fr", prices && "1.1fr")}>
        <Col title="Shop for" href="/frames"><Tiles items={shopFor("/frames").map((l) => ({ ...l, photo: shopForPhoto(l.label, "frames") }))} /></Col>
        <Col title="Shape" href="/frames"><List items={frameShapes} /></Col>
        {brands && (
          <Col title="Brands" href="/frames">
            <List items={menu.frameBrands.map((b) => ({ label: b.name, href: b.href }))} />
            <p style={{ marginTop: 12 }}><Link className="link-arrow" href="/frames#brands" prefetch={false}>All brands <Icon name="arrow" /></Link></p>
          </Col>
        )}
        {prices && (
          <Col title="Price range" href="/frames">
            <Prices items={menu.framePrices} />
            {priceTiersDummy && <p style={{ marginTop: 8 }}><DummyTag id={priceTiersDummy} /></p>}
          </Col>
        )}
      </div>
      <Foot note="Visit a branch for fitting and prescription." href="/frames" label="View all frames" />
    </div>
  );
}

export function SunglassesPanel({ menu }: { menu: MenuData }) {
  const prices = menu.sunglassPrices.length > 0;
  return (
    <div className="container mega__inner">
      <div className="mega__grid" style={cols("1.5fr", "1fr", "1fr", prices && "1.1fr")}>
        <Col title="Shop for" href="/sunglasses"><Tiles items={shopFor("/sunglasses").map((l) => ({ ...l, photo: shopForPhoto(l.label, "sunglasses") }))} /></Col>
        <Col title="Lens type" href="/sunglasses"><List items={sunglassLensTypes} /></Col>
        <Col title="Shape" href="/sunglasses"><List items={sunglassShapes} /></Col>
        {prices && (
          <Col title="Price range" href="/sunglasses">
            <Prices items={menu.sunglassPrices} />
            {priceTiersDummy && <p style={{ marginTop: 8 }}><DummyTag id={priceTiersDummy} /></p>}
          </Col>
        )}
      </div>
      <Foot note="Power sunglasses are made to your prescription." href="/sunglasses" label="View all sunglasses" />
    </div>
  );
}

export function LensesPanel({ menu }: { menu: MenuData }) {
  const brands = menu.lensBrands.length > 0;
  return (
    <div className="container mega__inner">
      <div className="mega__grid" style={cols("1fr", brands && "1fr", "1.4fr")}>
        <Col title="Spectacle lenses" href="/lenses#spectacle"><List items={lensTypes} /></Col>
        {brands && (
          <Col title="All branded lenses" href="/lenses#brands">
            <List items={menu.lensBrands.map((b) => ({ label: b.name, href: b.href }))} />
          </Col>
        )}
        <Col title="Not sure which lens?" href="/book-eye-test">
          <p className="card__text">Our optometrist checks your eyes and suggests the right lens for your power and daily use.</p>
          <p style={{ marginTop: 16 }}><Link className="link-arrow" href="/book-eye-test">Book an eye test <Icon name="arrow" /></Link></p>
        </Col>
      </div>
      <Foot note="All branded lenses available." href="/lenses" label="View all lenses" />
    </div>
  );
}

/** `photo`: the card's DUMMY C24 photo in public/dummy/naiv, shown only while developing. */
const careCards: { href: string; icon: IconName; title: string; text: string; photo: string }[] = [
  // Not "free" until the client confirms (DUMMY D7)
  { href: "/book-eye-test", icon: "eye", title: "Book an eye test", text: "Pick a branch, date and time. To reschedule, call or WhatsApp the branch.", photo: "Book-an-eyetest" },
  { href: "/contact#branches", icon: "store", title: "Our branches", text: "Indresham and Patelguda, open 7 days.", photo: "our-branches" },
  { href: "/eye-camps", icon: "camp", title: "Eye camps", text: "Upcoming camps near you, and photos from past ones.", photo: "eye-camps" },
];

export function EyeCarePanel() {
  return (
    <div className="container mega__inner">
      <div className="mega__grid" style={cols("1fr", "3.4fr")}>
        <Col title="Our services" href="/eye-care">
          <List items={eyeCareServices} />
          <p className="card__text" style={{ marginTop: 8 }}>At both branches.</p>
        </Col>
        <div className="cards">
          {careCards.map((c) => {
            const photo = dummyPhoto("naiv", c.photo);
            return (
            <Link key={c.href} className="card" href={c.href} prefetch={false}>
              {/* Photo placeholder until the client's photos arrive (a DUMMY photo while developing) */}
              {photo ? <div className="card__img"><Image src={photo} alt="" fill sizes="260px" /></div>
                : <div className="ph" aria-hidden="true"><Icon name={c.icon} className="icon icon--lg" /></div>}
              <span className="card__title">{c.title} <Icon name="arrow" /></span>
              <span className="card__text">{c.text}</span>
            </Link>
            );
          })}
        </div>
      </div>
      <Foot note="" href="/eye-care" label="Eye care tips and FAQ" />
    </div>
  );
}
