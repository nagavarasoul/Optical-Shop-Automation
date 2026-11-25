import type { Metadata } from "next";

/* Staff area: never indexed by search engines (also disallowed in robots.ts). */
export const metadata: Metadata = {
  title: { default: "Staff area", template: "%s | VS Lens Mart staff area" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
