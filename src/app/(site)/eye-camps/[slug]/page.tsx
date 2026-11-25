import type { Metadata } from "next";
import { campMetadata, CampDetailPage } from "@/components/camps/camp-detail";
import { getCampSlugs } from "@/lib/content-data";

// A blocking route, like the frame pages: visible camps are pre-rendered; a hidden or
// unknown camp shows the not-available page with "noindex".
export const instant = false;

export async function generateStaticParams() {
  const slugs = await getCampSlugs();
  // Cache Components needs at least one; "none" is simply not available
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "none" }];
}

export async function generateMetadata({ params }: PageProps<"/eye-camps/[slug]">): Promise<Metadata> {
  return campMetadata((await params).slug);
}

export default async function Page({ params }: PageProps<"/eye-camps/[slug]">) {
  return <CampDetailPage slug={(await params).slug} />;
}
