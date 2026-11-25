import type { ReactNode } from "react";
import { BranchPickerProvider } from "@/components/site/branch-picker";
import { SiteFooter, SiteHeader, StickyBar, UtilityBar } from "@/components/site/site-chrome";
import { getBranches } from "@/lib/site-data";

/* The public site's chrome: utility bar, navigation, footer and the phone
   sticky bar, with the branch picker. Used by the (site) layout and by the
   root not-found page, which sits outside that layout (it also serves
   addresses that match no route). Spec: Requirements_Navigation.md */
export async function SiteFrame({ children }: { children: ReactNode }) {
  const branches = await getBranches();
  return (
    <BranchPickerProvider branches={branches}>
      <div className="site-shell flex min-h-full flex-1 flex-col">
        <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-pill focus:bg-gold focus:px-4 focus:py-2 focus:font-semibold focus:text-navy" href="#main">
          Skip to content
        </a>
        <header className="site-header">
          <UtilityBar />
          <SiteHeader />
        </header>
        <main id="main" className="flex-1">{children}</main>
        <SiteFooter />
        <StickyBar />
      </div>
    </BranchPickerProvider>
  );
}
