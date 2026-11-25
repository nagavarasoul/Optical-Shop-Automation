/* The navigation's fixed links (Requirements_Navigation.md sections 4–5),
   shared by the desktop mega menus, the phone accordion and the footer, so
   they can't drift apart. Brands and prices come from the database instead
   (src/lib/queries/site.ts). Shapes and lens types are the mockup's lists;
   TODO (client): confirm the shapes stocked and blue-cut / photochromic. */

export type NavItem = { id: string; label: string; href: string; mega?: true };

// The client's order (2026-10-21). No more than 7: to add one, remove one.
// Eye camps left the top level on 2026-11-16 (developer request, not yet confirmed
// by the client); it's a card in the Eye care menu, the phone accordion and the footer.
export const NAV: NavItem[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "about", label: "About", href: "/about" },
  { id: "frames", label: "Frames", href: "/frames", mega: true },
  { id: "sunglasses", label: "Sunglasses", href: "/sunglasses", mega: true },
  { id: "lenses", label: "Lenses", href: "/lenses", mega: true },
  { id: "eye-care", label: "Eye care", href: "/eye-care", mega: true },
  { id: "contact", label: "Contact", href: "/contact" },
];

/** The nav item for the current address, for the gold "you are here" underline. */
export function currentNavId(pathname: string): string | null {
  if (pathname === "/") return "home";
  if (pathname === "/gallery") return "about"; // reached from About
  if (pathname === "/book-eye-test") return "eye-care";
  if (pathname === "/eye-camps" || pathname.startsWith("/eye-camps/")) return "eye-care"; // in the Eye care menu
  const hit = NAV.find((n) => n.href !== "/" && (pathname === n.href || pathname.startsWith(`${n.href}/`)));
  return hit?.id ?? null;
}

const links = (base: string, key: string, labels: string[]) =>
  labels.map((label) => ({ label, href: `${base}?${key}=${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` }));

export const shopFor = (base: "/frames" | "/sunglasses") => links(base, "for", ["Men", "Women", "Kids"]);
export const frameShapes = links("/frames", "shape", ["Rectangle", "Square", "Round", "Cat-eye", "Aviator"]);
export const sunglassLensTypes = links("/sunglasses", "lens", ["Polarized", "UV protection", "Tinted", "Power sunglasses"]);
export const sunglassShapes = links("/sunglasses", "shape", ["Aviator", "Wayfarer", "Round", "Square"]);
export const lensTypes = [
  { label: "Single vision", href: "/lenses?type=single-vision" },
  { label: "Bifocal", href: "/lenses?type=bifocal" },
  { label: "Progressive", href: "/lenses?type=progressive" },
  { label: "Blue-cut / computer", href: "/lenses?type=blue-cut" },
  { label: "Photochromic", href: "/lenses?type=photochromic" },
];
// The client's services at both branches (Q92)
export const eyeCareServices = [
  { label: "Eye testing", href: "/eye-care#eye-testing" },
  { label: "Instant lens fitting (spherical powers)", href: "/eye-care#lens-fitting" },
  { label: "Frame adjustment", href: "/eye-care#frame-adjustment" },
  { label: "Frame repair", href: "/eye-care#frame-repair" },
];

export const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;
