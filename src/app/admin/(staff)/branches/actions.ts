"use server";

/* Branch details (Requirements_Admin.md 7.1): only an admin saves (the database
   refuses staff too). Changes reach the footer, Contact, the branch picker and
   the booking form straight away (cache tag "branches"). */
import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { branches } from "@/db/schema";
import { fieldErrors } from "@/lib/booking-rules";
import { branchFields, type BranchInput } from "@/lib/branch-rules";
import { withRole } from "@/lib/db";
import { requireStaff } from "@/lib/session";

export type BranchesResult = { ok: true } | { ok: false; errors: Record<string, string> };

export async function saveBranches(input: unknown): Promise<BranchesResult> {
  const staff = await requireStaff();
  if (staff.role !== "admin") return { ok: false, errors: { form: "Only an admin can change branch details." } };
  if (!Array.isArray(input) || !input.length || input.length > 10) return { ok: false, errors: { form: "Nothing to save." } };
  const rows: BranchInput[] = [];
  for (const raw of input) {
    const r = branchFields.safeParse(raw);
    const slug = typeof raw === "object" && raw && "slug" in raw ? String((raw as { slug: unknown }).slug) : "?";
    if (!r.success) return { ok: false, errors: Object.fromEntries(Object.entries(fieldErrors(r.error)).map(([k, v]) => [`${slug}.${k}`, v])) };
    rows.push(r.data);
  }
  await withRole(staff.role, async (tx) => {
    for (const b of rows) {
      await tx.update(branches).set({
        address: b.address, mapUrl: b.mapUrl, phone: b.phone, whatsapp: b.whatsapp, opens: b.opens, closes: b.closes,
        openDays: [...b.openDays], isVisible: b.isVisible, updatedBy: staff.id, updatedAt: new Date(),
      }).where(eq(branches.slug, b.slug));
    }
  }, staff.id);
  updateTag("branches");
  revalidatePath("/admin", "layout");
  return { ok: true };
}
