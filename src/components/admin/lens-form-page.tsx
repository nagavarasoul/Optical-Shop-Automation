/* Loads what the lens form needs, with the signed-in role. An unknown id is a 404. */
import { notFound } from "next/navigation";
import { withRole } from "@/lib/db";
import { lensBrandNames, lensById } from "@/lib/queries/admin";
import { requireStaff } from "@/lib/session";
import { LensForm } from "./lens-form";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function LensFormPage({ id }: { id?: string }) {
  const staff = await requireStaff();
  if (id && !UUID.test(id)) notFound();
  const data = await withRole(staff.role, async (tx) => ({
    brands: await lensBrandNames(tx),
    lens: id ? await lensById(tx, id) : null,
  }), staff.id);
  if (id && !data.lens) notFound();
  return <LensForm key={id ?? "new"} role={staff.role} brands={data.brands} lens={data.lens ?? null} />;
}
