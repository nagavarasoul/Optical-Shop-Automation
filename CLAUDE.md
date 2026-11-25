# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Website for **VS Lens Mart**, a family-run optical shop (since 1999) with two branches (Indresham and Patelguda). Brand tone: a trusted family shop, premium quality at affordable prices ("Welcome to the Optical Family"). Customers browse and then enquire on WhatsApp or visit a branch. **There is no online checkout.**

Status: Phase 5 in progress. Phase 4 (Foundation) is complete as of 2026-10-23; sprints 5.1 Layout (2026-10-23), 5.3 Admin + frames, 5.4 Booking + contact and 5.5 Content modules (2026-10-24) are done, and so are the staff settings pages (Branches, Branch holidays, Staff accounts) and 5.2 Home (2026-10-25). 5.6 Polish (`ROADMAP.md` section 4 build order: 5.1 → 5.3 → 5.4 → 5.5 → 5.2 → 5.6) was built on 2026-11-09 in four parts: A 404 and error pages, B search, C sitemap and share image, D loading states, Add frame button and Lighthouse. Two colour-contrast questions from Lighthouse wait for the client (`docs/open-questions.md`). After it comes Phase 6, virtual try-on (`ROADMAP.md` section 8, `docs/requirements/Requirements_TryOn.md`; plan approved 2026-11-09): built behind `TRYON_ENABLED` (off by default) so it never holds up the launch. Phase 3 (HTML mockups) was signed off by the client on 2026-10-21 in a Google Meet review; the mockups in `mockups/` are the approved design. Missing client details stay `DUMMY` until they arrive and must be replaced before launch. The Next.js app (16.4, App Router, Cache Components on) lives at the repo root; `mockups/` stays as the reference design.

Commands:
- `npm run dev`: the app at http://localhost:3000 (or the `app` config in `.claude/launch.json`)
- `npm run build`, `npm run lint`
- `npm run db:setup`: one-time; asks for the local `postgres` password, creates `vslm_dev` and the three database users, writes `.env.local`
- `npm run db:generate`: after editing `src/db/schema.ts`, creates a migration in `db/migrations/`
- `npm run db:migrate`: app tables, then Better Auth's login tables, then `db/security.sql` (safe to re-run)
- `npm run db:seed`: resets the app tables to the DUMMY development data (login accounts are kept)
- `npm run check:launch`: the pre-launch gate. Lists every DUMMY value still in use (the register in `src/lib/site-config.ts`, placeholder facts, and seed data in the database) and fails while any remain. Not part of `npm test`.
- `npm run staff:create`: creates a staff-area account (admin or staff), or sets a new password for an existing one. You type the details; the password is hidden and stored only as a hash. Normally the admin does this at `/admin/staff`; the script is for the first admin, or if every admin is locked out
- `npm test`: the Playwright suite. It builds the app and starts its **own** production server on port 3100 (the dev server is untouched), makes throwaway accounts and rows, and removes them afterwards. Database checks run in rolled-back transactions. One worker, in order; `rate-limit.spec.ts` runs last. Run it before every commit that touches security, auth, uploads or the schema, and add a test for every new table or rule.
- One spec or one test: `npx playwright test tests/catalogue.spec.ts --project=desktop-1440 -g "sort by price"` (still builds first). Projects: `security` (database, auth, uploads, data rules), `phone-360` / `tablet-768` / `desktop-1440` (pages) and `rate-limit` (runs after all the others). Each project picks its specs by a filename regex in `playwright.config.ts`: **a new spec file runs only after you add its name there.**
- `npx tsc --noEmit`: type check (there is no npm script for it).
- `npm run db:studio`: browse the database (Drizzle Studio).
- Lighthouse: start the `prod` config in `.claude/launch.json` (serves the last `npm run build` on port 3200), then `npx lighthouse@12 http://localhost:3200/<page>` with `CHROME_PATH` set to Playwright's Chromium. Stop it before `npm test`, which rebuilds the same folder.
- `npx next typegen`: regenerates the `PageProps<"/route">` / `LayoutProps` types after adding a route, when `tsc` says the route doesn't satisfy `AppRoutes`.
- The scripts run on plain Node 24 (TypeScript type stripping), so they use relative `.ts` imports, not `@/` aliases.

**Layout (sprint 5.1):** public pages live in `src/app/(site)/` and get the shared chrome from `src/app/(site)/layout.tsx`: utility bar, nav with mega menus, phone menu, sticky bar, branch picker and footer, all in `src/components/site/`. The chrome's CSS is ported unchanged from `mockups/styles.css` into `src/styles/site-chrome.css`; edit it there. Layout data comes from `src/lib/site-data.ts` (cached, tags `branches` and `catalogue`). Admin saves that change frames, lenses or branches must call `updateTag("catalogue")` or `updateTag("branches")`. **The layout is pre-rendered at build time, so `npm run build` and `npm test` need PostgreSQL running.** The chrome itself is `SiteFrame` (`site-frame.tsx`), which the root `src/app/not-found.tsx` also uses, because that page sits outside the `(site)` layout. Missing pages: `NotFoundPage` / `NotFoundView` (`not-found-page.tsx`, `not-found-view.tsx`) for the site, `(site)/error.tsx` for errors, `admin/(staff)/not-found.tsx` inside the staff shell. Call and WhatsApp buttons use `<PickerButton>` (`branch-picker.tsx`); `<DummyTag id>` marks placeholders in development only. Placeholder photos (AI-generated people, DUMMY C12 / C24) live in the gitignored `public/dummy/` and are read only through `src/lib/dummy-photos.ts`, which returns nothing in a production build, so production shows the icon placeholders instead.

**Public data path (frames, menus, branches):** plain query functions in `src/lib/queries/*.ts` take a `Tx` and filter for live rows themselves (approved, active, visible) as well as relying on row-level security. Tests call them directly in rolled-back transactions. Cached wrappers in `src/lib/site-data.ts` and `src/lib/catalogue-data.ts` run them with the `public` role under `'use cache'` with tags `catalogue` / `branches`. Writing rows straight to the database does **not** show on the site until a staff save calls `updateTag`, or the server is rebuilt.

**Catalogue (sprint 5.3):** components live in `src/components/catalogue/`.
- **Listings:** `/frames` and `/sunglasses` send every live frame of the kind to `listing.tsx`, which filters, counts, sorts and pages in the browser.
- **State:** filters live in the address bar (`useSearchParams`, written with `history.replaceState`). The listing sits inside `<Suspense>`, and its fallback is the same listing unfiltered, so the pre-rendered page shows real frames. Mega-menu links (`?for=`, `?tier=`, `?lens=`, `?brand=`) are part of this contract (`menu-links.ts`, `site-config.ts` `priceTiers`).
- **Detail pages:** `[slug]` pages use `generateStaticParams` (it must return at least one param, so `"none"`) and `export const instant = false`. On the production server a missing frame shows `not-found.tsx` with **status 200** plus `noindex`, because the not-found page is streamed. Test the content, not the status.
- **Text helpers:** helpers used by both server and client code live in plain modules such as `frame-text.ts`, not in a `"use client"` file. The server can't call functions exported from one.
- **Links to unbuilt pages:** use `prefetch={false}`, or the prefetch logs 404s and fails the console-error checks in the tests.

**Search engines and sharing (sprint 5.6):** `src/app/sitemap.ts` (public pages plus live frames and camps, from the cached lists), `robots.ts`, and `opengraph-image.tsx`, the site-wide share image drawn at build time with `src/assets/fonts/PlusJakartaSans-ExtraBold.ttf` (Open Font License, `OFL.txt` beside it; a static file, because `next/og` can't use variable fonts). **A page that sets its own `openGraph` must also set `images`**, or it loses the site-wide image (see `frameMetadata`). Search: `/search` with the matching rules in `src/lib/search.ts`.

**Ported CSS:** `src/styles/*.css` (`site-chrome`, `forms`, `admin`, `catalogue`) are copied rule for rule from `mockups/styles.css`, with mockup-only selectors (`.todo`, `.mock-only`) removed, then imported in `globals.css`. When porting more, check that the comments and braces balance: a broken comment builds with only a CSS warning and silently drops rules. Additions that aren't in the mockup go in a marked "Live additions" block. If a CSS edit made outside the editor doesn't show in the dev server (seen 2026-10-25, even across a restart), save the file again through the editor.

**Motion:** `<Reveal>` (`src/components/site/reveal.tsx`) is the mockup's fade and slide up on scroll. Listing cards use `cards-on-scroll.ts`. Both hide only what is below the screen, only from the script, and never with reduced motion. Reuse them rather than adding an animation library.

Next.js 16 differs from older versions (`middleware` is now `proxy.ts`; with Cache Components, anything that reads cookies or the session must sit behind `<Suspense>`). Staff accounts (`/admin/staff`) work on the login tables only through `src/lib/staff-admin.ts` (the `vslm_auth` connection), which also holds the safety rules (own account, last admin, samples only deleted). Staff area: `src/proxy.ts` only checks that a session cookie exists; every admin page and server action must call `requireStaff()` (`src/lib/session.ts`) and pass its role to `withRole()`. Read the matching guide in `node_modules/next/dist/docs/` before writing Next.js code (see `AGENTS.md`).

Don't invent client facts (prices, brands, founder story, email, hours, phone numbers). For anything the client hasn't confirmed, use the placeholder from `docs/dummy-data.md` and mark it `DUMMY`; if it isn't there, add it there first. Dummy values never go live. Check `docs/open-questions.md` for what's still pending.

### Scope

- MVP vs later modules and sprint order: `ROADMAP.md`.
- **Language:** English only. No language toggle, extra fonts or translations.
- **Store management system** (customer login, registration, prescriptions, orders, inventory, billing, reports, audit log, automatic WhatsApp messages) is a separate later phase. Don't build any of it into the website MVP, and don't let it delay the launch.

## Source of truth

When documents disagree, the higher one wins:

1. `CLAUDE.md`: global rules
2. `ROADMAP.md`: scope
3. `docs/requirements/Requirements_<Page>.md`: page details
4. `docs/plan/VS_Lens_Mart_Plan_v1.2.docx`: background only. Some of its figures are v1.1 drawings; their captions say what changed. Older versions were in `docs/plan/archive/` (removed from the repository 2026-11-25; still in git history); don't use them.

Other docs:
- `docs/client-answers.md` and `docs/open-questions.md`: what the client has and hasn't confirmed. The raw form export is `docs/client-details.xlsx`.
- `docs/dummy-data.md`: the only allowed placeholders for missing client details.
- `docs/prescription_card.jpg`: the shop's real prescription card (fields, Indresham number, address).
- `docs/changelog.md`: the change history.
- `docs/ai-fluency-log.md`: the AI usage log.
- `docs/vs_lens_mart_navbar_mega_menu.html`: the navigation mockup. The homepage design image (`docs/Premium Eyewear Visionary Hero.png`) was removed from the repository on 2026-11-25 (it shows AI-generated people); it's still in git history.

## Working rules

- One feature per session.
- Before working on a page, read its `docs/requirements/Requirements_<Page>.md`. If it doesn't exist, write it and get it approved first.
- After any change, add an entry at the top of `docs/changelog.md` (newest first) in this format:

  ```
  ## YYYY-MM-DD · Phase/Sprint · Area
  - **Changed:** what changed
  - **Why:** the reason or decision behind it
  - **Files:** paths touched
  ```

## Folder rules

| What | Where |
|---|---|
| Pages and routes | `src/app/<route>/` (e.g. `src/app/frames/[slug]/page.tsx`) |
| Staff admin pages | `src/app/admin/` |
| Shared UI | `src/components/` |
| Database client (`db.ts`), auth (`auth.ts`), uploads (`storage.ts`), helpers | `src/lib/` (server-only where they touch the database) |
| Shop facts (hours, phone, WhatsApp, addresses) | The `branches` table (the admin edits it at `/admin/branches`), with `src/lib/site-config.ts` as the seed and fallback. Never hard-code them in components. |
| Database schema, migrations, row-level security, seed | `src/db/schema.ts` (Drizzle), `db/migrations/` (generated), `db/security.sql`; scripts in `scripts/` (`db-setup.ts`, `db-migrate.ts`, `db-seed.ts`) |
| Playwright tests | `tests/` |
| HTML mockups for client sign-off | `mockups/` |
| Requirements | `docs/requirements/Requirements_<Page>.md` |

## Mockups (`mockups/`)

Static HTML pages, signed off by the client on 2026-10-21. They are the reference design for the build. No build step. They open straight from the file system, but use a server for browser checks:
- **Preview:** the `mockups` config in `.claude/launch.json`, or `python -m http.server 8765` from the repo root. Then open `http://localhost:8765/mockups/home.html`.
- **Verify:** check at 1440 and 375 px (plus 768 / 1180 when layout changes), in both light and dark mode.

Every page is thin; the shared files do the work:

| File | Role |
|---|---|
| `styles.css` | All styles. Section 1 holds the tokens and the colour roles; light and dark mode swap only the roles. Later sections: header, home sections (7), listings (8), product detail (9). Components use roles (`--surface`, `--heading`, …), never raw light colours. |
| `site.js` | Injects the header (utility bar, nav, mega menus, search, theme toggle), mobile drawer, sticky bar, branch picker, footer (after `<main>`) and mockup controls, then wires them. Its `MOCKS` table maps live routes to mockup files: a link to a built page opens it, anything else shows a "not mocked up yet" toast. Add a line there when a page is built. |
| `frames-data.js` | `window.VSLM`: DUMMY frames and sunglasses (same shape as the live `frames` table), `card()`, slugs and URLs, device-only favourites. |
| `listing.js` | `VSLM_LISTING(cfg)`: filters, counts, chips, sort, Saved, load more, URL state and the phone filter panel. Frames and Sunglasses differ only in `cfg` (`items`, `groups`, `tiers`, wording). |
| `admin.js` | The staff area shell for `admin*.html`, used **instead of** `site.js`: top bar, sidebar (a drawer on phones) with the branch switcher (admin picks a branch; staff see their own), branch details, DUMMY drafts, a mockup-only "View as Staff / Admin" switch (`[data-only="admin|staff"]`), and a `guard` hook for unsaved changes. Its `mockFile()` maps admin routes to mockup files. |

Page conventions:
- Each page has the one-line `vslm-theme` script before `styles.css` in `<head>` (applies dark mode before paint).
- `<body data-page="…">` sets the current menu item; content goes in `<main id="main">`.
- Load `site.js` first, then the data and listing scripts, then the page's own script.
- `frame-detail.html` serves both `/frames/<slug>` and `/sunglasses/<slug>` via `?frame=<slug>`.
- `review.html` is the client review pack (not a site page). The client reviewed the mockups live on Google Meet instead, so it wasn't sent; it still lists the missing information.
- **Review notes:** `.todo` tags (dashed gold) and `.mock-only` blocks are notes for the client, hidden by the "Review notes" toggle and never part of the site. Tag every dummy value `DUMMY` with its `docs/dummy-data.md` id.
- **Branch picker:** `data-picker="call|whatsapp"` on any button opens it, and `data-wa-text` prefills the message. `data-dummy` on a link stops a dummy number from dialling.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS v4, with the design tokens below in `src/app/globals.css` (`@theme`) |
| Animation | CSS plus small scripts (`<Reveal>`, `cards-on-scroll.ts`), fades and slides only. Framer Motion was planned but isn't installed |
| Database | PostgreSQL 17, running locally on the developer's laptop (database `vslm_dev`); Drizzle ORM and migrations |
| Auth | Better Auth (email + password) for the `/admin` area, with two roles: `admin` and `staff`. No public sign-up |
| Files | Local `uploads/` folder (frames, lenses, camps, gallery), only through `src/lib/storage.ts`, so it can move to cloud storage later. Rules (real type from the first bytes, JPEG/PNG/WebP, 10 MB) in `src/lib/upload-rules.ts`. Photos are served by `/media/<path>`, only when their database row is visible to the person asking |
| Forms | Server actions + Zod validation |
| Messaging | WhatsApp `wa.me` links. They work with a normal WhatsApp number, so no WhatsApp Business account is needed for launch. No WhatsApp API in the MVP. |
| Favourites | Saved on the device only (`localStorage`), no login |
| Maps | Google Maps embed |
| Testing | Playwright, run at 360 / 768 / 1440 px. Page tests fail on any browser console error. They work out expected results from the database with the site's own queries (they need the seed data), and wait until React has hydrated before clicking (see `open()` / `formReady()` in the specs) |
| Hosting | Local laptop for now (developer decision 2026-10-21). DigitalOcean later; deployment isn't planned yet |

### Data security (PostgreSQL)

- **The browser never talks to the database.** Only server code (server components, server actions, route handlers) does, through `withRole()` in `src/lib/db.ts`, which sets the request's role (`public`, `staff`, `admin`).
- **Database users:** `vslm_owner` owns tables and runs migrations; `vslm_app` is the website's runtime user (no ownership, no BYPASSRLS); `vslm_auth` is used only by Better Auth for its own tables.
- Row-level security is enabled **and forced** on every table (`db/security.sql`), keyed on the request role.
- **Roles:** `staff` add and edit content; a frame they add is a `draft`. Only `admin` approves frames, manages staff accounts and deletes content.
- **Public tables** (frames, frame_images, lenses, eye_camps, camp_photos, gallery_photos, testimonials, branches): anyone can read rows where `is_active` / `is_visible` is true (frames: also `status = 'approved'`), and only staff can write.
- **Private tables** (customers, prescriptions, appointments, enquiries, orders): staff-only for both read and write. The public booking form may **insert** into appointments but never select.
- Every form that collects a name and phone needs a consent checkbox (DPDP Act 2023). The site needs a `/privacy` page. Its data-retention period is a `DUMMY` value from `docs/dummy-data.md` until the client confirms it.
- Database URLs, passwords and the auth secret live only in `.env.local` (gitignored); `.env.example` lists the names only. None of them reach the browser.
- **Public forms** (booking, enquiry) are guarded by `src/lib/form-guard.ts`: a hidden spam-trap field, a 3-second minimum fill time (both answered with a fake success), and a per-minute limit that uses the same `TRUSTED_IP_HEADER` rule as sign-in (one shared bucket without it). Bookings are saved by `placeBooking()` (`src/lib/booking-core.ts`) under a per-slot advisory lock, so two people can't take the last place.
- **Retention:** `purge_expired(days)` (`db/security.sql`, security definer, refuses under 30 days) deletes bookings and enquiries older than `RETENTION_DAYS` (`site-config.ts`, `DUMMY` D9, also shown on `/privacy`). It runs after each booking or enquiry and when staff open the lists (`src/lib/retention.ts`), so no scheduler is needed. When deploying, a daily job calling it would also cover quiet periods.
- **Sign-in limit:** 5 attempts a minute. Visitor IP headers such as `X-Forwarded-For` are **not trusted** unless `TRUSTED_IP_HEADER` names one that the host's proxy overwrites (a browser can fake them; tested 2026-10-23). Locally, all attempts share one bucket. **At deployment:** set `TRUSTED_IP_HEADER` and re-run the rate-limit test against the real host.
- **Sign out** loads the login page fresh (`src/app/admin/sign-out-button.tsx`), so Back can't show a staff page from the browser's memory. Keep it that way for any new sign-out control.

### Frames data

From the client's form (Q20, Q27, Q34, Q37, Q39). It applies to sunglasses too (category = sunglasses).

- **Fields:**
  - frame code, brand, category, model, colour, price (exact ₹), gender, material, size, shape;
  - up to 5 photos;
  - `status`: `draft` → `approved`;
  - `availability`: in stock / sold out. This is separate from `is_active`; sold-out frames stay visible with a "Sold out" label.
  - `available_at`: Indresham / Patelguda / both. There are no stock counts; those belong to the store management system.
- **Customer filters:** brand, price, gender, category, colour, shape, availability. There is no rim-type filter unless the client asks for one.
- **Frame detail:** enquire on WhatsApp, share on WhatsApp, favourite.
- **Photos:** product-only photos. "Model wearing it" photos only with real staff or customers who gave written consent.

## Design system

| Token | Value | Use |
|---|---|---|
| Navy (primary) | `#0D1B2A` | Header, hero, footer, quote band |
| Navy (secondary) | `#1E3A5F` | Cards, hover states, borders |
| Gold (accent) | `#F5C842` | Primary buttons, headline highlight |
| Gold (logo / brass) | `#C9A227` | Logo, thin dividers, icons |
| Cream (background) | `#FAF6EE` | Light page sections |
| Text dark / light | `#1A1A1A` / `#FFFFFF` | Body text on light / dark |
| Heading font | Plus Jakarta Sans, ExtraBold | Headlines |
| Body font | Inter, Regular | Paragraphs, forms |
| Buttons | Pill shape, 48px tall | Gold filled = primary, white outline = secondary |
| Animation: page / section | Fade and slide up on scroll, 300–500 ms | No 3D, respect reduced-motion |
| Animation: menus | Open / close in 300 ms or less | No animation when reduced-motion is on |
| Dark mode: page / sections / cards | `#0A1622` / `#0F1E2E` / `#162B42` | Dark mode only. Text and headings use Cream, accents use Brass and Gold |

**Light and dark mode:**
- Every page has a light and a dark mode. A sun/moon toggle in the header switches them.
- It follows the device setting until the visitor chooses. The choice is saved on the device (`localStorage` `vslm-theme`) and applied in `<head>` before the page draws.
- Components use colour roles (`--bg`, `--bg-alt`, `--surface`, `--text`, `--text-muted`, `--line`, `--heading`, `--accent-ink`, `--btn-ink`, `--pressed-bg` / `--pressed-ink`), never raw light colours, so both modes come from one stylesheet. See `mockups/styles.css` section 1.
- Navy blocks (hero, utility strip, footer, quote band) and gold buttons look the same in both modes.
- **Main menu bar:** white with navy text in light mode, navy in dark mode (developer idea 2026-10-23, **not yet confirmed by the client**; the signed-off mockup is navy). It uses the `--nav-*` colour roles in `globals.css`. To go back, delete the marked block in `src/styles/site-chrome.css`.

**Hero pattern:**
- "Trust / Care / Innovation" eyebrow.
- A headline with a white line, a gold line and a white line.
- A gold "Explore our frames" button and an outline "Book an eye test" button. Only these two.
- "WhatsApp us" and "Visit store" go in quick cards below the hero.
- There is no "Virtual try-on" button in the hero. Try-on (Phase 6) starts from frame pages and the listings, only for frames with try-on switched on, and only when `TRYON_ENABLED` is on.
- A navy gradient overlay behind any text on photos.

Use "Since 1999" and compute the years in code. Never hard-code "25 years".

## Navigation

Full spec (mega-menu contents, mobile accordion, sticky bar, behaviour, acceptance criteria): `docs/requirements/Requirements_Navigation.md`.

The logo and a "Home" item both link to `/`. The 7 top-level items, in order (client change 2026-10-21; Eye camps moved into the Eye care menu 2026-11-16, developer request, **not yet confirmed by the client**):

1. **Home:** plain link to `/`
2. **About:** plain link to `/about`
3. **Frames:** mega menu
4. **Sunglasses:** mega menu
5. **Lenses:** mega menu
6. **Eye care:** photo cards
7. **Contact:** plain link to `/contact`

Eye camps (`/eye-camps`) is not a top-level item: it's a card in the Eye care menu (desktop and phone), a footer link and a home page section, and the Eye care item is underlined on its pages.

On the right are the light/dark toggle, Search and WhatsApp icons. There are never cart or account icons. Favourites are a heart on frame cards and frame detail, not a nav icon. To add an item, remove one first.

**Routes:**
- `/`, `/about`, `/frames`, `/frames/[slug]`, `/sunglasses` (frames table, category = sunglasses)
- `/lenses`, `/eye-care`, `/book-eye-test`, `/eye-camps`
- `/gallery`: its own page, linked from About and the footer, not from the top menu
- `/contact`, `/privacy`, `/admin`
- Try-on (Phase 6) adds no route: a panel on frame detail pages (`?tryon=1` opens it) and a listing switch (`?onme=1`)

Every page shares the utility bar, the nav, and a footer with:
- both branch addresses, hours and phone numbers;
- quick links;
- social links (YouTube, Facebook, Instagram; `DUMMY` URLs until the client sends them);
- the privacy link.

Shop facts, read from the `branches` table (edited by the admin at `/admin/branches`; `src/lib/site-config.ts` holds the seed values):
- **Hours:** 9:00 AM–9:30 PM, Monday–Sunday, both branches.
- **Indresham:** 9550685417 (phone and WhatsApp).
- **Patelguda:** its own number, still `DUMMY` (`docs/dummy-data.md` D2).

## Never do

- Never use stock photos or generated people on the live site. Real people only with written consent.
- Never put `DUMMY` values on the live site.
- Never expose customer, prescription, appointment, enquiry or order data to the public.
- Never hard-code secrets; use environment variables.
- No 3D or heavy animation; fades and slides only.
- Never use colours outside the design-system tokens.
- Always design mobile-first and check at 360 px.

## Repo conventions

`CLAUDE.local.md`, `.claude/settings.local.json` and `.env` / `.env.*` are gitignored. Only `.env.example` is committed.
