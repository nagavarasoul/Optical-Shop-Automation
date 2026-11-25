import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PickerButton } from "@/components/site/branch-picker";
import { Icon } from "@/components/site/icons";
import { Reveal } from "@/components/site/reveal";
import { rupees } from "@/components/site/menu-links";
import { hoursLine } from "@/components/site/site-chrome";
import { getCatalogue, getFrame } from "@/lib/catalogue-data";
import type { CatalogueItem, FrameDetail, Kind } from "@/lib/queries/catalogue";
import { site } from "@/lib/site-config";
import { getBranches } from "@/lib/site-data";
import { CardRow, FavButton } from "./fav-button";
import { enquiryText, photoAlt } from "./frame-text";
import { Gallery } from "./gallery";

/* /frames/[slug] and /sunglasses/[slug] (Requirements_Frames.md 4,
   Requirements_Sunglasses.md 4), ported from mockups/frame-detail.html. Only
   approved, active frames have a page; anything else is a 404. */

const K = {
  frames: { list: "Frames", path: "/frames", many: "frames" },
  sunglasses: { list: "Sunglasses", path: "/sunglasses", many: "sunglasses" },
} as const;

/** Up to 4 live frames with the same shape (sunglasses: or a lens type) or brand; in stock first. */
function related(f: CatalogueItem, pool: CatalogueItem[]) {
  const close = (x: CatalogueItem) => x.shape === f.shape || x.lens.some((l) => f.lens.includes(l));
  return pool
    .filter((x) => x.code !== f.code && (close(x) || x.brand === f.brand))
    .sort((a, b) => Number(a.sold) - Number(b.sold) || Number(close(b)) - Number(close(a)))
    .slice(0, 4);
}

const pageUrl = (f: CatalogueItem) => `${site.url}${f.href}`;

function productData(f: FrameDetail) {
  return {
    "@context": "https://schema.org", "@type": "Product", name: `${f.brand} ${f.model}`, sku: f.code,
    brand: { "@type": "Brand", name: f.brand }, color: f.colour, ...(f.material ? { material: f.material } : {}),
    ...(f.photos.length ? { image: f.photos.map((p) => `${site.url}/media/${p.path}`) } : {}),
    offers: {
      "@type": "Offer", priceCurrency: "INR", price: f.price, url: pageUrl(f),
      availability: f.sold ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
  };
}

/** Title "Ray-Ban RB5154 Clubmaster · ₹6,490", description, and the first photo for link previews. */
export async function frameMetadata(kind: Kind, slug: string): Promise<Metadata> {
  const f = await getFrame(kind, slug);
  if (!f) return { title: kind === "sunglasses" ? "Sunglasses not available" : "Frame not available", robots: { index: false } };
  const name = `${f.brand} ${f.model}`;
  const title = `${name} · ${rupees(f.price)}`;
  const description = `${name}, ${f.colour.toLowerCase()} ${f.shape.toLowerCase()} ${kind === "sunglasses" ? "sunglasses" : "frame"}, ${rupees(f.price)} at VS Lens Mart. ${f.sold ? "Sold out." : `Available at ${f.where.toLowerCase()}.`}`;
  // This openGraph replaces the site's, so a frame with no photo yet names the site-wide image itself
  const image = f.photos[0]
    ? { url: `/media/${f.photos[0].path}`, alt: photoAlt(f) }
    : { url: "/opengraph-image", width: 1200, height: 630, alt: `${site.name}, family opticians since ${site.since}` };
  return {
    title, description, alternates: { canonical: f.href },
    openGraph: { title, description, url: f.href, type: "website", images: [image] },
  };
}

export async function FrameDetailPage({ kind, slug }: { kind: Kind; slug: string }) {
  const f = await getFrame(kind, slug);
  if (!f) notFound();
  const [pool, branches] = await Promise.all([getCatalogue(kind), getBranches()]);
  const sun = kind === "sunglasses";
  const k = K[kind];
  const name = `${f.brand} ${f.model}`;
  const price = rupees(f.price);
  const share = `Look at ${sun ? "these sunglasses" : "this frame"} at VS Lens Mart: ${name}, ${price}. ${pageUrl(f)}`;
  const more = related(f, pool);
  const branchNames = branches.map((b) => b.name).join(" and ");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productData(f)).replace(/</g, "\\u003c") }} />
      <div className="container">
        <nav aria-label="Breadcrumb" className="crumbs-nav">
          <ol className="crumbs"><li><Link href="/">Home</Link></li><li><Link href={k.path}>{k.list}</Link></li><li aria-current="page">{name}</li></ol>
        </nav>

        <div className="pdp">
          <Gallery photos={f.photos} name={name} alt={photoAlt(f)} sold={f.sold} />

          <div className="pinfo">
            <p className="caps pinfo__brand">{f.brand}</p>
            <h1>{f.model}</h1>
            <p className="pinfo__code">{sun ? "Code" : "Frame code"} {f.code}</p>
            <p className="pinfo__price">{price}<small>Exact in-store price</small></p>
            <div className="pstatus">
              {f.sold ? <span className="pill pill--sold">Sold out</span> : <span className="pill pill--stock">In stock</span>}
              {sun && f.lens.map((l) => <span className="pill" key={l}>{l}</span>)}
              <span className="pill"><Icon name="pin" />Available at: {f.where === "Both branches" ? branchNames || f.where : f.where}</span>
            </div>
            <div className="pactions">
              <PickerButton kind="whatsapp" className="btn btn--primary" waText={enquiryText(f)}>
                <Icon name="wa" className="icon icon--sm" />{f.sold ? `Ask about similar ${k.many}` : "Enquire on WhatsApp"}
              </PickerButton>
              <FavButton code={f.code} name={name} />
              <a className="icon-pill" href={`https://wa.me/?text=${encodeURIComponent(share)}`} target="_blank" rel="noopener noreferrer"
                aria-label={`Share ${sun ? "these sunglasses" : "this frame"} on WhatsApp`} title="Share on WhatsApp">
                <Icon name="share" />
              </a>
              <Link className="btn btn--outline-dark pactions__book" href="/book-eye-test">Book an eye test</Link>
            </div>

            <div className="specs">
              <h2>{sun ? "Sunglasses details" : "Frame details"}</h2>
              <dl>
                <dt>{sun ? "Code" : "Frame code"}</dt><dd>{f.code}</dd>
                <dt>Brand</dt><dd>{f.brand}</dd>
                <dt>Model</dt><dd>{f.model}</dd>
                {!sun && <><dt>Category</dt><dd>{f.category}</dd></>}
                <dt>Gender</dt><dd>{f.gender}</dd>
                <dt>Colour</dt><dd>{f.colour}</dd>
                <dt>Shape</dt><dd>{f.shape}</dd>
                {sun && f.lens.length > 0 && <><dt>Lens type</dt><dd>{f.lens.join(", ")}</dd></>}
                {sun && f.lensColour && <><dt>Lens colour</dt><dd>{f.lensColour}</dd></>}
                {f.material && <><dt>Material</dt><dd>{f.material}</dd></>}
                {f.size && <><dt>Size</dt><dd>{f.size} <span className="specs__unit">(lens–bridge–temple, mm)</span></dd></>}
              </dl>
            </div>

            <div className="note">
              <Icon name="lens" />
              {!sun ? (
                <div><b>Need prescription lenses?</b><p>All branded lenses are available. We fit them in store. <Link href="/lenses">See lenses</Link></p></div>
              ) : f.lens.includes("Power sunglasses") ? (
                <div><b>Made to your prescription</b><p>Power sunglasses are made to your prescription in store. Book an eye test first if you don’t have a recent prescription. <Link href="/book-eye-test">Book an eye test</Link></p></div>
              ) : (
                <div><b>Want this pair with your power?</b><p>Ask us on WhatsApp and we’ll tell you if these can be made with your prescription.</p></div>
              )}
            </div>
            <div className="note">
              <Icon name="store" />
              <div><b>Try it on at a branch</b><p>{branchNames}, {hoursLine(branches).replace(/^Open/, "open")}. <Link href="/contact#branches">Find a branch</Link></p></div>
            </div>
          </div>
        </div>
      </div>

      {more.length > 0 && (
        <section className="section section--white" aria-labelledby="related-title">
          <Reveal className="container" stagger>
            <div className="section__head">
              <div>
                <p className="caps section__eyebrow">You may also like</p>
                <h2 className="section__title" id="related-title">Similar {k.many}</h2>
              </div>
              <Link className="link-arrow" href={k.path}>View all {k.many} <Icon name="arrow" /></Link>
            </div>
            <CardRow items={more} />
          </Reveal>
        </section>
      )}
    </>
  );
}
