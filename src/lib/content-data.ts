import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { withRole } from "./db";
import { isUpcoming } from "./camp-rules";
import { nowInIndia } from "./booking-rules";
import { campDetailQuery, campsQuery, galleryQuery, lensesQuery, testimonialsQuery } from "./queries/content";

/* Cached content reads with the public role, tagged "content": every staff save
   of a lens, eye camp, gallery photo or testimonial calls updateTag("content"),
   so the public pages update straight away. */

export async function getLenses() {
  "use cache";
  cacheTag("content");
  cacheLife("hours");
  return withRole("public", (tx) => lensesQuery(tx));
}

/** Camps split into upcoming (soonest first) and past (newest first), in India time.
 *  Cached for an hour at most, so a camp moves to "Past" within the hour after its day. */
export async function getCamps() {
  "use cache";
  cacheTag("content");
  cacheLife("hours");
  const all = await withRole("public", (tx) => campsQuery(tx));
  const today = nowInIndia().day;
  return {
    today,
    upcoming: all.filter((c) => isUpcoming(c.day, today)),
    past: all.filter((c) => !isUpcoming(c.day, today)).reverse(),
  };
}

export async function getCamp(slug: string) {
  "use cache";
  cacheTag("content");
  cacheLife("hours");
  const camp = await withRole("public", (tx) => campDetailQuery(tx, slug));
  return camp ? { ...camp, upcoming: isUpcoming(camp.day) } : null;
}

/** Camp addresses to pre-render at build time. */
export async function getCampSlugs() {
  "use cache";
  cacheTag("content");
  cacheLife("hours");
  const all = await withRole("public", (tx) => campsQuery(tx));
  return all.map((c) => c.slug);
}

export async function getGallery() {
  "use cache";
  cacheTag("content");
  cacheLife("hours");
  return withRole("public", (tx) => galleryQuery(tx));
}

export async function getTestimonials() {
  "use cache";
  cacheTag("content");
  cacheLife("hours");
  return withRole("public", (tx) => testimonialsQuery(tx));
}
