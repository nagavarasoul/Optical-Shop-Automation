import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BookingForm, BookingFormPlain } from "@/components/booking/booking-form";
import { EYE_TEST_FREE } from "@/lib/site-config";
import { getBranches } from "@/lib/site-data";

export const metadata: Metadata = {
  title: { absolute: "Book an eye test | VS Lens Mart, Indresham and Patelguda" },
  description: "Book an eye test at VS Lens Mart in Indresham or Patelguda. Pick a branch, a day and a time; it takes a minute.",
  alternates: { canonical: "/book-eye-test" },
};

/* Book an eye test (Requirements_Booking.md), from mockups/book-eye-test.html. */
export default async function BookEyeTestPage() {
  const branches = await getBranches();
  const props = { branches, freeTest: EYE_TEST_FREE };
  return (
    <div className="container">
      <nav aria-label="Breadcrumb" className="crumbs-nav"><ol className="crumbs"><li><Link href="/">Home</Link></li><li aria-current="page">Book an eye test</li></ol></nav>
      <header className="page-head">
        <h1>Book your eye test</h1>
        <p>Takes a minute. Pick a branch, a day and a time.</p>
      </header>
      {/* ?branch=&date= from the home page apply as soon as the address is read */}
      <Suspense fallback={<BookingFormPlain {...props} />}>
        <BookingForm {...props} />
      </Suspense>
    </div>
  );
}
