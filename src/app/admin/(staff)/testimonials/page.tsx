import { AdminLoading } from "@/components/admin/admin-loading";
import type { Metadata } from "next";
import { Suspense } from "react";
import { TestimonialsAdmin } from "@/components/admin/testimonials-admin";

export const metadata: Metadata = { title: "Testimonials" };

/* Staff testimonials (Requirements_Admin.md section 7). */
export default function Page({ searchParams }: PageProps<"/admin/testimonials">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <TestimonialsAdmin searchParams={searchParams} />
    </Suspense>
  );
}
