# Requirements: Lenses

Status: Approved by the client 2026-10-21 (mockups reviewed together on Google Meet; changes applied).
Route: `/lenses`
Plan version: v1.2 (pages table, sprint 5.5; the Lenses menu was trimmed on 2026-10-09)
Sources:
- `docs/client-answers.md`: WhatsApp Q11 "All Branded Lens Available"; feature list "Lens uploads by the shop"; form Q92 (services), Q118
- `docs/prescription_card.jpg` (single vision / bifocal / progressive)
- `docs/requirements/Requirements_Navigation.md` (Lenses mega menu)
- `docs/dummy-data.md`
- `CLAUDE.md`

**Dummy values:** where the client hasn't answered, mockups and development use the `DUMMY` values from `docs/dummy-data.md`, visibly tagged. They never go live. "TODO (client)" means the real value is still needed before launch.

## 1. Purpose

Explain the lenses the shop offers in plain language, show that all major brands are available, and turn uncertainty ("which lens do I need?") into an eye-test booking or a WhatsApp question. There is no online lens ordering. Lenses are chosen and fitted in store after an eye test.

**Scope (decision 2026-10-09):**
- Spectacle lenses and lens brands only.
- Contact lenses, reading glasses and care products stay off the page until the client confirms they sell them.

## 2. Lens data (`lenses` table, managed in admin)

Staff add lenses in admin ("Lens uploads by the shop"); they appear when active. Specified fully in `Requirements_Admin.md`.

| Field | Shown | Notes |
|---|---|---|
| Brand | Card, filter | From admin. `DUMMY` C6: Essilor, ZEISS, Hoya, Kodak Lens, Crizal |
| Lens name | Card | e.g. "Crizal Rock", "ZEISS SmartLife" (`DUMMY` C16) |
| Type | Card, filter | Single vision · Bifocal · Progressive · Blue-cut / computer · Photochromic. The first three are on the prescription card. **TODO (client):** confirm blue-cut and photochromic |
| Features | Card | Short tags entered by staff, e.g. "Anti-glare", "Scratch-resistant". Only what the brand and shop state; the site adds no claims of its own |
| Price | Card, if entered | Optional. **TODO (client):** show lens prices or not? Without a price the card says "Ask for price" |
| Photo | Card | Optional product or brand image; brand logos only with permission |
| Active | Never | Only active lenses appear |

## 3. Page sections

| # | Section | Anchor | Data |
|---|---|---|---|
| 1 | Page hero | | Static |
| 2 | Lens types | `#spectacle` | Static (types) + counts from DB |
| 3 | How we choose your lens | | Static |
| 4 | Lens catalogue with filters | `#catalogue` | DB (`lenses`) |
| 5 | Brands | `#brands` | DB (brands of active lenses) |
| 6 | Instant lens fitting | | Static (service Q92) |
| 7 | Call to action | | Static |

### 3.1 Page hero

- **Layout:** the shorter navy page hero (same as About).
  - Breadcrumb: Home › Lenses.
  - Eyebrow: "LENSES".
  - `h1`: "All branded lenses, *fitted in store.*"
  - Subtext: "Single vision, bifocal and progressive lenses from the brands you trust. We test your eyes, explain your options and fit your lenses at the branch."
- **Buttons:** "Book an eye test" (primary) and "Ask on WhatsApp" (outline, branch picker).

### 3.2 Lens types `#spectacle`

Five cards, each with a simple icon, the name, who it's for, and "See lenses →", which filters the catalogue to that type.

| Type | Plain-language description | Status |
|---|---|---|
| Single vision | One power across the whole lens, for distance or for reading. | Confirmed (prescription card) |
| Bifocal | Two powers in one lens: distance on top, reading below. | Confirmed |
| Progressive | Distance, middle and reading powers in one lens, with no visible line. | Confirmed |
| Blue-cut / computer | Lenses with a blue-light filtering coating, often chosen for long screen work. | TODO (client): confirm |
| Photochromic | Clear indoors, darker outdoors in sunlight. | TODO (client): confirm |

- **Wording:** descriptions only, never medical promises (no "protects your eyes" or "cures strain").
- **Unconfirmed types:** a type with no active lenses is hidden, so blue-cut and photochromic disappear automatically if the client doesn't stock them.

### 3.3 How we choose your lens

Three steps in a row:
1. **Eye test.** "We check your eyes at the branch." Links to `/book-eye-test`.
2. **Your options.** "We explain lens types, brands and prices for your power and daily use."
3. **Fitting.** "We fit your lenses. Spherical powers are fitted while you wait." (Q92)

### 3.4 Lens catalogue `#catalogue`

- **Filters:** one row of chips for **Type** and **Brand**. This is a simpler UI than the Frames sidebar, because there are far fewer lenses.
  - Chips combine as in Frames: OR within a group, AND across groups.
  - Filters are kept in the page link: `?type=progressive&brand=zeiss`, so mega-menu links land filtered.
  - "Clear" resets them.
- **Lens card:**
  - brand (caps), lens name, type
  - up to 3 feature tags
  - the price, or "Ask for price"
  - **"Enquire"**: the branch picker, with WhatsApp text "Hi VS Lens Mart, I'd like to know about the {brand} {lens name} ({type}) lens."
  - There's no detail page for lenses.
- **Layout:** 3 columns on desktop, 2 on tablet, 1 on phones.
- **Empty states:**
  - **No results:** "No lenses match. We have all branded lenses in store; ask us on WhatsApp."
  - **No lenses in admin at all:** the catalogue is hidden, and the page still works with the types, steps and brands text ("All branded lenses available").

### 3.5 Brands `#brands`

- Brand tiles (name, and the logo if the client provides it with permission), each filtering the catalogue to that brand.
- **Live:** brands come from active lenses only. Heading: "All branded lenses available".
- **Mockup:** `DUMMY` C6. **TODO (client):** the actual brand names (WhatsApp Q11 says only "All branded").

### 3.6 Instant lens fitting

- **Layout:** a navy band with the heading "Instant lens fitting" and the text "Spherical powers fitted while you wait, at both branches. For other powers we'll tell you when your glasses will be ready." (Q92)
- **Not stated:** no fixed time or days, until the client confirms.

### 3.7 Call to action

A gold band: "Not sure which lens you need?" with "Book an eye test" and "Ask on WhatsApp".

## 4. Behaviour and accessibility

- **Headings:** one `h1`; every section has an `h2`; lens type cards use `h3`.
- **Filter chips:** use `aria-pressed`, and the result count is announced politely. Each chip is at least 44 px.
- **Anchors:** the mega-menu anchors (`#spectacle`, `#brands`) land below the sticky header.
- **Animation:** sections fade in on scroll; nothing animates with reduced motion.
- **Light / dark mode:** shared colour roles.
- **SEO:**
  - Title: "Lenses | All branded lenses at VS Lens Mart".
  - The meta description mentions single vision, bifocal and progressive.

## 5. Acceptance criteria

Done when:

1. The sections appear in the order in section 3, with the shared navigation (Lenses highlighted) and footer.
2. **Scope:** only the five spectacle lens types appear, and any type without active lenses is hidden. Contact lenses, reading glasses and care products don't appear.
3. **Catalogue:**
   - The Type and Brand chips filter it and combine correctly.
   - The URL keeps the filters, and mega-menu links (`/lenses?type=progressive`, `/lenses?brand=zeiss`) land filtered.
   - Type cards and brand tiles filter it too.
4. **Lens cards:** show the price only if one is entered, otherwise "Ask for price". "Enquire" opens the branch picker with the lens name in the message.
5. **Empty states:** no results and no lenses each behave as in 3.4.
6. **Live site:** no `DUMMY` brands or lenses, no feature claims that didn't come from admin data, and no medical promises.
7. **Mobile (360 px):** one-column cards, the chip row wraps, there's no horizontal scroll, and content isn't hidden by the sticky bar.
8. Light and dark mode both read clearly, and nothing animates with reduced motion.

## 6. Open items

| Item | Owner | Mockup uses |
|---|---|---|
| Lens brands stocked (WhatsApp Q11 "All branded") | Client | `DUMMY` C6 |
| Lens products to list, and their features | Client, then staff in admin | `DUMMY` C16 |
| Show lens prices on the site? | Client | Some `DUMMY` prices, the rest "Ask for price" |
| Blue-cut and photochromic stocked? | Client | Shown, tagged TODO |
| Contact lenses, reading glasses, care products sold? | Client | Not shown |
| Brand logos (with permission) | Client | Brand names only |

## 7. Build notes (sprint 5.5 part A, 2026-10-24)

- **Data:** active lenses from the `lenses` table, cached under the `content` tag; every staff save refreshes the page and the Lenses menu's brands straight away.
- **Types and brands come from the data:** a type card, chip or brand tile appears only when an active lens has it, so blue-cut and photochromic disappear on their own if the client doesn't stock them. With no lenses at all, the types, catalogue and brand tiles are hidden; the steps, the "All branded lenses available" heading and the fitting band stay.
- **Filters in the address:** `?type=` uses the menu's dashed names (`single-vision`, `blue-cut`); `?brand=` uses the brand's name in lower case with dashes (`kodak-lens`). Unknown values are ignored. Type cards and brand tiles are links (`/lenses?type=progressive#catalogue`), so they work before the page's script loads too.
- **Staff (`/admin/lenses`):** list with search, type and shown / hidden filters; the form has brand (lens brands, or add a new one), name, type, up to 6 short feature tags, optional price, one optional photo, and "Show on the Lenses page". No approval step; staff hide, only an admin deletes (the photo file goes too). A hidden lens's photo stops being public at once.
- **Shared with the next parts:** the browser photo resizing (`src/lib/client-photo.ts`) and a photo picker (`src/components/admin/photo-picker.tsx`) used by lenses now and eye camps and the gallery next.
