import { AdminLoading } from "@/components/admin/admin-loading";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CampsList } from "@/components/admin/camps-list";

export const metadata: Metadata = { title: "Eye camps" };

/* Staff eye camps (Requirements_Admin.md 7.2). */
export default function Page({ searchParams }: PageProps<"/admin/eye-camps">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <CampsList searchParams={searchParams} />
    </Suspense>
  );
}
