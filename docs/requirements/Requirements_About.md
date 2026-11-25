# Requirements: About / Our Journey

Status: Approved by the client 2026-10-21 (mockups reviewed together on Google Meet; changes applied).
Route: `/about`
Plan version: v1.2 (pages table: "Timeline 1999 → today, founder, family, team, second branch, reviews"; sprint 5.5)
Sources: `docs/client-answers.md` (WhatsApp Q10; form Q143–146), `docs/requirements/Requirements_Navigation.md` (About: Our journey, family, team, Gallery, Reviews), `docs/requirements/Requirements_HomePage.md` (links to `/about` and `/about#reviews`), `docs/dummy-data.md`, `CLAUDE.md`

**Dummy values:** where the client hasn't answered, mockups and development use the `DUMMY` values from `docs/dummy-data.md`, visibly tagged. They never go live. "TODO (client)" means the real value is still needed before launch.

## 1. Purpose

This page tells the shop's story and shows that VS Lens Mart is a real family business people can trust. It covers:
- since 1999, with the year count calculated
- the founder and family
- the team
- two branches
- real customer reviews

It is also the home of the Gallery link (Gallery isn't in the top menu) and of the Reviews that the home page links to.

Most of this page's facts are still pending from the client (Q10: "We will update it shortly"). The structure can be signed off now; the content is dummy until then.

## 2. Section order

| # | Section | Anchor | Data | Status |
|---|---|---|---|---|
| 1 | Page hero | | Static | Copy by developer |
| 2 | Founder and family | `#family` | Static | `DUMMY` C1–C2 |
| 3 | Our journey (timeline) | `#journey` | Static | 1999 confirmed; other milestones `DUMMY` C15 |
| 4 | What we stand for | | Static | Brand values (Trust / Care / Innovation) |
| 5 | Our team | `#team` | Static (admin later) | `DUMMY` C10 |
| 6 | Our branches | `#branches` | DB (`branches`) | Confirmed, except the Patelguda number (D2) |
| 7 | Gallery preview | `#gallery` | DB (`gallery_photos`) | Photos TODO (client) |
| 8 | Reviews | `#reviews` | DB (`testimonials`), Google reviews later | `DUMMY` C8 |
| 9 | Eye camps band | | DB (`eye_camps`, next camp) | `DUMMY` C9 |
| 10 | Call to action | | Static | |

The navigation and footer are shared. The menu highlights "About".

## 3. Section details

### 3.1 Page hero

- **Layout:** a navy band (same style as the home hero, but shorter, about 50% of the home hero's height).
  - Breadcrumb: Home › About.
  - Eyebrow: "OUR STORY".
  - `h1`: "A family that cares, since 1999."
  - Subtext: "For **{years}** years, VS Lens Mart has helped families in Indresham and Patelguda see clearly. Honest advice, careful eye testing and frames for every budget." `{years}` = current year − 1999, calculated in code.
- **Photo:** a family or shop photo on the right. **TODO (client):** real photo with consent; the mockup uses a labelled placeholder (no generated people).

### 3.2 Founder and family `#family`

- **Content:**
  - a founder photo (placeholder)
  - a heading: "Welcome to the Optical Family"
  - 2–3 paragraphs of the founding story
  - a short pull-quote from the founder
  - the founder's name and role
- **Story:** `DUMMY` C1, the same text as the home page. Name: `DUMMY` "[Founder name]" (C2). **TODO (client):** the real story, name, photo and quote (WhatsApp Q10).
- **Not the founder by default:** Dr. N. Venkateswarlu, who appears on the prescription card, must not be called the founder until the client confirms it.

### 3.3 Our journey `#journey`

A vertical timeline (horizontal is not used: it breaks on phones).

| Year | Milestone | Status |
|---|---|---|
| 1999 | VS Lens Mart opens in Indresham | Year confirmed; "Indresham" `DUMMY` (C1) |
| 2010 | `[Milestone]`, e.g. new testing equipment | `DUMMY` C15 |
| 2016 | First community eye camp | `DUMMY` C15 |
| 2022 | Second branch opens in Patelguda | `DUMMY` C3 |
| Today | Two branches, {years} years, three generations of customers | Calculated |

- Each entry: year (gold, display font), title, one line of text, optional photo placeholder.
- **TODO (client):** the real milestones and years. The page must never show invented milestones live.

### 3.4 What we stand for

Three cards, matching the hero eyebrow: **Trust** (honest advice, exact prices), **Care** (careful eye testing, frame adjustment and repair), **Innovation** (all branded lenses, modern testing). Uses only facts the client has confirmed (services Q92, "all branded lenses", exact prices Q21).

### 3.5 Our team `#team`

- 3 cards: photo placeholder, role, one line. `DUMMY` C10: "Optometrist", "Frame stylist", "Branch manager", no names.
- **Photos:** real staff photos only with written consent (`CLAUDE.md`). Names are shown only if the staff member agrees.
- **TODO (client):** who should appear, with names, roles and photos.

### 3.6 Our branches `#branches`

The same two branch cards as the home page (`Requirements_HomePage.md` 3.11): address, hours, each branch's own number, Call, WhatsApp, Directions, map placeholder.

### 3.7 Gallery preview `#gallery`

- 6 photo tiles in a grid from the gallery (the shop, eye camps, customers with consent), plus "View the gallery →" linking to `/gallery`.
- This is the main way into the Gallery, since it isn't in the top menu.
- **Empty state:** with no gallery photos, the section is hidden.
- **TODO (client):** photos. The mockup uses labelled placeholders.

### 3.8 Reviews `#reviews`

- Up to 6 review cards (star rating, quote, first name and initial, branch).
- **Mockup:** `DUMMY` C8 reviews, tagged.
- **Live:** Google reviews once the client has a Google Business Profile, or real testimonials from the `testimonials` table. Never made-up reviews; the section is hidden until real ones exist.
- `/about#reviews` from the home page scrolls here.

### 3.9 Eye camps band

- A short navy band: "We give back. Free eye camps in our community." It shows the next camp's date and place (`DUMMY` C9), with "See eye camps →" linking to `/eye-camps`.
- **Empty state:** if there's no upcoming camp, it shows "See our past camps →".

### 3.10 Call to action

A gold band: "Come and meet the family." with "Book an eye test" (primary) and "WhatsApp us" (branch picker).

## 4. Behaviour and accessibility

- **Headings:** one `h1` (hero); every section has an `h2`.
- **Timeline:** an ordered list (`<ol>`), so the order is announced; years are part of the text, not only visual.
- **Anchors:** the anchors in section 2 work from the menu and other pages, scrolling with the header offset so section titles aren't hidden under the sticky header.
- **Animation:** sections fade and slide up on scroll; timeline entries appear one after another. Nothing animates when reduced motion is on.
- **Images:** alt text describes who or what is shown; decorative images use empty alt text.
- **Light / dark mode:** follows the shared colour roles.
- **SEO:**
  - Title: "About VS Lens Mart | Family opticians since 1999".
  - `Organization` structured data with the founding year (1999).

## 5. Acceptance criteria

Done when:

1. The sections appear in the order in section 2, with the shared navigation (About highlighted) and footer.
2. The year count is calculated from 1999 (27 in 2026), never hard-coded.
3. **Anchors:** `#family`, `#journey`, `#team`, `#branches`, `#gallery` and `#reviews` scroll to their sections with the titles visible below the sticky header; `/about#reviews` from the home page works.
4. The timeline is an ordered list; 1999 is the first entry and "Today" the last.
5. "View the gallery" goes to `/gallery`, and "See eye camps" to `/eye-camps`.
6. Branch cards show each branch's own number, and Call / WhatsApp / Directions work (the dummy number never dials in mockups).
7. **Live site:**
   - No `DUMMY` values.
   - No invented milestones or reviews.
   - No generated people; staff and customer photos only with written consent.
   - Dr. N. Venkateswarlu is not called the founder unless confirmed.
8. **Mobile (360 px):** a single column, the timeline readable, no horizontal scroll, and content not hidden by the sticky bar.
9. Both light and dark mode read clearly; with reduced motion on, nothing animates.

## 6. Open items

| Item | Owner | Mockup uses |
|---|---|---|
| Founding story, founder name, photo and quote (WhatsApp Q10) | Client | `DUMMY` C1–C2 |
| Real milestones and years | Client | `DUMMY` C15 |
| Year the Patelguda branch opened | Client | `DUMMY` C3 (2022) |
| Team: who appears, names, roles, photos, consent | Client | `DUMMY` C10 |
| Family / shop photo for the hero, gallery photos | Client (Q144) | Placeholders |
| Permission to publish customer photos (Q146 "Will confirm later") | Client | No customer photos |
| Google Business Profile for reviews | Client | `DUMMY` C8 |

## 7. Build notes: testimonials (sprint 5.5 part C, 2026-10-24)

- **Staff (`/admin/testimonials`):** the customer's first name (and initial if they like), optional branch, their words (up to 300 characters), and the date they agreed to be quoted. That date is required and can't be in the future, so a review can't be added without the customer's agreement on record. Staff add, edit and hide; only an admin deletes.
- **On the site:** visible testimonials, the most recently agreed first. The About reviews section (part D) and the home page (sprint 5.2) read them; with none visible, the section stays hidden. The seed's three "Sample Customer" rows are `DUMMY` C8 and are listed by `check:launch`.

## 8. Build notes: the page (sprint 5.5 part D, 2026-10-24)

- **Years** ("For 27 years", "Today: … 27 years") are worked out in the visitor's browser from 1999 (the page is pre-rendered, so the server never reads the clock), the same way as the footer year.
- **Placeholders** each have their own tag and register entry: founding story C1, founder name and quote C2, Patelguda opening year C3, team roles C10, the 2010 and 2016 milestones C15. Dr. N. Venkateswarlu isn't mentioned (a test checks it).
- **From the database:** the branch cards are the Contact page's (`src/components/contact/branch-card.tsx`, now shared), with maps that load only when scrolled to. The gallery preview shows the 5 newest visible photos (the mockup's grid), hidden with none. The reviews show up to 6 visible testimonials, hidden with none, **without star ratings** (testimonials don't record one, so none are invented). The camps band names the next camp, or links to past camps when none is scheduled.
- **Search engines:** `Organization` data with the founding year 1999.
