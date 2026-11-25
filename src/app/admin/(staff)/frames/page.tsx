import { AdminLoading } from "@/components/admin/admin-loading";
import type { Metadata } from "next";
import { Suspense } from "react";
import { FramesList } from "@/components/admin/frames-list";

export const metadata: Metadata = { title: "Frames" };

/* Staff frames list (Requirements_Admin.md section 7). */
export default function Page({ searchParams }: PageProps<"/admin/frames">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <FramesList kind="frames" searchParams={searchParams} />
    </Suspense>
  );
}
