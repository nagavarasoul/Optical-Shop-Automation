import type { Metadata } from "next";
import { CataloguePage } from "@/components/catalogue/catalogue-page";

export const metadata: Metadata = {
  title: "Sunglasses",
  description: "Browse sunglasses at VS Lens Mart with exact prices: polarized, UV protection, tinted and power sunglasses. Enquire on WhatsApp or visit a branch.",
  alternates: { canonical: "/sunglasses" },
};

export default function SunglassesPage() {
  return <CataloguePage kind="sunglasses" />;
}
