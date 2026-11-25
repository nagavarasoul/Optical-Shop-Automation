# Requirements: Home page

Status: Approved by the client 2026-10-21 (mockups reviewed together on Google Meet; changes applied).
Route: `/`
Plan version: v1.2 (Figure 1, "Homepage section structure")
Sources:
- `docs/plan/VS_Lens_Mart_Plan_v1.2.docx` section 2
- homepage design image (`docs/Premium Eyewear Visionary Hero.png` (removed from the repository 2026-11-25; still in git history))
- `docs/client-answers.md` (form Q7–17)
- `docs/dummy-data.md`
- `CLAUDE.md`
- `ROADMAP.md` (sprint 5.2)

**Dummy values:** where the client hasn't answered, mockups and development use the `DUMMY` values from `docs/dummy-data.md`, visibly tagged. They never go live. "TODO (client)" means the real value is still needed before launch.

## 1. Purpose

The home page is the first impression for most customers. Within a few seconds it must make them feel **trust, premium quality and affordability** (Q7), and get them to one of two actions:
- **Explore frames**
- **Book an eye test**

WhatsApp and visiting a branch are the next most important actions (Q9, Q154).

Brand tone: a trusted family shop, premium quality at affordable prices ("Welcome to the Optical Family").

## 2. Section order

From top to bottom. **DB** means the section loads from the database, so it updates when staff add content in admin.

| # | Section | Data | Client answer |
|---|---|---|---|
| 1 | Header (shared navigation). On Home the nav bar is **semi-opaque** over the hero (see 3.1) | Static + DB | See `Requirements_Navigation.md` |
| 2 | Hero | Static | Q8, Q9, Q11, Q12 |
| 3 | Quick cards: WhatsApp us · Visit store | Static (`site-config.ts`) | Q9, Q154 (decision 2026-10-09) |
| 4 | Trust strip | Static | Q12 |
| 5 | Welcome to the Optical Family | Static | Founder story pending |
| 6 | Shop by category | Static | Plan |
| 7 | Featured frames | **DB** | Q14 |
| 8 | Lenses and eye care | Static + **DB** (lens brands) | Q92 |
| 9 | Eye camps | **DB** | Q16 |
| 10 | Quote band | Static | Plan section 10 |
| 11 | Customer reviews | **DB** | Q15, Q152 |
| 12 | Our branches | **DB** (`branches`) | Q17 |
| 13 | Book an eye test band | Static | Plan |
| 14 | Footer (shared) | Static + DB | `CLAUDE.md` |

Plan v1.2 Figure 1 has 13 sections. The quick cards (3) are new from the 2026-10-09 decision; everything else keeps the plan's order.

## 3. Section details

### 3.1 Hero

Layout from the design image: the photo on the right, with text and buttons on the left.
- **Behind the whole hero:** a soft, darkened, blurred copy of the same photo, so the left side reads as the shop rather than an empty navy strip on wide screens.
- **On top, on the right:** the sharp photo fades in from the left, with no hard edge.
- **Behind the text:** a navy shade keeps the headline readable (developer decision 2026-10-10).

| Element | Content | Source / status |
|---|---|---|
| Eyebrow | "TRUST / CARE / INNOVATION", with a short gold line under "Trust" | Design, `CLAUDE.md` |
| Headline | Three lines, from the design image: white "**{years}** Years of Trust." / gold "A Clearer Vision" / white "for Tomorrow." | Developer decision 2026-10-10. `{years}` = current year − 1999, calculated in code (27 in 2026), so it is never wrong and never hard-coded. Client hasn't confirmed the wording (Q8 blank, Q13 "Not sure"). |
| Subtext | "Premium eyewear, expert eye care and a commitment to your vision, for every generation." | Design image copy |
| Legacy line | "Since 1999" in brass caps, near the eyebrow or under the buttons | Q12: shown prominently. |
| Primary button | Gold pill "Explore our frames", linking to `/frames` | `CLAUDE.md` |
| Secondary button | White outline pill "Book an eye test", linking to `/book-eye-test` | `CLAUDE.md` |
| Photo | A real photo of the shop, staff or family with a customer | **TODO (client):** photo, with the consent of everyone shown. Until then the mockup uses the photo part of the design image, tagged `DUMMY` (C12). Its people are AI-generated, so it **can't go on the live site** (`CLAUDE.md` never-do). |
| Overlay | Navy gradient behind the text side so it stays readable on any photo | `CLAUDE.md` |

- Only the two buttons in the hero. No "Virtual try-on" button until the try-on module exists.
- The design image's "Scroll" cue is dropped: the quick cards sit where it was.
- **Semi-opaque nav bar** (developer decision 2026-10-10, as in the design image), on Home only:
  - The hero extends up under the main nav bar.
  - The bar is navy at 60% with a background blur, so the photo shows through.
  - Once the page scrolls past the hero, it becomes navy at 88%, still slightly see-through, so the white menu text and gold logo stay readable over light sections.
  - The utility strip above stays solid, and other pages keep the solid bar.
  - Browsers without blur support get 85% navy instead.
- Video in the hero: no. The client was "Not sure" (Q11), and a photo loads faster on phones.
- **Mobile (360 px):** the headline and buttons stack above the photo. The photo is cropped to keep faces visible, and the buttons are full width.

### 3.2 Quick cards

Two cards directly below the hero, overlapping its bottom edge slightly on desktop.

| Card | Content | Action |
|---|---|---|
| WhatsApp us | "Ask about a frame, a lens or your order." | Opens the branch picker (same component as the navigation), then the chosen branch's `wa.me` link |
| Visit a store | "Indresham and Patelguda, open 7 days, 9 AM–9:30 PM." | Links to `/contact#branches` |

- Side by side on tablet and desktop; stacked on mobile.

### 3.3 Trust strip

A thin cream or gold-tinted band with 4 short facts and icons:
- Since 1999
- 2 branches: Indresham and Patelguda
- All branded lenses
- Open 7 days, 9 AM–9:30 PM

All four are confirmed by the client. Hours come from `site-config.ts`.

### 3.4 Welcome to the Optical Family

- **Content:** heading "Welcome to the Optical Family"; 2–3 sentences of the family story; a founder photo; a link "Read our journey →" to `/about`.
- **Story:** `DUMMY` C1, with "[Founder name]". **TODO (client):** founder name, story and photo.
- Don't name Dr. N. Venkateswarlu (from the prescription card) as the founder unless the client confirms it.

### 3.5 Shop by category

Four photo tiles: **Men · Women · Kids · Sunglasses**.
- Men, Women and Kids link to `/frames?for=…`; Sunglasses links to `/sunglasses`.
- **TODO (client):** product photos for each tile; photos with people need written consent. The mockup uses placeholders.

### 3.6 Featured frames (DB)

- Shows the **8 most recently approved** frames (`status = 'approved'`, `is_active = true`). Draft frames never appear.
- **Each card shows:**
  - the first photo
  - brand and model
  - the exact ₹ price
  - a "Sold out" label when `availability = sold out`
  - "Available at: Indresham / Patelguda / both"
  - a heart to favourite it (saved on the device)
  - an "Enquire" button that opens WhatsApp with the frame code prefilled, via the branch picker
- The card links to `/frames/[slug]`; the section ends with "View all frames →".
- **Empty state:** with no approved frames, the whole section is hidden. Never show placeholder cards on the live site.
- Mockup: 8 cards with `DUMMY` brands and prices (C4, C7).
- **Layout:** 4 columns on desktop, 2 on tablet, a horizontal scroll row on mobile.

### 3.7 Lenses and eye care

Two halves:
- **Lenses:** "All branded lenses available", plus lens types (single vision, bifocal, progressive) and up to 5 lens brands from the DB (`DUMMY` C6 in the mockup), with a "View lenses →" link.
- **Eye care services:** the client's 4 services (Q92):
  - eye testing
  - instant lens fitting for spherical powers
  - frame adjustment
  - frame repair

  Each has an icon and one line of copy. A "Book an eye test" button ends the half.

"Free eye test" only with a `DUMMY` tag (D7) until the client confirms.

### 3.8 Eye camps (DB)

- **Next upcoming camp:** date, location, short description, and a "Details →" link to `/eye-camps/[slug]`.
- **Past camps:** up to 4 photos with captions, and "All eye camps →".
- **Empty state:** if there's no upcoming camp, show only past camps. If there are none at all, hide the section.
- Mockup: `DUMMY` C9 camps.

### 3.9 Quote band

Navy band with one large quote in the display font, from the plan's quotes (section 10). It rotates slowly between 3 quotes with a fade:
- "Welcome to the Optical Family, where every customer is family."
- "We see you, not just your prescription."
- "Quality you can see. Trust you can feel."

The quotes don't rotate when reduced motion is on, and there are pause controls for keyboard users.

### 3.10 Customer reviews (DB)

- 3 review cards: quote, first name and initial, branch, and a star rating. "Read more reviews →" links to `/about#reviews`.
- **Mockup:** `DUMMY` C8 reviews ("Sample Customer 1/2/3"), tagged.
- **Live site:** the dummy reviews are swapped for **Google reviews** once the client has a Google Business Profile (Q150–152; developer decision 2026-10-10). Real testimonials from the `testimonials` table can also fill these cards. **Never publish made-up reviews.** Until real ones exist, the section stays hidden.

### 3.11 Our branches (DB)

Two cards, Indresham and Patelguda, each with:
- the address (Branch 1: "Plot No 30/Part Block-B…")
- hours
- **its own phone number**, as a call link (Patelguda `DUMMY` D2)
- WhatsApp for that branch
- "Get directions", which opens Google Maps
- a small map embed

The map loads only when the card scrolls into view, so the page stays fast.

### 3.12 Book an eye test band

- **Layout:** a gold band with the heading "Book your eye test", one line of copy, and a small form: branch (select) + preferred date + a "Continue" button.
- "Continue" goes to `/book-eye-test?branch=…&date=…` to finish the booking: time, name, phone and consent. **This band stores no personal data.**

### 3.13 Footer (shared)

- **Content:** both branch addresses, hours and phone numbers; quick links; social links (YouTube, Facebook, Instagram; `DUMMY` URLs D5); the privacy policy link; "© VS Lens Mart, since 1999".
- **Mobile:** the sticky Call / WhatsApp / Book bar from the navigation stays visible.

## 4. Behaviour and accessibility

- **Animation:** sections fade and slide up on scroll (300–500 ms). Nothing animates when reduced motion is on, and there are no 3D effects (`CLAUDE.md`).
- **Images:** every image has alt text describing it, and decorative images use empty alt text. Photos below the fold lazy-load.
- **Headings:** one `h1` (the hero headline); each section has an `h2`.
- **Colours and type:** design-system tokens only, with Plus Jakarta Sans ExtraBold for headings and Inter for body text.
- **Performance:**
  - The hero photo is the only image that loads straight away.
  - Maps load only when their section scrolls into view.
  - Target: Largest Contentful Paint under 2.5 s on a mid-range phone over 4G (Lighthouse in sprint 5.6).
- **SEO:**
  - Title: "VS Lens Mart | Opticians in Indresham and Patelguda since 1999".
  - Meta description: one sentence with both branches.
  - `LocalBusiness` structured data for each branch.

## 5. Acceptance criteria

Done when:

1. The sections appear in the order in section 2, sharing the navigation header and footer.
2. **Hero:**
   - The headline is three lines (white / gold / white).
   - There are exactly two buttons: gold "Explore our frames" to `/frames`, and outline "Book an eye test" to `/book-eye-test`.
   - "Since 1999" is visible.
   - The year count is calculated from 1999 (27 in 2026), never hard-coded. There's no try-on button.
3. The quick cards open the WhatsApp branch picker and link to `/contact#branches`.
4. **Featured frames:**
   - Only approved, active frames appear, newest first, at most 8.
   - Sold-out frames show "Sold out".
   - The heart saves to the device.
   - "Enquire" opens WhatsApp with the frame code for the chosen branch.
   - With no frames, the section is hidden.
5. Eye camps, reviews and branches show live data. Each hides cleanly when it has no data.
6. The branch cards show each branch's own number. Call, WhatsApp and directions work.
7. The eye-test band passes the branch and date to `/book-eye-test` and saves nothing itself.
8. **Live site:**
   - No `DUMMY` value appears.
   - No made-up reviews appear.
   - No stock or generated people appear.
   - "Free eye test" appears only after the client confirms.
9. **Mobile (360 px):**
   - There's no horizontal page scroll; the featured-frames row scrolls inside itself.
   - The buttons are full width.
   - Content isn't hidden behind the sticky bar.
10. With reduced motion on, nothing animates and the quote band doesn't rotate.
11. Lighthouse on mobile scores at least 90 for Performance, Accessibility and SEO, with no console errors.
12. Playwright tests at 360, 768 and 1440 px cover:
    - the hero buttons
    - the quick cards and branch picker
    - featured-frame links and Enquire
    - the eye-test band handing off to `/book-eye-test`
    - the empty states

## 6. Open items

| Item | Owner | Mockup uses |
|---|---|---|
| Confirm the headline "{years} Years of Trust. A Clearer Vision for Tomorrow." (Q8, Q13) | Client | The headline, with the year count calculated |
| Hero photo, with consent (Q11) | Client | AI image from the design, tagged `DUMMY` (C12) |
| Founder name, story and photo | Client | `DUMMY` C1 |
| Category and frame photos | Client (staff will photograph frames, Q32) | Placeholders |
| Frame and lens brands, prices | Client, then staff in admin | `DUMMY` C4, C6, C7 |
| Is the eye test free? | Client | "Free eye test" tagged `DUMMY` |
| Google Business Profile, so Google reviews can replace the dummy reviews | Client | `DUMMY` C8 |
| Eye camp details and photos | Client | `DUMMY` C9 |
| Patelguda number; social media links | Client | `DUMMY` D2, D5 |

## 7. Build notes (sprint 5.2, 2026-10-25)

- **Hero photos: a slideshow** (developer decision 2026-10-25; the signed-off mockup has one still photo, so show the client):
  - **How it works:** the photos cross-fade every 6 s (fades only); a pause button and dots sit bottom-right; with reduced motion only the first photo shows, with no controls. Only the first photo loads straight away.
  - **For now:** 5 AI-generated photos (`DUMMY` C12) in `public/dummy/hero/` (gitignored), shown **only while developing**. A production build shows the plain navy hero, a test checks that, and `check:launch` fails while the folder has images.
  - **With the client's real photos:** move them to a real folder, list them in the page instead of `dummyHeroPhotos()`, and give each one alt text describing it (the dummy ones are decorative, `alt=""`).
- **Nav on Home** (developer decision 2026-10-25): see-through navy with white text over the hero, more navy past it, as in the signed-off mockup. Other pages keep the white light-mode bar. Done in CSS with `body:has(.hero--home)`, so nothing flashes while loading.
- **Database sections:**
  - Featured frames: the 8 newest live eyeglasses and computer glasses (`/sunglasses` has its own tile).
  - Lens brands: up to 5, from the lenses staff add.
  - Eye camps: the next camp and up to 4 past ones, with their cover photo when one is uploaded.
  - Reviews: the first 3 testimonials, shown **without stars**, because the table has no rating and none is invented.
  - Branches: the same branch cards as Contact and About.
  - Each section is left out when it has nothing to show.
- **Shared facts:** hours and branch names in the quick cards and trust strip come from the database (`hoursLine()`), never hard-coded.
- **Placeholders:** the founder story is `DUMMY` C1 and C3, as on About; category tiles and the welcome photo use icon placeholders until the client's photos arrive.
- **Book band:** a plain form that opens `/book-eye-test?branch=…&date=…`; it saves nothing. The date box starts from today in India.
- **Quote band:** changes every 7 seconds with a fade; dots and pause; still, with no pause button, when reduced motion is on. Screen readers hear it only when the visitor picks a quote.
- **Found while testing:** the branch picker moved focus to its first link, which could scroll the page and so close the picker straight away. It now moves focus without scrolling.
