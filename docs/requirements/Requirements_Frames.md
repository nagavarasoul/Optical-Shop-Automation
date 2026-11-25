# Requirements: Frames (listing and frame detail)

Status: Approved by the client 2026-10-21 (mockups reviewed together on Google Meet; changes applied).
Routes: `/frames` (listing) and `/frames/[slug]` (frame detail)
Plan version: v1.2 (pages table, sprint 5.3)
Sources:
- `docs/client-answers.md` (form Q18–39)
- `CLAUDE.md` ("Frames data")
- `ROADMAP.md` (sprint 5.3)
- `docs/requirements/Requirements_Navigation.md` (Frames mega menu)
- `docs/dummy-data.md`

`/sunglasses` uses the same page with `category = sunglasses`; its differences go in `Requirements_Sunglasses.md`.

**Dummy values:** where the client hasn't answered, mockups and development use the `DUMMY` values from `docs/dummy-data.md`, visibly tagged. They never go live. "TODO (client)" means the real value is still needed before launch.

## 1. Purpose

Customers browse about 300 frames (Q18), with 15–20 new each month (Q19). They narrow them down with the client's filters, see the exact price, and either enquire on WhatsApp or visit a branch. There is no cart or checkout. Staff add frames in admin, and frames appear here only after an admin approves them (Q37).

## 2. Frame data

From `CLAUDE.md` and the client's form (Q20). Admin entry is specified in `Requirements_Admin.md`.

| Field | Shown to customers | Notes |
|---|---|---|
| Frame code | Detail page; in the WhatsApp enquiry text | Unique, e.g. `VSF-1024` (format `DUMMY` until the client shares theirs) |
| Brand | Card and detail | Filter |
| Model | Card and detail | |
| Category | Detail | Filter. **TODO (client):** the categories they use. `DUMMY` (C13): Eyeglasses · Computer glasses; Sunglasses is its own page |
| Gender | Detail | Filter: Men · Women · Unisex · Kids |
| Colour | Detail | Filter |
| Shape | Detail | Filter. **TODO (client):** shapes stocked. `DUMMY`: Rectangle · Square · Round · Cat-eye · Aviator |
| Material | Detail | e.g. acetate, metal, TR90 |
| Size | Detail | Lens–bridge–temple, e.g. 52-18-140 |
| Price | Card and detail | Exact ₹ (Q21, Q22). Filter |
| Availability | Card and detail | In stock / Sold out. Sold-out frames stay visible (Q24, Q39). Filter |
| Available at | Card and detail | Indresham / Patelguda / both (Q25) |
| Photos | Card (first) and detail (all) | Up to 5 (Q34), product-only. "Model wearing it" (Q35) only with real staff or customers and written consent |
| Status | Never | `draft` → `approved`. Only approved and active frames appear |

## 3. Listing page `/frames`

### 3.1 Layout

| Area | Content |
|---|---|
| Breadcrumb | Home › Frames |
| Page head | `h1` "Frames"; the count, e.g. "120 frames"; a one-line intro: "Premium frames at honest prices. Every price is the exact in-store price." |
| Quick chips | Men · Women · Kids · Unisex, the same choices as the mega menu's "Shop for", as one-tap gender filters |
| Filters | Left sidebar on desktop; on tablet and mobile, a "Filters" button opens a full-height panel |
| Toolbar | Active filter chips, each removable, plus "Clear all"; sort; a "Saved (n)" toggle for favourites |
| Grid | Frame cards (the same component as the home page): 3 columns on desktop with the sidebar, 3 on tablet, 2 on mobile |
| Load more | 24 frames at a time, with a "Load more" button that shows "Showing 24 of 120". No infinite scroll, so the footer stays reachable |
| Help band | "Not sure what suits you? Visit a branch or ask us on WhatsApp", with the branch picker and a link to `/contact#branches` |

### 3.2 Filters (Q27)

The client's filters, in this order:

| Filter | Type | Options |
|---|---|---|
| Gender | Checkboxes | Men · Women · Unisex · Kids |
| Category | Checkboxes | From the database (`DUMMY` C13) |
| Brand | Checkboxes, searchable once there are more than 8 | From the database: only brands of approved frames, with counts |
| Price | Checkboxes | Under ₹1,000 · ₹1,000–2,999 · ₹3,000–4,999 · ₹5,000 and above |
| Colour | Swatches with names | From the database |
| Shape | Checkboxes with small shape icons | From the database |
| Availability | Toggle | "In stock only" (off by default, because sold-out frames are shown) |

- **No rim-type filter** unless the client asks for one (decision 2026-10-09).
- Brand, colour and shape options come only from approved frames, so the live site never lists something it doesn't have. Each option shows its count, and options with 0 results are disabled.
- Selections combine: OR within a filter, AND across filters.
- Every filter is kept in the URL (e.g. `/frames?for=women&shape=round&price=1000-2999`), so links can be shared and the mega-menu links land with the right filters applied.
- Desktop applies filters instantly. The mobile panel has "Show 42 frames" and "Clear" buttons at the bottom.

### 3.3 Sort

Options: Newest (default) · Price: low to high · Price: high to low. Sold-out frames always sort after in-stock frames.

### 3.4 Frame card

The same component as the home page (`Requirements_HomePage.md` 3.6):
- photo (or a frame placeholder)
- brand and model
- exact price
- "Available at"
- "Sold out" label
- heart (favourite, saved on the device)
- "Enquire", which opens the branch picker; the WhatsApp text includes the frame code

The photo and the name link to the detail page.

### 3.5 Favourites (Q28)

- The heart saves the frame code on this device (`localStorage`); there is no login.
- "Saved (n)" in the toolbar shows only saved frames.
- With nothing saved, the toggle is disabled with a hint: "Tap ♡ on a frame to save it".
- Saved frames that are later deleted or unapproved disappear quietly.

### 3.6 Empty and error states

| State | What the customer sees |
|---|---|
| No results for the filters | "No frames match these filters." with "Clear filters" and "Ask us on WhatsApp", because the shop may have it in store |
| No approved frames at all | "New frames are coming soon. Visit a branch to see the full collection." with the branch links |
| Loading | Card skeletons in the grid; filters stay usable |

## 4. Frame detail `/frames/[slug]`

The slug is made from brand + model + code, e.g. `/frames/ray-ban-rb5154-clubmaster-vsf-1024`.

| Area | Content |
|---|---|
| Breadcrumb | Home › Frames › Ray-Ban RB5154 Clubmaster |
| Gallery | Up to 5 photos, with thumbnails. Swipe on mobile, click to zoom on desktop. Product-only photos |
| Title block | Brand (caps), model (`h1`), frame code, exact price, availability ("In stock" / "Sold out"), "Available at: Indresham / Patelguda / both" |
| Actions | Primary: "Enquire on WhatsApp" (branch picker, with the frame code and name prefilled). Secondary: "Book an eye test". Icons: favourite (heart) and "Share on WhatsApp" |
| Details | Table: frame code, brand, model, category, gender, colour, shape, material, size |
| Lens note | "Need prescription lenses? All branded lenses are available. We fit them in store." with a link to `/lenses` |
| Visit note | "Try it on at a branch." with both branches' hours, which link to `/contact#branches` |
| Related frames | Up to 4 approved frames with the same shape or brand |

- **Sold out:** the Enquire text becomes "Ask about similar frames"; the frame stays visible (Q39).
- **Share on WhatsApp:** opens `https://wa.me/?text=<frame name + page link>`, so the customer chooses the contact. It doesn't go to the shop's number.
- **Try-on (Phase 6):** a "Try it on" button appears only on a live frame whose try-on is switched on, and only when the site's `TRYON_ENABLED` switch is on. Until then, and on every other frame, there's no try-on button. Details: `Requirements_TryOn.md`.
- **Missing frame** (wrong slug, or a draft frame): a 404 page with "This frame isn't available" and links to `/frames`.
- **SEO:**
  - Title: "Ray-Ban RB5154 Clubmaster · ₹6,490 | VS Lens Mart".
  - Each frame gets `Product` structured data (price, availability) and an Open Graph image of the first photo.

## 5. Behaviour and accessibility

- **Filters:** fieldsets with legends; the result count is announced politely after changes; the mobile panel traps focus and closes with Esc.
- **Hearts:** use `aria-pressed`, with labels like "Save Ray-Ban RB5154 to favourites".
- **Images:** every photo has alt text with brand, model and colour; images below the first rows lazy-load.
- **Touch targets:** at least 44 px, and the filter checkboxes have large labels.
- **Animation:** cards fade in when loaded (300–500 ms), with no animation when reduced motion is on.
- **Performance:**
  - 24 cards at a time, with thumbnails of at most 600 px.
  - The listing Largest Contentful Paint is under 2.5 s on a mid-range phone.

## 6. Acceptance criteria

Done when:

1. `/frames` lists only approved, active frames in category Eyeglasses / Computer glasses, newest first, 24 at a time with "Load more".
2. **Filters:**
   - All 7 client filters work and combine as in 3.2, and each change updates the URL and the count.
   - Opening a mega-menu link such as `/frames?for=women` applies that filter.
   - There's no rim-type filter.
3. Filter options for brand, colour, shape and category come from approved frames only, with counts.
4. **Sold out:** sold-out frames show "Sold out", sort last, and disappear when "In stock only" is on.
5. **Favourites:** the heart saves on the device and survives a reload; "Saved (n)" shows only saved frames; there's no login.
6. **Enquire:** opens the branch picker; the WhatsApp message includes the frame code and name; the dummy Patelguda number never dials in mockups.
7. **Detail page:**
   - It shows every field in section 4, the gallery (up to 5 photos), both WhatsApp actions, favourite and "Book an eye test".
   - A draft or unknown frame gives a 404.
   - There's no try-on button, except on try-on frames once Phase 6 is switched on (`Requirements_TryOn.md`).
8. **Empty states:** no results and no frames each show the right message from 3.6.
9. **Mobile (360 px):** 2-column grid; the filter panel opens and closes, applies with "Show n frames" and closes with Esc; no horizontal page scroll; content isn't hidden by the sticky bar.
10. **Live site:** no `DUMMY` values; no stock or generated people; no prices that don't come from the database.
11. Playwright tests at 360, 768 and 1440 px cover filters, URL sharing, sort, load more, favourites, Enquire, the detail page and the 404.

## 7. Open items

| Item | Owner | Mockup uses |
|---|---|---|
| Frame categories (Q20 "Category") | Client | `DUMMY` C13: Eyeglasses · Computer glasses |
| Shapes stocked | Client | `DUMMY` list from the navigation |
| Brands and prices | Client, then staff in admin | `DUMMY` C4, C7 |
| Frame code format | Client | `DUMMY` `VSF-1024` |
| Frame photos (staff will take them, Q32) | Client | Frame drawing placeholders |
| Filter by branch? (Q94 "select a branch before browsing": "Not sure") | Client | Not shown; "Available at" on each card |
| Should sold-out frames disappear after a while? (Q23 "Not sure") | Client | They stay, labelled "Sold out" |

## 8. Build notes (sprint 5.3 part C, 2026-10-24)

Decisions made while building `/frames`, `/sunglasses` and the detail pages. They don't change what the customer sees.

- **Filtering runs in the browser.** The page gets every live frame of its kind (about 300, Q18), and filters, counts, sort and "Load more" run on the device, so they're instant. The address bar still holds every filter, so shared links and the mega-menu links work.
- **The pre-rendered page is the unfiltered list.** It's built from the database, so search engines and slow phones see real frames; the filters in the address apply as soon as the page has read it.
- **Filter changes replace the address rather than adding history**, as in the mockup, so Back leaves the page instead of undoing filters one at a time.
- **Swatch colours** are the product colours from the mockup (`listing.js`), not design tokens. A colour the list doesn't know shows grey.
- **Photos are resized by Next.js** for cards and thumbnails, so a phone downloads small versions, not the 1600 px originals. The resized copies are kept for an hour at most, so a removed photo or a hidden frame stops showing within the hour.
- **A missing frame shows the not-found page** ("This frame isn't available") marked `noindex`, so search engines drop it. The production server streams that page, so the status code is 200 rather than 404 (the same Next.js behaviour as in the staff area). Live frames are pre-rendered; a frame approved later renders on its first visit.
- **Share links and search-engine data use the `DUMMY` domain D4** (`vslensmart.example`) until the client buys one (Q156). `npm run check:launch` lists it.
- **The phone filter panel's title is white.** In the mockup it was navy on navy in light mode.
