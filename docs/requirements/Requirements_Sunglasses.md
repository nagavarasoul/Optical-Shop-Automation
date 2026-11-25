# Requirements: Sunglasses (listing and detail)

Status: Approved by the client 2026-10-21 (mockups reviewed together on Google Meet; changes applied).
Routes: `/sunglasses` (listing) and `/sunglasses/[slug]` (detail)
Plan version: v1.2 (pages table, sprint 5.3)
Sources: `docs/requirements/Requirements_Frames.md` (the base for this page), `docs/requirements/Requirements_Navigation.md` (Sunglasses mega menu), `docs/client-answers.md` (Q20–39), `CLAUDE.md`, `docs/dummy-data.md`

**This page works exactly like Frames** (`Requirements_Frames.md`). Everything there applies here unless this file says otherwise:
- frame data
- approval (draft → approved)
- the "Sold out" label and "Available at"
- the card, favourites, Enquire and Share on WhatsApp
- load more, empty states, page links that keep the filters
- the phone filter panel, accessibility, light/dark mode

Sunglasses are rows in the same `frames` table with `category = sunglasses`, managed in the same admin form.

**Dummy values:** where the client hasn't answered, mockups and development use the `DUMMY` values from `docs/dummy-data.md`, visibly tagged. They never go live. "TODO (client)" means the real value is still needed before launch.

## 1. Purpose

Customers browse the shop's sunglasses by lens type, brand, price and shape. As with frames, they see the exact price, then enquire on WhatsApp or visit a branch. Power sunglasses are made to the customer's prescription in store.

## 2. Extra data for sunglasses

On top of the frame fields in `Requirements_Frames.md` section 2:

| Field | Shown | Notes |
|---|---|---|
| Lens type | Card (small label), detail, filter | Polarized · UV protection · Tinted · Power sunglasses (same list as the mega menu). A pair can have more than one, e.g. Polarized + UV protection |
| Lens colour | Detail | e.g. Grey, Green, Brown, Gradient blue. Not a filter |

- **No invented claims.** Lens-type labels come only from what staff enter in admin. The site never adds health or protection claims (such as "100% UV400") that the shop hasn't confirmed.

## 3. Listing page `/sunglasses`

Same layout as `/frames`: breadcrumb, page head, quick chips, filters, toolbar, grid, load more and help band. The differences:

| Area | Sunglasses |
|---|---|
| Page head | `h1` "Sunglasses", count, intro: "Sunglasses for every face, at honest prices. Ask about power sunglasses made to your prescription." |
| Quick chips | Men · Women · Kids · Unisex (as Frames) |
| Filters, in order | Gender · **Lens type** · Brand · Price · Colour (frame colour) · Shape · Availability |
| Category filter | Not shown: everything on this page is category Sunglasses |
| Shape options | From approved sunglasses. **TODO (client):** shapes stocked. `DUMMY` from the mega menu: Aviator · Wayfarer · Round · Square |
| Price bands | Same as Frames: Under ₹1,000 · ₹1,000–2,999 · ₹3,000–4,999 · ₹5,000 and above |
| Mega-menu tiers | `?tier=everyday` → under ₹3,000; `?tier=branded` → ₹3,000 and above (`DUMMY` tier names) |
| Card | The frame card, plus a small lens-type label under the brand, e.g. "Polarized" |
| Help band | "Need power sunglasses? We make them to your prescription. Book an eye test or ask on WhatsApp." |

- Lens-type links from the mega menu (`/sunglasses?lens=polarized`) open with that filter applied.

## 4. Detail page `/sunglasses/[slug]`

Same as the frame detail (`Requirements_Frames.md` section 4), with these differences:

- **Breadcrumb:** Home › Sunglasses › name.
- **Details table:** adds **Lens type** and **Lens colour** after Shape; Category is not shown.
- **Lens note:** for Power sunglasses: "Power sunglasses are made to your prescription in store. Book an eye test first if you don't have a recent prescription." For other sunglasses: "Want this pair with your power? Ask us on WhatsApp."
- **Similar sunglasses:** same lens type or shape first, then same brand. Up to 4.
- **Enquire text:** "Hi VS Lens Mart, I'm interested in sunglasses SG-2012 (Ray-Ban RB3025 Aviator). Is it available?"

## 5. Acceptance criteria

Done when everything in `Requirements_Frames.md` section 6 passes for `/sunglasses`, plus:

1. `/sunglasses` lists only approved, active rows with category Sunglasses, and `/frames` lists none of them.
2. **Filters:**
   - The Lens type filter works, and combines with the others as in Frames.
   - `/sunglasses?lens=polarized` from the mega menu applies it.
   - There's no Category filter.
3. Cards show the lens-type label, and the detail table shows lens type and lens colour.
4. Power sunglasses show the prescription note on the detail page.
5. No lens-protection claims appear that don't come from admin data.

## 6. Open items

| Item | Owner | Mockup uses |
|---|---|---|
| Sunglasses brands and prices | Client, then staff in admin | `DUMMY` C5 brands (Ray-Ban, Fastrack, Carrera, Oakley), C14 prices |
| Shapes and lens types stocked | Client | `DUMMY` lists from the mega menu |
| Is "UV protection" true for every pair, or only some? | Client | Shown per pair, from data only |
| Code format for sunglasses | Client | `DUMMY` `SG-2012` |
| Photos | Client (staff photograph them) | Drawing placeholders |
