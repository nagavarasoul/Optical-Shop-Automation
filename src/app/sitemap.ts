import type { MetadataRoute } from "next";
import { getLiveSlugs } from "@/lib/catalogue-data";
import { getCampSlugs } from "@/lib/content-data";
import { site } from "@/lib/site-config";

/* sitemap.xml for search engines (sprint 5.6 part C; Requirements_Navigation.md
   "Search engines"): the public pages, every live frame and pair of
   sunglasses, and every visible eye camp. Never the staff area, search
   results or not-found pages. Built from the same cached public lists as the
   pages (tags "catalogue" and "content"), so a staff save updates it too.
   The address is DUMMY D4 until the domain is bought. */
const PAGES = ["/", "/about", "/frames", "/sunglasses", "/lenses", "/eye-care", "/book-eye-test", "/eye-camps", "/gallery", "/contact", "/privacy"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [frames, sunglasses, camps] = await Promise.all([getLiveSlugs("frames"), getLiveSlugs("sunglasses"), getCampSlugs()]);
  const paths = [
    ...PAGES,
    ...frames.map((s) => `/frames/${s}`),
    ...sunglasses.map((s) => `/sunglasses/${s}`),
    ...camps.map((s) => `/eye-camps/${s}`),
  ];
  return paths.map((p) => ({ url: new URL(p, site.url).toString() }));
}
