import { AdminLoading } from "@/components/admin/admin-loading";
import type { Metadata } from "next";
import { Suspense } from "react";
import { FrameFormPage } from "@/components/admin/frame-form-page";

export const metadata: Metadata = { title: "Edit frame" };

export default function Page({ params }: PageProps<"/admin/frames/[code]">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Code params={params} />
    </Suspense>
  );
}

async function Code({ params }: { params: PageProps<"/admin/frames/[code]">["params"] }) {
  const { code } = await params;
  return <FrameFormPage kind="frames" code={decodeURIComponent(code)} />;
}
