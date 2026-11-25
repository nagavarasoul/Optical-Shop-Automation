import { notFound } from "next/navigation";

/* Any staff-area address that doesn't exist: "not found" inside the staff
   area, rather than the public site's page. Every sidebar section is built. */

export function generateStaticParams() {
  return [{ section: ["none"] }]; // at least one is required; it's a 404 too
}

export default function Unknown() {
  notFound();
}
