# AI Fluency Log

This document records how AI/Claude Code was used during the VS Lens Mart website project, following the 4D framework:

- **Delegation** — What work was given to AI?
- **Description** — How was the task described?
- **Discernment** — How were AI outputs reviewed and decisions made?
- **Diligence** — How was the final result verified?

---

## v1.0 — Initial Project Planning

### Delegation

AI was used to help structure the initial VS Lens Mart website project plan from the available client requirements, design direction, and technical requirements.

The goal was to convert the project information into a structured implementation plan covering:

- Website pages
- Navigation
- Features
- Admin functionality
- Database requirements
- Technical stack
- Development workflow
- MVP vs later modules
- Testing and deployment

### Description

The project was described as a premium optical-store website for VS Lens Mart.

The main business goals were to communicate:

- Trust
- Care
- Family values
- Professional eye care
- Premium eyewear
- Innovation
- The shop's legacy

The project plan also established the technical direction and development workflow.

### Discernment

AI-generated planning was reviewed against the actual client requirements rather than accepting every suggestion automatically.

Unknown business information was kept as unresolved rather than invented.

Examples include:

- Exact enquiry email
- Founding story
- Founder details
- Complete brand list
- Final legacy wording
- Client-provided photography

### Diligence

The resulting project plan was organized into documentation so that requirements could be reviewed and updated independently.

The project documentation was separated into areas such as:

- Client answers
- Open questions
- Requirements
- Changelog
- AI fluency evidence

---

## v1.1 — Navigation Update

### Delegation

AI was asked to help define the updated navigation structure for the VS Lens Mart website.

The task included documenting:

- Utility bar
- 7 top-level menu items
- Mega menus
- Mobile navigation
- Mobile accordion behaviour
- Sticky mobile bottom bar
- Acceptance criteria

### Description

The navigation was changed to a product-first structure with 7 top-level items:

1. Frames
2. Sunglasses
3. Lenses
4. Eye Care
5. Eye Camps
6. About
7. Contact

The VS Lens Mart logo acts as the Home link rather than adding Home as an eighth menu item.

The navigation also includes actions for:

- Search
- WhatsApp
- Book an Eye Test

The shopping-bag/cart concept was not retained because online checkout is outside the project scope.

### Discernment

The navigation requirements were checked against the documented project direction.

Particular attention was given to preventing unsupported information from being added.

The client confirmed:

- Shop name: VS Lens Mart
- Phone/WhatsApp number: 9550685417
- Frame prices should be shown
- Branded lenses are available
- Exact lens brands are still pending

Therefore, exact brands and prices were **not invented**.

They are treated as database/client-provided information.

### Diligence

The navigation requirements were written with acceptance criteria so that the implementation can later be tested against them.

The requirements cover:

- Desktop navigation
- Mega-menu behaviour
- Keyboard accessibility
- Mobile accordion behaviour
- Sticky bottom bar
- WhatsApp action
- Responsive behaviour
- Data-driven brands and prices
- Client TODOs

---

## Client Requirements Extraction

### Delegation

AI was used to organize the client's WhatsApp responses into a structured `client-answers.md` document.

### Description

The client's answers were preserved as the source for business information.

Important confirmed information includes:

- **Business name:** VS Lens Mart
- **Phone:** 9550685417
- **GST:** No GST
- **Working hours:** Monday–Sunday, 9:00 AM–9:30 PM
- **Frame prices:** Show on website
- **Lens availability:** All branded lenses available
- **Reminders:** Yes
- **Counter devices:** Computer, tablet, and mobile

### Discernment

Answers that were incomplete or pending were not treated as confirmed requirements.

For example:

- Email — pending
- Founding story — pending
- Photos — client will share
- Prescription sample — client will share
- Final anniversary/legacy wording — pending

### Diligence

The information was separated into:

- `docs/client-answers.md`
- `docs/open-questions.md`

This makes confirmed information distinguishable from information that still requires client input.

---

## Navigation Requirements Documentation

### Delegation

AI was asked to draft:

`docs/requirements/Requirements_Navigation.md`

using the project documentation and client answers.

The task specifically required coverage of:

- Utility bar
- 7 menu items
- Mega menu contents
- Mobile accordion
- Sticky bottom bar
- Acceptance criteria

### Description

The navigation requirements define the desktop and mobile behaviour of the website.

The documented mega-menu structure includes:

**Frames**
- Men
- Women
- Kids
- Frame types
- Shapes
- Brands
- Price range

**Sunglasses**
- Men
- Women
- Kids
- Lens types
- Shapes
- Price range

**Lenses**
- Single vision
- Progressive
- Bifocal
- Blue-cut
- Photochromic
- Contact lenses
- Reading power
- Care
- Lens brands

**Eye Care**
- Book an eye test
- Our branches
- Eye camps

**About**
- Our Journey
- Family
- Team
- Gallery
- Reviews

**Contact**
- Branches
- Maps
- Hours
- Enquiry form

### Discernment

The requirements explicitly avoid inventing business information.

Exact brand names and prices were not supplied by the client, so they are marked as:

`TODO — client/admin data`

Similarly, unresolved business information is marked as:

`TODO — client confirmation required`

### Diligence

Acceptance criteria were included so the navigation can later be validated during implementation and testing.

The acceptance criteria cover:

- Correct number of top-level menu items
- Desktop mega menus
- Mobile accordion
- Sticky bottom bar
- WhatsApp functionality
- Keyboard accessibility
- Responsive behaviour
- Database-driven product information
- No invented brands or prices

---

## ROADMAP.md — Feature Planning (Phase 2), 2026-10-03

### Delegation

Claude was asked to use Plan Mode to propose `ROADMAP.md` from `CLAUDE.md` and `docs/requirements/`. It had to cover:

- The MVP vs Later split
- Dependencies between features
- Build sprints
- Rough effort per sprint

No code or files were to be written until the plan was approved.

### Description

The prompt asked Claude to read `CLAUDE.md` and every requirements file, propose the roadmap, and show the plan before writing anything.

### Discernment

The plan was reviewed before approval, and Claude's output was corrected in three places.

1. **Telugu translation removed from scope.** Claude's plan listed "Full Telugu translation of all pages" as a later module, with the toggle and fonts in the MVP. This was rejected, and Telugu was removed from the project completely:
   - Claude also removed the toggle, since a toggle with no translation does nothing, and asked for confirmation instead of assuming.
   - After confirmation, Telugu was also removed from `CLAUDE.md` and `Requirements_Navigation.md`.
   - A "Never do" rule was added to `CLAUDE.md` so a later session does not bring it back from the original plan.
2. **Sprint structure didn't follow the plan document.** Claude's first `ROADMAP.md` invented its own sprint numbers (S0–S6) instead of using the plan's Phase 5 sprint table. It was rewritten using sprints 5.1–5.6 as the base, with a "done when" line for each sprint.
3. **Changes from the plan had to be visible.** Claude proposed moving Home after the content modules, adding a separate Foundation step, adding Sunglasses and basic search, and a longer estimate. These changes were accepted, but they are recorded in a "Changes from the plan" table in `ROADMAP.md`. The plan document stays the reference, and every deviation can be traced.

### Diligence

- The final `ROADMAP.md` was checked against the plan's Phase 5 sprint table and MVP / Later list.
- Every MVP page and route in `CLAUDE.md` appears in a sprint.
- A repo-wide search confirmed that no remaining Telugu references contradict the decision. Only the original plan `.docx` files and the changelog still mention it, and they are kept as history.

---

## MVP Confirmation Risk — Phase 2 → 3, 2026-10-03

### Diligence

The client hasn't yet confirmed the MVP feature list. Instead of waiting, or quietly assuming it was approved, the risk was recorded in `docs/changelog.md`:

> MVP not yet confirmed by client; proceeding with the v1.1 MVP list.

- **Why record it:** if the client later changes the MVP, the changelog shows that the work went ahead on a known, documented assumption, not by accident.
- **How it will be resolved:** the client gets the Phase 3 mockups to approve, rather than the feature list. Clients usually react faster to screens than to a list of features, so mockup sign-off doubles as MVP confirmation.
- **Follow-up:** when the client signs off on the mockups (or changes the scope), add a changelog entry that closes the risk, and update `ROADMAP.md` if the MVP changes.

---

## Client Form vs Project Docs — Phase 2, 2026-10-09

### Delegation

Claude compared the client's 160-question form with `CLAUDE.md`, `ROADMAP.md` and `Requirements_Navigation.md`. It listed every conflict and recommended MVP vs later for each, in Plan Mode, without changing files. I made the scope decisions myself.

### Description

> Compare @docs/client-answers.md (latest client form) with @CLAUDE.md, @ROADMAP.md and @docs/requirements/Requirements_Navigation.md. List every conflict or outdated item (hours, years wording, brands, phone, email, features). Don't change files yet.

### Discernment

Claude found 9 outdated facts, 1 rule conflict and 19 feature conflicts. I approved the facts and rules, but corrected two things before anything was applied:

1. **Missed dependency: approval needs roles.** Claude put admin approval of frames (Q37) in the MVP, but put admin vs staff roles in "later". Approval only works if one person uploads and another approves, so the two roles are needed from the start. Claude had even noted this link earlier in `docs/open-questions.md` ("needs an admin vs staff role") but didn't carry it into its recommendation. **Fix:** two roles in the MVP; the audit log and 5+ accounts stay later.
2. **WhatsApp Business wasn't a blocker.** Claude flagged the missing WhatsApp Business account as a problem for the WhatsApp buttons. `wa.me` links work with a normal WhatsApp number. WhatsApp Business only matters later, for automatic messages.

I also made decisions where Claude only had a recommendation:
- the store management system becomes its own later phase;
- favourites are saved on the device only, with no login;
- branch availability is a simple "Available at" field, without stock counts;
- the menu only lists the services the client actually named.

### Diligence

- Every outdated fact was traced to a line in the three files, fixed, and the files were searched again for the old wording ("9:00 or 9:30", "same number", "wishlist").
- Each feature decision appears in `ROADMAP.md` or `docs/open-questions.md` section 3, so nothing from the form is silently dropped.
- The git diff is reviewed before committing.

---

## Mockup Verification Gap — Phase 3, 2026-10-10

### Discernment

While checking `mockups/404.html` at 360 px, a screenshot looked clipped although Claude's automated check reported "no horizontal scroll". Claude had measured overflow as `scrollWidth - innerWidth`. On a phone-sized viewport, content that is too wide **widens the layout viewport itself**, so `innerWidth` grew to 367 px and the check passed while the page was really 7 px too wide. The cause was the 404 headline's longest word at a large font forcing the centred column wider than the screen.

### Diligence

- **Fix:** the 404 column is constrained and the headline scales on phones.
- **Better check:** overflow is now measured against `document.documentElement.clientWidth` inside a fixed 360 px frame.
- **Re-run:** the stricter check was re-run on the 404 states, Privacy, Contact, Gallery and both admin pages; all fit.
- **Lesson:** a passing automated check is only as good as what it measures. When a screenshot and a number disagree, trust neither until the measurement is understood.

---

## Database Security Check — Phase 4, 2026-10-22

### Delegation

Claude wrote the PostgreSQL schema, the row-level security rules (`db/security.sql`) and the setup, migrate and seed scripts, replacing Supabase after the developer chose plain PostgreSQL on the laptop. The developer installed PostgreSQL and typed the superuser password themselves; Claude never saw it.

### Discernment

- **Error found:** the first `db:migrate` failed with "permission denied to set parameter app.role". Claude had written the booking-count function to switch its own role with a `SET app.role` clause, which PostgreSQL refuses for custom settings. Claude replaced it with a narrow policy that lets only the table owner count bookings. The website's user still can't.
- **Weak test caught:** the first run of the security checks reported "slot counts: rows 0". That passed, but proved nothing, because every test booking had been rolled back. Claude re-tested with a booking in the same transaction, and got "10:00 → 1 booked" with no names or numbers.

### Diligence

- 24 checks ran as the real website user (`vslm_app`), covering public, staff, admin and "no role set". All pass.
- The migration was re-run to prove it's safe to repeat.
- **Lesson:** a security test that can't fail isn't a test. Each check needs data that would expose a leak if the rule were wrong.

---

## Automated Tests Found Two Real Holes — Phase 4, 2026-10-23

### Delegation

Claude turned the manual database, login and upload checks into a permanent Playwright suite (`npm test`, 46 tests), as the last step of Phase 4.

### Discernment

- **Sign-in limit bypass:** while designing the rate-limit test, Claude read how Better Auth works out a visitor's IP. It trusts `X-Forwarded-For`, which any browser can fake. A quick experiment proved it: 7 wrong passwords, each with a different fake IP, and none were blocked. Better Auth falls back to a single shared bucket when no IP is trusted, which fails safe, so trusting no header locally is the fix. A real proxy header gets configured at deployment.
- **Back button after sign-out:** a browser test (not the earlier manual check on the dev server) showed the dashboard after signing out and pressing Back. Next.js keeps visited pages in memory for 5 minutes (`x-nextjs-stale-time: 300`). The page itself was already `no-store`, so the fix had to be a fresh page load on sign-out.
- **Test mistakes:** four first-run failures were in the tests, not the app. Each was diagnosed before changing anything, so the app wasn't "fixed" to satisfy a wrong test. Example: a sign-out request without an `Origin` header was correctly refused by CSRF protection, which then got a test of its own.
- **A test that couldn't fail:** after the Back-button fix, the test passed only because Back landed on a blank page. Claude changed it so Back lands on a real staff page, and confirmed the fix still held.

### Diligence

- Both holes were reproduced before the fix and re-tested after.
- The full suite was re-run until it passed (46/46), and Claude checked that it left no accounts, rows or files behind.
- **Lessons:**
  - Read how a library decides who someone is before trusting its security feature.
  - Test the production build, not only the dev server.
  - When a test passes, ask whether it could have failed.

---

## A Build That Passed But Was Broken — Sprint 5.1, 2026-10-23

### Delegation

Claude built the shared layout from the signed-off mockups. To match the approved design exactly, it ported the mockup's header CSS by copying line ranges with a script, rather than retyping it.

### Discernment

- **Silent failure:** the copy started one line too late and missed the line that opens a `/* … */` comment, so the comment's text became broken CSS. `npm run build` reported success with only a vague "1 warning while optimizing CSS", and the production CSS had silently dropped the rules after the break. The dev server, opened in the browser, refused the file outright and showed the real error. The fix was the line range; Claude then checked that comment openers and closers and the braces balanced.
- **Console errors after a restart:** a hydration mismatch from a footer-year `<script>` showed up only in the browser console. Claude replaced it with React's pattern for values that differ between server and browser (`useSyncExternalStore`).

### Diligence

- After the fixes: a fresh page load with no console errors, checks at 1440 and 375 px against the mockups, and the full suite (69 passed).
- The new layout tests fail on any console error, so the same class of problem is caught automatically next time.
- **Lesson:** "build succeeded" isn't "it works". A warning can hide dropped styles, and the only proof is looking at the page and its console.

---

## Tests That Caught What the Browser Check Missed — Sprint 5.3 part C, 2026-10-24

### Delegation

Claude built the public Frames, Sunglasses and frame detail pages from the signed-off mockups, then wrote tests at 360, 768 and 1440 px.

### Discernment

- **A claim that wasn't true in production:** Claude had written in the code and docs that a missing frame "answers with a real 404 status". That was true on the dev server, but the production server returns 200 (Next.js streams the not-found page, marked `noindex`). The test found it; the comment, requirements and changelog were corrected rather than the test loosened to hide it.
- **A small bug no screenshot shows:** a ticked filter box snapped back for a moment, because it waited for the address bar to update. The filters now change at once, and the address follows.
- **Not bugs, but noise:** links to pages not built yet were fetched in advance and logged 404s, so they now skip prefetching, as the menu's do. Other failures were the test clicking before the page had loaded its script.

### Diligence

- The full suite passed after the fixes: 113 passed, 16 skipped (tests meant for other screen sizes).
- **Lesson:** checking in the dev browser isn't enough. The tests run against a production build, and that's where the 404 claim fell apart.

---

## Two Problems No Single Page Showed: Sprint 5.5 part B, 2026-10-24

### Delegation

Claude built the Eye camps pages and the staff camp form from the signed-off mockups.

### Discernment

- **Clashing class names:** the mockup used the class name `camp-row` for two different things: public "More upcoming" rows and staff list rows. Each mockup page loaded only its own styles, so it never mattered there. In the app all styles load together, so each set would have leaked borders and padding into the other. Claude scoped both, then scanned every stylesheet pair for other classes styled in two places (only the shared form field, which is intended).
- **A test that passed by luck:** the first camp test passed although the "Saved" message vanished after the form moved to the new camp's address; it had caught the old message in time. The second test exposed it. The message is now carried in the address. A further detail: Next.js 16 keeps the previous page hidden in memory for Back, so the same text exists twice, and tests must look only at the visible copy.

### Diligence

- Full suite: 201 passed, 16 skipped (other screen sizes).
- **Lesson:** a passing test isn't proof if it could pass for the wrong reason. Check what it actually saw.

---

## Planning Try-On From a Prototype: Phase 6 planning, 2026-11-09

### Delegation

Claude was asked to plan how the developer's virtual try-on prototype (a single HTML page) moves into the app, to say whether it belongs before or after launch, and to change only the documents.

### Discernment

- **Timing:** Claude recommended after sprint 5.6, behind an off-by-default switch, because try-on needs new client input (front-view photos, Q40, a domain for QR codes) and several MB of face models would disturb the 5.6 Lighthouse checks.
- **What not to port:** the prototype loaded its face library from a CDN, shipped the models as base64 text, and offered invented SVG frames and customer-uploaded frames. Claude proposed self-hosting, real frames only, and staff-only frame uploads.
- **Gaps the prototype didn't show:** a `wa.me` link can't carry an image (share sheet on phones instead); a QR code needs the real domain; a shared listing link must never show another person's face; the photo must stay on the device and be removable.
- **Developer decision:** MediaPipe Face Landmarker instead of face-api.js, so the live camera (6.5) doesn't mean writing the face detection twice.

### Diligence

- Every claim was checked against `docs/client-answers.md` (Q40–50), the frames schema, the upload rules and the existing requirements before writing. The two tests that check for "no try-on" were left in place until the code changes.
- **Lesson:** a working prototype answers "can it be done?", not "what should ship". Check it against the project's privacy, hosting and design rules before porting it.

---

## A 404 Page That Lives Outside Its Layout: Sprint 5.6 part A, 2026-11-09

### Delegation

Claude built the site-wide 404 and error pages from the signed-off mockup and `Requirements_NotFound.md`.

### Discernment

- **Read the framework docs first:** the Next.js 16 guide showed that the root not-found page renders outside the `(site)` layout, so it would have had no header or footer. Claude moved the chrome into one shared component used by both, instead of copying it.
- **Checked a warning before blaming the change:** a "script tag" console warning appeared on frame 404s. Claude re-ran the same check on the last commit (changes set aside, then restored) and found it was already there, so it wasn't fixed as part of this work.
- **What can't be tested automatically was checked by hand:** the error page needs a page that fails, which a production build shouldn't contain. It was checked in development with a temporary failing page, removed straight after, and recorded as such.

### Diligence

- Screenshots at 360 and 1440 px in light and dark mode; `npm test`: 257 passed, 16 skipped.
- **Lesson:** "is this new?" is answered by checking the old version, not by guessing.

---

## Search, and a Gap in the Signed-off Design: Sprint 5.6 part B, 2026-11-09

### Delegation

Claude wrote the search requirements, waited for approval, then built `/search` with its tests.

### Discernment

- **A matching rule with a trap:** letting every word match anywhere inside a field would make "rb 5154" find RB5154, but also make "men" find "women". Claude limited "match anywhere" to words with a digit (codes and model numbers).
- **Didn't redesign without asking:** the signed-off design hides the search icon on phones, so phone visitors can't reach search except from the 404 page. Claude flagged it as a client question instead of adding an icon.
- **Screenshots over numbers:** the no-results buttons had turned into large circles. The page passed every check except a look at it, because a shared style made one icon 96 px wide.

### Diligence

- Browser checks at 360 and 1440 px in both modes; full suite, then the search spec again after the fixes.
- **Lesson:** the new tests found a real bug ("Searching…" never went away for common words only) on their first run. A test that fails first is doing its job; fix the cause, not the test.

---

## Asking Again When the Facts Changed: Sprint 5.6 part C, 2026-11-09

### Delegation

Claude added the sitemap, the site-wide share image and the alt-text and title checks.

### Discernment

- **An approval covers what was described, not what turned up:** the developer approved downloading the font "from Google's repository". There, only a variable font existed, which the image tool can't draw in bold. The static file was in the designer's repository instead. Claude stopped and asked again, naming the new source, file and size, rather than treating the first yes as covering a different host.
- **Checked what a shared link really shows:** the share image worked on most pages, but frame pages showed none. A page's own share settings replace the site's, and the seed frames have no photos. Found by reading the page's tags, not by assuming the site image applies everywhere.
- **An audit that changed nothing is still a result:** every empty alt text was checked in context and was correct, so it was recorded rather than "fixed".

### Diligence

- The image was viewed, the tags read on several pages, and a new test checks the sitemap against the database.
- **Lesson:** approval is for the specific thing described. When the details change, ask again.

---

## Measuring Twice Before Fixing: Sprint 5.6 part D, 2026-11-09

### Delegation

Claude fixed the staff Add frame button, added staff loading states, and ran Lighthouse on the production build.

### Discernment

- **A dead rule, not a missing one:** the stylesheet already hid the button on forms (`.has-form`), but nothing set that class in the app. Claude hid it wherever the sticky Save bar exists instead, so new forms are covered automatically.
- **Didn't chase a noisy number:** Home's blocking time of 3.1 s looked alarming. Two more runs gave about 1 s, the same as Frames, so it was the laptop being busy, not the page.
- **Fixed code, asked about colours:** heading order and a missing role were bugs and were fixed. The contrast failures come from signed-off colours and the unconfirmed white menu bar, so they went to the open questions.
- **Removed a test that couldn't fail:** a loading-state test passed whether or not the placeholder worked. Claude deleted it and said so, rather than counting it as coverage.

### Diligence

- Lighthouse before and after on the production build; full suite 288 passed.
- **Lesson:** measure more than once before acting on a performance number, and make sure a test can fail before trusting that it passes.

---

## AI Output Review Principles

During the project, AI output is treated as a draft or implementation aid rather than automatically accepted as fact.

The following rules are followed:

1. Client-provided information takes priority over AI assumptions.
2. Unknown information is marked `TODO` or `Pending client confirmation`.
3. Brands and prices are never invented.
4. Business claims are not added without a source.
5. Design decisions are checked against the approved homepage design.
6. Technical changes are reviewed before implementation.
7. Large unrelated code changes are avoided.
8. Requirements are documented before implementing major features.
9. Acceptance criteria are used to verify completed work.
10. Client-provided assets are preferred over placeholder or invented content for the final website.

---

## Current Documentation Created

The project documentation currently includes:

- `docs/client-answers.md`
- `docs/open-questions.md`
- `docs/changelog.md`
- `docs/requirements/Requirements_Navigation.md`
- `docs/ai-fluency-log.md`
- `CLAUDE.md`
- `CLAUDE.local.md`
- `ROADMAP.md`

---

## Lessons Learned

### Lesson 1 — Do not invent missing client information

When the client has not supplied a brand name, price, founder detail, email address, or other business information, it should remain a TODO rather than being filled using AI assumptions.

### Lesson 2 — Keep shared and local instructions separate

Shared project rules belong in `CLAUDE.md`.

Personal/local development notes belong in `CLAUDE.local.md`.

### Lesson 3 — Requirements should exist before implementation

The navigation requirements were documented before implementation so that the final UI can be checked against explicit acceptance criteria.

### Lesson 4 — AI output requires human review

AI can organize requirements and propose structures, but the final decision must be checked against the client documentation and approved design.

### Lesson 5 — Keep the project documentation traceable

Client answers, unresolved questions, changes, requirements, and AI usage are maintained in separate files so that future development decisions can be traced back to their source.