CREATE TYPE "public"."appointment_status" AS ENUM('booked', 'attended', 'no_show', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."availability" AS ENUM('in_stock', 'sold_out');--> statement-breakpoint
CREATE TYPE "public"."available_at" AS ENUM('indresham', 'patelguda', 'both');--> statement-breakpoint
CREATE TYPE "public"."enquiry_branch" AS ENUM('indresham', 'patelguda', 'either');--> statement-breakpoint
CREATE TYPE "public"."enquiry_status" AS ENUM('new', 'replied', 'closed');--> statement-breakpoint
CREATE TYPE "public"."enquiry_topic" AS ENUM('frames', 'sunglasses', 'lenses', 'eye_test', 'repair', 'other');--> statement-breakpoint
CREATE TYPE "public"."frame_category" AS ENUM('eyeglasses', 'computer_glasses', 'sunglasses');--> statement-breakpoint
CREATE TYPE "public"."frame_status" AS ENUM('draft', 'waiting', 'sent_back', 'approved');--> statement-breakpoint
CREATE TYPE "public"."gallery_branch" AS ENUM('indresham', 'patelguda', 'both', 'none');--> statement-breakpoint
CREATE TYPE "public"."gallery_tag" AS ENUM('shop', 'frames', 'eye_camps', 'team', 'customers', 'celebrations');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('men', 'women', 'unisex', 'kids');--> statement-breakpoint
CREATE TYPE "public"."lens_type" AS ENUM('single_vision', 'bifocal', 'progressive', 'blue_cut', 'photochromic');--> statement-breakpoint
CREATE TYPE "public"."photo_kind" AS ENUM('front', 'side', 'closeup', 'model');--> statement-breakpoint
CREATE TYPE "public"."reply_by" AS ENUM('whatsapp', 'call');--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"branch_id" uuid NOT NULL,
	"day" date NOT NULL,
	"slot_start" time NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"for_whom" text,
	"note" text,
	"address" text,
	"consent_at" timestamp with time zone NOT NULL,
	"status" "appointment_status" DEFAULT 'booked' NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "appointments_reference_unique" UNIQUE("reference"),
	CONSTRAINT "appointments_lengths" CHECK (char_length("appointments"."name") between 2 and 60 and char_length(coalesce("appointments"."note", '')) <= 300 and char_length(coalesce("appointments"."address", '')) <= 150)
);
--> statement-breakpoint
CREATE TABLE "branch_closures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid,
	"day" date NOT NULL,
	"note" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "branch_closures_day" UNIQUE NULLS NOT DISTINCT("branch_id","day")
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"map_url" text,
	"phone" text NOT NULL,
	"whatsapp" text NOT NULL,
	"opens" time NOT NULL,
	"closes" time NOT NULL,
	"open_days" text[] DEFAULT '{Mon,Tue,Wed,Thu,Fri,Sat,Sun}' NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"sort" smallint DEFAULT 0 NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "branches_slug_unique" UNIQUE("slug"),
	CONSTRAINT "branches_hours" CHECK ("branches"."closes" > "branches"."opens")
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"for_lenses" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "brands_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "camp_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"camp_id" uuid NOT NULL,
	"path" text NOT NULL,
	"position" smallint NOT NULL,
	"shows_people" boolean DEFAULT false NOT NULL,
	"consent" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "camp_photos_position" UNIQUE("camp_id","position"),
	CONSTRAINT "camp_photos_max12" CHECK ("camp_photos"."position" between 0 and 11),
	CONSTRAINT "camp_photos_consent" CHECK (not "camp_photos"."shows_people" or "camp_photos"."consent")
);
--> statement-breakpoint
CREATE TABLE "colours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "colours_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"address" text,
	"branch" "enquiry_branch" DEFAULT 'either' NOT NULL,
	"topic" "enquiry_topic" NOT NULL,
	"message" text NOT NULL,
	"frame_code" text,
	"reply_by" "reply_by" DEFAULT 'whatsapp' NOT NULL,
	"consent_at" timestamp with time zone NOT NULL,
	"status" "enquiry_status" DEFAULT 'new' NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "enquiries_lengths" CHECK (char_length("enquiries"."name") between 2 and 60 and char_length("enquiries"."message") between 10 and 500 and char_length(coalesce("enquiries"."address", '')) <= 150)
);
--> statement-breakpoint
CREATE TABLE "eye_camps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"day" date NOT NULL,
	"starts" time NOT NULL,
	"ends" time NOT NULL,
	"branch_id" uuid,
	"place" text NOT NULL,
	"organised_with" text,
	"description" text NOT NULL,
	"offered" text[] DEFAULT '{}' NOT NULL,
	"people" integer,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "eye_camps_slug_unique" UNIQUE("slug"),
	CONSTRAINT "eye_camps_time" CHECK ("eye_camps"."ends" > "eye_camps"."starts")
);
--> statement-breakpoint
CREATE TABLE "frame_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"frame_id" uuid NOT NULL,
	"path" text NOT NULL,
	"kind" "photo_kind" DEFAULT 'front' NOT NULL,
	"consent" boolean DEFAULT false NOT NULL,
	"position" smallint NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "frame_images_position" UNIQUE("frame_id","position"),
	CONSTRAINT "frame_images_max5" CHECK ("frame_images"."position" between 0 and 4),
	CONSTRAINT "frame_images_consent" CHECK ("frame_images"."kind" <> 'model' or "frame_images"."consent")
);
--> statement-breakpoint
CREATE TABLE "frames" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"slug" text NOT NULL,
	"brand_id" uuid NOT NULL,
	"model" text NOT NULL,
	"category" "frame_category" NOT NULL,
	"gender" "gender" NOT NULL,
	"colour_id" uuid NOT NULL,
	"shape" text NOT NULL,
	"material" text,
	"size_lens" smallint,
	"size_bridge" smallint,
	"size_temple" smallint,
	"lens_types" text[],
	"lens_colour" text,
	"price" integer NOT NULL,
	"availability" "availability" DEFAULT 'in_stock' NOT NULL,
	"available_at" "available_at" NOT NULL,
	"status" "frame_status" DEFAULT 'draft' NOT NULL,
	"review_note" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"approved_by" text,
	"approved_at" timestamp with time zone,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "frames_code_unique" UNIQUE("code"),
	CONSTRAINT "frames_slug_unique" UNIQUE("slug"),
	CONSTRAINT "frames_price" CHECK ("frames"."price" between 1 and 100000)
);
--> statement-breakpoint
CREATE TABLE "gallery_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" text NOT NULL,
	"tag" "gallery_tag" NOT NULL,
	"caption" text NOT NULL,
	"branch" "gallery_branch" DEFAULT 'none' NOT NULL,
	"month" date,
	"shows_people" boolean DEFAULT false NOT NULL,
	"consent" boolean DEFAULT false NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gallery_photos_consent" CHECK (not "gallery_photos"."shows_people" or "gallery_photos"."consent")
);
--> statement-breakpoint
CREATE TABLE "lenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" "lens_type" NOT NULL,
	"features" text[] DEFAULT '{}' NOT NULL,
	"price" integer,
	"photo_path" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"branch_id" uuid,
	"quote" text NOT NULL,
	"agreed_on" date NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branch_closures" ADD CONSTRAINT "branch_closures_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "camp_photos" ADD CONSTRAINT "camp_photos_camp_id_eye_camps_id_fk" FOREIGN KEY ("camp_id") REFERENCES "public"."eye_camps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eye_camps" ADD CONSTRAINT "eye_camps_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "frame_images" ADD CONSTRAINT "frame_images_frame_id_frames_id_fk" FOREIGN KEY ("frame_id") REFERENCES "public"."frames"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "frames" ADD CONSTRAINT "frames_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "frames" ADD CONSTRAINT "frames_colour_id_colours_id_fk" FOREIGN KEY ("colour_id") REFERENCES "public"."colours"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lenses" ADD CONSTRAINT "lenses_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointments_slot" ON "appointments" USING btree ("branch_id","day","slot_start");--> statement-breakpoint
CREATE INDEX "frames_listing" ON "frames" USING btree ("category","status","is_active");