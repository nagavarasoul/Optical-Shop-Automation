import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { GalleryWall, GalleryWallPlain } from "@/components/gallery/gallery-wall";
import { PickerButton } from "@/components/site/branch-picker";
import { Icon } from "@/components/site/icons";
import { getGallery } from "@/lib/content-data";
import { site } from "@/lib/site-config";
import { getBranches } from "@/lib/site-data";

export const metadata: Metadata = {
  title: { absolute: "Gallery | VS Lens Mart, Indresham and Patelguda" },
  description: "Inside VS Lens Mart: our shops, our team and our eye camps in Indresham and Patelguda.",
  alternates: { canonical: "/gallery" },
};

/* Gallery (Requirements_Gallery.md), from mockups/gallery.html. Photos come from
   the staff area; photos of people only with recorded permission. */
export default async function GalleryPage() {
  const [photos, branches] = await Promise.all([getGallery(), getBranches()]);
  return (
    <>
      <section className="hero hero--page" aria-labelledby="gallery-title">
        <div className="container hero__inner">
          <nav aria-label="Breadcrumb"><ol className="crumbs"><li><Link href="/">Home</Link></li><li><Link href="/about">About</Link></li><li aria-current="page">Gallery</li></ol></nav>
          <p className="eyebrow"><span>GALLERY</span></p>
          <h1 className="hero__title" id="gallery-title">Inside <span className="gold">VS Lens Mart.</span></h1>
          <p className="hero__sub">Our shops, our team and our eye camps, since {site.since}.</p>
        </div>
      </section>

      <section className="section" aria-label="Photos">
        <div className="container">
          {photos.length ? (
            <Suspense fallback={<GalleryWallPlain photos={photos} />}>
              <GalleryWall photos={photos} />
            </Suspense>
          ) : (
            <div className="empty">
              <Icon name="store" />
              <h2>Photos coming soon</h2>
              <p>Visit us at {branches.map((b) => b.name).join(" or ")}.</p>
              <div className="empty__actions"><Link className="btn btn--primary" href="/contact#branches">Find a branch</Link></div>
            </div>
          )}
          <p className="consent-note">
            <Icon name="shield" />
            <span>Photos of people are shared with their permission. Want a photo removed?</span>
            <PickerButton kind="whatsapp" waText="Hi VS Lens Mart, I'd like a photo removed from your gallery: ">Ask us on WhatsApp</PickerButton>
          </p>
        </div>
      </section>

      <section className="book-band" aria-labelledby="cta-title">
        <div className="container book-band__inner">
          <div>
            <h2 id="cta-title">See it for yourself</h2>
            <p>Visit us in {branches.map((b) => b.name).join(" or ")}, 7 days a week.</p>
          </div>
          <div className="hero__actions">
            <Link className="btn btn--navy" href="/contact#branches">Find a branch</Link>
            <Link className="btn btn--outline-dark" href="/book-eye-test">Book an eye test</Link>
          </div>
        </div>
      </section>
    </>
  );
}
