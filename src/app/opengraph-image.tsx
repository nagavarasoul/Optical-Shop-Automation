import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site-config";
import { getBranches } from "@/lib/site-data";

/* The site-wide share image (sprint 5.6 part C; Requirements_Navigation.md 11):
   what WhatsApp, Facebook and others show when a page is shared. Frame pages
   use their first photo instead (frameMetadata). Brand colours from the design
   tokens; no logo until the new one is approved (DUMMY D8). Branch names come
   from the branches table. Drawn once at build time.
   Font: Plus Jakarta Sans ExtraBold, src/assets/fonts (SIL Open Font License,
   OFL.txt beside it), from github.com/tokotype/PlusJakartaSans at the commit
   Google Fonts uses. */

export const alt = `${site.name}, family opticians since ${site.since}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAVY = "#0D1B2A";
const GOLD = "#F5C842";
const BRASS = "#C9A227";
const CREAM = "#FAF6EE";

export default async function Image() {
  const [font, branches] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/fonts/PlusJakartaSans-ExtraBold.ttf")),
    getBranches(),
  ]);
  const places = branches.map((b) => b.name).join(" · ");
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 96px", background: NAVY, color: CREAM, fontFamily: "Jakarta" }}>
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 8, color: BRASS }}>SINCE {site.since}</div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 112, lineHeight: 1.05 }}>
          <span style={{ color: GOLD }}>VS</span>
          <span style={{ marginLeft: 28 }}>Lens Mart</span>
        </div>
        <div style={{ display: "flex", width: 140, height: 4, marginTop: 36, background: BRASS }} />
        <div style={{ display: "flex", marginTop: 36, fontSize: 44 }}>Welcome to the Optical Family</div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 30, color: GOLD }}>{places}</div>
      </div>
    ),
    { ...size, fonts: [{ name: "Jakarta", data: font, style: "normal", weight: 800 }] },
  );
}
