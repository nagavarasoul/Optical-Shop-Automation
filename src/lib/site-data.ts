import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { withRole } from "./db";
import { branchesQuery, closuresQuery, menuQuery } from "./queries/site";

/* Cached layout data, read with the public role. The tags let admin saves
   refresh it straight away (sprint 5.3 and /admin/branches call updateTag), so
   an approved frame's brand or a new branch phone appears with no code change.
   Note: the layout is pre-rendered at build time, so `next build` reads the
   database; PostgreSQL must be running for builds and tests. */

export async function getBranches() {
  "use cache";
  cacheTag("branches");
  cacheLife("hours");
  return withRole("public", (tx) => branchesQuery(tx));
}

export async function getMenu() {
  "use cache";
  cacheTag("catalogue");
  cacheLife("hours");
  return withRole("public", (tx) => menuQuery(tx));
}

/** Closed days, with the branch facts (admin edits both; tag "branches"). */
export async function getClosures() {
  "use cache";
  cacheTag("branches");
  cacheLife("hours");
  return withRole("public", (tx) => closuresQuery(tx));
}
