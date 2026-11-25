import "server-only";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

/* The website's only way into the database (CLAUDE.md "Data security").
   Connects as vslm_app, which owns nothing and can't bypass row-level security.
   Every query runs inside withRole(), which sets the role for that transaction
   only, so a forgotten check falls back to the public rules, never to staff. */

export type Role = "public" | "staff" | "admin";

const globalForDb = globalThis as unknown as { vslmPool?: Pool };
const pool =
  globalForDb.vslmPool ??
  new Pool({ connectionString: process.env.DATABASE_URL_APP, max: 10 });
if (process.env.NODE_ENV !== "production") globalForDb.vslmPool = pool; // survive dev reloads

const db = drizzle(pool, { schema });
export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Runs `fn` in a transaction as `role`. `userId` (a Better Auth user id) is
 * recorded for created_by / updated_by. Public pages use withRole("public", …);
 * admin pages get the role from the signed-in session, never from the request.
 */
export async function withRole<T>(role: Role, fn: (tx: Tx) => Promise<T>, userId?: string): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.role', ${role}, true), set_config('app.user_id', ${userId ?? ""}, true)`);
    return fn(tx);
  });
}
