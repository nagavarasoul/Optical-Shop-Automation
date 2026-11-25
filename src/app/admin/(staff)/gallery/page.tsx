import { AdminLoading } from "@/components/admin/admin-loading";
import type { Metadata } from "next";
import { Suspense } from "react";
import { GalleryAdmin } from "@/components/admin/gallery-admin";

export const metadata: Metadata = { title: "Gallery" };

/* Staff gallery (Requirements_Admin.md section 7). */
export default function Page() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <GalleryAdmin />
    </Suspense>
  );
}
