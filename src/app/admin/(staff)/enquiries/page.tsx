import { AdminLoading } from "@/components/admin/admin-loading";
import type { Metadata } from "next";
import { Suspense } from "react";
import { EnquiriesList } from "@/components/admin/customer-lists";

export const metadata: Metadata = { title: "Enquiries" };

/* Staff enquiries list (Requirements_Admin.md section 7). */
export default function Page({ searchParams }: PageProps<"/admin/enquiries">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <EnquiriesList searchParams={searchParams} />
    </Suspense>
  );
}
