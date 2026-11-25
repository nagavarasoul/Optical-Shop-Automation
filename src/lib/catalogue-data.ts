import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { withRole } from "./db";
import { catalogueQuery, frameDetailQuery, liveSlugsQuery, type Kind } from "./queries/catalogue";

/* Cached catalogue reads with the public role, tagged "catalogue" like the
   menus: every frame save, approval, sold-out toggle and delete in the staff
   area calls updateTag("catalogue"), so the listings and detail pages update
   straight away with no restart. */

export async function getCatalogue(kind: Kind) {
  "use cache";
  cacheTag("catalogue");
  cacheLife("hours");
  return withRole("public", (tx) => catalogueQuery(tx, kind));
}

export async function getFrame(kind: Kind, slug: string) {
  "use cache";
  cacheTag("catalogue");
  cacheLife("hours");
  return withRole("public", (tx) => frameDetailQuery(tx, kind, slug));
}

export async function getLiveSlugs(kind: Kind) {
  "use cache";
  cacheTag("catalogue");
  cacheLife("hours");
  return withRole("public", (tx) => liveSlugsQuery(tx, kind));
}
