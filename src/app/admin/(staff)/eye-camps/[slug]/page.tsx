import { AdminLoading } from "@/components/admin/admin-loading";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CampFormPage } from "@/components/admin/camp-form-page";

export const metadata: Metadata = { title: "Edit eye camp" };

export default function Page({ params }: PageProps<"/admin/eye-camps/[slug]">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Camp params={params} />
    </Suspense>
  );
}

async function Camp({ params }: { params: PageProps<"/admin/eye-camps/[slug]">["params"] }) {
  const { slug } = await params;
  return <CampFormPage slug={slug} />;
}
