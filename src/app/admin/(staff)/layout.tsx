import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { workingBranch } from "@/lib/admin-branch";
import { withRole } from "@/lib/db";
import { counts } from "@/lib/queries/admin";
import { requireStaff } from "@/lib/session";
import { getBranches } from "@/lib/site-data";

/* The staff area's shell around every page except the login page.
   Reading the session makes it request-time, so it sits behind <Suspense>
   (Next.js 16 Cache Components). */
export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-6 text-muted">Loading the staff area…</p>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}

async function Shell({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  const [slug, allBranches] = await Promise.all([workingBranch(staff), getBranches()]);
  const n = await withRole(staff.role, (tx) => counts(tx, staff.id), staff.id);
  const branch = allBranches.find((b) => b.slug === slug) ?? allBranches[0];
  return (
    <AdminShell
      user={{ name: staff.name, role: staff.role }}
      branch={{ slug: branch.slug, name: branch.name, address: branch.address }}
      branches={allBranches.map((b) => ({ slug: b.slug, name: b.name }))}
      counts={{
        frames: staff.role === "admin" ? n.waitingFrames : n.myOpen,
        sunglasses: staff.role === "admin" ? n.waitingSunglasses : 0,
        bookings: n.bookingsToday,
        enquiries: n.newEnquiries,
      }}
    >
      {children}
    </AdminShell>
  );
}
