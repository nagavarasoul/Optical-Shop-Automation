import { AdminLoading } from "@/components/admin/admin-loading";
import type { Metadata } from "next";
import { Suspense } from "react";
import { FrameFormPage } from "@/components/admin/frame-form-page";

export const metadata: Metadata = { title: "Add a frame" };

export default function Page() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <FrameFormPage kind="frames" />
    </Suspense>
  );
}
