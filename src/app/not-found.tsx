import type { Metadata } from "next";
import { NotFoundPage } from "@/components/site/not-found-page";
import { SiteFrame } from "@/components/site/site-frame";

/* Any address that matches no page, and any notFound() without a closer
   not-found page. It sits outside the (site) layout, so it draws the site's
   chrome itself. Staff-area addresses have their own (admin/(staff)/not-found.tsx).
   Spec: docs/requirements/Requirements_NotFound.md */
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <SiteFrame>
      <NotFoundPage variant="page" />
    </SiteFrame>
  );
}
