import { AdminLoading } from "@/components/admin/admin-loading";
import type { Metadata } from "next";
import { Suspense } from "react";
import { FramesList } from "@/components/admin/frames-list";

export const metadata: Metadata = { title: "Sunglasses" };

/* Staff sunglasses list (Requirements_Admin.md section 7). */
export default function Page({ searchParams }: PageProps<"/admin/sunglasses">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <FramesList kind="sunglasses" searchParams={searchParams} />
    </Suspense>
  );
}
