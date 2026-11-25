import { AdminLoading } from "@/components/admin/admin-loading";
import type { Metadata } from "next";
import { Suspense } from "react";
import { StaffAdmin } from "@/components/admin/staff-admin";

export const metadata: Metadata = { title: "Staff accounts" };

/* Staff accounts (Requirements_Admin.md section 3). */
export default function Page({ searchParams }: PageProps<"/admin/staff">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <StaffAdmin searchParams={searchParams} />
    </Suspense>
  );
}
