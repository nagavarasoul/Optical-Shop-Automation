import { AdminLoading } from "@/components/admin/admin-loading";
import type { Metadata } from "next";
import { Suspense } from "react";
import { FrameFormPage } from "@/components/admin/frame-form-page";

export const metadata: Metadata = { title: "Edit sunglasses" };

export default function Page({ params }: PageProps<"/admin/sunglasses/[code]">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Code params={params} />
    </Suspense>
  );
}

async function Code({ params }: { params: PageProps<"/admin/sunglasses/[code]">["params"] }) {
  const { code } = await params;
  return <FrameFormPage kind="sunglasses" code={decodeURIComponent(code)} />;
}
