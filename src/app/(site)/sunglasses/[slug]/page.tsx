import type { Metadata } from "next";
import { frameMetadata, FrameDetailPage } from "@/components/catalogue/frame-detail";
import { getLiveSlugs } from "@/lib/catalogue-data";

// A blocking route (no loading placeholder): live frames are pre-rendered, so
// opening them is quick anyway. A missing frame shows the not-found page with
// "noindex"; the production server streams it, so its status is 200.
export const instant = false;

// Pre-rendered from the database. Frames approved later render on first visit
// and are then kept; a staff save refreshes them (tag "catalogue").
export async function generateStaticParams() {
  const slugs = await getLiveSlugs("sunglasses");
  // Cache Components needs at least one; "none" is simply a 404
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "none" }];
}

export async function generateMetadata({ params }: PageProps<"/sunglasses/[slug]">): Promise<Metadata> {
  return frameMetadata("sunglasses", (await params).slug);
}

export default async function Page({ params }: PageProps<"/sunglasses/[slug]">) {
  return <FrameDetailPage kind="sunglasses" slug={(await params).slug} />;
}
