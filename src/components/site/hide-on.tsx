"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Leaves its children out on the listed pages (the booking page hides the
 *  phone sticky bar, which would repeat its own form: Requirements_Booking.md 5). */
export function HideOn({ paths, children }: { paths: string[]; children: ReactNode }) {
  return paths.includes(usePathname()) ? null : children;
}
