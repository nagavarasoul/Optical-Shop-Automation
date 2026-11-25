import { AdminLoading } from "@/components/admin/admin-loading";
import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingsList } from "@/components/admin/customer-lists";

export const metadata: Metadata = { title: "Bookings" };

/* Staff bookings list (Requirements_Admin.md section 7). */
export default function Page({ searchParams }: PageProps<"/admin/bookings">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <BookingsList searchParams={searchParams} />
    </Suspense>
  );
}
