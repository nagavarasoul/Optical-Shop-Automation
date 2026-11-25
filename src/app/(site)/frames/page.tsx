import type { Metadata } from "next";
import { CataloguePage } from "@/components/catalogue/catalogue-page";

export const metadata: Metadata = {
  title: "Frames",
  description: "Browse eyeglass frames at VS Lens Mart with exact prices. Filter by brand, price, gender, colour and shape, then enquire on WhatsApp or visit a branch.",
  alternates: { canonical: "/frames" },
};

export default function FramesPage() {
  return <CataloguePage kind="frames" />;
}
