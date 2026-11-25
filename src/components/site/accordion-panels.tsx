/* Phone menu sections (Requirements_Navigation.md section 6): the mega-menu
   links stacked, as in the signed-off mockup's accordion. Same links and the
   same database rules as the desktop panels. */
import Link from "next/link";
import type { MenuData } from "@/lib/queries/site";
import { priceTiersDummy } from "@/lib/site-config";
import { DummyTag } from "./dummy-tag";
import { eyeCareServices, frameShapes, lensTypes, rupees, shopFor, sunglassLensTypes, sunglassShapes } from "./menu-links";

type L = { label: string; href: string };

function Group({ title, items, dummy }: { title: string; items: L[]; dummy?: boolean }) {
  if (!items.length) return null;
  return (
    <>
      <h4>{title} {dummy && priceTiersDummy && <DummyTag id={priceTiersDummy} />}</h4>
      {items.map((i) => <Link key={i.href} href={i.href} prefetch={false}>{i.label}</Link>)}
    </>
  );
}

function PriceGroup({ items }: { items: MenuData["framePrices"] }) {
  if (!items.length) return null;
  return (
    <>
      <h4>Price range {priceTiersDummy && <DummyTag id={priceTiersDummy} />}</h4>
      {items.map((p) => (
        <Link key={p.href} href={p.href} prefetch={false}>{p.label} <span className="mega__price">from {rupees(p.from)}</span></Link>
      ))}
    </>
  );
}

const All = ({ href, label }: L) => <Link className="acc__all" href={href} prefetch={false}>{label}</Link>;

export function accordionPanels(menu: MenuData) {
  return {
    frames: (
      <div className="acc__group">
        <Group title="Shop for" items={shopFor("/frames")} />
        <Group title="Shape" items={frameShapes} />
        <PriceGroup items={menu.framePrices} />
        <All href="/frames" label="View all frames" />
      </div>
    ),
    sunglasses: (
      <div className="acc__group">
        <Group title="Shop for" items={shopFor("/sunglasses")} />
        <Group title="Lens type" items={sunglassLensTypes} />
        <Group title="Shape" items={sunglassShapes} />
        <PriceGroup items={menu.sunglassPrices} />
        <All href="/sunglasses" label="View all sunglasses" />
      </div>
    ),
    lenses: (
      <div className="acc__group">
        <Group title="Spectacle lenses" items={lensTypes} />
        <Group title="All branded lenses" items={menu.lensBrands.map((b) => ({ label: b.name, href: b.href }))} />
        <All href="/book-eye-test" label="Not sure? Book an eye test" />
      </div>
    ),
    "eye-care": (
      <div className="acc__group">
        <Group title="Our services" items={eyeCareServices} />
        <Group title="More" items={[
          { label: "Book an eye test", href: "/book-eye-test" },
          { label: "Our branches", href: "/contact#branches" },
          { label: "Eye camps", href: "/eye-camps" },
        ]} />
        <All href="/eye-care" label="Eye care tips and FAQ" />
      </div>
    ),
  } as Record<string, React.ReactNode>;
}
