/* ==========================================================================
   VS Lens Mart: database schema (Drizzle, PostgreSQL 17)
   Columns come from the data sections of docs/requirements/Requirements_*.md.
   Security (grants, forced row-level security, the frames approval trigger)
   is in db/security.sql, which db:migrate applies after these tables.
   Login tables (user, session, account, verification) belong to Better Auth
   and are created by its own migration; the *_by columns below hold its user
   ids as plain text, with no foreign key, so the two stay independent.
   ========================================================================== */
import { sql } from "drizzle-orm";
import {
  boolean, check, date, index, integer, pgEnum, pgTable, smallint, text, time, timestamp, unique, uuid,
} from "drizzle-orm/pg-core";

/* ---------- Enums ---------- */
export const frameCategory = pgEnum("frame_category", ["eyeglasses", "computer_glasses", "sunglasses"]);
export const gender = pgEnum("gender", ["men", "women", "unisex", "kids"]);
export const frameStatus = pgEnum("frame_status", ["draft", "waiting", "sent_back", "approved"]);
export const availability = pgEnum("availability", ["in_stock", "sold_out"]);
export const availableAt = pgEnum("available_at", ["indresham", "patelguda", "both"]);
export const photoKind = pgEnum("photo_kind", ["front", "side", "closeup", "model"]);
export const lensType = pgEnum("lens_type", ["single_vision", "bifocal", "progressive", "blue_cut", "photochromic"]);
export const galleryTag = pgEnum("gallery_tag", ["shop", "frames", "eye_camps", "team", "customers", "celebrations"]);
export const galleryBranch = pgEnum("gallery_branch", ["indresham", "patelguda", "both", "none"]);
export const appointmentStatus = pgEnum("appointment_status", ["booked", "attended", "no_show", "cancelled"]);
export const enquiryBranch = pgEnum("enquiry_branch", ["indresham", "patelguda", "either"]);
export const enquiryTopic = pgEnum("enquiry_topic", ["frames", "sunglasses", "lenses", "eye_test", "repair", "other"]);
export const replyBy = pgEnum("reply_by", ["whatsapp", "call"]);
export const enquiryStatus = pgEnum("enquiry_status", ["new", "replied", "closed"]);

/* Who changed a row and when (feeds the dashboard's "Recent changes"). */
const audit = {
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

/* ---------- Branches (public read; admin edits at /admin/branches) ---------- */
export const branches = pgTable("branches", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  mapUrl: text("map_url"),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp").notNull(),
  opens: time("opens").notNull(),
  closes: time("closes").notNull(),
  openDays: text("open_days").array().notNull().default(sql`'{Mon,Tue,Wed,Thu,Fri,Sat,Sun}'`),
  isVisible: boolean("is_visible").notNull().default(true),
  sort: smallint("sort").notNull().default(0),
  ...audit,
}, (t) => [check("branches_hours", sql`${t.closes} > ${t.opens}`)]);

/* Closed days (festivals); the booking form offers no slots on them. Null branch = both. */
export const branchClosures = pgTable("branch_closures", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id").references(() => branches.id, { onDelete: "cascade" }),
  day: date("day").notNull(),
  note: text("note"),
  ...audit,
}, (t) => [unique("branch_closures_day").on(t.branchId, t.day).nullsNotDistinct()]);

/* ---------- Lookups, so filters stay consistent ("Ray-Ban", not "rayban") ---------- */
export const brands = pgTable("brands", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  forLenses: boolean("for_lenses").notNull().default(false),
  ...audit,
});

export const colours = pgTable("colours", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  ...audit,
});

/* ---------- Frames and sunglasses (one table, category = sunglasses) ---------- */
export const frames = pgTable("frames", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  slug: text("slug").notNull().unique(),
  brandId: uuid("brand_id").notNull().references(() => brands.id),
  model: text("model").notNull(),
  category: frameCategory("category").notNull(),
  gender: gender("gender").notNull(),
  colourId: uuid("colour_id").notNull().references(() => colours.id),
  shape: text("shape").notNull(),
  material: text("material"),
  sizeLens: smallint("size_lens"),
  sizeBridge: smallint("size_bridge"),
  sizeTemple: smallint("size_temple"),
  lensTypes: text("lens_types").array(), // sunglasses only
  lensColour: text("lens_colour"), // sunglasses only
  price: integer("price").notNull(), // whole rupees
  availability: availability("availability").notNull().default("in_stock"),
  availableAt: availableAt("available_at").notNull(),
  status: frameStatus("status").notNull().default("draft"),
  reviewNote: text("review_note"), // the admin's note when sent back
  isActive: boolean("is_active").notNull().default(true),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  ...audit,
}, (t) => [
  check("frames_price", sql`${t.price} between 1 and 100000`),
  index("frames_listing").on(t.category, t.status, t.isActive),
]);

export const frameImages = pgTable("frame_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  frameId: uuid("frame_id").notNull().references(() => frames.id, { onDelete: "cascade" }),
  path: text("path").notNull(),
  kind: photoKind("kind").notNull().default("front"),
  consent: boolean("consent").notNull().default(false),
  position: smallint("position").notNull(), // 0 = cover
  ...audit,
}, (t) => [
  unique("frame_images_position").on(t.frameId, t.position),
  check("frame_images_max5", sql`${t.position} between 0 and 4`),
  check("frame_images_consent", sql`${t.kind} <> 'model' or ${t.consent}`),
]);

/* ---------- Lenses ---------- */
export const lenses = pgTable("lenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  brandId: uuid("brand_id").notNull().references(() => brands.id),
  name: text("name").notNull(),
  type: lensType("type").notNull(),
  features: text("features").array().notNull().default(sql`'{}'`),
  price: integer("price"), // null = "Ask for price"
  photoPath: text("photo_path"),
  isActive: boolean("is_active").notNull().default(true),
  ...audit,
});

/* ---------- Eye camps ---------- */
export const eyeCamps = pgTable("eye_camps", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  day: date("day").notNull(),
  starts: time("starts").notNull(),
  ends: time("ends").notNull(),
  branchId: uuid("branch_id").references(() => branches.id),
  place: text("place").notNull(),
  organisedWith: text("organised_with"),
  description: text("description").notNull(),
  offered: text("offered").array().notNull().default(sql`'{}'`),
  people: integer("people"), // after the camp
  isVisible: boolean("is_visible").notNull().default(true),
  ...audit,
}, (t) => [check("eye_camps_time", sql`${t.ends} > ${t.starts}`)]);

export const campPhotos = pgTable("camp_photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  campId: uuid("camp_id").notNull().references(() => eyeCamps.id, { onDelete: "cascade" }),
  path: text("path").notNull(),
  position: smallint("position").notNull(),
  showsPeople: boolean("shows_people").notNull().default(false),
  consent: boolean("consent").notNull().default(false),
  ...audit,
}, (t) => [
  unique("camp_photos_position").on(t.campId, t.position),
  check("camp_photos_max12", sql`${t.position} between 0 and 11`),
  check("camp_photos_consent", sql`not ${t.showsPeople} or ${t.consent}`),
]);

/* ---------- Gallery and testimonials ---------- */
export const galleryPhotos = pgTable("gallery_photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  path: text("path").notNull(),
  tag: galleryTag("tag").notNull(),
  caption: text("caption").notNull(), // also the alt text
  branch: galleryBranch("branch").notNull().default("none"),
  month: date("month"), // first day of the month it was taken
  showsPeople: boolean("shows_people").notNull().default(false),
  consent: boolean("consent").notNull().default(false),
  isVisible: boolean("is_visible").notNull().default(true),
  sort: integer("sort").notNull().default(0),
  ...audit,
}, (t) => [check("gallery_photos_consent", sql`not ${t.showsPeople} or ${t.consent}`)]);

export const testimonials = pgTable("testimonials", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  branchId: uuid("branch_id").references(() => branches.id),
  quote: text("quote").notNull(),
  agreedOn: date("agreed_on").notNull(), // the day the customer agreed to be quoted
  isVisible: boolean("is_visible").notNull().default(true),
  ...audit,
});

/* ---------- Private: bookings and enquiries (public may insert, never read) ---------- */
export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  reference: text("reference").notNull().unique(),
  branchId: uuid("branch_id").notNull().references(() => branches.id),
  day: date("day").notNull(),
  slotStart: time("slot_start").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  forWhom: text("for_whom"),
  note: text("note"),
  address: text("address"), // optional (client change 2026-10-21)
  consentAt: timestamp("consent_at", { withTimezone: true }).notNull(),
  status: appointmentStatus("status").notNull().default("booked"),
  ...audit,
}, (t) => [
  index("appointments_slot").on(t.branchId, t.day, t.slotStart),
  check("appointments_lengths", sql`char_length(${t.name}) between 2 and 60 and char_length(coalesce(${t.note}, '')) <= 300 and char_length(coalesce(${t.address}, '')) <= 150`),
]);

export const enquiries = pgTable("enquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  address: text("address"), // optional (client change 2026-10-21)
  branch: enquiryBranch("branch").notNull().default("either"),
  topic: enquiryTopic("topic").notNull(),
  message: text("message").notNull(),
  frameCode: text("frame_code"),
  replyBy: replyBy("reply_by").notNull().default("whatsapp"),
  consentAt: timestamp("consent_at", { withTimezone: true }).notNull(),
  status: enquiryStatus("status").notNull().default("new"),
  ...audit,
}, (t) => [
  check("enquiries_lengths", sql`char_length(${t.name}) between 2 and 60 and char_length(${t.message}) between 10 and 500 and char_length(coalesce(${t.address}, '')) <= 150`),
]);
