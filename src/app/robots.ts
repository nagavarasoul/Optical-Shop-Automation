import type { MetadataRoute } from "next";
import { site } from "@/lib/site-config";

/* The staff area and the auth API are never crawled (Requirements_Admin.md
   section 3); search results are marked noindex on the page itself, which
   only works if crawlers may open it. The sitemap address is DUMMY D4 until
   the domain is bought. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: ["/admin", "/api/"] }],
    sitemap: new URL("/sitemap.xml", site.url).toString(),
  };
}
