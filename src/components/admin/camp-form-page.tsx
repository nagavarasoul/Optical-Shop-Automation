/* Loads what the camp form needs, with the signed-in role. An unknown camp is a 404. */
import { notFound } from "next/navigation";
import { workingBranch } from "@/lib/admin-branch";
import { withRole } from "@/lib/db";
import { campBySlug } from "@/lib/queries/admin";
import { requireStaff } from "@/lib/session";
import { getBranches } from "@/lib/site-data";
import { CampForm } from "./camp-form";

export async function CampFormPage({ slug }: { slug?: string }) {
  const staff = await requireStaff();
  const [branches, defaultBranch] = await Promise.all([getBranches(), workingBranch(staff)]);
  const camp = slug && /^[a-z0-9-]{1,100}$/.test(slug) ? await withRole(staff.role, (tx) => campBySlug(tx, slug), staff.id) : undefined;
  if (slug && !camp) notFound();
  return (
    <CampForm key={camp?.id ?? "new"} role={staff.role} defaultBranch={defaultBranch} camp={camp ?? null}
      branches={branches.map((b) => ({ slug: b.slug, name: b.name }))} />
  );
}
