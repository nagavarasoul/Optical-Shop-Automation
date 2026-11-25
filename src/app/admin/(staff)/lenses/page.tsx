import { AdminLoading } from "@/components/admin/admin-loading";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LensesList } from "@/components/admin/lenses-list";

export const metadata: Metadata = { title: "Lenses" };

/* Staff lenses list (Requirements_Admin.md section 7). */
export default function Page({ searchParams }: PageProps<"/admin/lenses">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <LensesList searchParams={searchParams} />
    </Suspense>
  );
}
