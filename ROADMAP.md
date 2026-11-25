# ROADMAP

VS Lens Mart website: MVP vs later modules, sprints, and build order. It's based on the Phase 5 sprint table of the project plan (v1.1 navigation update), with the changes agreed in the Phase 2 planning session (section 6).

Sources: `CLAUDE.md`, `docs/requirements/Requirements_Navigation.md`, `docs/client-answers.md` (including the 160-question form, 2026-10-07), `docs/dummy-data.md`, and the v1.1 project plan. Scope decisions from the form were made on 2026-10-09 (section 6). Navigation is the only page with a requirements file so far. Write each page's `docs/requirements/Requirements_<Page>.md` before its sprint starts.

## 1. MVP (first launch)

- Home
- Navigation with mega menus
- About / Our Journey
- Frames, plus frame detail
- Sunglasses
- Lenses
- Eye Care
- Book an eye test
- Eye Camps
- Gallery
- Contact
- Privacy policy
- Admin panel: frames, lenses, camps, gallery, reviews, bookings
- Two admin roles: `staff` add frames as drafts, `admin` approves them (added, see section 6)
- Frame availability ("Sold out" label) and "Available at: Indresham / Patelguda / both" (added)
- Frame filters from the client: brand, price, gender, category, colour, shape, availability (added)
- Favourites saved on the device, no login; WhatsApp share and enquiry on each frame (added)
- Eye care services: eye testing, instant spherical lens fitting, frame adjustment, frame repair (added)
- Social links in the footer (added)
- Light / dark mode with a header toggle; follows the device setting until chosen (added 2026-10-10)
- Basic search of frames and lenses by name or brand (added, see section 6)

## 2. Later modules

| Module | Why later / dependency |
|---|---|
| **Store management system** (separate later phase, section 7) | Customer login, registration, prescriptions, orders, inventory, billing, reports and automatic WhatsApp messages. It's effectively a second project and must not delay the website launch. |
| Online appointment cancel / reschedule | The MVP booking confirmation says "Call or WhatsApp to reschedule". Online changes need a way to look up a booking, which the insert-only appointments table doesn't allow. |
| Google Analytics | Needs a consent banner and a privacy policy update first. |
| Google reviews on the site | The client has no Google Business Profile yet. Use manual testimonials until then; recommend the client creates one (it helps local search). |
| Email alerts for bookings and enquiries | Waiting on the client's enquiry email address. |
| Virtual try-on | Now Phase 6, after launch (section 8). |

## 3. Before the sprints: Foundation (Phase 4), complete 2026-10-23

Done: all of the scope below, proven by `npm test` (46 automated tests). The DigitalOcean deployment and the real dashboard are not part of it.

| Scope | Done when | Effort |
|---|---|---|
| Next.js + TypeScript + Tailwind v4; design tokens and fonts in `globals.css`; PostgreSQL 17 on the laptop with separate database users; Drizzle schema and migrations; `db/security.sql` with forced row-level security on every table; local `uploads/` folders (frames, lenses, camps, gallery) behind `src/lib/storage.ts`; Better Auth login with `admin` and `staff` roles; frames `status` / `availability` / `available_at` columns; DUMMY seed data; `.env.example`; Playwright config. Runs locally only; deployment (DigitalOcean) is decided later (developer decisions 2026-10-21) | A request with the public role can't read any private table, and the admin can sign in | 3–4 days |

## 4. Sprints (Phase 5)

Sprints keep the plan's numbers, but they are **built in this order: 5.1 → 5.3 → 5.4 → 5.5 → 5.2 → 5.6** (see section 6). Estimates assume one part-time developer.

| Sprint | Features | Done when | Effort |
|---|---|---|---|
| 5.1 Layout | Utility bar with both branch numbers; mega-menu navigation (brands and prices from the database); mobile accordion menu; sticky Call / WhatsApp / Book bar; footer with social links; design tokens and colour roles for light / dark mode, with the toggle; fonts | Every page shares the layout, the menus work by mouse, touch and keyboard, and it works at 360 px | 3–4 days |
| 5.2 Home | All 13 homepage sections, with the database sections (featured frames, eye camps, reviews, branches) wired to live data | It matches the signed-off mockup | 2–3 days |
| 5.3 Admin + frames | Admin/staff login; staff add/edit frames and sunglasses as drafts with up to 5 photos (size and type checks); admin approval; availability and "Available at"; Frames page with the client's filters; Sunglasses page; Frame detail with WhatsApp enquiry and share; device-only favourites; nav brand and price hookup | Staff upload a frame on a phone, an admin approves it, and only then does it appear on the site; a sold-out frame shows "Sold out" | 5–6 days |
| 5.4 Booking + contact | Book an eye test (confirmation says "Call or WhatsApp to reschedule"), enquiry form, both branches with maps and their own numbers, prefilled WhatsApp links, consent checkboxes, privacy policy (retention period `DUMMY`) | A booking is saved, a logged-out user can't read it, and the WhatsApp message opens to the right branch | 2–3 days |
| 5.5 Content modules | Lenses, Eye care with the 4 services, eye camps, gallery, testimonials (admin and public pages), About / Journey timeline | Staff can add each type of content | 4–5 days |
| 5.6 Polish | SEO titles, Open Graph images, alt text, loading states, 404 page, basic search | Lighthouse checks pass, with no console errors | 2–3 days |

The total, including Foundation, is about 20–27 working days, roughly 4–5 weeks part-time.

## 5. Dependencies

```
Foundation (schema + row-level security, auth, uploads, tokens)
 ├─> 5.1 Layout/nav ─────────> every page
 │     (mega-menu brands and prices: hidden until products exist)
 ├─> Staff login ─> Admin shell ─> 5.3 Frames admin + upload
 │        ├─> /frames, /frames/[slug], /sunglasses
 │        ├─> nav brands / "from ₹"
 │        └─> 5.2 Home "featured frames"
 ├─> branches table ─> footer, /contact, booking branch picker, Eye care cards
 ├─> appointments (insert-only) + consent + /privacy ─> /book-eye-test
 ├─> enquiries + consent + /privacy ─> contact enquiry form
 ├─> 5.5 Lenses admin ─> /lenses, nav lens brands
 ├─> 5.5 Eye camps admin ─> /eye-camps, 5.2 Home camps section
 ├─> 5.5 Gallery admin ─> /gallery (linked from /about)
 └─> 5.5 Testimonials admin ─> /about reviews, 5.2 Home reviews
Mockups signed off (Phase 3) ─> each page's sprint
```

Client inputs block **launch**, not building. Until they arrive, use the `DUMMY` values in `docs/dummy-data.md` (see also `docs/open-questions.md`):
- **Content:** photos, frame and lens brands, whether to show a year count next to "Since 1999", the founder story.
- **Contact details:** the Patelguda phone/WhatsApp number, the enquiry email, social media URLs.
- **Branding:** a high-res logo (the current PNG spells "FAMLY"), and whether the eye test is free.
- **Privacy:** how long customer data is kept.

## 6. Changes from the plan (agreed in Phase 2)

| Change | Plan said | Roadmap says | Why |
|---|---|---|---|
| Foundation step | Part of Phase 4 | A separate step before 5.1, with "done when" and effort | Row-level security has to exist before any form or admin page |
| Home order | 5.2, built second, static content first | Still 5.2, but built after 5.5 | Its database sections can then be built once against real tables, not built static and redone |
| Sunglasses | Not in the sprint table | Added to 5.3 | It shares the frames table and admin (category = sunglasses) |
| Search | Not scheduled; the nav requirements left it as a developer TODO | Basic search in 5.6 | The search icon is in the v1.1 nav |
| Languages | Language toggle in 5.6; full translation later | English only, in every sprint and later module | Developer decision, 2026-10-09. Recorded in the changelog; will go into plan v1.2. |
| Estimate | 3–4 weeks of development | About 20–27 days including Foundation | More realistic for one part-time developer; 5.3 grew by a day for approval, availability and favourites. Flag this to the client |
| Frame approval + roles | Staff upload and it appears | Draft → approved; `admin` and `staff` roles from the start | Client wants admin approval (Q37). Approval only works if one person uploads and another approves, so two roles are needed now. Audit log and 5+ accounts wait for the store system |
| Frame data | Men / women / kids / sunglasses filters | Client's fields and filters; availability separate from `is_active`; "Available at" a branch | Client form Q20, Q24, Q25, Q27, Q39. Real stock counts wait for the store system |
| Favourites | Not planned; "never wishlist" | Device-only, no login | Client wants it (Q28); no accounts in the MVP |
| Eye care menu | Contact lenses, reading glasses, care products | The client's 4 services | Client listed its services (Q92) and never mentioned the others |
| Hero CTAs | Two buttons | Still two; WhatsApp us / Visit store as quick cards; no Try-on button | Client listed 5 CTAs (Q9). Try-on (Phase 6, section 8) starts from frame pages, not the hero, unless the client asks |
| Store management system | Customer and prescription records, reminders, orders as separate later modules | One later phase (section 7) | Client's form asks for a full counter system (Q51–135); it's a second project |

## 7. Later phase: Store management system

Starts only after the website launches. It needs its own requirements, schema, row-level security and estimate. Based on the client's form:

- **Customers:** registration for first-time customers; customer login, own history and updating details (Q51–56).
- **Prescriptions:** fields from `docs/prescription_card.jpg`. Admin-only editing with version history; retention period to confirm (Q57–66).
- **Orders:** statuses New → Prescription Verified → Ordered → Lens Processing → Ready → Delivered / Cancelled; total, advance, balance; online order status (Q67–74).
- **Inventory:** stock per branch, low-stock and daily stock reports, damaged/lost frames, lenses included (Q113–128).
- **Billing:** Cash / UPI, no GST (Q129–135).
- **Staff:** 5+ accounts, admin vs staff permissions, audit log (Q102–112).
- **Automatic WhatsApp messages:** appointment and order confirmation, ready for pickup, eye-check reminders. Needs WhatsApp Business and an API provider (Q81–87).

## 8. Phase 6: Virtual try-on (after launch)

Moved out of "Later modules" on 2026-11-09 (developer decision), after a working prototype showed a frame lined up on an uploaded photo in the browser. Full details: `docs/requirements/Requirements_TryOn.md`.

- **When:** after sprint 5.6 Polish. It may be built while the launch still waits on client details, but behind the `TRYON_ENABLED` switch (off by default), so it never holds up the launch and adds nothing to the launch pages' size or Lighthouse scores.
- **Before 6.1:** the client sees a mockup of the customer screens and answers Q40 (what they expect) and Q48 ("Both").
- **Face tracking:** MediaPipe Face Landmarker, self-hosted in `public/tryon/` (one library for photo now and live camera later). The customer's photo never leaves the device.

| Release | Features | Done when | Effort |
|---|---|---|---|
| 6.1 Try-on (photo) | Staff try-on switch per frame, front-view picture clean-up (background, arm tips, lens line) and upload; "Try it on" panel on frame detail with sliders, hold to compare and save image | Staff prepare a frame on a phone, and a customer sees it on their own photo on Android, iPhone and desktop, with no photo leaving the device | 4–6 days |
| 6.2 Listing "on you" | After one photo, a switch shows each try-on frame's card on the customer's face while scrolling | 24 cards draw smoothly on a mid-range phone; other frames unchanged | 3–4 days |
| 6.3 Share and compare | Share through the phone's share sheet (WhatsApp), save-then-WhatsApp on desktop; two looks side by side | The image reaches WhatsApp on a phone | 1–2 days |
| 6.4 QR codes | A printable QR label per try-on frame that opens its try-on | A printed code opens the frame with try-on open. Needs the real domain (Q156) | 1 day |
| 6.5 Live camera | Try-on on the live camera, switching frames with it open | Works on Android and iPhone; needs answers to Q43 and Q50 first | 3–5 days |
