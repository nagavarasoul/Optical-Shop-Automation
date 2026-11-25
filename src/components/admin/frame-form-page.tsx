/* Loads what the frame form needs (Requirements_Admin.md section 6), with the
   signed-in role: brand and colour lists, and for an existing frame its fields,
   photos and status. An unknown code, or a code of the wrong kind, is a 404. */
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { brands, colours, frameImages, frames } from "@/db/schema";
import { workingBranch } from "@/lib/admin-branch";
import { withRole } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { staffNames } from "@/lib/staff-directory";
import { FrameForm, type FrameFormProps } from "./frame-form";

export async function FrameFormPage({ kind, code }: { kind: "frames" | "sunglasses"; code?: string }) {
  const staff = await requireStaff();
  const branch = await workingBranch(staff);
  const data = await withRole(staff.role, async (tx) => {
    const brandList = (await tx.select({ name: brands.name }).from(brands).where(eq(brands.forLenses, false)).orderBy(asc(brands.name))).map((b) => b.name);
    const colourList = (await tx.select({ name: colours.name }).from(colours).orderBy(asc(colours.name))).map((c) => c.name);
    if (!code) return { brandList, colourList, frame: null };
    const [row] = await tx.select({ frame: frames, brand: brands.name, colour: colours.name }).from(frames)
      .innerJoin(brands, eq(brands.id, frames.brandId)).innerJoin(colours, eq(colours.id, frames.colourId))
      .where(eq(frames.code, code.toUpperCase()));
    if (!row) return { brandList, colourList, frame: undefined };
    const imgs = await tx.select().from(frameImages).where(eq(frameImages.frameId, row.frame.id)).orderBy(asc(frameImages.position));
    return { brandList, colourList, frame: { ...row, imgs } };
  }, staff.id);

  if (data.frame === undefined) notFound();
  const isSun = data.frame?.frame.category === "sunglasses";
  if (data.frame && isSun !== (kind === "sunglasses")) notFound();

  let frame: FrameFormProps["frame"] = null;
  if (data.frame) {
    const r = data.frame.frame;
    const by = r.createdBy ? (await staffNames([r.createdBy])).get(r.createdBy)?.name ?? null : null;
    frame = {
      id: r.id, status: r.status, reviewNote: r.reviewNote, addedBy: by,
      fields: {
        code: r.code, category: r.category, brand: data.frame.brand, model: r.model, gender: r.gender, colour: data.frame.colour,
        shape: r.shape, material: r.material ?? "", sizeLens: r.sizeLens?.toString() ?? "", sizeBridge: r.sizeBridge?.toString() ?? "",
        sizeTemple: r.sizeTemple?.toString() ?? "", lensTypes: r.lensTypes ?? [], lensColour: r.lensColour ?? "",
        price: String(r.price), availability: r.availability, availableAt: r.availableAt, isActive: r.isActive,
      },
      photos: data.frame.imgs.map((i) => ({ id: i.id, path: i.path, kind: i.kind, consent: i.consent })),
    };
  }
  return (
    <FrameForm
      // A new key per frame, so moving between frames starts with a fresh form
      key={frame?.id ?? `new-${kind}`}
      kind={kind}
      role={staff.role}
      defaultBranch={branch}
      brands={data.brandList}
      colours={data.colourList}
      frame={frame}
    />
  );
}
