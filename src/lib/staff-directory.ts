import "server-only";
import { authPool } from "./auth";

/* Staff names for "Added by …" and "Recent changes". The website's database
   user (vslm_app) can't read the login tables, so this asks through the login
   tables' own connection (vslm_auth), and only for names and home branches. */
export type StaffName = { name: string; branch: string | null };

export async function staffNames(ids: (string | null | undefined)[]): Promise<Map<string, StaffName>> {
  const wanted = [...new Set(ids.filter((id): id is string => !!id))];
  const map = new Map<string, StaffName>();
  if (!wanted.length) return map;
  const { rows } = await authPool.query<{ id: string; name: string; branch: string | null }>(
    `select id, name, branch from "user" where id = any($1)`, [wanted],
  );
  for (const r of rows) map.set(r.id, { name: r.name, branch: r.branch });
  return map;
}
