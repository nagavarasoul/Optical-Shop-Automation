import "server-only";
import { ilike } from "drizzle-orm";
import { brands, colours } from "@/db/schema";
import type { Tx } from "./db";

/* Brand and colour lookups for the staff forms: an existing name is reused
   whatever its capitals ("ray-ban" finds "Ray-Ban"),
   so the public filters stay consistent; a new one is added. */
export async function findOrAdd(tx: Tx, table: typeof brands | typeof colours, name: string, userId: string, forLenses = false) {
  const [hit] = await tx.select({ id: table.id }).from(table).where(ilike(table.name, name));
  if (hit) return hit.id;
  const values = { name, createdBy: userId, updatedBy: userId, ...(table === brands && forLenses ? { forLenses: true } : {}) };
  const [row] = await tx.insert(table).values(values).returning({ id: table.id });
  return row.id;
}
