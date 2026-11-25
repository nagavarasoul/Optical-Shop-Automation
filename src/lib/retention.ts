/* Deletes bookings and messages older than the retention period shown on
   /privacy (Requirements_Privacy.md 4.5, DUMMY D9). Called after each booking
   or message and when staff open the lists, so it needs no scheduler on the
   laptop. purge_expired() runs as the table owner and refuses short periods. */
import { sql } from "drizzle-orm";
import type { Tx } from "./db";
import { RETENTION_DAYS } from "./site-config";

export async function purgeExpired(tx: Tx): Promise<number> {
  const r = await tx.execute(sql`select purge_expired(${RETENTION_DAYS}) as n`);
  return Number((r.rows[0] as { n: number }).n);
}
