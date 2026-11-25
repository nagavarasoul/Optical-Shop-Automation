import { SiteFrame } from "@/components/site/site-frame";

/* The public site's shared layout (sprint 5.1): utility bar, navigation,
   footer and the phone sticky bar around every page (`SiteFrame`). The staff
   area (/admin) is outside this group and has its own shell.
   Spec: Requirements_Navigation.md */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return <SiteFrame>{children}</SiteFrame>;
}
