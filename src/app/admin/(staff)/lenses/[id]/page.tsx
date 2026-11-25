import { AdminLoading } from "@/components/admin/admin-loading";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LensFormPage } from "@/components/admin/lens-form-page";

export const metadata: Metadata = { title: "Edit lens" };

export default function Page({ params }: PageProps<"/admin/lenses/[id]">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Lens params={params} />
    </Suspense>
  );
}

async function Lens({ params }: { params: PageProps<"/admin/lenses/[id]">["params"] }) {
  const { id } = await params;
  return <LensFormPage id={id} />;
}
