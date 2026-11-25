import Link from "next/link";
import { Suspense } from "react";
import { PickerButton } from "@/components/site/branch-picker";
import { Icon } from "@/components/site/icons";
import { Reveal } from "@/components/site/reveal";
import { getCatalogue } from "@/lib/catalogue-data";
import type { Kind } from "@/lib/queries/catalogue";
import { Listing, ListingUnfiltered } from "./listing";

/* /frames and /sunglasses (mockups/frames.html, sunglasses.html): breadcrumb,
   the listing, and the help band. The words that differ are here. */
const TEXT: Record<Kind, { title: string; intro: string; help: string; helpText: string; second: { href: string; label: string } }> = {
  frames: {
    title: "Frames",
    intro: "Premium frames at honest prices. Every price is the exact in-store price.",
    help: "Not sure what suits you?",
    helpText: "Visit a branch to try frames on, or ask us on WhatsApp.",
    second: { href: "/contact#branches", label: "Visit a branch" },
  },
  sunglasses: {
    title: "Sunglasses",
    intro: "Sunglasses for every face, at honest prices. Ask about power sunglasses made to your prescription.",
    help: "Need power sunglasses?",
    helpText: "We make them to your prescription. Book an eye test, or ask us on WhatsApp.",
    second: { href: "/book-eye-test", label: "Book an eye test" },
  },
};

export async function CataloguePage({ kind }: { kind: Kind }) {
  const items = await getCatalogue(kind);
  const t = TEXT[kind];
  const props = { kind, items, title: t.title, intro: t.intro };
  return (
    <>
      <div className="container">
        <nav aria-label="Breadcrumb" className="crumbs-nav"><ol className="crumbs"><li><Link href="/">Home</Link></li><li aria-current="page">{t.title}</li></ol></nav>
        {/* Pre-rendered unfiltered; the filters from the address apply as soon as it's read */}
        <Suspense fallback={<ListingUnfiltered {...props} />}>
          <Listing {...props} />
        </Suspense>
      </div>

      <section className="help-band" aria-labelledby="help-title">
        <Reveal className="container help-band__inner">
          <div>
            <h2 id="help-title">{t.help}</h2>
            <p>{t.helpText}</p>
          </div>
          <div className="help-band__actions">
            <PickerButton kind="whatsapp" className="btn btn--primary"><Icon name="wa" className="icon icon--sm" />Ask on WhatsApp</PickerButton>
            <Link className="btn btn--outline" href={t.second.href}>{t.second.label}</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
