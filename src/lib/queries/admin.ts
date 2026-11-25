/* Staff-area reads (Requirements_Admin.md sections 5 and 7). Plain functions
   that take a transaction already running with the signed-in role (withRole),
   so row-level security still decides what each role can see. "Today" is
   India time (Asia/Kolkata), whatever the server's clock zone is. */
import { and, asc, desc, eq, ilike, inArray, ne, or, sql, type SQL } from "drizzle-orm";
import { appointments, branchClosures, branches, brands, campPhotos, enquiries, eyeCamps, frameImages, frames, galleryPhotos, lenses, testimonials } from "../../db/schema";
import type { Tx } from "../db";

const TODAY = sql`(now() at time zone 'Asia/Kolkata')::date`;
export type Kind = "frames" | "sunglasses";
const kindWhere = (kind: Kind) =>
  kind === "sunglasses" ? eq(frames.category, "sunglasses") : inArray(frames.category, ["eyeglasses", "computer_glasses"]);

const photoCount = sql<number>`(select count(*)::int from ${frameImages} where ${frameImages.frameId} = ${frames.id})`;
const frameRow = {
  id: frames.id, code: frames.code, slug: frames.slug, brand: brands.name, model: frames.model, category: frames.category,
  price: frames.price, status: frames.status, availability: frames.availability, availableAt: frames.availableAt,
  isActive: frames.isActive, reviewNote: frames.reviewNote, createdBy: frames.createdBy, createdAt: frames.createdAt,
  updatedAt: frames.updatedAt, photos: photoCount,
};
export type FrameRow = Awaited<ReturnType<typeof framesList>>[number];

/** Frames waiting for the admin's approval (oldest first, so nothing waits too long). */
export function waitingFrames(tx: Tx, limit = 5) {
  return tx.select(frameRow).from(frames).innerJoin(brands, eq(brands.id, frames.brandId))
    .where(eq(frames.status, "waiting")).orderBy(asc(frames.updatedAt)).limit(limit);
}

/** A staff member's own frames not yet approved, sent-back ones first. */
export function myOpenFrames(tx: Tx, userId: string, limit = 5) {
  return tx.select(frameRow).from(frames).innerJoin(brands, eq(brands.id, frames.brandId))
    .where(and(eq(frames.createdBy, userId), ne(frames.status, "approved")))
    .orderBy(sql`${frames.status} = 'sent_back' desc`, desc(frames.updatedAt)).limit(limit);
}

export async function todaysBookings(tx: Tx) {
  return tx.select({
    id: appointments.id, time: appointments.slotStart, name: appointments.name, phone: appointments.phone,
    branch: branches.name, branchSlug: branches.slug, status: appointments.status, note: appointments.note, address: appointments.address,
  }).from(appointments).innerJoin(branches, eq(branches.id, appointments.branchId))
    .where(eq(appointments.day, TODAY)).orderBy(asc(appointments.slotStart));
}

export async function counts(tx: Tx, userId: string) {
  const [r] = await tx.select({
    waitingFrames: sql<number>`(select count(*)::int from ${frames} where ${frames.status} = 'waiting' and ${frames.category} <> 'sunglasses')`,
    waitingSunglasses: sql<number>`(select count(*)::int from ${frames} where ${frames.status} = 'waiting' and ${frames.category} = 'sunglasses')`,
    myOpen: sql<number>`(select count(*)::int from ${frames} where ${frames.createdBy} = ${userId} and ${frames.status} <> 'approved')`,
    mySentBack: sql<number>`(select count(*)::int from ${frames} where ${frames.createdBy} = ${userId} and ${frames.status} = 'sent_back')`,
    bookingsToday: sql<number>`(select count(*)::int from ${appointments} where ${appointments.day} = ${TODAY} and ${appointments.status} <> 'cancelled')`,
    newEnquiries: sql<number>`(select count(*)::int from ${enquiries} where ${enquiries.status} = 'new')`,
    framesLive: sql<number>`(select count(*)::int from ${frames} where ${frames.status} = 'approved' and ${frames.isActive} and ${frames.category} <> 'sunglasses')`,
    sunglassesLive: sql<number>`(select count(*)::int from ${frames} where ${frames.status} = 'approved' and ${frames.isActive} and ${frames.category} = 'sunglasses')`,
    soldOut: sql<number>`(select count(*)::int from ${frames} where ${frames.status} = 'approved' and ${frames.isActive} and ${frames.availability} = 'sold_out')`,
    notApproved: sql<number>`(select count(*)::int from ${frames} where ${frames.status} <> 'approved')`,
    upcomingCamps: sql<number>`(select count(*)::int from ${eyeCamps} where ${eyeCamps.isVisible} and ${eyeCamps.day} >= ${TODAY})`,
    galleryPhotos: sql<number>`(select count(*)::int from ${galleryPhotos} where ${galleryPhotos.isVisible})`,
  }).from(sql`(select 1) as one`);
  return r;
}

/** The last content changes, from updated_by / updated_at (not a full audit log; later phase). */
export async function recentChanges(tx: Tx, limit = 8) {
  const { rows } = await tx.execute<{ at: string; by: string | null; what: string; status: string | null }>(sql`
    (select ${frames.updatedAt} as at, ${frames.updatedBy} as by,
            ${frames.code} || ' ' || ${brands.name} || ' ' || ${frames.model} as what, ${frames.status}::text as status
       from ${frames} join ${brands} on ${brands.id} = ${frames.brandId} where ${frames.updatedBy} is not null)
    union all
    (select ${eyeCamps.updatedAt}, ${eyeCamps.updatedBy}, ${eyeCamps.title}, null from ${eyeCamps} where ${eyeCamps.updatedBy} is not null)
    order by at desc limit ${limit}`);
  return rows;
}

export type ListFilters = { q?: string; status?: string; avail?: string; branch?: string };

/** The staff frames list: search and filters; the viewer's own drafts and sent-back frames first. */
export function framesList(tx: Tx, kind: Kind, f: ListFilters, userId: string) {
  const where: SQL[] = [kindWhere(kind)];
  const q = f.q?.trim();
  if (q) where.push(or(ilike(frames.code, `%${q}%`), ilike(frames.model, `%${q}%`), ilike(brands.name, `%${q}%`))!);
  if (f.status && ["draft", "waiting", "sent_back", "approved"].includes(f.status)) where.push(eq(frames.status, f.status as "draft"));
  if (f.status === "hidden") where.push(eq(frames.isActive, false));
  if (f.avail === "in_stock" || f.avail === "sold_out") where.push(eq(frames.availability, f.avail));
  if (f.branch === "indresham" || f.branch === "patelguda") where.push(inArray(frames.availableAt, [f.branch, "both"]));
  return tx.select(frameRow).from(frames).innerJoin(brands, eq(brands.id, frames.brandId))
    .where(and(...where))
    .orderBy(
      sql`(${frames.createdBy} = ${userId} and ${frames.status} in ('draft', 'sent_back')) desc`,
      sql`${frames.status} = 'waiting' desc`,
      desc(frames.updatedAt),
    )
    .limit(200);
}

export const BOOKING_STATUSES = [["booked", "Booked"], ["attended", "Attended"], ["no_show", "No-show"], ["cancelled", "Cancelled"]] as const;
export const ENQUIRY_STATUSES = [["new", "New"], ["replied", "Replied"], ["closed", "Closed"]] as const;

/** Bookings for one day (Requirements_Admin.md 7): optionally one branch and one status; by time. */
export function bookingsList(tx: Tx, f: { day: string; branch?: string; status?: string }) {
  const where: SQL[] = [eq(appointments.day, f.day)];
  if (f.branch) where.push(eq(branches.slug, f.branch));
  if (BOOKING_STATUSES.some(([s]) => s === f.status)) where.push(eq(appointments.status, f.status as "booked"));
  return tx.select({
    id: appointments.id, reference: appointments.reference, time: appointments.slotStart, name: appointments.name, phone: appointments.phone,
    forWhom: appointments.forWhom, note: appointments.note, address: appointments.address, status: appointments.status,
    branch: branches.name, branchSlug: branches.slug,
  }).from(appointments).innerJoin(branches, eq(branches.id, appointments.branchId))
    .where(and(...where)).orderBy(asc(appointments.slotStart), asc(branches.name)).limit(500);
}

/** Enquiries with one status, newest first. */
export function enquiriesList(tx: Tx, status: string) {
  return tx.select({
    id: enquiries.id, name: enquiries.name, phone: enquiries.phone, address: enquiries.address, branch: enquiries.branch,
    topic: enquiries.topic, message: enquiries.message, frameCode: enquiries.frameCode, replyBy: enquiries.replyBy,
    status: enquiries.status, createdAt: enquiries.createdAt,
  }).from(enquiries).where(eq(enquiries.status, status as "new")).orderBy(desc(enquiries.createdAt)).limit(200);
}

/** Staff lenses list: search by brand or name; filter by type and shown / hidden. */
export function lensesList(tx: Tx, f: { q?: string; type?: string; active?: string }) {
  const where: SQL[] = [];
  const q = f.q?.trim();
  if (q) where.push(or(ilike(lenses.name, `%${q}%`), ilike(brands.name, `%${q}%`))!);
  if (f.type) where.push(eq(lenses.type, f.type as "progressive"));
  if (f.active === "yes" || f.active === "no") where.push(eq(lenses.isActive, f.active === "yes"));
  return tx.select({
    id: lenses.id, brand: brands.name, name: lenses.name, type: lenses.type, features: lenses.features, price: lenses.price,
    isActive: lenses.isActive, photo: lenses.photoPath, updatedAt: lenses.updatedAt,
  }).from(lenses).innerJoin(brands, eq(brands.id, lenses.brandId))
    .where(where.length ? and(...where) : undefined).orderBy(asc(brands.name), asc(lenses.name)).limit(300);
}

/** One lens for the form, or undefined. */
export async function lensById(tx: Tx, id: string) {
  const [row] = await tx.select({
    id: lenses.id, brand: brands.name, name: lenses.name, type: lenses.type, features: lenses.features, price: lenses.price,
    isActive: lenses.isActive, photo: lenses.photoPath,
  }).from(lenses).innerJoin(brands, eq(brands.id, lenses.brandId)).where(eq(lenses.id, id));
  return row;
}

/** Lens brands for the form's list. */
export async function lensBrandNames(tx: Tx) {
  return (await tx.select({ name: brands.name }).from(brands).where(eq(brands.forLenses, true)).orderBy(asc(brands.name))).map((b) => b.name);
}

/** Staff eye camps: upcoming (soonest first) or past (newest first), hidden ones included. */
export function campsAdminList(tx: Tx, when: "upcoming" | "past", today: string) {
  return tx.select({
    id: eyeCamps.id, slug: eyeCamps.slug, title: eyeCamps.title, day: eyeCamps.day, starts: eyeCamps.starts, ends: eyeCamps.ends,
    place: eyeCamps.place, people: eyeCamps.people, isVisible: eyeCamps.isVisible,
    photos: sql<number>`(select count(*)::int from ${campPhotos} where ${campPhotos.campId} = ${eyeCamps.id})`,
  }).from(eyeCamps)
    .where(when === "upcoming" ? sql`${eyeCamps.day} >= ${today}` : sql`${eyeCamps.day} < ${today}`)
    .orderBy(when === "upcoming" ? asc(eyeCamps.day) : desc(eyeCamps.day)).limit(300);
}

/** One camp for the form, with its photos, or undefined. */
export async function campBySlug(tx: Tx, slug: string) {
  const [camp] = await tx.select({
    id: eyeCamps.id, slug: eyeCamps.slug, title: eyeCamps.title, day: eyeCamps.day, starts: eyeCamps.starts, ends: eyeCamps.ends,
    branch: branches.slug, place: eyeCamps.place, organisedWith: eyeCamps.organisedWith, description: eyeCamps.description,
    offered: eyeCamps.offered, people: eyeCamps.people, isVisible: eyeCamps.isVisible,
  }).from(eyeCamps).leftJoin(branches, eq(branches.id, eyeCamps.branchId)).where(eq(eyeCamps.slug, slug));
  if (!camp) return undefined;
  const photos = await tx.select({ id: campPhotos.id, path: campPhotos.path, showsPeople: campPhotos.showsPeople, consent: campPhotos.consent })
    .from(campPhotos).where(eq(campPhotos.campId, camp.id)).orderBy(asc(campPhotos.position));
  return { ...camp, photos };
}

/** Staff gallery: every photo, hidden ones included, newest added first. */
export function galleryAdminList(tx: Tx) {
  return tx.select({
    id: galleryPhotos.id, path: galleryPhotos.path, tag: galleryPhotos.tag, caption: galleryPhotos.caption, branch: galleryPhotos.branch,
    month: galleryPhotos.month, showsPeople: galleryPhotos.showsPeople, isVisible: galleryPhotos.isVisible,
  }).from(galleryPhotos).orderBy(desc(galleryPhotos.createdAt)).limit(500);
}

/** Staff testimonials: every one, hidden ones included. */
export function testimonialsAdminList(tx: Tx) {
  return tx.select({
    id: testimonials.id, firstName: testimonials.firstName, branch: branches.slug, branchName: branches.name, quote: testimonials.quote,
    agreedOn: testimonials.agreedOn, isVisible: testimonials.isVisible,
  }).from(testimonials).leftJoin(branches, eq(branches.id, testimonials.branchId)).orderBy(desc(testimonials.agreedOn), desc(testimonials.createdAt)).limit(300);
}

/** Every branch for the admin's Branches page, hidden ones included. */
export function branchesAdmin(tx: Tx) {
  return tx.select({
    slug: branches.slug, name: branches.name, address: branches.address, mapUrl: branches.mapUrl, phone: branches.phone,
    whatsapp: branches.whatsapp, opens: branches.opens, closes: branches.closes, openDays: branches.openDays, isVisible: branches.isVisible,
  }).from(branches).orderBy(asc(branches.sort), asc(branches.name));
}

/** Every closed day with its branch (null = both), soonest first. */
export function closuresAdmin(tx: Tx) {
  return tx.select({ id: branchClosures.id, day: branchClosures.day, branch: branches.name, note: branchClosures.note })
    .from(branchClosures).leftJoin(branches, eq(branches.id, branchClosures.branchId)).orderBy(asc(branchClosures.day)).limit(500);
}

