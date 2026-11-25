import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { site } from "@/lib/site-config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: "800",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url), // DUMMY D4 until the domain is bought
  title: { default: `${site.name} | Opticians in Indresham and Patelguda`, template: `%s | ${site.name}` },
  description: `A family optical shop since ${site.since}. Frames, sunglasses, lenses and eye tests in Indresham and Patelguda.`,
};

export const viewport: Viewport = {
  themeColor: "#0D1B2A",
};

// Applies the saved light/dark choice before the first paint (same key as the mockups).
// With no saved choice, the device setting decides through CSS.
const themeScript = `(function(){try{var t=localStorage.getItem("vslm-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      {/* Browser extensions (e.g. Grammarly) add attributes to <body> before React loads */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
