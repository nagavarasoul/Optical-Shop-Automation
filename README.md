# VS Lens Mart website

A website for **VS Lens Mart**, a family-run optical shop (since 1999) with two branches, Indresham and Patelguda. Customers browse frames, sunglasses and lenses, book an eye test and send an enquiry; they buy by WhatsApp or at a branch, so there is **no online checkout**. Staff manage the catalogue and content in a signed-in staff area.

> **Status:** the website (Phase 5) is complete and runs locally. Client details that haven't arrived yet (some phone numbers, photos, brands, social links and so on) are placeholder values marked `DUMMY`, listed in `docs/dummy-data.md`; they must be replaced before launch. It has not been deployed yet.

## Features

**Public site**
- Home, About, Eye care, Eye camps (with camp pages), Gallery, Contact and Privacy pages
- Frames and Sunglasses listings with filters (brand, price, gender, colour, shape, availability), sorting, and frame detail pages with WhatsApp enquiry and share
- Lenses catalogue
- Eye test booking by branch, day and time slot, with live availability
- Enquiry form, with WhatsApp and call buttons for each branch
- Site search, sitemap, share images, 404 and error pages
- Light and dark mode; works on phones, tablets and desktops
- Favourites saved on the device only (no customer accounts)

**Staff area (`/admin`)**
- Sign-in with two roles, **admin** and **staff**; no public sign-up
- Frames and sunglasses (up to 5 photos each), lenses, eye camps, gallery, testimonials
- Frames added by staff are drafts until an admin approves them
- Bookings and enquiries lists
- Branch details, closed days (holidays) and staff accounts (admin only)

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Cache Components), React 19, TypeScript |
| Styling | Tailwind CSS 4 plus CSS ported from the approved HTML mockups |
| Database | PostgreSQL 17 with Drizzle ORM and migrations |
| Auth | Better Auth (email and password) |
| Forms | Server actions with Zod validation |
| Tests | Playwright at 360, 768 and 1440 px, plus security tests |

## Security in brief

- The browser never talks to the database; only server code does.
- Row-level security is switched on **and forced** on every table. Each request runs as `public`, `staff` or `admin`, and the database itself decides what that role may read or change.
- Three database users: `vslm_owner` (owns tables, runs migrations), `vslm_app` (the website, cannot bypass security), `vslm_auth` (login tables only).
- Bookings and enquiries can be submitted by anyone but read only by staff, and are deleted automatically after the retention period.
- Public forms have a spam trap, a minimum fill time and a rate limit; sign-in is limited to 5 attempts a minute.
- Uploads are checked by their real file type and size and served only when their record is visible.
- All passwords and secrets live in `.env.local`, which is never committed.

## Requirements

- **Node.js 24** (the setup scripts run TypeScript directly, which needs Node 24)
- **PostgreSQL 17**, running locally on port 5432, and the password of its `postgres` user
- npm (comes with Node)

## Getting started

```bash
npm install
```

```bash
npm run db:setup
```
Asks for the `postgres` password (used once, never saved), creates the database `vslm_dev` and its three users, and writes `.env.local` with generated passwords and an auth secret.

```bash
npm run db:migrate
```
Creates the tables, the login tables and the security rules (safe to re-run).

```bash
npm run db:seed
```
Fills the database with `DUMMY` sample data.

```bash
npm run staff:create
```
Creates the first admin account for the staff area (you type the email and a password of 10 or more characters).

```bash
npm run dev
```
Opens the site at http://localhost:3000 and the staff area at http://localhost:3000/admin.

## Other commands

| Command | What it does |
|---|---|
| `npm run build` / `npm start` | Production build and server (PostgreSQL must be running: pages are pre-rendered from the database) |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type check |
| `npm test` | The Playwright test suite. It builds the app and starts its own server on port 3100. First run `npx playwright install chromium` |
| `npm run db:generate` | Creates a migration after editing `src/db/schema.ts` |
| `npm run db:studio` | Browse the database |
| `npm run check:launch` | Pre-launch check: lists every `DUMMY` value still in use, and fails while any remain |

## Project structure

```
src/
  app/(site)/        public pages
  app/admin/         staff area (login and staff pages)
  app/api/, media/   auth endpoint and photo serving
  components/        UI components (site chrome, catalogue, admin, ...)
  lib/               server logic: database access, auth, uploads, form guard, queries
  db/schema.ts       database tables (Drizzle)
  proxy.ts           staff-area gate
  styles/            CSS
db/                  migrations and security.sql (grants, row-level security, functions)
scripts/             setup, migrate, seed, staff accounts, launch check
tests/               Playwright tests
mockups/             the HTML design the client approved (reference only)
docs/                requirements for each page, changelog, AI usage log, client answers
```

`ROADMAP.md` describes the scope and build order. `CLAUDE.md` holds the project rules used while building it with Claude Code.

## Not included here

- **Virtual try-on** (Phase 6) is kept on a separate development branch, not part of this submission, and is planned for after launch.
- The store management system (customer records, prescriptions, orders, billing) is a separate later phase.
