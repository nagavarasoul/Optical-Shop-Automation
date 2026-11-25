import { AdminLoading } from "@/components/admin/admin-loading";
import type { Metadata } from "next";
import { Suspense } from "react";
import { HolidaysAdmin } from "@/components/admin/holidays-admin";

export const metadata: Metadata = { title: "Branch holidays" };

/* Closed days (Requirements_Admin.md settings). */
export default function Page() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <HolidaysAdmin />
    </Suspense>
  );
}
