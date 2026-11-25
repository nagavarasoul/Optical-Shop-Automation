# Changelog

All notable changes to the VS Lens Mart website project documentation and plan are recorded here.

New entries go at the top, newest first. Each entry starts with a heading `## YYYY-MM-DD · Phase/Sprint · Area`, followed by **Changed**, **Why** and **Files** lines (see `CLAUDE.md`). The v1.0 and v1.1 entries further down are older, plan-version entries.

## 2026-11-25 · Submission · README and repository clean-up
- **Changed:** added `README.md` (overview, features, stack, security, requirements, setup, commands, structure). Removed files not needed in the repository: the scratch note `changes to the mockups.txt`, the archived plans `docs/plan/archive/` (v1.0, v1.1), and the old design images `docs/Premium Eyewear Visionary Hero.png` (AI-generated people) and `docs/logo.png`. The documents that mention them now say they were removed (they're still in git history).
- **Why:** preparing `main` for submission to the professor's GitHub repository. Virtual try-on stays on `feature/virtual-try-on`, unmerged.
- **Files:** `README.md`, `CLAUDE.md`, `docs/dummy-data.md`, `docs/open-questions.md`, `docs/requirements/Requirements_HomePage.md`, `docs/requirements/Requirements_Navigation.md`, `docs/changelog.md`, and the removed files above

## 2026-11-16 · Phase 5 follow-up · Navigation: larger menu items
- **Changed:** the top menu items are larger and further apart on wide screens: 16px text with 16px each side from 1280px, and 20px each side from 1440px (the mockup has 15px text and 12px). Between 1180 and 1279px they keep the mockup's tighter 14px / 10px, because the larger size made the page scroll sideways at 1180px. Checked at 1180, 1280 and 1440px: no sideways scroll.
- **Why:** developer request: with 7 items the bar looked short. A marked "Live additions" block, so deleting it restores the mockup sizes.
- **Files:** `src/styles/site-chrome.css`, `docs/changelog.md`

## 2026-11-16 · Phase 5 follow-up · Navigation: 7 top-level items
- **Changed:** removed "Eye camps" from the top menu bar (desktop and phone), leaving 7 items: Home, About, Frames, Sunglasses, Lenses, Eye care, Contact. Eye camps stays reachable from the Eye care menu's card, the phone menu's Eye care section, the footer and the home page; on `/eye-camps` pages the Eye care item now gets the gold "you are here" underline. Layout test updated to 7 items, plus a new test for the Eye care link and underline.
- **Why:** developer request: the 8-item bar felt too long, and Eye camps already sits under Eye care. **Not yet confirmed by the client**, who signed off the 8-item order on 2026-10-21. The mockups (`mockups/site.js`) still show 8 items.
- **Files:** `src/components/site/menu-links.ts`, `tests/layout.spec.ts`, `docs/requirements/Requirements_Navigation.md`, `CLAUDE.md`, `docs/changelog.md`

## 2026-11-09 · Sprint 5.6 part D · Loading states, Add frame button, Lighthouse

- **Changed:**
  - **Add frame button (phones and tablets):** it no longer covers a form's sticky Save bar. The mockup hid it on every form with that bar; the app only did so on frame forms, so on camps, lenses, gallery, holidays and branches it sat on top of Save. Any staff page with the bar now hides it (`admin.css` live addition); lists keep it.
  - **Staff loading state:** the 20 staff pages that showed a bare "Loading…" now show `AdminLoading`, the shape of a heading and list rows that fades gently (none with reduced motion), announced as "Loading…". Public pages needed nothing: they already pre-draw their real content.
  - **Accessibility fixes from Lighthouse:** the footer's column titles are now `h2` (they were `h3` with no `h2` before them on the booking page); the listing's active-filter chips have `role="group"` for their label.
- **Lighthouse** (version 12 through `npx`, not installed; production build, this laptop; Home, Frames, a frame, Lenses, Contact, Book):
  - Best practices 100 and SEO 100 on every page, mobile and desktop.
  - Accessibility 92–100 before, 96–100 after. What's left is colour contrast, which needs a colour decision (`docs/open-questions.md`): the gold "VS" on the unconfirmed white menu bar (1.58 to 1), and small brass labels on cream (2.24 to 1).
  - Performance: desktop 83–99; mobile about 55–77, varying a lot between runs on a busy laptop (Home's blocking time measured 3.1 s once, then about 1 s twice, the same as Frames). The steady issue is that the largest text appears at about 4 s on a simulated slow phone, likely the five web-font files (Inter in four weights plus Plus Jakarta Sans). Not changed: fewer font weights is a design choice.
- **Why:** sprint 5.6 (`ROADMAP.md`): loading states, Lighthouse checks; the Add frame button was a known issue.
- **Tests:** `admin-shell.spec.ts` checks the button is hidden on the camp, lens and frame forms and shown on lists (360 and 768 px). A first loading-state test was removed because it couldn't fail. The footer change broke one search test that looked for "the" level-2 heading anywhere; it now looks inside the main content. Full suite: 288 passed, 18 skipped, none failed.
- **Files:** `src/components/admin/admin-loading.tsx`, 20 pages under `src/app/admin/(staff)/`, `src/styles/admin.css`, `src/components/site/site-chrome.tsx`, `src/styles/site-chrome.css`, `src/components/catalogue/listing.tsx`, `tests/admin-shell.spec.ts`, `tests/search.spec.ts`, `.claude/launch.json` (a `prod` preview on port 3200 for Lighthouse), `docs/open-questions.md`, `CLAUDE.md`, `docs/ai-fluency-log.md`, `docs/changelog.md`

## 2026-11-09 · Sprint 5.6 part C · Sitemap, share image, alt text and titles

- **Changed:**
  - **`/sitemap.xml`** (new): the 11 public pages, every live frame and pair of sunglasses, and every visible eye camp (64 addresses with the seed data). Never the staff area, search results or not-found pages. Built from the same cached lists as the pages, so staff saves update it.
  - **`/robots.txt`:** now gives the sitemap's address (still keeps crawlers out of `/admin` and `/api/`).
  - **Site-wide share image** (`src/app/opengraph-image.tsx`, new): navy with "Since 1999", "VS Lens Mart" (VS in gold), "Welcome to the Optical Family" and the branch names from the branches table, 1200 × 630, drawn once at build time. No logo until the new one is approved (`DUMMY` D8).
  - **Font file:** `src/assets/fonts/PlusJakartaSans-ExtraBold.ttf` and its `OFL.txt` (SIL Open Font License), from `github.com/tokotype/PlusJakartaSans` at the commit Google Fonts uses (128,888 bytes; downloaded with the developer's approval). Google's own copy is a variable font, which `next/og` can't draw in ExtraBold.
  - **Frame pages without a photo** shared no image at all, because a page's own share settings replace the site's. They now fall back to the site-wide image (`frameMetadata`); frames with photos still share their first photo.
  - **Checked, no change needed:** every public page has a title, description and canonical address; every image's alt text is right (the empty ones are inside links or buttons that already say what they are, or beside their caption).
- **Why:** sprint 5.6 (`ROADMAP.md`); rules added as `Requirements_Navigation.md` section 11 (sitemap and share images weren't in the requirements).
- **Tests:** new `tests/seo.spec.ts` (security project): the sitemap matches the database and lists nothing private; `robots.txt`; the share image is a 1200 × 630 PNG on the main pages and frames use the right image. Full suite for parts B and C: 283 passed, 17 skipped, but one staff-accounts test timed out on a slow run (25 minutes, with other work alongside). Run again: 286 passed, 17 skipped, none failed.
- **Files:** `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/opengraph-image.tsx`, `src/assets/fonts/PlusJakartaSans-ExtraBold.ttf`, `src/assets/fonts/OFL.txt`, `src/components/catalogue/frame-detail.tsx`, `tests/seo.spec.ts`, `playwright.config.ts`, `docs/requirements/Requirements_Navigation.md`, `CLAUDE.md`, `docs/ai-fluency-log.md`, `docs/changelog.md`

## 2026-11-09 · Sprint 5.6 part B · Search results page

- **Changed:**
  - **New page `/search?q=`:** results across live frames, sunglasses and lenses, in groups with counts, using the listings' frame cards (hearts, Sold out, Enquire) and the lens cards (each lens links to `/lenses` filtered by brand and type). Up to 24 per group, then a note to add a word.
  - **Matching** (`src/lib/search.ts`): every word must match; case, spaces and hyphens in codes don't matter; an exact frame code comes first, then brand or model matches. It searches the cached lists the site already loads, so the words never reach the database and aren't stored.
  - **Messages:** empty search, common words only, and no results (with "Ask us on WhatsApp", the words in the message). The page is `noindex`.
  - The header search panel and the 404 search box, which already sent to `/search`, now land on results.
- **Why:** sprint 5.6 basic search; `Requirements_Search.md` (approved by the developer 2026-11-09).
- **Checked:** 360 and 1440 px in light and dark mode. Two problems found and fixed on the way: the search field and cards made the page scroll sideways on phones (the grids now fit the screen, and phones get the listings' two-column grid), and a large WhatsApp icon stretched the no-results buttons (removed, as in the listings' own empty state). HTML typed into the search shows as text.
- **Tests:** new `tests/search.spec.ts` at all three sizes (expected results from the database). It caught a bug: a search of only common words kept saying "Searching…". Fixed. Full suite before that fix: 273 passed, 17 skipped; the search spec after it: 26 passed, 1 skipped (the header search at 360 px, where there's no icon).
- **Open:** the signed-off design has no search icon on phones (below 768 px), so phone visitors can only reach search from the 404 page. Added to `Requirements_Search.md` open items for the client.
- **Files:** `src/lib/search.ts`, `src/app/(site)/search/page.tsx`, `src/components/search/search-client.tsx`, `src/styles/pages.css`, `tests/search.spec.ts`, `playwright.config.ts`, `docs/requirements/Requirements_Search.md`, `docs/ai-fluency-log.md`, `docs/changelog.md`

## 2026-11-09 · Sprint 5.6 part B · Search requirements (docs only)

- **Changed:** new `docs/requirements/Requirements_Search.md` (draft): a `/search?q=` results page across live frames, sunglasses and lenses, grouped with counts; whole-word matching that ignores case and the spaces or hyphens in frame codes; exact frame code first; empty, small-words and no-results messages; `noindex`. `Requirements_Navigation.md` now points to it instead of the "TODO (dev)".
- **Why:** sprint 5.6 "basic search" (`ROADMAP.md`); the header and 404 search forms already send to `/search`. Requirements come before code (`CLAUDE.md` working rules).
- **Files:** `docs/requirements/Requirements_Search.md`, `docs/requirements/Requirements_Navigation.md`, `docs/changelog.md`

## 2026-11-09 · Sprint 5.6 part A · Page not found and error pages

- **Changed:**
  - **Site-wide 404:** any unknown address now shows the signed-off 404 page (message, search, four cards, "Ask us on WhatsApp" with the missing address, "Back to home") inside the normal header, footer and sticky bar, with HTTP 404 and `noindex`. Before, it showed the plain Next.js page.
  - **Hints:** missing frame, sunglasses and camp addresses use the same page with their own heading and first card ("See all frames" and so on). The old smaller "not available" boxes are gone.
  - **Error pages:** "Something went wrong on our side." with Try again, Call and WhatsApp (`(site)/error.tsx`), and a plain last-resort page (`global-error.tsx`).
  - **Staff area:** unknown `/admin/...` addresses now show "Page not found" inside the staff shell with a link to the dashboard, instead of the public page.
  - **Layout:** the site chrome moved into `SiteFrame` so the root 404 page can use it. The 404 styles are mockup section 19, ported unchanged.
- **Why:** sprint 5.6 (`ROADMAP.md`), `Requirements_NotFound.md`.
- **Checked:** 360 and 1440 px in light and dark mode, no sideways scroll; the error page with a temporary failing page in development (removed); `npm test` 257 passed, 16 skipped. A new spec, `tests/not-found.spec.ts`, runs at all three sizes; the frame, camp and staff not-found tests were updated to the new wording.
- **Known:** missing frame and camp addresses still return status 200 with `noindex` (streamed, as before). The 404 search goes to `/search`, built in part B. The development server logs a "script tag" warning on frame and camp 404s; it was there before this change.
- **Files:** `src/app/not-found.tsx`, `src/app/global-error.tsx`, `src/app/(site)/error.tsx`, `src/app/(site)/layout.tsx`, `src/app/(site)/frames/[slug]/not-found.tsx`, `src/app/(site)/sunglasses/[slug]/not-found.tsx`, `src/app/(site)/eye-camps/[slug]/not-found.tsx`, `src/app/admin/(staff)/not-found.tsx`, `src/components/site/site-frame.tsx`, `src/components/site/not-found-view.tsx`, `src/components/site/not-found-page.tsx`, `src/components/site/not-found-help.tsx`, `src/components/catalogue/frame-detail.tsx`, `src/components/camps/camp-detail.tsx`, `src/styles/pages.css`, `tests/not-found.spec.ts`, `tests/catalogue.spec.ts`, `tests/eye-camps.spec.ts`, `tests/admin-shell.spec.ts`, `playwright.config.ts`, `docs/requirements/Requirements_NotFound.md`, `CLAUDE.md`, `docs/ai-fluency-log.md`

## 2026-11-09 · Phase 6 · Virtual try-on planned (docs only)

- **Changed:**
  - **Scope:** virtual try-on moves from "Later modules" to a new Phase 6 after launch (`ROADMAP.md` section 8), in five releases: 6.1 photo try-on and the staff try-on picture, 6.2 listing "on you", 6.3 share and compare, 6.4 QR codes, 6.5 live camera.
  - **New requirements:** `Requirements_TryOn.md` (draft): customer panel, listing switch, staff clean-up of a front-view photo, QR labels, data rules, privacy, acceptance criteria and open items.
  - **Other docs:** Frames (a try-on button only on try-on frames once switched on), Admin (try-on section on the frame form), Privacy (a try-on row), `CLAUDE.md` (status, hero rule, routes), `docs/open-questions.md` (Q40–50 decision and new questions), `docs/dummy-data.md` (new C25 for sample try-on pictures, not in use yet).
  - **Unchanged:** the hero keeps its two buttons, and the tests that check for no try-on stay until 6.1 changes the code.
- **Why:** the developer built a working in-browser prototype (eye detection, frame overlay, sliders, compare, save) and approved the plan on 2026-11-09. It's built behind `TRYON_ENABLED` (off by default), so it never holds up the launch. MediaPipe Face Landmarker replaces the prototype's face-api.js so the same code can later run on the live camera.
- **Files:** `docs/requirements/Requirements_TryOn.md`, `ROADMAP.md`, `CLAUDE.md`, `docs/requirements/Requirements_Frames.md`, `docs/requirements/Requirements_Admin.md`, `docs/requirements/Requirements_Privacy.md`, `docs/open-questions.md`, `docs/dummy-data.md`, `docs/ai-fluency-log.md`, `docs/changelog.md`

## 2026-11-09 · Phase 5 · CLAUDE.md review

- **Changed:** `CLAUDE.md` now lists the `rate-limit` test project and says new spec files must be added to the regex in `playwright.config.ts`; adds `npx tsc --noEmit`; explains the dev-only `public/dummy/` photos and `src/lib/dummy-photos.ts`; corrects the Stack table (Framer Motion was never installed; motion is `<Reveal>` and `cards-on-scroll.ts`); notes the dev-server CSS cache workaround.
- **Why:** a `/init` review against the code found these gaps and one wrong fact.
- **Files:** `CLAUDE.md`, `docs/changelog.md`

## 2026-10-25 · Sprint 5.2 · Category photos in the menus and on Home (DUMMY C24, development only)

- **Changed:**
  - **Desktop mega menus:** the Frames and Sunglasses "Shop for" tiles (Men, Women, Kids) show AI-generated portraits from `public/dummy/naiv/`, named by slot (`men-frames.png`, `kid-sunglasses.png` and so on). The phone menu has text links only, as in the mockup.
  - **Desktop Eye care menu:** its three cards show `Book-an-eyetest.png`, `our-branches.png` and `eye-camps.png` (16:10, the placeholder's shape). The "Our branches" photo is an invented shop front, not the real branch.
  - **Homepage "Find your frame":** Men, Women and Kids use the frames portraits, and Sunglasses uses `woman-sunglasses.png`. The photos fill the same 4:5 box as the placeholder, with a slight zoom on hover (none with reduced motion).
  - **Development only, like the hero (C12):**
    - a new shared helper, `src/lib/dummy-photos.ts`, which the hero slideshow now uses too;
    - a new placeholder id, C24, in `docs/dummy-data.md` and the DUMMY register;
    - `check:launch` names both C12 and C24 for `public/dummy`.
    - Production builds keep the icon placeholders, and `home.spec.ts` checks that.
- **Why:** the developer's placeholder photos until the client sends real product and category photos (2026-10-25). They show AI-generated people, so they never go live.
- **Checked:** both mega menus and the homepage tiles at 1440 and 360 px; no sideways scroll, no console errors or warnings.
- **Found while checking:** the dev server kept serving an older `pages.css` after an edit made outside the editor (its cache missed the change, even across a restart). Saving the file again through the editor fixed it. If a style change doesn't show, re-save the file.
- **Files:** `src/lib/dummy-photos.ts`, `src/components/site/mega-panels.tsx`, `src/app/(site)/page.tsx`, `src/styles/pages.css`, `src/lib/site-config.ts`, `scripts/launch-check.ts`, `tests/home.spec.ts`, `docs/dummy-data.md`

## 2026-10-25 · Sprint 5.2 · Home hero: photo closer to the headline

- **Changed:** on Home, the hero photo starts 30% across (the mockup's 38%; 24% below 1180 px), with a shorter left fade, and each photo is shifted right (`object-position: 72% 30%`) so less of its own dark edge shows. The navy shade behind the text is unchanged, so the headline stays readable.
- **Why:** the developer found the gap between the text and the photo too wide (2026-10-25). At 1920 px the person started about 350 px after the headline.
- **Checked:** screenshots at 1920, 1440 and 1180 px with photos 1, 3 and 5; phones are unchanged (the photo sits below the text there).
- **Files:** `src/styles/pages.css`

## 2026-10-25 · Sprint 5.2 · Home hero slideshow (DUMMY photos, development only)

- **Changed:**
  - **Home hero:** a slideshow of 5 AI-generated photos from `public/dummy/hero/`:
    - a slow cross-fade every 6 s;
    - a pause button and dots on a small dark pill, bottom-right;
    - only the first photo with reduced motion;
    - the first photo is also the hero's blurred backdrop, as in the mockup.
  - **Development only:**
    - the page lists the folder only outside a production build;
    - `next.config.ts` allows `/dummy/**` images only while developing;
    - the folder is gitignored, like `uploads/`;
    - `check:launch` fails while it holds images;
    - the C12 register entry describes it.
- **Why:** the developer wants placeholder photos in the hero until the client's real ones arrive, shown as a slideshow (2026-10-25). The photos show AI-generated people, so they must never reach the live site (`CLAUDE.md` never-do). The signed-off mockup has one still photo, so the slideshow is for the client to see at the next review.
- **Checked:**
  - With the dev server: slides change after 6 s, pause holds, reduced motion shows one photo with no controls, no sideways scroll at 1440 and 360 px, no console errors.
  - `home.spec.ts` checks that a production build shows no hero image, controls or backdrop photo.
- **Files:** `src/components/home/hero-slides.tsx`, `src/app/(site)/page.tsx`, `src/styles/pages.css`, `next.config.ts`, `scripts/launch-check.ts`, `src/lib/site-config.ts`, `.gitignore`, `tests/home.spec.ts`, `docs/requirements/Requirements_HomePage.md`, `docs/dummy-data.md`

## 2026-10-25 · Sprint 5.2 (part B) · Home page: database sections (sprint 5.2 done)

- **Changed:**
  - **Database sections**, each left out when it has nothing to show:
    - **Featured frames:** the 8 newest live frames in the shared card (heart, Enquire), a sideways row on phones;
    - **Lenses and eye care:** up to 5 lens brands and the 4 services, "Free eye test" only with `DUMMY` D7;
    - **Eye camps:** the next camp and up to 4 past ones, with cover photos once uploaded;
    - **Reviews:** 3 testimonials, without stars (there's no rating to show);
    - **Our branches:** the shared branch cards.
  - **Quote band:** the 3 plan quotes change every 7 s with a fade; dots and pause; still with reduced motion.
  - **Book band:** a plain form to `/book-eye-test?branch=…&date=…` that saves nothing.
  - **Search-engine data:** the shop data (OpticianStore per branch) moved from Contact into `src/lib/store-data.ts` and is now on Home too.
  - **Fix, branch picker:** when it opened near the edge of the screen, moving focus to its first link scrolled the page, and scrolling closes the picker, so it shut at once. It now focuses without scrolling, and it closes only when the page has really moved (more than 24 px) since it opened: a scroll event can arrive a frame after the tap that opened it, and phones nudge the page as the address bar hides (`branch-picker.tsx`).
  - **Fix, staff area:** the "View site" link no longer pre-loads the homepage. Every staff page rendered the public homepage in the background, which in the tests cached throwaway frames and camps on the public pages (`admin-shell.tsx`).
- **Why:** sprint 5.2 (`ROADMAP.md`); built after 5.5 so these sections read the real tables. Build notes: `Requirements_HomePage.md` 7.
- **Checked:**
  - New `home.spec.ts` (7 tests × 3 sizes):
    - hero lines, years, buttons and the section order;
    - quick cards and the picker; hours from the database;
    - featured frames in the database's order, with Enquire carrying the code and the heart surviving a reload;
    - camps, reviews and branches against the database;
    - the book band's hand-off;
    - the nav: see-through with white text on Home, and the white bar elsewhere in light mode;
    - the quote band with a fake clock: changes, pause, still with reduced motion.
  - `layout.spec.ts`: the "no favourites icon" and "no free eye test / year count" checks now look at the shared header and footer, since the homepage has frame-card hearts and the D7 services line.
  - Screenshots at 1440 (light and dark) and 360 px: no sideways scroll, no console errors.
- **Files:** `src/app/(site)/page.tsx`, `src/components/home/{featured-frames,quote-band,book-date}.tsx`, `src/lib/store-data.ts`, `src/app/(site)/contact/page.tsx`, `src/components/site/branch-picker.tsx`, `src/components/admin/admin-shell.tsx`, `src/styles/pages.css`, `tests/{home,layout}.spec.ts`, `playwright.config.ts`, `docs/requirements/Requirements_HomePage.md`, `docs/open-questions.md`, `docs/dummy-data.md`, `CLAUDE.md`

## 2026-10-25 · Sprint 5.2 (part A) · Home page: hero and static sections

- **Changed:**
  - **`/`** is now the real homepage (the Phase 4 foundation-check page is gone): hero, quick cards, trust strip, "Welcome to the Optical Family" and Shop by category, from the signed-off `mockups/home.html`. The database sections follow in part B.
  - **Hero:** the three-line headline with the year count computed from 1999, the two buttons only, "Since 1999 · Indresham & Patelguda". **No photo yet:** the mockup's shows AI-generated people (`DUMMY` C12, now in the register), so it never enters the app.
  - **Hours and branch names** in the quick cards and trust strip come from the database (`hoursLine()`), never hard-coded. The founder story is `DUMMY` C1 and C3, as on About; the category tiles use icon placeholders until the client's photos arrive.
  - **Home nav:** see-through navy over the hero with white text, more navy after scrolling, as in the signed-off mockup. Other pages keep the white light-mode bar. The rules now key on `body:has(.hero--home)` (the live site has no `data-page`), so nothing flashes; a small `HomeNav` component adds `is-past-hero` on scroll.
  - Pause and play icons added to the icon set (from the mockup), for the quote band.
- **Why:** sprint 5.2 (`ROADMAP.md`). Developer decisions 2026-10-25: a navy hero without a photo until the client's real one, and the mockup's see-through nav on Home.
- **Checked:** screenshots at 1440 px (light and dark) and 360 px (no sideways scroll, no console errors, white nav text, `is-past-hero` after scrolling); `layout`, `privacy` and `ui` specs pass (38).
- **Files:** `src/app/(site)/page.tsx`, `src/components/home/home-nav.tsx`, `src/components/site/icons.tsx`, `src/styles/pages.css`, `src/lib/site-config.ts`

## 2026-10-25 · Staff settings (part C) · Staff accounts page

- **Changed:**
  - **`/admin/staff`** (admin only; not mocked up): every account with role, home branch and badges; an "Add a staff account" form (password typed twice, stored only as a hash); and Manage for each account: name, role and branch, a new password (signs that person out everywhere), switch off or on, and delete for samples only.
  - **Safety rules** on the server: nobody changes their own role, switches themselves off or deletes themselves; an admin who can sign in always remains; real accounts can't use the sample domain.
  - **Sample staff (`DUMMY` C22):** `npm run db:seed` adds 1 sample admin and 4 sample staff on `@vslensmart.example` with no password, so nobody can sign in with them. `check:launch` lists them, and C22 is in the DUMMY register.
  - Staff see "Only an admin can manage staff accounts" and no accounts.
  - The "coming later" page is gone; an unknown staff-area address still shows "not found" inside the staff area.
  - Email and password boxes now have the form styling (they had none in the staff area).
- **Why:** the developer's decision (2026-10-24): a working page with sample accounts until the client names the staff (Q102, Q103). Build notes: `Requirements_Admin.md` 15.
- **Checked:**
  - `staff-settings.spec.ts`, 3 new tests (7 pass):
    - staff are refused and see no accounts; the form's password minimum is Better Auth's;
    - the admin adds an account that can sign in, a new password signs it out, switching off ends the session and blocks sign-in, switching on again; real accounts have no Delete;
    - an admin can't change their own role or switch themselves off; a sample can't sign in, and deleting a sample works (the test puts it back).
  - Browser screenshots at 360 px (light) and 1440 px (light and dark): no sideways scroll, no console errors. Phones drop the role column so long emails don't run under Manage.
- **Files:** `src/lib/staff-rules.ts`, `src/lib/staff-admin.ts`, `src/app/admin/(staff)/staff/{page.tsx,actions.ts}`, `src/components/admin/{staff-admin,staff-forms}.tsx`, `src/app/admin/(staff)/[...section]/page.tsx`, `src/styles/admin.css`, `src/lib/site-config.ts`, `scripts/{db-seed,launch-check}.ts`, `tests/{staff-settings,admin-shell}.spec.ts`, `docs/requirements/Requirements_Admin.md`, `docs/dummy-data.md`, `CLAUDE.md`

## 2026-10-24 · Staff settings (part B) · Branch holidays page

- **Changed:**
  - **`/admin/holidays`** (not mocked up, staff-area style): upcoming closed days, past ones folded away; an admin form to add a day (date, one branch or both, note) and a Remove button with a confirmation.
  - After adding, it says how many bookings already stand on that day, with a link to them.
  - The same day twice for a branch, or both branches over a one-branch day, is refused with a plain message.
  - Only an admin can add or remove (checked in the action and by the database); staff see the list read-only.
  - Saving refreshes the `branches` cache, so the booking form and Contact show the change at once.
  - The "Saved" message on `/admin/branches` no longer disappears straight after saving.
  - The "coming later" page now covers only Staff accounts.
- **Why:** the developer's decision (2026-10-24) to build the staff settings with `DUMMY` values. The real closed days are a question for the client (Q91, added to `docs/open-questions.md`); the seed's Diwali day stays `DUMMY` D3. Build notes: `Requirements_Admin.md` 14.
- **Checked:** `staff-settings.spec.ts` (4 tests pass): staff read-only and a database refusal; the admin closes a day, sees the bookings warning, gets the duplicate message, the booking form and Contact show it, and removing it makes the day bookable again. Full `npm test`: 222 passed and 1 timing failure, now fixed; the two changed specs then passed twice at every size (56 runs).
  - **Test fixes:** two earlier runs stopped halfway left the Indresham closing time at 8:30 PM and two throwaway `E2E-M` frames (removed by hand). The Branches test now restores the seed value from `site-config.ts`, not the value it found. The Enquire test keeps reading the WhatsApp link until the picker has filled in the message.
- **Files:** `src/app/admin/(staff)/holidays/{page,actions}.ts(x)`, `src/components/admin/{holiday-form,holidays-admin,branches-admin}.tsx`, `src/lib/branch-rules.ts`, `src/lib/queries/admin.ts`, `src/app/admin/(staff)/[...section]/page.tsx`, `tests/staff-settings.spec.ts`, `tests/catalogue.spec.ts`, `docs/open-questions.md`, `docs/requirements/Requirements_Admin.md`

## 2026-10-24 · Staff settings (part A) · Branches page

- **Changed:**
  - **`/admin/branches`**, built from the approved mockup:
    - one card per branch (address, Google Maps link, phone, WhatsApp with "Same as phone", opening and closing time, open days, "Show this branch on the site"), saved together;
    - plain messages for wrong numbers or times; "Undo changes"; a warning before leaving with unsaved changes.
  - **Who can save:** only an admin (checked in the action and refused by the database for staff); staff see it read-only.
  - **Saving** refreshes the `branches` cache, so the utility bar, footer, Contact, branch picker and booking times update at once.
  - The Patelguda placeholder number (D2) stays allowed and tagged. The "coming later" entry for Branches is gone.
- **Why:** the developer's decision (2026-10-24) to build the staff settings with the current `DUMMY` values; the client asked for branch editing on 2026-10-21 (`Requirements_Admin.md` 7.1). Build notes: `Requirements_Admin.md` 13.
- **Checked:**
  - New `staff-settings.spec.ts`:
    - staff see the page read-only at 360 px and the database refuses a staff change;
    - the admin's plain messages for a bad number or closing time;
    - closing at 8:30 PM shows in the footer and makes 8:00 PM the last booking time, then it's put back through the page.
  - Full suite: 216 passed, 16 skipped. Two tests failed only because **drive C: ran out of space** during the run (`ENOSPC`); both passed on a rerun.
- **Files:** `src/app/admin/(staff)/branches/` (`page.tsx`, `actions.ts`), `src/app/admin/(staff)/[...section]/page.tsx`, `src/components/admin/branches-admin.tsx`, `src/components/admin/branches-form.tsx`, `src/lib/branch-rules.ts`, `src/lib/queries/admin.ts`, `playwright.config.ts`, `tests/staff-settings.spec.ts`, `docs/requirements/Requirements_Admin.md`, `docs/changelog.md`

## 2026-10-24 · Sprint 5.5 (part D) · Eye care and About pages; sprint 5.5 done

- **Changed:**
  - **`/eye-care`**, built from the approved mockup:
    - hero; the four services with their anchors (`#eye-testing`, `#lens-fitting`, `#frame-adjustment`, `#frame-repair`), "Free" tagged D7;
    - "What happens at your eye test"; "When to get your eyes checked" with the always-visible safety note; tips;
    - FAQ (`<details>`), with `FAQPage` data from confirmed answers only;
    - quick links; CTA; "General information only, not medical advice".
  - **`/about`**, built from the approved mockup:
    - hero with the years worked out from 1999; founder and family; the journey as an ordered list (1999 … Today); values; team;
    - branch cards (shared with Contact); gallery preview (5 newest photos, hidden with none); reviews from testimonials (hidden with none, no star ratings); the eye camps band (next camp, or past camps); CTA;
    - `Organization` data.
  - **Shared:** the branch card moved out of the Contact page (`src/components/contact/branch-card.tsx`); `YearsSince` next to the footer year; tool and alert icons from the mockup sprite.
  - DUMMY register: C1, C2, C3, C10, C15, C17.
  - The gallery's breadcrumb link to `/about` prefetches again now that About exists.
- **Why:** sprint 5.5 part D (`ROADMAP.md`, `Requirements_EyeCare.md`, `Requirements_About.md`). Build decisions are in `Requirements_EyeCare.md` 7 and `Requirements_About.md` 8. With this part, **sprint 5.5 is done**: staff can add lenses, eye camps, gallery photos and testimonials, and every content page reads them.
- **Checked:**
  - In the browser: About at 1440 px ("For 27 years", sections in order, gallery preview hidden with no photos) and Eye care at 360 px (`#frame-repair` lands below the header, FAQ data with 5 confirmed answers), with no console errors.
  - New `about-eye-care.spec.ts` at 3 widths covers:
    - the four services and every anchor below the header;
    - the safety note; the FAQ by keyboard; confirmed-only FAQ data;
    - the years from 1999; the ordered timeline; the About anchors; `Organization` data;
    - the database sections matching the data (branches, photos, reviews, camps band), with no star ratings.
  - Full suite: 220 passed, 16 skipped (other screen sizes). `check:launch` lists the new placeholders.
- **Files:** `src/app/(site)/eye-care/page.tsx`, `src/app/(site)/about/page.tsx`, `src/app/(site)/contact/page.tsx`, `src/app/(site)/gallery/page.tsx`, `src/components/contact/branch-card.tsx`, `src/components/site/footer-year.tsx`, `src/components/site/icons.tsx`, `src/lib/site-config.ts`, `src/styles/pages.css`, `playwright.config.ts`, `tests/about-eye-care.spec.ts`, `docs/requirements/Requirements_EyeCare.md`, `docs/requirements/Requirements_About.md`, `CLAUDE.md`, `docs/changelog.md`

## 2026-10-24 · Sprint 5.5 (part C) · Gallery page, staff gallery and testimonials

- **Changed:**
  - **`/gallery`**, built from the approved mockup:
    - hero (Home › About › Gallery); tag chips with counts, only tags that have photos, kept in the address (`?tag=`);
    - the photo wall (first photo larger, 24 at a time with Load more); the shared photo viewer, staying within the tag (caption, branch, month, "n of m");
    - the consent note with "Ask us on WhatsApp" to have a photo removed; "Photos coming soon" when there are none; the CTA.
  - **`/admin/gallery`:** upload up to 10 photos at a time (resized in the browser), each with tag, caption, branch, month, and "Shows people" with the permission tick; the photo list with an "On the site" switch; admin-only Delete (file too). The Customers tag is blocked until Q146 (`CUSTOMER_PHOTOS_ALLOWED`).
  - **`/admin/testimonials`:** add or edit a customer's first name, branch, words and the date they agreed to be quoted (required, not in the future); the list with edit links; admin-only Delete.
  - **Shared:** `src/lib/gallery-rules.ts` (tags, form rules), gallery and testimonial queries with cached `getGallery()` / `getTestimonials()`, server actions refreshing the `content` cache. The "coming later" placeholders for Gallery and Testimonials are gone.
- **Fixed:**
  - The gallery's breadcrumb link to `/about` no longer prefetches until About exists (part D); it logged a 404.
  - The gallery "On the site" switch flips at once instead of snapping back while the server saves.
- **Why:** sprint 5.5 part C (`ROADMAP.md`, `Requirements_Gallery.md`, `Requirements_Admin.md` 7). Build decisions are in `Requirements_Gallery.md` 7 and `Requirements_About.md` 7.
- **Checked:**
  - `staff-content.spec.ts` adds:
    - three photos uploaded on a phone, the permission tick required, no Customers option, and the database refusing a photo of people without consent;
    - the public gallery's chips and address, the viewer wrapping within a tag, Esc and focus back, and a hidden photo leaving the page;
    - staff can't delete; an admin's delete removes the file;
    - testimonials need an agreed date, not in the future; staff add; only an admin deletes.
  - New `gallery.spec.ts` at 3 widths: hero, photos or "coming soon", the consent note's WhatsApp text, the CTA, no sideways scroll.
  - `admin-shell.spec.ts` now uses Staff accounts as its "coming later" example.
  - Full suite: 208 passed, 16 skipped (other screen sizes).
- **Files:** `src/app/(site)/gallery/page.tsx`, `src/components/gallery/gallery-wall.tsx`, `src/app/admin/(staff)/gallery/` (`page.tsx`, `actions.ts`), `src/app/admin/(staff)/testimonials/` (`page.tsx`, `actions.ts`), `src/app/admin/(staff)/[...section]/page.tsx`, `src/components/admin/` (`gallery-admin.tsx`, `gallery-upload.tsx`, `gallery-controls.tsx`, `testimonials-admin.tsx`, `testimonial-form.tsx`), `src/lib/gallery-rules.ts`, `src/lib/queries/content.ts`, `src/lib/queries/admin.ts`, `src/lib/content-data.ts`, `src/styles/pages.css`, `src/styles/admin.css`, `playwright.config.ts`, `tests/staff-content.spec.ts`, `tests/gallery.spec.ts`, `tests/admin-shell.spec.ts`, `docs/requirements/Requirements_Gallery.md`, `docs/requirements/Requirements_About.md`, `docs/changelog.md`

## 2026-10-24 · Sprint 5.5 (part B) · Eye camps pages and staff eye camps

- **Changed:**
  - **`/eye-camps`**, built from the approved mockup:
    - hero with "{n} camps · {people} people checked";
    - the next camp (date box, facts, description, what's offered, Directions, Add to calendar, Share on WhatsApp, Details) and more upcoming camps;
    - past camps with year chips kept in the address (`?year=`) and Load more (9 at a time);
    - the "Bring a camp" band, the CTA, and all the empty states.
  - **`/eye-camps/[slug]`:**
    - upcoming camps: what's offered, what to bring, actions, `Event` data;
    - past camps: people checked and a photo grid opening the shared photo viewer;
    - more camps; "This camp isn't available" for hidden or unknown camps.
  - **`/admin/eye-camps`**, `/new`, `/[slug]`: Upcoming / Past lists with flags; the camp form, with "After the camp" (people, up to 12 photos with the "shows people" and permission ticks) opening once the date has passed; staff hide, admin deletes (photo files too). Actions `saveCamp` and `deleteCamp` refresh the `content` cache.
  - **Shared:**
    - `src/components/site/photo-viewer.tsx` (native `<dialog>`, also for the gallery);
    - `src/lib/camp-rules.ts` (India-time upcoming / past, date wording, `.ics`, share link, form rules);
    - camp queries and cached `getCamps()` / `getCamp()` / `getCampSlugs()`.
  - DUMMY register: C19.
- **Fixed:**
  - **Clashing class names:** the mockup uses `camp-row` both for the public "More upcoming" rows and for the staff list rows, and the app loads all styles together. Each set is now scoped to its own list (`.camp-rows`, `.camp-list`). A scan found no other class styled in both.
  - **Lost "Saved" message:** after adding a new lens or camp, the form opens the new item's edit page, where the "Saved" message was lost. It's now carried in the address (`?saved=1`).
  - **Date wording:** dates read "Sun, 15 Nov 2026"; the Indian date format had added a comma before the year.
- **Why:** sprint 5.5 part B (`ROADMAP.md`, `Requirements_EyeCamps.md`, `Requirements_Admin.md` 7.2). Build decisions are in `Requirements_EyeCamps.md` section 8.
- **Checked:**
  - In the browser: `/eye-camps` at 1440 px (next camp, 5 past camps, the 461 total checked by hand) and a camp page at 360 px in dark mode.
  - New `eye-camps.spec.ts` at 3 widths: order and totals, the calendar file and share link, year chips and the address, upcoming / past / unknown camp pages.
  - `staff-content.spec.ts` adds:
    - an upcoming camp (no photos before the day) that's on the site at once;
    - a past camp with photos, where a photo of people is refused without the tick by the browser, the server and the database;
    - the photo viewer by keyboard (arrows, Esc, focus back);
    - admin-only delete removing the files.
  - The camp wording was added to `booking-rules.spec.ts`.
  - Full suite: 201 passed, 16 skipped (other screen sizes).
- **Files:** `src/app/(site)/eye-camps/page.tsx`, `src/app/(site)/eye-camps/[slug]/` (`page.tsx`, `not-found.tsx`), `src/components/camps/` (`camp-card.tsx`, `past-camps.tsx`, `camp-detail.tsx`, `camp-photos.tsx`), `src/components/site/photo-viewer.tsx`, `src/app/admin/(staff)/eye-camps/` (`page.tsx`, `new/page.tsx`, `[slug]/page.tsx`, `actions.ts`), `src/app/admin/(staff)/[...section]/page.tsx`, `src/components/admin/` (`camps-list.tsx`, `camp-form.tsx`, `camp-form-page.tsx`, `lens-form.tsx`), `src/lib/camp-rules.ts`, `src/lib/queries/content.ts`, `src/lib/queries/admin.ts`, `src/lib/content-data.ts`, `src/lib/site-config.ts`, `src/styles/pages.css`, `src/styles/admin.css`, `playwright.config.ts`, `tests/eye-camps.spec.ts`, `tests/staff-content.spec.ts`, `tests/booking-rules.spec.ts`, `docs/requirements/Requirements_EyeCamps.md`, `docs/ai-fluency-log.md`, `docs/changelog.md`

## 2026-10-24 · Sprint 5.5 (part A) · Lenses page and staff lenses

- **Changed:**
  - **`/lenses`**, built from the approved mockup:
    - page hero; "Which lens is which?" (type cards with counts, only types that have active lenses); "How we choose your lens";
    - the catalogue: Type and Brand chips, OR within and AND across, kept in the address so the mega menu's links land filtered; Clear;
    - lens cards with up to 3 features, the price or "Ask for price", and Enquire (branch picker, the lens named in the WhatsApp text);
    - brand tiles; the "Instant lens fitting" band; the CTA; the empty states.
  - **`/admin/lenses`**, `/admin/lenses/new`, `/admin/lenses/[id]`: list with search and filters, and the lens form (brand or a new brand, name, type, feature tags, optional price, optional photo, show on the site; admin-only delete). Server actions `saveLens` and `deleteLens` refresh the `content` and `catalogue` caches.
  - **Shared:**
    - `src/lib/client-photo.ts` (the browser photo resizing, moved out of the frame form);
    - `src/components/admin/photo-picker.tsx`;
    - `src/lib/lookups.ts` (find or add a brand or colour, moved out of the frame actions; new lens brands are flagged as lens brands);
    - `src/lib/lens-rules.ts`, `src/lib/queries/content.ts`, `src/lib/content-data.ts` (cache tag `content`).
  - **CSS:** mockup sections 11, 14 and 15 ported into `pages.css`. Headings on navy sections now inherit the band colour too (the same fix as part 5.4 B, here for the fitting band). A shield icon was added from the mockup sprite.
- **Why:** sprint 5.5 part A (`ROADMAP.md`, `Requirements_Lenses.md`, `Requirements_Admin.md` 7). Build decisions are in `Requirements_Lenses.md` section 7.
- **Checked:**
  - In the browser: `/lenses?type=progressive` lands filtered, at 1440 and 360 px, light and dark.
  - New `lenses.spec.ts` at 3 widths: types from the data, prices or "Ask for price", Enquire text, chips and the address, menu and type-card links, nonsense ignored.
  - New `staff-content.spec.ts`: staff add a lens with a new brand and a photo on a phone and it's on `/lenses` at once; hiding takes the photo off; staff can't delete; an admin deletes.
  - `admin-shell.spec.ts` now uses the gallery as its "coming later" example.
  - Full suite: 184 passed, 16 skipped (other screen sizes).
- **Files:** `src/app/(site)/lenses/page.tsx`, `src/components/lenses/lens-catalogue.tsx`, `src/app/admin/(staff)/lenses/` (`page.tsx`, `new/page.tsx`, `[id]/page.tsx`, `actions.ts`), `src/app/admin/(staff)/[...section]/page.tsx`, `src/app/admin/(staff)/frames/actions.ts`, `src/components/admin/lens-form.tsx`, `src/components/admin/lens-form-page.tsx`, `src/components/admin/lenses-list.tsx`, `src/components/admin/photo-picker.tsx`, `src/components/admin/frame-form.tsx`, `src/components/catalogue/frame-detail.tsx`, `src/components/site/icons.tsx`, `src/lib/client-photo.ts`, `src/lib/lookups.ts`, `src/lib/lens-rules.ts`, `src/lib/queries/content.ts`, `src/lib/queries/admin.ts`, `src/lib/content-data.ts`, `src/styles/pages.css`, `playwright.config.ts`, `tests/lenses.spec.ts`, `tests/staff-content.spec.ts`, `tests/admin-shell.spec.ts`, `docs/requirements/Requirements_Lenses.md`, `docs/changelog.md`

## 2026-10-24 · Sprint 5.4 (part C) · Privacy policy, retention, staff Bookings and Enquiries

- **Changed:**
  - **`/privacy`**, from the approved mockup:
    - page hero with "Last updated"; "In short"; contents (beside the text on desktop, "On this page" on phones, current section marked);
    - the ten policy sections; a contact card (WhatsApp with a prefilled question, Call, email, both addresses);
    - the print style.
    - "What we collect" now includes the optional area or address on both forms, so the page matches what is really stored. The footer link now prefetches.
  - **Retention:** `purge_expired(days)` in `db/security.sql` (security definer, refuses under 30 days, owner-only delete policies) and `src/lib/retention.ts`.
    - It's called after every booking and enquiry and when staff open the lists, using `RETENTION_DAYS` (`DUMMY` D9, 365), the same setting the privacy page's "1 year" is worked out from.
  - **`/admin/bookings`:** day / branch / status filters, previous and next day, each row with Call / WhatsApp and status; admin-only Delete with a confirmation.
  - **`/admin/enquiries`:** New / Replied / Closed, with the message, frame code and preferred reply.
  - New: `RowControls`, `customer-lists.tsx`, the `bookingsList` / `enquiriesList` queries, and the `setEnquiryStatus` / `deleteCustomerRow` actions. The "coming soon" placeholders for these two pages are gone.
  - DUMMY register: D9, C23.
- **Why:** sprint 5.4 part C (`ROADMAP.md`, `Requirements_Privacy.md`, `Requirements_Admin.md` 7; the staff lists were added to this sprint by the developer on 2026-10-24). Build decisions: `Requirements_Privacy.md` 9, `Requirements_Admin.md` 12.
- **Checked:**
  - In the browser: the privacy page at 360 px, with the contents collapsed and no sideways scroll.
  - New `staff-lists.spec.ts`:
    - logged out, the lists redirect and show no customer;
    - staff see the details, change the status and can't delete;
    - enquiries move between tabs;
    - the admin deletes after confirming;
    - retention deletes old rows, keeps new ones and refuses 10 days.
  - New `privacy.spec.ts` at 3 widths: links from the footer and both consent boxes, the fields and keys named, the retention words, no third-party requests, and the contents.
  - Full suite: 173 passed, 16 skipped (other screen sizes). `check:launch` lists the new placeholders.
- **Files:** `src/app/(site)/privacy/page.tsx`, `src/components/privacy/contents.tsx`, `src/app/admin/(staff)/bookings/page.tsx`, `src/app/admin/(staff)/enquiries/page.tsx`, `src/app/admin/(staff)/[...section]/page.tsx`, `src/app/admin/(staff)/actions.ts`, `src/components/admin/customer-lists.tsx`, `src/components/admin/row-controls.tsx`, `src/lib/queries/admin.ts`, `src/lib/retention.ts`, `src/lib/site-config.ts`, `src/app/(site)/book-eye-test/actions.ts`, `src/app/(site)/contact/actions.ts`, `src/components/site/site-chrome.tsx`, `src/styles/admin.css`, `db/security.sql`, `playwright.config.ts`, `tests/staff-lists.spec.ts`, `tests/privacy.spec.ts`, `docs/requirements/Requirements_Privacy.md`, `docs/requirements/Requirements_Admin.md`, `CLAUDE.md`, `docs/changelog.md`

## 2026-10-24 · Sprint 5.4 (part B) · Contact page and enquiry form

- **Changed:**
  - `/contact`, built from the approved mockup:
    - page hero; three quick cards (WhatsApp and Call through the branch picker, Book an eye test);
    - "Our branches" (`#branches`, `#indresham`, `#patelguda`): each card shows its address, hours, the next closed day, four services and an "Open now / Closed now" label (India time), with Directions, Call and WhatsApp for **that branch's own number**;
    - a Google map per branch that loads only when scrolled near or on "Show map";
    - "Send us a message": the enquiry form, with the "Faster on WhatsApp" and email side notes, and a thank-you showing only what was sent;
    - FAQ and the gold "Ready for an eye test?" band;
    - `OpticianStore` search-engine data (no placeholder phone).
  - Server action `sendEnquiry` (spam trap, per-minute limit, Zod, insert only as the public role). Rules in `src/lib/enquiry-rules.ts`.
  - `?topic=&frame=` prefill. Closed days come from a new cached `getClosures()` (tag `branches`).
  - `BranchLink` (call / WhatsApp one branch; a placeholder number never dials) moved to `src/components/site/branch-link.tsx`, shared with the booking confirmation.
  - Links to `/contact` now prefetch. DUMMY register: D1, D3, C21.
- **Fixed:**
  - **Invisible headings on bands:** headings on the navy hero and help bands, and the gold book band, took the dark heading colour (navy on navy in light mode; in dark mode cream on gold). They now inherit the band's colour, as in the mockup. This also fixes the Frames / Sunglasses "Not sure what suits you?" band in light mode.
  - **Mobile number cut off:** the field allowed 14 characters (from the mockup), so "+91 98765 43210" lost its last digit. It now allows 16, on both forms.
- **Why:** sprint 5.4 part B (`ROADMAP.md`, `Requirements_Contact.md`). Build decisions are in `Requirements_Contact.md` section 9.
- **Checked:**
  - In the browser at 360 and 1440 px, light and dark: each card's links go to its own branch, and maps load only when scrolled to.
  - New `contact.spec.ts` at 3 widths covers the cards and their numbers, maps not loaded before scrolling, an enquiry saved with consent time, prefill, validation, and the search-engine data. The contact form's rules were added to `booking-rules.spec.ts`. The booking test now types "+91 98765 43210".
  - Full suite: 159 passed, 16 skipped (other screen sizes).
- **Files:** `src/app/(site)/contact/page.tsx`, `src/app/(site)/contact/actions.ts`, `src/components/contact/enquiry-form.tsx`, `src/components/contact/branch-live.tsx`, `src/components/site/branch-link.tsx`, `src/components/booking/booking-form.tsx`, `src/lib/enquiry-rules.ts`, `src/lib/booking-rules.ts`, `src/lib/queries/site.ts`, `src/lib/site-data.ts`, `src/lib/site-config.ts`, `src/components/site/site-chrome.tsx`, `src/components/catalogue/catalogue-page.tsx`, `src/components/catalogue/frame-detail.tsx`, `src/styles/pages.css`, `playwright.config.ts`, `tests/contact.spec.ts`, `tests/booking-rules.spec.ts`, `tests/booking.spec.ts`, `docs/requirements/Requirements_Contact.md`, `docs/changelog.md`

## 2026-10-24 · Sprint 5.4 (part A) · Book an eye test

- **Changed:**
  - `/book-eye-test`, built from the approved mockup:
    - three steps on one page: branch, then one of 14 day chips or "Pick another date", then a time by part of the day; full slots show "Full", closed days "Closed";
    - details (name, mobile, who it's for, optional area, optional note with a counter, consent with the privacy link);
    - an error summary that takes focus; the summary card (sticky on desktop) and an inline line on phones;
    - the confirmation, with the reference, "Send to the branch on WhatsApp" (that branch's own number, full prefilled message), "Add to calendar" (`.ics`) and "Call or WhatsApp to change or cancel".
    - `?branch=&date=` prefill.
    - The phone sticky bar is hidden on this page.
  - Server actions `getSlots` (counts only) and `bookEyeTest` (Zod, the slot re-checked, saved with the public role, insert only).
  - New shared pieces:
    - `src/lib/booking-rules.ts` (DUMMY C18 rules, India time, form checks, random `VS-XXXX` references);
    - `src/lib/booking-core.ts` (per-slot lock, then count, then insert);
    - `src/lib/form-guard.ts` (spam trap, minimum fill time, per-minute limit);
    - `src/components/site/hide-on.tsx`;
    - `src/styles/pages.css` (mockup 7.2–7.13, 7.15, 10, 12, 16, 18 ported for this sprint and the next pages).
  - DUMMY register: C18 and D7. Links to `/book-eye-test` now prefetch, since the page exists.
- **Why:** sprint 5.4 part A (`ROADMAP.md`, `Requirements_Booking.md`). It's the site's first form with personal data, so the public role can only add a booking, never read one, and the last place can't be double-booked. Build decisions are in `Requirements_Booking.md` section 10.
- **Checked:**
  - In the browser at 360 and 1440 px, light and dark: a real booking was saved (reference, 10-digit phone, consent time) and then removed.
  - New tests:
    - `booking-rules.spec.ts` (hours, notice, window, closed days, full slots, form checks);
    - `booking-race.spec.ts` (two people at once for the last place: one booking, one "full"; the public role reads nothing back);
    - `booking.spec.ts` at 3 widths (full booking and its WhatsApp link, prefill, Full slots with no personal data sent, validation, "just filled up", spam trap).
  - Full suite: 140 passed, 16 skipped (other screen sizes).
- **Files:** `src/app/(site)/book-eye-test/page.tsx`, `src/app/(site)/book-eye-test/actions.ts`, `src/components/booking/booking-form.tsx`, `src/lib/booking-rules.ts`, `src/lib/booking-core.ts`, `src/lib/form-guard.ts`, `src/lib/site-config.ts`, `src/components/site/hide-on.tsx`, `src/components/site/site-chrome.tsx`, `src/components/site/mega-panels.tsx`, `src/components/catalogue/frame-detail.tsx`, `src/styles/pages.css`, `src/app/globals.css`, `playwright.config.ts`, `tests/booking-rules.spec.ts`, `tests/booking-race.spec.ts`, `tests/booking.spec.ts`, `docs/requirements/Requirements_Booking.md`, `CLAUDE.md`, `docs/changelog.md`

## 2026-10-24 · Sprint 5.3 · CLAUDE.md brought up to date

- **Changed:** `CLAUDE.md` now:
  - gives the current status (5.1 and 5.3 done, the build order) and how to run one spec or test, `db:studio` and `next typegen`;
  - describes the public data path (plain queries, cached wrappers, cache tags);
  - describes the catalogue setup (filtering in the browser, the address-bar contract with the mega menu, the detail routes' 200 + `noindex` not-found, server/client helper modules, `prefetch={false}` for unbuilt pages);
  - covers the CSS porting method, the motion components, and how the page tests work.
- **Why:** `/init` review. These facts span several files and cost time to rediscover; the old status line still said 5.3 was next.
- **Files:** `CLAUDE.md`, `docs/changelog.md`

## 2026-10-24 · Sprint 5.3 · Frame cards: hover zoom and fade-in on scroll

- **Changed:**
  - **Hover zoom:** a frame card's photo (or frame drawing) zooms in 5% while the mouse is over the card or the photo link has keyboard focus. It's for mouse devices only, never touch screens or reduced motion, and the photo stays inside its rounded box.
  - **Fade-in on scroll:** on `/frames` and `/sunglasses`, cards below the screen fade in and rise 16 px as they scroll into view, a row at a time, 80 ms apart (at most 4 steps). Cards on screen when they appear keep the existing load fade. Cards added by "Load more" or a filter change follow the same rule.
- **Why:** the developer's request, to help customers focus on the frames. The zoom is a scale, not a fade or slide, but it's the same kind of zoom as the approved gallery's click-to-zoom. The cards are hidden only by the script, and a card that isn't laid out yet (still behind the loading placeholder) counts as below the screen, so no card is skipped or left hidden.
- **Files:** `src/components/catalogue/cards-on-scroll.ts` (new), `src/components/catalogue/listing.tsx`, `src/styles/catalogue.css`, `docs/changelog.md`

## 2026-10-24 · Sprint 5.3 · Scroll fade on Similar frames and the help band

- **Changed:** a new `<Reveal>` component (`src/components/site/reveal.tsx`) gives the mockup's fade and slide up on scroll (section 7.1): 16 px over the section duration (420 ms), once, when a block is 10% into view. It's used on two blocks:
  - the frame detail page's "Similar frames", with the cards following 80 ms apart, at most 4 steps;
  - the Frames and Sunglasses help band.
- **Why:** the developer asked for scroll animation where it can't disturb the layout. It only changes opacity and position. Nothing is hidden without the script, for a block already on screen, or when the device asks for reduced motion. Image-sequence scroll animation from AI-generated video was discussed and not used: it's against the "fades and slides only" and "no generated people" rules, heavy on phones, and would show frames the shop doesn't stock. Home page sections get the same component in sprint 5.2.
- **Files:** `src/components/site/reveal.tsx` (new), `src/styles/site-chrome.css`, `src/components/catalogue/frame-detail.tsx`, `src/components/catalogue/catalogue-page.tsx`, `docs/changelog.md`

## 2026-10-24 · Sprint 5.3 (part C) · Frames, Sunglasses and frame detail pages

- **Changed:**
  - `/frames` and `/sunglasses`, built from the approved mockups (`frames.html`, `sunglasses.html`, `listing.js`):
    - the client's filters with counts (empty options disabled), OR within a filter and AND across;
    - quick gender chips, active-filter chips and Clear all;
    - sort (sold out always last), "Saved (n)" and "Load more" (24 at a time);
    - the phone filter panel ("Show n frames", Esc closes it, focus stays inside);
    - both empty states and the help band.
    - Every filter is kept in the address, so the mega menu's links (`?for=kids`, `?tier=premium`, `?lens=polarized`, `?brand=…`) land filtered.
  - The frame card (`frame-card.tsx`), reused on the home page in 5.2: photo or frame drawing, price, where it's available, Sold out, heart, and Enquire (branch picker with the frame code in the WhatsApp text).
  - Favourites are saved on the device (`vslm-favourites`, as in the mockups); all hearts on a page stay in step.
  - `/frames/[slug]` and `/sunglasses/[slug]` (from `frame-detail.html`):
    - gallery with thumbnails, arrow keys, swipe and click-to-zoom;
    - title block, Enquire on WhatsApp ("Ask about similar frames" when sold out), heart, Share on WhatsApp (the customer picks the contact), Book an eye test;
    - details table, lens and branch notes (hours from the `branches` table), up to 4 similar frames;
    - `Product` structured data, title "Brand Model · ₹price", Open Graph photo.
    - Pre-rendered from the database. A draft, hidden, wrong-page or unknown frame shows "This frame isn't available", marked `noindex` (status 200 on the production server, because Next.js streams it).
  - Data: `src/lib/queries/catalogue.ts` (approved, active rows only), cached in `src/lib/catalogue-data.ts` under the `catalogue` tag that every staff save already refreshes.
  - CSS: mockup sections 7.1, 7.7, 8 and 9 ported to `src/styles/catalogue.css`, plus a short block for real photos. Five icons were added from the mockup sprite.
  - `next.config.ts` resizes `/media` photos for cards (at most an hour's cache). `site.url` is the `DUMMY` D4 domain, now listed by `check:launch`.
  - The seed now dates its frames newest first, so "Newest" matches the mockup order (the existing dev rows were re-dated in place).
- **Why:** sprint 5.3's last part (`ROADMAP.md`): an approved frame now appears on the public site, and a sold-out frame shows "Sold out". The decisions made while building are in `Requirements_Frames.md` section 8. The mockup's phone filter panel had a navy title on navy in light mode; the live one is white.
- **Files:** `src/app/(site)/frames/page.tsx`, `src/app/(site)/frames/[slug]/page.tsx`, `src/app/(site)/frames/[slug]/not-found.tsx`, `src/app/(site)/sunglasses/` (same three), `src/components/catalogue/` (`catalogue-page.tsx`, `listing.tsx`, `frame-card.tsx`, `frame-text.ts`, `frame-photo.tsx`, `favourites.ts`, `fav-button.tsx`, `gallery.tsx`, `frame-detail.tsx`), `src/lib/queries/catalogue.ts`, `src/lib/catalogue-data.ts`, `src/lib/site-config.ts`, `src/components/site/icons.tsx`, `src/styles/catalogue.css`, `src/app/globals.css`, `src/app/layout.tsx`, `next.config.ts`, `scripts/db-seed.ts`, `tests/catalogue.spec.ts`, `tests/catalogue-query.spec.ts`, `playwright.config.ts`, `docs/requirements/Requirements_Frames.md`, `docs/changelog.md`

## 2026-10-23 · Phase 4 · Logo concepts: presentation boards

- **Changed:** `mockups/logo-concepts.html` is now a presentation deck on navy. It has a cover with the five marks, one board per concept, and a side-by-side board. Each concept board has six panels: primary logo, construction lines, the logo on the website (browser tab, header, hero), a brand line, a shop sign and business card, and icons with the colour swatches. Concepts 1 and 4 have a metallic brass-to-gold rim. A new `concept-4-icon.svg` (the badge without its ring text) is used at icon sizes. Printing the page (Save as PDF, landscape) puts one board on each page.
- **Why:** the developer wanted the concepts designed visually to show the client, not just listed. The brand lines use only the existing wording ("Welcome to the Optical Family", "Care · Love · Quality · Family", "Since 1999"). There's no phone number, domain or price on any board. Still a draft: the site keeps the placeholder (`DUMMY` D8).
- **Checked:** all boards at 1440 and 375 px, with no page overflow and no console errors. Panel padding uses `%`, because `cqw` on the panel itself measures the page rather than the panel.
- **Files:** `mockups/logo-concepts.html`, `mockups/styles.css`, `mockups/assets/logo-concepts/concept-1.svg`, `concept-1-mark.svg`, `concept-4.svg`, `concept-4-mark.svg`, `concept-4-icon.svg` (new), `docs/changelog.md`

## 2026-10-23 · Phase 4 · Logo concepts for the client

- **Changed:** five logo concepts drawn as SVG, each as a mark and a full logo with the name: 1 Lens monogram, 2 Spectacles, 3 Family eye, 4 Heritage badge (the current badge cleaned up, "FAMILY" spelled correctly), 5 Clear vision. A new page, `mockups/logo-concepts.html`, shows each one on cream, on navy, and at header, phone-icon and browser-tab sizes, for the client to pick one on WhatsApp. The SVGs use the design tokens only; their colours switch on navy through `--lg-ink`, `--lg-accent` and `--lg-iris`, with light-background fallbacks.
- **Why:** the developer asked for options to show the client, who asked for a new logo on 2026-10-21 but hasn't sent one. None of them is approved. The site keeps the placeholder (`DUMMY` D8) until the client chooses. The text in the SVGs is live text, so it must be converted to outlines before final use. Concept 4's ring text can't be read at 32 px, so it would need concept 1's monogram as its browser-tab icon.
- **Checked:** all 25 inlined SVGs render at 1440 and 375 px, in light and dark mode. No page overflow at 375 px. No console errors.
- **Files:** `mockups/assets/logo-concepts/concept-1.svg` … `concept-5.svg` and `concept-1-mark.svg` … `concept-5-mark.svg` (new), `mockups/logo-concepts.html` (new), `mockups/styles.css`, `docs/open-questions.md`, `docs/changelog.md`

## 2026-10-23 · Phase 4 · Hydration warning from browser extensions

- **Changed:** added `suppressHydrationWarning` to `<body>` in `src/app/layout.tsx`, as `<html>` already has.
- **Why:** the Grammarly extension adds `data-gr-ext-installed` and `data-new-gr-c-s-check-loaded` to `<body>` before React loads, which showed a hydration mismatch in the dev error panel. It only ignores attribute differences on the `<body>` tag itself, not the page content.
- **Files:** `src/app/layout.tsx`, `docs/changelog.md`

## 2026-10-24 · Sprint 5.3 (part B) · Add, edit and approve frames with photos

- **Changed:**
  - `/admin/frames/new`, `/admin/frames/[code]`, and the same for sunglasses. Built from the approved mockup (`frame-form.tsx`, loaded by `frame-form-page.tsx`):
    - **Photos:** up to 5, Take photo or Choose; resized in the browser to 1600 px WebP; type per photo, with a consent tick for "Model wearing it"; reorder; the first is the cover.
    - **Fields and messages:** every field from Requirements_Admin 6.1, with "Add a new brand / colour"; a live "Code already used by …" check; errors under each field plus a summary.
    - **Buttons by role and status:**
      - staff: Save as draft, Send for approval;
      - admin: Save and publish, or for a waiting frame Approve and publish / Send back with a note;
      - an approved frame: Save changes.
    - **Danger zone:** staff can Hide from site; an admin can Delete, which removes the photo files too.
    - **Safety:** "Leave without saving?" guard; the fields autosave on the device, with "Continue it / Start fresh".
    - **Done screen:** "Add another", which keeps brand, category, gender and branch and suggests the next code.
  - **Server actions** (`frames/actions.ts`):
    - use the same Zod rules (`src/lib/frame-schema.ts`) and check role and status before saving;
    - remove new uploads again if a save fails;
    - every change calls `updateTag("catalogue")`, so the public menu updates at once.
  - **Security:** `staff_delete` on `frame_images`, so staff can remove and reorder photos.
  - **Removed:** the temporary `/admin/upload-test` page, its proxy block and its test.
- **Why:** sprint 5.3 part B. This is the "done when" of the sprint: staff upload on a phone, an admin approves, and only then is it public.
- **Checked:**
  - `tests/frame-form.spec.ts` (5): staff add a frame with 2 photos at 360 px (stored as WebP, the photo is 404 to the public), an admin approves it (photo 200), send back shows the note, plain errors (not a photo, a used code, missing fields), staff see Hide but not Delete, and an admin's delete removes the row and files.
  - Full suite: 88 passed.
  - **Found and fixed:**
    - a test picked a file before React had attached to the input, so it now waits until the form is ready;
    - a bad photo's message showed twice;
    - a lint error in the draft-restore check.
  - **Noted:** one slow full run (8.8 min) gave two timeouts; both passed on a rerun and in the next full run.
- **Files:** `src/app/admin/(staff)/frames/{actions.ts,new,[code]}`, `src/app/admin/(staff)/sunglasses/{new,[code]}`, `src/components/admin/{frame-form,frame-form-page,admin-shell}.tsx`, `src/lib/frame-schema.ts`, `db/security.sql`, `src/proxy.ts`, `tests/frame-form.spec.ts`, `tests/uploads.spec.ts`, `playwright.config.ts`, `docs/requirements/Requirements_Admin.md`, `docs/changelog.md`

## 2026-10-23 · Sprint 5.3 (part A) · Staff area shell, dashboard, frames list

- **Changed:**
  - Staff pages are now in `src/app/admin/(staff)/` with the shell from the mockup (`admin-shell.tsx`):
    - top bar and sidebar (a drawer on phones);
    - the admin's branch switcher, saved in a cookie; staff see their own branch;
    - menu counts and the phone "Add frame" button.
  - Real dashboard (Requirements_Admin 5): to-do cards, quick actions, today's bookings with status, approval queue (admin) or own frames (staff), branch card, recent changes, "On the site now".
  - `/admin/frames` and `/admin/sunglasses`: search, filters and a one-tap Sold out toggle that updates the public site (`updateTag("catalogue")`).
  - Sections from later sprints show "arrives in sprint …".
  - The staff CSS (mockup sections 13 and 17) is ported into `src/styles/forms.css` and `admin.css`.
  - Shared `ThemeToggle`; staff names are read through the login connection (`staff-directory.ts`).
- **Found and fixed:**
  - My CSS cleaner deleted a grouped phone rule, causing 105 px of overflow at 360 px. It now removes only the mockup selector.
  - A stale dev-server cache served old CSS; clearing `.next/dev` fixed it.
  - Streamed staff pages can't send a 404 status, so the upload test page is now blocked in `src/proxy.ts` in production.
  - Note: in a hidden browser pane React's reveal waits for a repaint, which only affects manual checks.
- **Checked:** `npm test` passes 84 tests, including the new `tests/admin-shell.spec.ts` at 360, 768 and 1440 px. In the browser: the toggle saves to the database, and the branch switch persists.
- **Files:** `src/app/admin/(staff)/*`, `src/components/admin/*`, `src/components/theme-toggle.tsx`, `src/lib/queries/admin.ts`, `src/lib/admin-branch.ts`, `src/lib/staff-directory.ts`, `src/lib/auth.ts`, `src/proxy.ts`, `src/styles/{admin,forms,site-chrome}.css`, `src/app/globals.css`, `tests/*`, `playwright.config.ts`, `docs/changelog.md`

## 2026-10-23 · Sprint 5.1 · White menu bar in light mode (proposal)

- **Changed:**
  - In light mode the main menu bar is white with navy text and logo name. The gold underline stays, but the current item's text is navy and the WhatsApp and sun icons are navy-2 (gold on white is too faint to read).
  - The search panel is cream with a white field.
  - Unchanged: dark mode stays navy, and so do the utility strip, phone menu and footer.
  - Done with new `--nav-*` colour roles in `globals.css` and one marked override block in `src/styles/site-chrome.css`, so it's a one-block revert.
- **Why:** the developer's idea, to show the client. The approved mockup is navy, so it's listed in `docs/open-questions.md` and marked "client to confirm" in `CLAUDE.md` and `Requirements_Navigation.md`.
- **Checked:**
  - In the browser: light mode at 1440 px (white bar, navy text, gold underline) and 375 px (white bar, navy menu icon, no overflow); dark mode still navy.
  - The phone menu header and footer stay white-on-navy. No console errors.
  - `npm test`: 69 passed.
- **Files:** `src/app/globals.css`, `src/styles/site-chrome.css`, `CLAUDE.md`, `docs/requirements/Requirements_Navigation.md`, `docs/open-questions.md`, `docs/changelog.md`

## 2026-10-23 · Sprint 5.1 · Layout: utility bar, navigation, mega menus, phone menu, sticky bar, footer

- **Changed:**
  - Public pages now live in the `src/app/(site)/` route group with a shared layout (the staff area keeps its own). Built from the signed-off mockups and `Requirements_Navigation.md`:
    - **Utility bar:** Since 1999, hours, each branch's call link, "2 branches", Book an eye test; a shortened strip on phones.
    - **Navigation:** the 8 items in the client's order with the gold underline on the current section; mega menus open on hover, click or keyboard and close on Esc, mouse-out or a click outside.
    - **Theme and search:** the light/dark toggle (remembered, no flash); the search panel (results page in 5.6).
    - **Phone and tablet menu:** full screen, + / − one section at a time, scroll locked, focus kept inside.
    - **Sticky bar:** Call / WhatsApp / Book test.
    - **Branch picker:** one picker for the whole site.
    - **Footer:** both branches, quick links, social links, privacy link.
  - **Data:**
    - Branches, menu brands and "from ₹" prices are read from the database (approved, active rows only) and cached with tags for instant refresh after admin edits.
    - A tier with no products is hidden (never ₹0).
    - The seed now includes the mockups' DUMMY lens catalogue.
  - **Styles:** the mockup's header and footer CSS is ported unchanged (`src/styles/site-chrome.css`); the remaining tokens are added to `globals.css`.
  - **Dummy safety:**
    - `site-config.ts` has a DUMMY register (D2, D5, D8, C7).
    - `<DummyTag>` shows only in development.
    - A placeholder phone number never works as a link.
    - New `npm run check:launch` fails while any placeholder remains (currently 14 items).
  - **Tests:** `tests/layout.spec.ts` (16 checks across 360 / 768 / 1440) and `tests/menu-data.spec.ts` (3).
- **Why:** sprint 5.1, the first build sprint. Every later page sits inside this layout.
- **Checked:**
  - `npm test`: 69 passed (the 46 earlier ones too). The 16 skipped are width-specific.
  - In the browser at 1440 and 375 px:
    - the header, the Frames mega menu (database brands, "Premium from ₹3,290"), the phone menu and the sticky-bar WhatsApp picker all match the mockups;
    - DUMMY tags show beside placeholder values only.
  - **Found and fixed:**
    - the CSS port skipped a comment's opening line, which broke the dev build; the production build had only warned and silently dropped the header styles;
    - a footer-year `<script>` caused a hydration mismatch and was replaced with a small client component;
    - a lint error (state reset in an effect) was moved to React's render-time pattern.
- **Files:** `src/app/(site)/*`, `src/components/site/*`, `src/styles/site-chrome.css`, `src/app/globals.css`, `src/lib/site-config.ts`, `src/lib/queries/site.ts`, `src/lib/site-data.ts`, `scripts/db-seed.ts`, `scripts/launch-check.ts`, `public/logo-placeholder.svg`, `tests/layout.spec.ts`, `tests/menu-data.spec.ts`, `playwright.config.ts`, `package.json`, `CLAUDE.md`, `docs/requirements/Requirements_Navigation.md`, `docs/ai-fluency-log.md`, `docs/changelog.md`

## 2026-10-23 · Phase 4 · Step 6: automated tests; Phase 4 complete

- **Changed:**
  - **`npm test`:**
    - Playwright builds the app and runs its own production server on port 3100;
    - global setup and teardown make and delete throwaway accounts with random passwords;
    - one worker, with the rate-limit test last.
  - **46 tests:**
    - `db-security.spec.ts` (18): every table has forced row-level security; the website's user can't bypass it; public, staff and admin rules, in rolled-back transactions.
    - `admin-auth.spec.ts` (9): redirects, noindex and robots, no sign-up, staff and admin sign-in and sign-out, a cross-site sign-out refused (CSRF), forged cookie, switched-off account, identical "wrong details" messages, the real limit of 5 a minute.
    - `uploads.spec.ts` (9): file-type and size rules, traversal paths, `/media` visibility for the public and staff, the upload test page is a 404 in production.
    - `ui.spec.ts` (3 × 3 widths): no overflow, fonts and colours, error message, sign-in and sign-out, Back after sign-out, no redirect to other sites.
    - `rate-limit.spec.ts` (1).
  - **Security fix 1, sign-in limit:** a browser could dodge it by sending a new fake `X-Forwarded-For` on every try (7 wrong passwords, no block). No IP header is trusted now unless `TRUSTED_IP_HEADER` is set at deployment. The test server's limit is raised with `E2E_SIGNIN_LIMIT` (tests only); the real limit of 5 has its own test.
  - **Security fix 2, Back after sign-out:** the Back button showed the dashboard (name and counts) from Next.js's in-page memory. Sign out is now a button that loads the login page fresh, replacing the `signOut` server action (`src/app/admin/actions.ts` removed).
  - `.env.example` documents `TRUSTED_IP_HEADER`; `tests/.auth/` is gitignored.
  - Phase 4 is marked complete in `CLAUDE.md` and `ROADMAP.md`.
- **Why:** Phase 4 step 6. Foundation is "done when" a public request can't read private data and the admin can sign in; both are now proven by tests that run on every change.
- **Checked:**
  - **Fixes:** both were reproduced before fixing and pass after: 7 spoofed-IP attempts now get 429 from the 6th; Back lands on the login page with no staff data.
  - **Test mistakes fixed on the way:** React's `<!-- -->` text markers; Next.js's own `role="alert"` route announcer; a sign-out test without an `Origin` header (correctly refused by CSRF protection); and a Back test that landed on a blank page and would have passed without proving anything.
  - **Result:** the full suite passes (46/46). Afterwards there are no test accounts, rows or files left. The 2 files in `uploads/` are the developer's own upload-test photos.
- **Files:** `playwright.config.ts`, `tests/*.ts`, `src/lib/auth-options.ts`, `src/app/admin/sign-out-button.tsx`, `src/app/admin/page.tsx`, `src/app/admin/actions.ts` (removed), `package.json`, `.gitignore`, `.env.example`, `CLAUDE.md`, `ROADMAP.md`, `docs/ai-fluency-log.md`, `docs/changelog.md`

## 2026-10-23 · Phase 4 · Temporary upload test page

- **Changed:**
  - Added `/admin/upload-test`, a temporary page:
    - signed-in staff only, and a 404 when the app runs in production;
    - any file can be uploaded; it's saved through `saveUpload()` as a **hidden** gallery photo and shown back through `/media/`;
    - an admin can delete each one (row and file).
  - Linked from the `/admin` placeholder on the laptop only.
  - `next.config.ts`: server-action and proxy body limits raised from 1 MB to 12 MB, so a 10 MB photo reaches our own check.
- **Why:** the developer wanted to try uploads before the frame form exists. It also tests `saveUpload()` end to end, which step 5 couldn't. Remove the `src/app/admin/upload-test/` folder in sprint 5.3.
- **Checked** (throwaway admin account, in the browser):
  - a real PNG is saved and displays;
  - a text file named `fake.jpg` gets "This file isn't a photo. Use JPG, PNG or WebP.";
  - an 11 MB file gets "This photo is too large (max 10 MB).";
  - Delete removes the row and the file (`/media` then returns 404).
  - Test account and files removed afterwards (0 files in `uploads/`). Lint and types are clean.
- **Files:** `src/app/admin/upload-test/{page.tsx,actions.ts,upload-form.tsx,constants.ts}`, `src/app/admin/page.tsx`, `next.config.ts`, `docs/changelog.md`

## 2026-10-23 · Phase 4 · Step 5: photo uploads

- **Changed:**
  - **`src/lib/upload-rules.ts`:**
    - reads the real file type from the first bytes (JPEG, PNG, WebP only);
    - enforces the 10 MB limit, with the plain error messages from the requirements;
    - allows only stored paths shaped `bucket/<uuid>/<uuid>.ext`, so no request can reach a file outside `uploads/`.
  - **`src/lib/storage.ts` (server-only):** `saveUpload()` needs the signed-in staff member, re-checks type and size, saves under a random name and never overwrites. Also `readUpload()` and `deleteUpload()`.
  - **`/media/[...path]`:** serves a photo only if its row is visible to the person asking, using row-level security with their role. Public photos are cached for an hour; staff previews of drafts are `no-store`. Sent with `nosniff`.
  - **Also:** `suppressHydrationWarning` on `<body>`, because Grammarly adds attributes there before React loads, which showed a dev-only hydration warning.
  - **Requirements_Admin 6.2:** the server refuses HEIC; the browser converts it.
- **Why:** Phase 4 Foundation, step 5 of the approved plan.
- **Checked:**
  - **Rules (21 checks, all pass):** real JPEG/PNG/WebP accepted; a text file renamed `.jpg`, an SVG with a script, an HTML page, GIF, HEIC and empty files refused; 10 MB accepted, 10 MB + 1 byte refused; 8 path-traversal and wrong-format paths refused.
  - **`/media` over HTTP:** 13 of 14 checks passed as written:
    - the public gets an approved frame's photo (correct type, cacheable, nosniff), but 404 for a draft's photo, a hidden gallery photo, a file with no row and a row with no file;
    - a throwaway staff account sees the draft and hidden photos, uncached.
  - The 14th failed only because the test expected 404 and Next.js answered 400 for an encoded `..%2F`. Re-checked by hand: four encoded traversal attempts were all refused (400/404) with no secrets in the body.
  - The test account and test files were removed. Lint and types are clean.
  - **Not yet tested:** `saveUpload()` itself. It runs end to end once the frame form exists (sprint 5.3).
- **Files:** `src/lib/upload-rules.ts`, `src/lib/storage.ts`, `src/app/media/[...path]/route.ts`, `src/app/layout.tsx`, `docs/requirements/Requirements_Admin.md`, `CLAUDE.md`, `docs/changelog.md`

## 2026-10-23 · Phase 4 · Step 4: staff login

- **Changed:**
  - **Better Auth server** (`src/lib/auth.ts`): connects as `vslm_auth`. Endpoints at `src/app/api/auth/[...all]/route.ts`. Sign-up is off; 12-hour sessions; 5 sign-in attempts a minute.
  - **Login page** `/admin/login`: a card in the design tokens, with plain error messages (wrong details, too many attempts, account switched off). The return path only allows `/admin…`, so it can't send people to another site.
  - **Gate** (`src/proxy.ts`): no session cookie means a redirect to login. **Real check** (`src/lib/session.ts`): `requireStaff()` against the database, refusing banned or role-less accounts.
  - **Temporary `/admin`:** name, role and branch, two counts read with the signed-in role, and Sign out (a server action). The `/admin` area is noindex, and `robots.ts` disallows `/admin` and `/api/`.
  - **`npm run staff:create`:** creates the first admin, or resets a password and signs that person out everywhere.
  - **Other:** a shared `scripts/prompt.ts`; `.env.example` lists the variable names.
- **Why:** Phase 4 Foundation, step 4 of the approved plan. Admin sign-in is half of the Foundation "done when".
- **Checked:**
  - Throwaway test accounts (staff, admin, a banned one), with random passwords that were never displayed; 14 HTTP checks, all pass:
    - signed out → redirect to login;
    - public sign-up refused (400);
    - staff and admin sign in, see their own name and role, and read 4 drafts with their role;
    - after sign-out the old cookie shows nothing;
    - a forged cookie passes the proxy but gets no dashboard;
    - the banned account gets 403;
    - the 6th attempt in a minute gets 429.
  - In the browser at 375 px: wrong password shows the message; correct password opens the dashboard; Sign out returns to login and Back doesn't reveal the dashboard; light and dark mode; no overflow.
  - Test accounts deleted afterwards (0 users, 0 sessions). Lint, types and build clean.
  - Fixed: the branch showed as a lowercase slug, and the `/admin` tab title missed "staff area" (a layout's title template doesn't apply to its own page).
- **Files:** `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/lib/session.ts`, `src/proxy.ts`, `src/app/api/auth/[...all]/route.ts`, `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/app/admin/actions.ts`, `src/app/admin/login/page.tsx`, `src/app/admin/login/login-form.tsx`, `src/app/robots.ts`, `scripts/staff-create.ts`, `scripts/prompt.ts`, `scripts/db-setup.ts`, `.env.example`, `package.json`, `CLAUDE.md`, `docs/requirements/Requirements_Admin.md`, `docs/changelog.md`

## 2026-10-22 · Phase 4 · Steps 1 and 3: local PostgreSQL, schema and security

- **Changed:**
  - **Step 1 (developer):** installed PostgreSQL 17. `npm run db:setup` created `vslm_dev` and the users `vslm_owner`, `vslm_app` and `vslm_auth`. They have generated passwords, `NOBYPASSRLS`, and live in a gitignored `.env.local`.
  - **Schema:** `src/db/schema.ts` defines 13 app tables from the requirement files, with checks built in: price range, 5 frame photos, 12 camp photos, consent for photos of people, valid times, field lengths. Migration: `db/migrations/0000_init.sql`.
  - **Login tables:** created by Better Auth's own migration; settings in `src/lib/auth-options.ts` (no sign-up, 12-hour sessions DUMMY C22, 5 sign-in attempts a minute).
  - **Security (`db/security.sql`):**
    - Row-level security is enabled and forced on all 17 tables, keyed on `app.role`, with public / staff / admin policies.
    - Only an admin edits branches and closed days; a trigger refuses approval by anyone but an admin.
    - Login tables are reachable only by `vslm_auth`.
    - `slot_counts()` returns booking counts only.
  - **Access:** `src/lib/db.ts` `withRole()` is the website's only way into the database (server-only).
  - **Data:** `npm run db:seed` loads the mockups' DUMMY data: 2 branches, 46 approved frames and sunglasses plus 4 drafts, 7 camps, 3 testimonials.
  - `package.json` is now `"type": "module"`, which silences a Node warning.
- **Why:** Phase 4 Foundation, steps 1 and 3 of the approved plan.
- **Checked:** connected as the website's user (`vslm_app`), 24 checks all pass. Examples:
  - **Public:** sees 46 approved frames and 0 drafts; reads 0 bookings and 0 enquiries; can add a booking but can't read it back (even with `RETURNING`) or change it; is refused on login tables.
  - **Staff:** can't approve or delete; can edit an approved frame's price.
  - **Admin:** can approve, delete and edit branches, but still can't read login tables.
  - **Other:** a request with no role is treated as public; slot counts return only "10:00 → 1".
  - The migration re-runs cleanly; lint and types are clean.
- **Files:** `src/db/schema.ts`, `db/migrations/*`, `db/security.sql`, `src/lib/db.ts`, `src/lib/auth-options.ts`, `scripts/env.ts`, `scripts/db-setup.ts`, `scripts/db-migrate.ts`, `scripts/db-seed.ts`, `drizzle.config.ts`, `package.json`, `tsconfig.json`, `CLAUDE.md`, `docs/ai-fluency-log.md`, `docs/changelog.md`

## 2026-10-21 · Phase 4 · Step 2: Next.js app scaffold

- **Changed:**
  - Scaffolded the app at the repo root with Next.js 16.4 (App Router, TypeScript, Tailwind v4, ESLint, Cache Components).
  - Ported the design tokens and light/dark colour roles from `mockups/styles.css` into `src/app/globals.css`. Tailwind's default palette is removed, so only token colours exist as utilities (`bg-navy`, `bg-surface`, `text-heading`, …). Base styles sit in `@layer base`, so utilities win.
  - Fonts via `next/font`: Inter and Plus Jakarta Sans 800. A no-flash `vslm-theme` script runs in `<head>`.
  - Added `src/lib/site-config.ts` (seed shop facts; Patelguda number `DUMMY` D2) and a temporary foundation-check home page.
  - Installed the planned packages (drizzle-orm, pg, better-auth, zod, server-only; dev: drizzle-kit, @types/pg, @playwright/test).
  - Added the `app` preview config. `.gitignore` gains `uploads/`; `mockups/` is excluded from TypeScript and ESLint.
- **Why:** Phase 4 Foundation, step 2 of the approved plan.
- **Checked:** `npm run lint`, `tsc` and `npm run build` are clean. In the browser: fonts and token colours correct in light and dark mode, no overflow at 375 px, no console errors. Found and fixed a base heading colour overriding `text-white`.
- **Files:** `package.json`, `package-lock.json`, `tsconfig.json`, `eslint.config.mjs`, `next.config.ts`, `AGENTS.md`, `src/app/*`, `src/lib/site-config.ts`, `.gitignore`, `.claude/launch.json`, `CLAUDE.md`, `docs/changelog.md`

## 2026-10-21 · Phase 4 · Stack: local PostgreSQL instead of Supabase

- **Changed:**
  - The stack no longer uses Supabase:
    - Database: PostgreSQL 17 on the developer's laptop (`vslm_dev`), with Drizzle for the schema and migrations.
    - Staff login: Better Auth, with `admin` / `staff` roles and no sign-up.
    - Photos: local `uploads/` folders behind `src/lib/storage.ts`.
    - Hosting: local for now.
  - Security model: the browser never talks to the database; server code uses `withRole()`. Separate database users (`vslm_owner`, `vslm_app`, `vslm_auth`) and forced row-level security on every table, keyed on the request role.
  - Updated `CLAUDE.md` (stack, data security, folder rules), `ROADMAP.md` Foundation, and the Admin, Booking and Privacy requirements (no reset emails in the MVP; the hosting provider is named once deployment is decided). Mockup comments now say "the database".
- **Why:** developer decision: everything on DigitalOcean eventually, and run the whole project on the laptop first. Deployment is out of scope for now.
- **Files:** `CLAUDE.md`, `ROADMAP.md`, `docs/requirements/Requirements_Admin.md`, `Requirements_Booking.md`, `Requirements_Privacy.md`, `mockups/privacy.html`, `mockups/about.html`, `mockups/admin.html`, `mockups/home.html`, `mockups/lenses.html`, `mockups/camps-data.js`, `mockups/frames-data.js`, `mockups/listing.js`, `docs/changelog.md`

## 2026-10-21 · Phase 4 · Hosting: Netlify → DigitalOcean

- **Changed:**
  - Hosting is now DigitalOcean App Platform (auto-deploy from `main`) instead of Netlify, in `CLAUDE.md`, `ROADMAP.md`, the privacy requirements and mockup ("service providers"), and the 404 requirements. Old-URL redirects now go in the Next.js config, not `netlify.toml`.
  - Removed the `.netlify/` ignore rule.
  - The preview deploy moves out of Foundation; it now happens before sprint 5.1 ends.
- **Why:** the developer learned the site will be deployed on DigitalOcean, and decided to skip the deploy for now. App Platform is assumed, as the closest match to the old setup; change the wording if it's a Droplet.
- **Files:** `CLAUDE.md`, `ROADMAP.md`, `docs/requirements/Requirements_Privacy.md`, `docs/requirements/Requirements_NotFound.md`, `mockups/privacy.html`, `.gitignore`, `docs/changelog.md`

## 2026-10-21 · Phase 3 → 4 · Mockups signed off

- **Changed:** Phase 3 is complete and Phase 4 (Foundation) begins.
  - All 14 requirement files are now "Approved by the client 2026-10-21". Privacy still needs a legal review of its wording before launch.
  - `CLAUDE.md` status now says Phase 4, and the mockups are described as the approved design.
- **Why:** the client reviewed every mockup live with the developer on Google Meet (screen share). The changes they asked for were applied (previous entry) and they approved the result. `review.html` wasn't sent, since the review happened live. Missing client details stay `DUMMY` (see `docs/dummy-data.md`, `docs/open-questions.md`) and must be replaced before launch. They don't block Foundation.
- **Files:** `CLAUDE.md`, `docs/requirements/*.md` (status lines), `docs/changelog.md`

## 2026-10-21 · Phase 3 · Mockups: client changes (menu, logo, branches, eye camps)

- **Changed:** the client's change list ("changes to the mockups.txt"), clarified with the developer:
  - **Menu:** a "Home" item was added and the order is now Home · About · Frames · Sunglasses · Lenses · Eye care · Eye camps · Contact (desktop, phone menu and footer quick links). Menu labels no longer wrap at 1180 px.
  - **Logo:** the client is sending a new logo. Until it arrives, every page uses `mockups/assets/logo-placeholder.svg` (`DUMMY` D8) instead of `docs/logo.png`.
  - **Branches in admin:** a sidebar branch switcher (the admin picks Indresham or Patelguda; staff see their own branch) shows the address. The dashboard has a branch-details card, and bookings are filtered to that branch by default. There's a new `admin-branches.html` (`/admin/branches`, admin only) for editing each branch's address, phone, WhatsApp, hours, open days and visibility, with validation.
  - **Customer address:** an optional "Your area or address" field on the booking and contact forms (consent text updated). The admin booking rows show it.
  - **Eye camps in admin:** a new `admin-camps.html` (`/admin/eye-camps`) with the upcoming/past list and the add/edit form, including the after-camp people count and photos.
  - `admin.js`: branch data, routes for the new pages, and `guard(go, stay)`, so a cancelled branch switch puts the select back.
- **Why:** client feedback on the mockups. Branch details now come from the `branches` table, which the admin edits, instead of only `site-config.ts`. The optional address field goes against the earlier data-minimisation rule in `Requirements_Booking.md`, so it's optional, named in the consent text and listed as an open item.
- **Checked:**
  - Menu order and the current item at 1440, 1180 and 375 px.
  - Branch switching updates the sidebar, the dashboard and the booking filter. The branch and camp forms show errors with a summary. The staff view is read only.
  - No page-level overflow at 375 and 768 px on the dashboard, Branches, Eye camps (list, new, past), Booking, Contact, Home and About. Light and dark mode. No console errors.
- **Files:** `mockups/site.js`, `mockups/admin.js`, `mockups/admin.html`, `mockups/admin-frame.html`, `mockups/admin-branches.html` (new), `mockups/admin-camps.html` (new), `mockups/assets/logo-placeholder.svg` (new), `mockups/book-eye-test.html`, `mockups/contact.html`, `mockups/review.html`, `mockups/styles.css`, `CLAUDE.md`, `docs/requirements/Requirements_Navigation.md`, `docs/requirements/Requirements_Admin.md`, `docs/requirements/Requirements_Booking.md`, `docs/requirements/Requirements_Contact.md`, `docs/dummy-data.md`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Client review pack

- **Changed:** added `mockups/review.html`, a page for the client (not part of the website):
  - **How to review:** phone and computer, review notes, what "DUMMY" means, light / dark mode.
  - **15 page cards:** the 13 customer and other pages (Menu counted as one), plus the staff dashboard and the add-frame form. Each has links, 1–3 numbered questions, a "Looks good / Needs changes" choice and notes. Saved only in the reviewer's browser (`vslm-review`).
  - **Decisions we made:** 13 items, marked Website or Later phase.
  - **Information still needed:** 19 items before launch and 8 for the later shop system, from `docs/dummy-data.md` and `docs/open-questions.md`.
  - **Feedback:** a sticky bar with a count, "Copy feedback" and "Send feedback on WhatsApp", which opens WhatsApp with the reviewer's answers so they choose who to send it to.
  - **Shared files:** `styles.css` gets a "Client review pack" section, including a print style. `CLAUDE.md` mentions the pack.
- **Why:** Phase 3 ends with client sign-off. One page lets the shop owner try every mockup and answer the open questions in one go.
- **Checked:**
  - All 18 links resolve. Feedback saves, survives a reload and builds the WhatsApp text.
  - At 360 px in dark mode: no overflow (strict `clientWidth` check), targets at least 36 px, the feedback bar made compact.
  - The home section order in the questions was checked against `home.html`.
- **Files:** `mockups/review.html`, `mockups/styles.css`, `CLAUDE.md`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Mockups: full-width check on every page

- **Changed:**
  - Re-checked every mockup for content wider than the screen, with the stricter method from the 404 work: real 360 and 768 px frames emulating a phone, measured against `clientWidth`, across the whole page (header and footer included). Intentional off-canvas parts (drawer, mega menus, search, branch picker) and horizontal scrollers (the home frame carousel) are excluded.
  - Fixed the "not found" icons on Frame detail and Camp detail: they took 150 px of height (the SVG default). Glasses are now 120 × 50 and the camp icon 72 × 72, the same as the 404 page.
- **Why:** the earlier check could miss overflow on phones (`docs/ai-fluency-log.md`, 2026-10-10).
- **Checked:**
  - 40 page-and-width checks, all passing with no page-level scroll: Home, Frames, Sunglasses, Frame detail (and not found), About, Lenses, Eye care, Book an eye test, Eye camps, Camp detail (and not found), 404 (and error), Privacy, Contact, Gallery, Admin dashboard, and Admin frame form (new and review), each at 360 and 768 px.
  - A first run inside a desktop tab gave false alarms (a 15 px desktop scrollbar made the width 345 px); it was repeated with phone emulation.
- **Files:** `mockups/styles.css`, `mockups/camp-detail.html`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Mockups: 404 and error page

- **Changed:** added `mockups/404.html` (`Requirements_NotFound.md`, approved):
  - **404:** "This page is a little out of focus." with a search field, four "where to next" cards (Frames, Sunglasses, Book an eye test, Visit a branch), WhatsApp help prefilled with the missing address, and "Back to home".
  - **Smart hints:** removed frames and sunglasses ("isn't available", "See all frames / sunglasses" first) and missing camps.
  - **Error page:** "Something went wrong on our side." with Try again, Call and WhatsApp, and no technical details.
  - **Mockup:** `?path=` stands in for the missing address and `?state=error` shows the error page; a review panel links to each state.
  - **Shared files:** `styles.css` gets a "Page not found" section (reuses `.notfound` and the quick cards).
- **Why:** dead links and failed loads should lead back to frames, a booking or the shop, not a dead end; this matches the existing frame and camp "not available" rules.
- **Checked:** in the browser:
  - all five states (titles, headings, card order, WhatsApp text); search text escaped;
  - 1440 px light, 360 px dark;
  - no console errors.
  - A real 7 px overflow at 360 px was found and fixed (headline column). The overflow check was corrected to use `clientWidth` and re-run on the 404, Privacy, Contact, Gallery and admin pages; all fit (see `docs/ai-fluency-log.md`).
- **Files:** `mockups/404.html`, `mockups/styles.css`, `docs/requirements/Requirements_NotFound.md`, `docs/ai-fluency-log.md`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Mockups: Privacy policy

- **Changed:** added `mockups/privacy.html` (`Requirements_Privacy.md`, approved):
  - a hero with "Last updated", an "In short" box, a contents list (sticky on desktop with the current section highlighted; collapsible on phones, closing after a tap);
  - plain-English sections: who we are, what we collect and why (a table that stacks on phones), how we use it, who can see it, how long we keep it, your rights under the DPDP Act 2023, children, keeping it safe, changes, contact;
  - a contact card with WhatsApp / Call (branch picker) and the email; a print style.
  - **Shared files:** `site.js` routes `/privacy`, so the footer link and the consent links on the booking and contact forms open it; `styles.css` gets a "Privacy" section; shared branch action buttons raised from 40 to 44 px (also on Home, Contact and Booking).
  - **Dummy data:** new C23 (privacy contact person, 30-day reply); D9 retention and D1 email shown tagged.
- **Why:** every form links to `/privacy` (DPDP consent); the page must list exactly what the site collects. The wording still needs a legal check before launch.
- **Checked:** in the browser:
  - The contact form's consent link and the footer link open it.
  - Every contents link lands below the sticky header and highlights the right section.
  - At 360 px in dark mode: contents collapsed, table stacked, no horizontal scroll, buttons 44 px.
  - The listed browser storage keys (`vslm-theme`, `vslm-favourites`) match the public mockups' code.
- **Files:** `mockups/privacy.html`, `mockups/site.js`, `mockups/styles.css`, `docs/requirements/Requirements_Privacy.md`, `docs/dummy-data.md`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Mockups: Admin dashboard and add-frame form

- **Changed:** added the staff area mockups (`Requirements_Admin.md`, approved):
  - **`mockups/admin.js`:** its own shell instead of `site.js`: navy top bar (role, branch, theme toggle, View site, Sign out), sidebar with counts (a drawer on phones, inert when closed), "Add frame" button on phones, a mockup-only "View as Staff / Admin" switch, DUMMY drafts shared by both pages, and an unsaved-changes guard.
  - **`mockups/admin.html` (dashboard):** greeting; to-do cards (waiting for approval or your drafts, bookings today, new enquiries); quick actions; today's bookings with a branch filter, Call / WhatsApp and a status menu; the admin's approval queue or the staff member's drafts with the admin's note; recent changes; "On the site now" counts.
  - **`mockups/admin-frame.html` (add / edit / review):** up to 5 photos from the camera or gallery, resized in the browser to 1600 px WebP before upload, with type and size checks, progress, photo type, cover, reorder, remove with Undo, and a permission tick for "Model wearing it"; all frame fields (sunglasses lens fields when the category is Sunglasses); live duplicate-code check; actions by role and status (Save as draft / Send for approval; Send back with a note / Approve and publish; Save changes; Delete for admin, Hide from site for staff); autosave on the device with "Continue it"; "Add another frame" keeps brand, category, gender and branch.
  - **Shared files:** `styles.css` gets a "Staff area" section; `CLAUDE.md` lists `admin.js` in the mockups table.
  - **Dummy data:** C22 (accounts, session length, edit rule) and DUMMY customers with unusable numbers.
- **Why:** the last two of the 14 plan mockups (sprints 5.3–5.5); staff upload from a phone (Q36) and an admin approves (Q37).
- **Checked:** in the browser:
  - Desktop: the queue opens a draft in review mode; Send back refuses an empty note and lands on the result; the status menu and branch filter work; dummy numbers never dial.
  - As staff: an empty submit lists all 9 errors; a non-photo and an 11 MB file are refused; a 3000×2000 photo becomes 1600×1067 (333 KB → 39 KB); a duplicate code is caught; "Model wearing it" without permission is blocked; Send for approval works; the leave guard and "Continue it" work.
  - Approved frames: reorder keeps focus, remove + Undo; staff Hide and admin Delete ask first.
  - At 360 px in dark mode: no horizontal scroll, targets at least 44 px, the drawer opens and closes with Esc.
  - No console errors apart from Chrome blocking the leave prompt during scripted reloads.
- **Files:** `mockups/admin.js`, `mockups/admin.html`, `mockups/admin-frame.html`, `mockups/styles.css`, `CLAUDE.md`, `docs/requirements/Requirements_Admin.md`, `docs/dummy-data.md`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Mockups: Contact

- **Changed:** added `mockups/contact.html` (`Requirements_Contact.md`, approved):
  - a hero, three quick cards (WhatsApp, Call, Book an eye test);
  - two branch cards (`#branches`, `#indresham`, `#patelguda`): address, hours, holiday note, services, "Open now / Closed now" in India time, and Directions, Call and WhatsApp for each branch's own number; maps load only when scrolled into view or tapped;
  - an enquiry form (name, mobile, branch, topic, message, reply by, consent, spam trap) with an error summary, a server-error preview and a thank-you state that shows only what was just sent;
  - prefill from a frame (`?topic=frames&frame=VSF-1024`), invalid values ignored;
  - a small FAQ, a CTA band and `OpticianStore` structured data (Patelguda phone left out while DUMMY).
  - **Shared files:** `site.js` routes `/contact`; `styles.css` gets a "Contact" section (3-column quick cards, open/closed status, select field, form side notes).
  - **Dummy data:** new C21 (enquiry reply time).
- **Why:** sprint 5.4 contact page; WhatsApp stays the primary contact (Q154), the form is the fallback.
- **Checked:** in the browser:
  - Home's "Visit a store" lands on `#branches` with Contact highlighted in the menu;
  - an empty submit lists all 5 errors and focuses the summary; a valid send shows the thank-you state; "Either" opens the branch picker, a dummy branch never dials;
  - the server-error preview keeps the entered details; a prefilled message alone is rejected;
  - at 360 px in dark mode: one column, no horizontal scroll, sticky bar shown, readable;
  - no console errors.
- **Files:** `mockups/contact.html`, `mockups/site.js`, `mockups/styles.css`, `docs/requirements/Requirements_Contact.md`, `docs/dummy-data.md`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Mockups: Gallery

- **Changed:** added `mockups/gallery.html` (`Requirements_Gallery.md`, approved):
  - a hero with the Home › About › Gallery breadcrumb (About highlighted in the menu);
  - tag chips with counts (only tags that have photos; kept in `?tag=`);
  - a 3-column grid (2 on phones) with a large first photo, 24 per "Load more";
  - the large view staying within the current tag;
  - a consent note with an "ask to remove a photo" WhatsApp link;
  - a call to action.
  - **Data:** 28 DUMMY photos (C20); customer photos labelled "only with permission (Q146)".
  - **New shared `mockups/lightbox.js`:** the `<dialog>` large view with caption, meta, "n of m", arrows, swipe, Esc and focus return. `camp-detail.html` now uses it instead of its own copy.
  - **Shared files:** `site.js` routes `/gallery`; `styles.css` gets a "Gallery" section.
- **Checked:** in the browser:
  - About's "View the gallery" opens it; the tag filter and URL work;
  - "Load more" brings 24 up to 28; the large view wraps within a tag and returns focus;
  - camp detail still works on the shared view;
  - on phones, 2 columns and a full-width large view; dark mode readable;
  - no horizontal scroll and no console errors.
- **Files:** `mockups/gallery.html`, `mockups/lightbox.js`, `mockups/camp-detail.html`, `mockups/site.js`, `mockups/styles.css`, `docs/requirements/Requirements_Gallery.md`, `docs/dummy-data.md`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Requirements: Gallery (draft)

- **Changed:** added `docs/requirements/Requirements_Gallery.md`:
  - **Photo data:** image, tag, caption (also used as alt text), branch, date, plus a people/consent check that blocks the upload without consent.
  - **Tag chips:** with counts, kept in `?tag=`.
  - **Grid:** a 3- or 2-column grid with a featured first photo and load more.
  - **Large view:** a shared `<dialog>` view (the same as the camp gallery).
  - **Consent note:** with a "ask to remove a photo" WhatsApp link.
  - **Other:** empty states and a call to action.
  - Added `DUMMY` C20 (gallery).
- **Why:** this is the next page in the plan's mockup order. Customer photos depend on permission the client hasn't confirmed yet (Q146).
- **Files:** `docs/requirements/Requirements_Gallery.md`, `docs/dummy-data.md`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Mockups: Eye camps (listing and detail)

- **Changed:** added `mockups/eye-camps.html` and `mockups/camp-detail.html` (`Requirements_EyeCamps.md`, approved), plus `mockups/camps-data.js` (DUMMY C19 camps and helpers).
  - **Listing:**
    - hero with a totalled stat line ("5 camps · 461 people checked");
    - the next camp with a date block, facts, what's offered, Directions, Add to calendar (`.ics`) and Share on WhatsApp;
    - more upcoming camps as rows;
    - past camps with year chips (from the data, kept in `?year=`) and load more;
    - a "Bring a camp to your community" WhatsApp band and a call to action.
  - **Detail:**
    - an Upcoming / Past badge;
    - upcoming: what's offered, what to bring, the actions, a WhatsApp question and `Event` structured data;
    - past: participants and a photo gallery with a `<dialog>` large view (arrow keys, swipe, Esc, focus returns to the photo);
    - more camps, and a not-available state.
  - **Rule:** upcoming vs past comes from the date.
  - **Shared files:** `site.js` routes `/eye-camps` and `/eye-camps/<slug>` (so the home page's camp link works), and `styles.css` gets an "Eye camps" section.
- **Fixed:**
  - `site.js` highlighted the Eye care mega-menu card instead of the top-level "Eye camps" item; About and Contact had the same issue, so all three now target top-level items only.
  - The camp year chips shared the footer's `data-year` attribute (renamed to `data-camp-year`).
  - Dates no longer show a stray comma.
- **Checked:** in the browser:
  - the menu link opens the listing, and the year filter works;
  - past and upcoming detail pages, the gallery keyboard behaviour and the not-found state all work;
  - on phones, single columns and 44 px targets; dark mode readable;
  - no horizontal scroll and no console errors.
- **Files:** `mockups/eye-camps.html`, `mockups/camp-detail.html`, `mockups/camps-data.js`, `mockups/site.js`, `mockups/styles.css`, `docs/requirements/Requirements_EyeCamps.md`, `docs/dummy-data.md`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Requirements: Eye Camps (draft)

- **Changed:** added `docs/requirements/Requirements_EyeCamps.md`:
  - **Camp data** from Q100: date, place, description, what's offered, participants, photos.
  - **Listing:** a hero with a stat line, the next camp with Directions / Add to calendar / Share on WhatsApp, more upcoming camps, past camps with year chips and load more, and a "Bring a camp to your community" band.
  - **Camp detail:** upcoming vs past content and a keyboard-accessible photo gallery.
  - **Rules:** camps move to Past automatically, past camps stay permanently (Q101), and there's no registration in the MVP (Q99 "Not sure").
  - Added `DUMMY` C19 (camps).
- **Why:** this is the next page in the plan's mockup order.
- **Files:** `docs/requirements/Requirements_EyeCamps.md`, `docs/dummy-data.md`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Mockups: Book an eye test

- **Changed:** added `mockups/book-eye-test.html` (`Requirements_Booking.md`, approved). It's a working mockup in which nothing is saved:
  - **Steps:** 3 steps on one page (branch and day → time → details). Prefill from `?branch=&date=`.
  - **Slots:** 20-minute slots grouped Morning / Afternoon / Evening, with 2 hours' notice, a 30-day window, a Diwali-day closure, and DUMMY counts-only availability (about 1 in 8 slots full). DUMMY C18 and D3.
  - **Fields:** name, +91 mobile, optional for-whom and a note with a counter, a required consent checkbox with the privacy link, and a honeypot.
  - **Errors:** field errors plus a focused error summary.
  - **Confirmation:** a random reference, the last 4 digits of the mobile only, "Send to the branch on WhatsApp" (prefilled), an `.ics` calendar file, "Call or WhatsApp to change", and "Book another test".
  - **Review-only buttons:** preview the "slot just filled" and "server error" states.
  - **Layout:** the sticky bar is hidden on this page; on phones the summary card becomes a one-line summary above the submit button.
  - **Home page:** its booking band now opens this page with branch and date filled in.
  - **Shared files:** `site.js` routes `/book-eye-test`; `styles.css` gets a "Booking form" section.
- **Fixed:** the dummy availability hash marked about 40% of slots full, so it was replaced with FNV-1a (about 12%).
- **Checked:** in the browser:
  - the home band prefill works;
  - validation lists 3 errors with focus on the summary;
  - "slot just filled" makes that time Full and keeps the day;
  - "server error" keeps the entered details and offers Call / WhatsApp (dummy number blocked);
  - success shows the reference, a masked number, the WhatsApp text and the calendar file;
  - on phones, 44 px targets and no horizontal scroll; dark mode readable; no console errors.
- **Files:** `mockups/book-eye-test.html`, `mockups/home.html`, `mockups/site.js`, `mockups/styles.css`, `docs/requirements/Requirements_Booking.md`, `docs/dummy-data.md`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Requirements: Book an eye test (draft)

- **Changed:** added `docs/requirements/Requirements_Booking.md`:
  - **Form:** 3 steps on one page (branch and day → time → details), prefilled from the home band.
  - **Slots:** 20-minute slots with notice, window and capacity rules; availability fetched as counts only.
  - **Minimal data:** name, mobile, optional for-whom and note, required consent.
  - **Checks:** server-side validation, with the capacity check and insert in one transaction.
  - **Confirmation:** a random reference, "Send to the branch on WhatsApp" (prefilled), an `.ics` calendar file, and "call or WhatsApp to change".
  - **Database and tests:** an insert-only `appointments` table with row-level security, and acceptance tests for the read-block and the race condition.
  - Added `DUMMY` C18 (booking rules).
- **Why:** this is the next page in the plan's mockup order and the first form with personal data, so it follows the `CLAUDE.md` data-security rules and the DPDP consent requirement.
- **Files:** `docs/requirements/Requirements_Booking.md`, `docs/dummy-data.md`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Mockups: Eye care page

- **Changed:** added `mockups/eye-care.html` (`Requirements_EyeCare.md`, approved), with these sections:
  - hero;
  - the 4 services with the mega-menu anchors (`#eye-testing`, `#lens-fitting`, `#frame-adjustment`, `#frame-repair`): eye test 5–20 minutes, "Free" tagged DUMMY, repair charges TODO;
  - 4 eye-test steps;
  - the "when to get your eyes checked" checklist with an always-visible urgent-help note;
  - 6 tips with a "general information only" disclaimer;
  - an 8-question FAQ accordion (native `details`/`summary`; unconfirmed answers tagged);
  - quick links and a call to action;
  - `FAQPage` structured data (confirmed answers only).
  - **Shared files:** `site.js` routes `/eye-care` and has a new alert icon; `styles.css` gets an "Eye care page" section.
- **Checked:** in the browser:
  - the mega-menu link `/eye-care#lens-fitting` lands on the block below the header; Eye care is highlighted; there's one `h1`;
  - all sections and counts are right, and several FAQ answers open together;
  - single columns on phones, 56 px FAQ rows, dark mode readable;
  - no horizontal scroll and no console errors.
- **Files:** `mockups/eye-care.html`, `mockups/site.js`, `mockups/styles.css`, `docs/requirements/Requirements_EyeCare.md`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Requirements: Eye Care (draft)

- **Changed:** added `docs/requirements/Requirements_EyeCare.md`, with these sections:
  - hero;
  - the 4 services from Q92, with the mega-menu anchors;
  - what happens at an eye test;
  - when to get your eyes checked, with an always-visible "see a doctor straight away" safety note;
  - eye care tips;
  - an FAQ accordion: confirmed answers from Q75 / Q92 / Q131 / WhatsApp Q11, the rest DUMMY or TODO;
  - quick links and a call to action.
  - Added `DUMMY` C17 (health copy that needs the optometrist's approval).
- **Why:** this is the next page in the plan's mockup order. It is health information, so anything beyond the client's facts is tagged for professional review and makes no medical claims.
- **Files:** `docs/requirements/Requirements_EyeCare.md`, `docs/dummy-data.md`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Mockups: Lenses page

- **Changed:** added `mockups/lenses.html` (`Requirements_Lenses.md`, approved), with these sections:
  - page hero with Book an eye test and Ask on WhatsApp;
  - five lens type cards, each with "See lenses (n)" (types without lenses are hidden);
  - "How we choose your lens" in 3 steps;
  - the lens catalogue:
    - Type and Brand chip filters kept in the URL;
    - cards with up to 3 feature tags, the price or "Ask for price", and Enquire on WhatsApp naming the lens;
    - an empty state;
  - brand tiles that filter the catalogue;
  - an instant lens fitting band;
  - a "Not sure which lens you need?" call to action.
  - Data is DUMMY (C6, C16).
  - **Shared files:** `site.js` routes `/lenses` here, and the mega-menu Kodak link now uses `brand=kodak-lens` to match. `styles.css` gets a "Lenses page" section.
- **Checked:** in the browser:
  - menu links land filtered (`?type=progressive` gives 2 lenses);
  - chips combine (Progressive + ZEISS gives 1), the empty state shows, Clear works, a brand tile filters, and Enquire names the lens;
  - 5 / 3 / 3 / 5 columns on desktop and 1 / 1 / 1 / 2 on phones; dark mode reads clearly;
  - no horizontal scroll and no console errors.
- **Files:** `mockups/lenses.html`, `mockups/site.js`, `mockups/styles.css`, `docs/requirements/Requirements_Lenses.md`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Requirements: Lenses (draft)

- **Changed:** added `docs/requirements/Requirements_Lenses.md`, with these sections:
  - hero;
  - five lens types in plain language (types with no active lenses are hidden);
  - "How we choose your lens";
  - a lens catalogue with Type and Brand chip filters kept in the URL, lens cards with an optional price ("Ask for price" otherwise) and Enquire on WhatsApp, and no detail page;
  - brands;
  - an instant lens fitting band (Q92);
  - a call to action.
  - Added `DUMMY` C16 (lens catalogue).
- **Why:** this is the next page in the plan's mockup order. The scope stays at spectacle lenses and brands (decision 2026-10-09); descriptions carry no medical claims.
- **Files:** `docs/requirements/Requirements_Lenses.md`, `docs/dummy-data.md`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Mockups: About page

- **Changed:** added `mockups/about.html` (`Requirements_About.md`, approved), with these sections:
  - a shorter navy hero with the calculated year count;
  - founder and family with a pull-quote;
  - a vertical journey timeline (1999 → Today, with DUMMY milestones C15);
  - Trust / Care / Innovation values;
  - team roles;
  - both branches;
  - a gallery preview linking to `/gallery`;
  - 6 DUMMY reviews at `#reviews`;
  - an eye-camps band;
  - a "Come and meet the family" call to action;
  - `Organization` structured data.
  - **Shared files:** `site.js` routes `/about` here (the home page's "Read more reviews" now lands on `#reviews`). `styles.css` gets an "About page" section, and section anchors now clear the sticky header (`scroll-margin-top`).
- **Fixed:** the hero photo box now lines up with the content edge on wide screens; the timeline dot ring matches the section background.
- **Checked:**
  - In the browser at 1440 and 375 px, light and dark: about.html loads from the home page link, About is highlighted in the menu, there's one `h1`, all 10 sections are in order, both year counts read 27, there are 6 reviews, and the `#reviews` title sits below the header.
  - On phones, single columns and a left-line timeline; no horizontal scroll and no console errors.
- **Files:** `mockups/about.html`, `mockups/site.js`, `mockups/styles.css`, `docs/requirements/Requirements_About.md`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Requirements: About (draft); Sunglasses approved

- **Changed:**
  - Added `docs/requirements/Requirements_About.md`, with these sections:
    - hero with the calculated year count;
    - founder and family;
    - a vertical journey timeline;
    - values (Trust / Care / Innovation);
    - team;
    - branches;
    - gallery preview (the main way into `/gallery`);
    - reviews (`#reviews`, the target of the home page's link);
    - an eye-camps band and a call to action.
  - Also: anchors, empty states and acceptance criteria. Added `DUMMY` C15 (timeline milestones).
  - Marked `Requirements_Sunglasses.md` approved (developer, 2026-10-10).
- **Why:** About is the next page in the plan's mockup order. Most About content is still pending from the client (WhatsApp Q10), so the structure is designed now with tagged dummy content.
- **Files:** `docs/requirements/Requirements_About.md`, `docs/requirements/Requirements_Sunglasses.md`, `docs/dummy-data.md`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · CLAUDE.md: mockups section (/init)

- **Changed:**
  - Added a "Mockups" section to `CLAUDE.md`: the preview command, and what `styles.css`, `site.js` (including the `MOCKS` route table), `frames-data.js` and `listing.js` each do.
  - Page conventions: the theme script, `data-page`, script order, review notes, `DUMMY` tags, branch-picker attributes.
  - The status line now says Phase 3 mockups.
- **Why:** `/init` review. `CLAUDE.md` described rules and the future app but not the mockup code that exists, which needs several files read together to understand.
- **Files:** `CLAUDE.md`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Requirements: Sunglasses (draft)

- **Changed:** added `docs/requirements/Requirements_Sunglasses.md`. It covers only what differs from Frames:
  - lens type and lens colour fields;
  - a Lens type filter in place of Category;
  - mega-menu tier and lens links;
  - a lens-type label on cards;
  - the power-sunglasses prescription note;
  - similar sunglasses;
  - no lens-protection claims beyond admin data.
  - Also added `DUMMY` C14 (sunglasses data).
- **Why:** this is the next page in Phase 3. `CLAUDE.md` requires a requirements file before a page's mockup.
- **Files:** `docs/requirements/Requirements_Sunglasses.md`, `docs/dummy-data.md`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Mockups: light / dark mode

- **Changed:**
  - **Colour roles:** `mockups/styles.css` now has colour roles (`--bg`, `--bg-alt`, `--surface`, `--text`, `--text-muted`, `--line`, `--heading`, `--accent-ink`, `--btn-ink`, `--pressed-bg/-ink`, `--ph-stripe`, `--todo-ink`, `--focus`, `--navy-edge`).
    - 119 light-surface declarations were switched to them, and the page styles in `nav.html` and `frame-detail.html` too.
    - Light mode is unchanged (checked against the original computed colours).
  - **Dark mode:** three new dark surfaces (`--night` `#0A1622`, `--night-2` `#0F1E2E`, `--night-3` `#162B42`). Cream is used for text, Brass for accents, Gold for selected chips and badges. Navy blocks and gold buttons stay the same.
  - **Toggle:** a sun/moon button in the header tools on every page, desktop and mobile (`site.js`).
    - It follows the device setting until chosen.
    - The choice is saved (`vslm-theme`) and applied by a one-line script in each page's `<head>`, so there's no flash.
  - **Docs:** `CLAUDE.md` design system, the navigation icons rule, `Requirements_Navigation.md` (toggle and acceptance criterion 15) and `ROADMAP.md` (MVP, sprint 5.1) are updated.
- **Why:** developer request: every page should have a dark mode with a toggle.
- **Checked:** in the browser:
  - light mode matches the old colours exactly; the toggle switches and the choice persists across Home, Frames, Frame detail and Navigation;
  - a saved "light" wins over a dark device, and with no choice the site follows the device;
  - the mega menu, filters, cards, panels and the phone layout read clearly in dark;
  - there are no console errors.
- **Files:** `mockups/styles.css`, `mockups/site.js`, `mockups/nav.html`, `mockups/home.html`, `mockups/frames.html`, `mockups/frame-detail.html`, `CLAUDE.md`, `ROADMAP.md`, `docs/requirements/Requirements_Navigation.md`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Mockups: frame detail

- **Changed:** added `mockups/frame-detail.html` (`Requirements_Frames.md` section 4):
  - breadcrumb;
  - gallery of 5 DUMMY product views, with thumbnails, arrow keys, swipe on phones and click-to-zoom on desktop;
  - brand, model, frame code, exact price, In stock / Sold out, "Available at";
  - Enquire on WhatsApp (branch picker, frame code prefilled), favourite and Share on WhatsApp (`wa.me/?text=`, so the customer picks the contact; DUMMY domain D4), plus Book an eye test;
  - a 9-row details table, the lens note and the visit note;
  - up to 4 similar frames (same shape or brand, in stock first);
  - page title, description and `Product` structured data per frame.
  - **Sold out:** a badge, and the button becomes "Ask about similar frames". An unknown frame shows "This frame isn't available". There's no try-on button.
  - **Links:** `site.js` now routes `/frames/<slug>` to this page, so every frame card on Home and Frames opens its frame.
  - **Shared files:** a new share icon in `site.js`; a "Product detail" section in `styles.css`.
- **Fixed:** on phones the thumbnail labels pushed the gallery past the right margin. Grid columns can now shrink.
- **Checked:** in the browser at 1440 and 375 px:
  - a card click opens the right frame;
  - the gallery (thumbnails, keys, swipe), Enquire text, favourite and Share link all work;
  - the sold-out and not-found states work;
  - every button is at least 44 px, there's no horizontal scroll and no console errors.
- **Files:** `mockups/frame-detail.html`, `mockups/site.js`, `mockups/styles.css`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Mockups: wider layout and full-width hero

- **Changed:**
  - **Wider content area:** max width 1,280 → 1,440 px (`--max-w: 90rem`). At 1920 px the side margins shrink from 361 to 281 px; at 1366 px the content starts 48 px from the edge instead of about 83 px. It applies to every mockup.
  - **Home hero:**
    - a blurred, darkened copy of the hero photo now fills the whole hero behind everything;
    - the sharp photo fades in from the left (CSS mask) instead of ending in a hard edge;
    - a navy shade keeps the text readable;
    - on phones the fade and the shade run top to bottom.
  - The photo is passed in with `--hero-img`.
- **Why:** developer feedback that the page looked right-aligned with empty space on the left. Measured: it was centred, with equal margins. The cause was the photo bleeding to the right edge next to a flat navy left margin, plus a narrow 1,184 px content column on a 1920 px screen.
- **Checked:**
  - In the browser at 1920, 1366 and 375 px: content centred and the headline clear of the face in the photo.
  - No horizontal scroll; Frames uses the wider layout too.
- **Files:** `mockups/styles.css`, `mockups/home.html`, `docs/requirements/Requirements_HomePage.md`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Mockups: semi-opaque nav on Home

- **Changed:** on `home.html` the main nav bar is now semi-opaque, like the design image:
  - navy at 60% with a background blur, with the hero photo running underneath;
  - once scrolled past the hero, navy at 88%;
  - 85% navy where blur isn't supported.
  - The utility strip stays solid, and other pages keep the solid bar.
  - `--nav-h` is now 68 px below 1180 px, so the offsets match the shorter bar.
- **Why:** developer request. At 60% over the cream sections the bar turned washed-out grey and the gold "VS" faded, so it gets more navy (still see-through) once past the hero.
- **Checked:** in the browser at 1440 and 375 px: the photo shows through at the top, the bar darkens past the hero, the Frames page is still solid, and there's no horizontal scroll.
- **Files:** `mockups/styles.css`, `mockups/home.html`, `docs/requirements/Requirements_HomePage.md`, `docs/requirements/Requirements_Navigation.md`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Mockups: frames listing

- **Changed:** `Requirements_Frames.md` was approved, so I built `mockups/frames.html`:
  - breadcrumb and Men / Women / Kids / Unisex quick chips;
  - the client's 7 filters in order, with counts from the frames themselves; options with no matches are disabled, and there's no rim-type filter;
  - active-filter chips with "Clear all";
  - sort (sold out always last), "Saved (n)" and 24 frames per "Load more";
  - the no-results state and a help band;
  - every filter is kept in the page link, and the mega-menu tier links map to price bands;
  - below 1180 px the filters become a full-screen panel with "Show n frames", Esc and a focus trap.
  - Shared pieces:
    - `mockups/frames-data.js` holds the 30 DUMMY frames, the frame card and the device-only favourites, now used by `home.html` too.
    - The footer moved into `site.js`, so every mockup shares it.
    - `site.js` now opens mockups that exist (`/` → `home.html`, `/frames` → `frames.html`, keeping filters) instead of showing a toast.
    - `styles.css` has a new "Listing pages" section.
- **Fixed:** the mega menu's Vogue link (`brand=vogue-eyewear`); a global `[hidden]` rule; breadcrumb list styles.
- **Checked:** in the browser at 1440 and 375 px:
  - filters, page links, sort, Load more, Saved, "In stock only", the empty state and the menu tier link all work;
  - the phone panel now sits above the sticky bar, so its buttons can be reached;
  - no console errors; Home and Navigation still work.
- **Files:** `mockups/frames.html`, `mockups/frames-data.js`, `mockups/home.html`, `mockups/site.js`, `mockups/styles.css`, `docs/requirements/Requirements_Frames.md`, `docs/dummy-data.md`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Requirements: Frames (draft)

- **Changed:** added `docs/requirements/Requirements_Frames.md`. It covers the frame data, the `/frames` listing (the client's 7 filters, sort, load more, device-only favourites, empty states) and the frame detail page (gallery, Enquire and Share on WhatsApp, details, related frames, 404). Added `DUMMY` C13 (frame categories and code format).
- **Why:** this is the next page in Phase 3. `CLAUDE.md` requires a requirements file before a page's mockup.
- **Files:** `docs/requirements/Requirements_Frames.md`, `docs/dummy-data.md`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Mockups: home page + shared site chrome

- **Changed:**
  - **Requirements:** `Requirements_HomePage.md` approved with the developer's decisions:
    - the design's headline "{years} Years of Trust. A Clearer Vision for Tomorrow.", with the year count calculated from 1999 (27 in 2026), never hard-coded;
    - the design image's AI photo as a `DUMMY` hero (C12, never live);
    - dummy frames;
    - dummy reviews, to be swapped for Google reviews later;
    - the "Scroll" cue dropped.
  - **`mockups/home.html`:** all homepage sections, each with an empty state:
    - hero and quick cards (WhatsApp branch picker, Visit a store);
    - trust strip;
    - Welcome;
    - category tiles;
    - 8 featured frames (Sold out, Available at, a favourite saved on the device, Enquire with a prefilled WhatsApp message);
    - lenses and the 4 services;
    - eye camps;
    - a rotating, pausable quote band;
    - reviews;
    - branches with their own numbers;
    - the eye-test band (hands branch and date to `/book-eye-test` and stores nothing);
    - the footer with social links.
  - **New `mockups/site.js`:** the header, mega menus, drawer, sticky bar, branch picker and mockup controls now live in one shared script. `nav.html` uses it too, so every page mockup shares one header. The branch picker now:
    - works for buttons added later;
    - accepts a prefilled WhatsApp message;
    - opens above its button near the bottom of the screen;
    - closes on scroll.
  - **`mockups/styles.css`:** a new "Page sections" block, reusable by the next mockups.
  - **`mockups/assets/hero-dummy.jpg`:** cropped from the design image.
  - **`docs/dummy-data.md`:** C12 and the Q8 headline.
- **Why:** this is the Home page for Phase 3. The shared script keeps the remaining 12 mockups consistent.
- **Checked:**
  - In the browser at 1440 and 375 px: no horizontal scroll and no console errors.
  - Enquire, favourites, the quick cards, the book band and the dummy-number guard all work.
  - `nav.html` still works after the refactor.
- **Files:** `docs/requirements/Requirements_HomePage.md`, `docs/dummy-data.md`, `mockups/home.html`, `mockups/site.js`, `mockups/nav.html`, `mockups/styles.css`, `mockups/assets/hero-dummy.jpg`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Requirements: Home page (draft)

- **Changed:** added `docs/requirements/Requirements_HomePage.md`. It covers the 13 sections from plan v1.2 Figure 1 plus the quick cards below the hero, with the data source, empty state, mobile behaviour and acceptance criteria for each.
- **Why:** this is the first page of Phase 3. `CLAUDE.md` requires a requirements file before a page's mockup. Key decisions in the draft:
  - The design image's "25 Years of Trust" headline and its generated people are replaced (with a `DUMMY` headline and a photo placeholder).
  - Featured frames show only approved frames.
  - Reviews stay hidden until real ones exist.
  - The eye-test band hands off to `/book-eye-test` without storing data.
- **Files:** `docs/requirements/Requirements_HomePage.md`, `docs/changelog.md`

## 2026-10-10 · Phase 2 · Plan v1.2

- **Changed:** created `docs/plan/VS_Lens_Mart_Plan_v1.2.docx` from v1.1, and moved v1.1 to `docs/plan/archive/`. v1.2 brings the plan in line with `CLAUDE.md` and `ROADMAP.md`:
  - **Client facts:** the client details table has the form and prescription-card facts (hours, number per branch, address, prescription fields, style, frames, services, domain).
  - **Scope decisions:** English only, DUMMY placeholders, and the store management system as a later phase. The system has a new "Later phase" section after Phase 8.
  - **Menus and pages:** the navigation table, pages table and global elements are updated: branch picker, client filters, availability, favourites, services, social links, the trimmed Lenses menu, and no language toggle.
  - **Tech:** the tech stack has roles and the `wa.me` note; the security box has frame approval and roles; the folder tree is updated.
  - **Phases:** phase estimates, the build order, the sprint table, the MVP/later table, the "never do" rules, the starter prompts, the Phase 6 checks and the Phase 7–8 tasks are updated.
  - **Tables:** the open-questions table now shows statuses, and the document history has 1.2 and a planned 1.3.
  - **Figures:** 2, 3, 3a, 3c, 3d, 3e and 4 are still v1.1 drawings; their captions now say what changed. The table of contents was refreshed in Word.
- **Why:** you asked for plan v1.2 after the comparison with v1.1. `CLAUDE.md` now points to v1.2.
- **Files:** `docs/plan/VS_Lens_Mart_Plan_v1.2.docx`, `docs/plan/archive/VS_Lens_Mart_Plan_v1.1.docx`, `CLAUDE.md`, `docs/changelog.md`

## 2026-10-10 · Phase 3 · Mockups: navigation updated to requirements v1.2

- **Changed:** `mockups/nav.html` now matches `docs/requirements/Requirements_Navigation.md`:
  - **Utility bar:** hours with no TODO; both branch numbers (Patelguda tagged `DUMMY`).
  - **Branch picker:** the WhatsApp icon and the sticky-bar Call/WhatsApp buttons open a branch picker (proposal). The dummy Patelguda number never dials.
  - **Frames:** rim-type column removed; `DUMMY` brands and "from ₹" prices.
  - **Lenses:** contact lenses, reading glasses and care products removed; `DUMMY` lens brands; blue-cut/photochromic marked "to confirm".
  - **Eye care:** an "Our services" column with the client's 4 services; "Free eye test" tagged `DUMMY`; booking copy says "call or WhatsApp to reschedule".
  - **Mobile drawer:** updated the same way.
  - **Review area:** a "Changed since the last version" list and an updated "Waiting on the client" list.
  - `mockups/styles.css`: new branch-picker component; tablet utility bar hides the digits so it stays on one line; card titles align.
  - `docs/dummy-data.md` C7: the "from ₹" tier prices used in the menus.
- **Why:** the mockup still showed the pre-form navigation. Checked in the browser at 1440, 1280, 1180, 800 and 375 px: no horizontal scroll, no console errors, picker opens and closes with Esc and returns focus.
- **Files:** `mockups/nav.html`, `mockups/styles.css`, `docs/dummy-data.md`, `docs/changelog.md`

## 2026-10-09 · Phase 2 · Client form vs docs: facts and scope decisions

- **Changed:**
  - **Facts** in `CLAUDE.md`, `ROADMAP.md` and `Requirements_Navigation.md`:
    - hours 9:00 AM–9:30 PM;
    - separate number per branch (Indresham 9550685417, Patelguda `DUMMY`), with a branch picker for Call/WhatsApp (proposal);
    - "Since 1999" confirmed;
    - prescription card received;
    - logo facts ("FAMLY", no high-res file);
    - exact ₹ prices;
    - new docs listed (`dummy-data.md`, card, form export).
  - **Rule:** mockups may use tagged `DUMMY` values; the live site never does.
  - **MVP additions:**
    - frame status draft → approved, with `admin` and `staff` roles;
    - availability ("Sold out") separate from `is_active`;
    - "Available at" branch;
    - the client's frame fields and filters (no rim-type filter);
    - device-only favourites;
    - WhatsApp share;
    - social links;
    - Eye care lists the client's 4 services;
    - contact lenses, reading glasses and care products removed from the menu;
    - booking says "Call or WhatsApp to reschedule";
    - `/privacy` retention period is `DUMMY` (D9).
  - **Changes:**
    - brand tone "trusted family shop, premium quality at affordable prices";
    - hero keeps 2 buttons, with WhatsApp us / Visit store as quick cards and no Try-on button;
    - model photos need written consent.
  - **Later:**
    - new "Store management system" phase (`ROADMAP.md` section 7): customer login, registration, prescriptions, orders, inventory, billing, reports, audit log, automatic WhatsApp;
    - Google Analytics;
    - online appointment changes;
    - Google reviews.
  - Estimate is now 20–27 days.
- **Why:** the client's form (2026-10-07) and prescription card conflicted with the docs. Developer decisions on 2026-10-09. The missed approval → roles dependency is logged as Discernment in `docs/ai-fluency-log.md`. Tell the client about these decisions.
- **Files:** `CLAUDE.md`, `ROADMAP.md`, `docs/requirements/Requirements_Navigation.md`, `docs/open-questions.md`, `docs/dummy-data.md`, `docs/ai-fluency-log.md`, `docs/changelog.md`

## 2026-10-09 · Phase 2 · Dummy data, prescription card, English only

- **Changed:**
  - Added `docs/dummy-data.md`: placeholder values for every missing client detail (email, Patelguda number, founder story, brands, prices, free eye test, testimonials, eye camps, photos), a dummy decision for each contradiction, and a dummy answer for each of the 27 blank form questions. Every row has a "Replaced" box.
  - Recorded the prescription card (`docs/prescription_card.jpg`): 9550685417 is the Indresham number, the address is "Part Block-B", and its fields answer Q59. It has no PD field, which is a new contradiction with Q58.
  - `CLAUDE.md`: missing client facts now use `docs/dummy-data.md`, marked `DUMMY`, instead of `TODO (client)`. Language rule is now English only.
  - Removed every other-language item from `CLAUDE.md`, `ROADMAP.md` and `docs/open-questions.md`.
- **Why:** developer decision so mockups and development aren't blocked by missing client answers, and to fix the site to English only. Dummy values must be replaced before launch.
- **Files:** `docs/dummy-data.md`, `docs/open-questions.md`, `CLAUDE.md`, `ROADMAP.md`, `docs/changelog.md`

## 2026-10-08 · Phase 1 · Client questionnaire

- **Changed:** added the client's 160-question Google Form response (submitted 2026-10-07) to `docs/client-answers.md`, copied exactly, grouped by topic. Rewrote `docs/open-questions.md`: status of the original 11 questions, 8 contradictions inside the form, scope changes to decide, and 27 blank answers.
- **Why:** Phase 1 discovery. The form answers the opening time (9:00 AM) and says each branch has its own number, but it also asks for Telugu + Hindi, customer accounts, favourites, and a shop management system (inventory, billing, orders, staff roles). These conflict with `CLAUDE.md` and `ROADMAP.md`. They are recorded as open decisions; `CLAUDE.md` and `ROADMAP.md` are unchanged until agreed.
- **Files:** `docs/client-details.xlsx` (added by developer), `docs/client-answers.md`, `docs/open-questions.md`, `docs/changelog.md`

## 2026-10-03 · Phase 3 · Mockups: shared styles + navigation

- **Changed:** added `mockups/styles.css`, the shared stylesheet every mockup links. It holds the design tokens, base styles, buttons, photo placeholders, review-note tags and the site-header component. Also added `mockups/nav.html`, the navigation mockup:
  - utility bar;
  - the 7-item navy menu;
  - the Frames, Sunglasses, Lenses and Eye care mega menus;
  - a search drawer;
  - the mobile full-screen accordion;
  - the sticky Call / WhatsApp / Book bar.
- **Why:** this is Phase 3, building screens for client sign-off. Mockup sign-off also closes the MVP confirmation risk. Built to `docs/requirements/Requirements_Navigation.md`.
- **Proposed decisions** (for review):
  - Below 768 px the utility bar shrinks to "Since 1999 · Open 7 days, 9 AM–9:30 PM", and Call and Book move to the sticky bar.
  - The search icon is desktop and tablet only.
  - The hamburger menu takes over below 1180 px.
- **Found:** `docs/logo.png` spells "FAMLY" in its ring text. This is added to the review list for the client.
- **Files:** `mockups/styles.css`, `mockups/nav.html`, `docs/changelog.md`

## 2026-10-03 · Phase 2 · AI fluency log

- **Changed:** added the MVP confirmation risk to the AI fluency log as Diligence evidence.
- **Why:** it records how the unconfirmed MVP is being handled: mockup sign-off doubles as MVP confirmation.
- **Files:** `docs/ai-fluency-log.md`, `docs/changelog.md`

## 2026-10-03 · Phase 2 · Scope: MVP confirmation (risk)

- **Changed:** MVP not yet confirmed by client; proceeding with the v1.1 MVP list.
- **Why:** this records the risk that the client could change the MVP after work has started. Confirmation is expected sooner from the Phase 3 mockups, because clients find it easier to react to screens than to a feature list.
- **Files:** `docs/changelog.md`, `ROADMAP.md` (the MVP list)

## 2026-10-03 · Phase 2 · CLAUDE.md review fixes

- **Changed:**
  - Added a source-of-truth order (CLAUDE.md > ROADMAP.md > Requirements_<Page>.md > plan .docx), working rules, folder rules and this changelog format.
  - Pointed to the moved plan file, `docs/plan/VS_Lens_Mart_Plan_v1.1.docx`; the old version is in `docs/plan/archive/`.
  - Marked hours and phone as TODO (client), to be read only from `src/lib/site-config.ts`.
  - Split animation timing: menus 300 ms or less, page and section fades 300–500 ms.
  - Made `/gallery` its own page, linked from About and the footer.
  - Cut the Navigation section down to the 7 items plus a pointer to `Requirements_Navigation.md`.
  - Updated the brand tone.
- **Why:** a review found 4 contradictions, 4 unclear points and 2 missing sections in `CLAUDE.md`.
- **Files:** `CLAUDE.md`, `docs/changelog.md`

## 2026-10-03 · Phase 2 · Scope: Telugu dropped from MVP

- **Changed:** removed the Telugu/English toggle, the Noto Sans Telugu font and the Telugu translation from the MVP. Telugu is now "Not in MVP, possible later".
- **Why:** this is a scope change from plan v1.1. Telugu was the developer's suggestion, and the client never asked for it. It will go into plan v1.2.
- **Files:** `CLAUDE.md`, `ROADMAP.md`, `docs/requirements/Requirements_Navigation.md`

## v1.0 — Initial Plan

**Status:** Initial project plan

- Created the initial VS Lens Mart website project plan.
- Defined the project as a premium, family-oriented optical-store website.
- Established the core brand direction around trust, care, innovation, and the shop's legacy since 1999.
- Defined the main customer-facing pages:
  - Home
  - About / Our Journey
  - Frames
  - Frame Detail
  - Eye Care
  - Book an Eye Test
  - Eye Camps
  - Gallery
  - Contact
  - Privacy Policy
- Defined the staff-only Admin area for managing frames, lenses, camps, gallery content, reviews, and bookings.
- Established the initial technical stack:
  - Next.js
  - TypeScript
  - Tailwind CSS
  - Framer Motion
  - Supabase PostgreSQL
  - Supabase Storage
  - Supabase Auth
  - Netlify
- Established the initial database and security direction using Supabase and Row Level Security.
- Defined the MVP and later-module split.
- Added project workflow phases from setup and requirements through development, testing, deployment, and maintenance.
- Added Claude Code workflow requirements including Plan Mode, `/init`, `/clear`, `/compact`, `/rewind`, subagents, hooks, and Playwright testing.
- Established design constraints:
  - No 3D website.
  - No online checkout.
  - Use real client photography on the live site.
  - Use gentle fade/slide animations only.
  - Mobile-first implementation.
- Added the initial documentation structure under `docs/`.

## v1.1 — Navigation Update

**Status:** Navigation refined to match the approved homepage direction

- Updated the primary website navigation to:
  - Home
  - About
  - Frames
  - Eye Care
  - Eye Camps
  - Gallery
  - Contact
- Added a persistent **Book an Eye Test** action in the header.
- Defined the mobile navigation as a collapsible menu.
- Replaced the original shopping-bag concept because the MVP does not include online checkout.
- Planned the shopping-bag replacement as a WhatsApp action or **Book an Eye Test** action.
- Added a sticky WhatsApp button at the bottom-right of the website.
- Confirmed the WhatsApp contact number for the global WhatsApp action as `9550685417`.
- Kept the navigation aligned with the homepage visual direction: dark navy header, gold accents, and a premium minimal presentation.

## v1.2 — Client Details Received

**Status:** Client details received (2026-10-07 to 2026-10-09); details in the dated entries at the top

- Received the client's 160-question Google Form (`docs/client-details.xlsx`) and the prescription card (`docs/prescription_card.jpg`).
- Confirmed hours 9:00 AM–9:30 PM, separate numbers per branch (9550685417 = Indresham), and the "Part Block-B" address.
- Added `docs/dummy-data.md` for every detail still missing.
- Set the website to English only.
