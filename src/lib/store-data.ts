/* Search-engine data for the shop (schema.org OpticianStore, one per branch),
   used by Home and Contact. A placeholder phone (DUMMY D2) is left out. */
import type { Branch } from "./queries/site";
import { site } from "./site-config";

const DAY_CODES: Record<string, string> = { Mon: "Mo", Tue: "Tu", Wed: "We", Thu: "Th", Fri: "Fr", Sat: "Sa", Sun: "Su" };

export function storeData(branches: Branch[]) {
  return branches.map((b) => ({
    "@context": "https://schema.org", "@type": "OpticianStore", name: `${site.name}, ${b.name}`,
    address: { "@type": "PostalAddress", streetAddress: b.address, addressRegion: "Telangana", addressCountry: "IN" },
    ...(b.dummy ? {} : { telephone: `+91${b.phone}` }),
    openingHours: `${b.openDays.map((d) => DAY_CODES[d]).join(",")} ${b.opens}-${b.closes}`.replace("Mo,Tu,We,Th,Fr,Sa,Su", "Mo-Su"),
    url: `${site.url}/contact#${b.slug}`,
  }));
}

/** The data as a safe <script type="application/ld+json"> body. */
export const storeJson = (branches: Branch[]) => JSON.stringify(storeData(branches)).replace(/</g, "\\u003c");
