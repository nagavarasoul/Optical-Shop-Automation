# Requirements: Navigation

Status: Approved by the client 2026-10-21 (mockups reviewed together on Google Meet; changes applied). Built in sprint 5.1 (2026-10-23); acceptance criteria covered by `tests/layout.spec.ts` and `tests/menu-data.spec.ts`.
Plan version: v1.1 (navigation update), updated 2026-10-09 with the client's form and prescription card
Sources: project plan v1.1 section 3 "Navigation bar (mega menu)", `docs/client-answers.md` (incl. the 160-question form), `docs/prescription_card.jpg`, `docs/dummy-data.md`, homepage design image (`docs/Premium Eyewear Visionary Hero.png` (removed from the repository 2026-11-25; still in git history)), navigation mockup (`docs/vs_lens_mart_navbar_mega_menu.html`), `CLAUDE.md`

**Dummy values:** where the client hasn't answered, mockups and development use the `DUMMY` values from `docs/dummy-data.md`, visibly tagged. They never go live. "TODO (client)" below means the real value is still needed before launch.

## 1. Purpose

The navigation sits on every page. It must let customers:
- find frames, sunglasses and lenses in one or two clicks;
- book an eye test or contact the shop on WhatsApp from anywhere on the site.

It has to look like the approved homepage design: a dark navy bar, gold accents and a gold underline on the active item. **Proposed change (developer, 2026-10-23, client to confirm):** in light mode the main menu bar is white with navy text, keeping the gold underline (the current item's text is navy, because gold text on white is too faint to read). The utility strip and dark mode stay navy. If the client prefers the approved navy bar, delete the marked block in `src/styles/site-chrome.css`. On the home page only, the bar is semi-opaque navy over the hero photo (`Requirements_HomePage.md` 3.1). There is no online checkout or customer login, so there is no cart or account icon. Favourites are saved on the device and shown as a heart on frame cards, not in the navigation.

## 2. Structure overview

From top to bottom:

1. **Utility bar:** a thin strip with shop facts and the main call to action.
2. **Main navigation bar:** the logo, 7 top-level menu items, and Search and WhatsApp icons.
3. **Mega menu panel** (desktop): opens under the bar for Frames, Sunglasses, Lenses and Eye care.
4. **Mobile only:** a hamburger that opens a full-screen accordion, plus a sticky bottom action bar.

## 3. Utility bar

Always visible above the main navigation on desktop.

| Item | Content | Source / status |
|---|---|---|
| Legacy | "Since 1999" | Client wants "Since 1999" prominent (Q12). Don't show "25 years" or "27 years" (see TODO below). |
| Hours | "Open 7 days, 9 AM–9:30 PM" | Client: Monday–Sunday, 9:00 AM–9:30 PM, both branches (Q90). |
| Phone | "Indresham 9550685417 · Patelguda +91 00000 00000", each a click-to-call `tel:` link | Client: each branch has its own number (Q87, Q96). Indresham is from the prescription card. Patelguda is `DUMMY` (D2). Read from `src/lib/site-config.ts`. |
| Branches | "2 branches", linking to the branch section on `/contact` | Plan |
| CTA | Gold pill "Book an eye test" button, linking to `/book-eye-test` | Plan, design system |

- **TODO (client):** the Patelguda phone/WhatsApp number.
- **TODO (client):** whether to show a year count next to "Since 1999" ("Not sure", Q13). Until then, show only "Since 1999". Any year count must be calculated in code from 1999.
- **TODO (design):** on mobile the utility bar's content moves to the sticky bottom bar (section 7). Decide whether a shortened utility bar (for example "Since 1999 · Open 7 days") still shows at 360 px, or whether it hides.

## 4. Main navigation bar

### 4.1 Left: logo

- The VS logo plus "LENS MART" and "EST. 1999" link to `/`. There's also a "Home" menu item (client change 2026-10-21).
- **TODO (client):** the new logo file. On 2026-10-21 the client asked for a new logo; the file hasn't arrived. Until it does, mockups use a placeholder, `mockups/assets/logo-placeholder.svg` (`DUMMY` D8). The old `docs/logo.png` (which spells "FAMLY") is no longer used (removed from the repository 2026-11-25; still in git history).

### 4.2 Centre: 7 top-level items

Order changed by the client on 2026-10-21: Home and About first. Eye camps removed from the top level on 2026-11-16 (developer request, to shorten the bar; **not yet confirmed by the client**): it's reached from the Eye care menu (section 5.4), the footer and the home page.

| # | Item | Type | Destination |
|---|---|---|---|
| 1 | Home | Plain link | `/` |
| 2 | About | Plain link | `/about` (Our journey, family, team, Gallery, Reviews) |
| 3 | Frames | Mega menu | `/frames` |
| 4 | Sunglasses | Mega menu | `/sunglasses` |
| 5 | Lenses | Mega menu | `/lenses` |
| 6 | Eye care | Photo-card menu | `/eye-care` |
| 7 | Contact | Plain link | `/contact` (both branches, maps, enquiry form) |

- No more than 7 top-level items. Adding an item means removing one. Labels never wrap; at 1180–1279 px the items use tighter spacing.
- The footer's quick links follow the same order (Home, About us, then the product pages).
- Gallery is not a top-level item. It's reached from the About page, and `/gallery` stays a valid page.

**Differences from the homepage design image:**
- The image shows "Eye camps" as a top-level item with a dropdown arrow. Since 2026-11-16 it isn't a top-level item; it's a card in the Eye care menu.
- The image shows a shopping-bag icon. Replace it with WhatsApp (section 4.3).

### 4.3 Right: icons

| Icon | Behaviour |
|---|---|
| Light / dark toggle | A moon icon (in light mode) or sun icon (in dark mode). It switches the whole site between light and dark mode. Until the visitor chooses, it follows the device setting; the choice is saved on the device and applies on every page. It uses `aria-pressed` and the title "Switch to dark/light mode". Visible on desktop and mobile. Added 2026-10-10 (developer request) |
| Search | Opens the search panel; submitting it opens `/search?q=...`, a results page across frames, sunglasses and lenses (`Requirements_Search.md`, sprint 5.6). |
| WhatsApp | Opens a small branch chooser (Indresham / Patelguda). Each opens `https://wa.me/91<number>` for that branch in a new tab. It replaces the shopping bag. *Proposal for client review.* |

- `wa.me` links work with a normal WhatsApp number, so they can go live before the client sets up WhatsApp Business (Q83). WhatsApp Business is only needed later, for automatic messages.
- Never show cart or account icons. Favourites aren't in the nav (section 1).

## 5. Mega menu contents (desktop)

General rules:
- Each column heading is a link to the matching listing page with that filter applied.
- Each mega menu ends with a "View all …" link.
- Brands, lens brands and "from ₹" prices are read from the database, so they update when staff upload products. Only approved frames count.
- If a category has no active products, hide its price row or column. Never show "₹0". Mockups may show `DUMMY` brands and prices from `docs/dummy-data.md` (C4–C7), tagged; the live site shows only database values.

### 5.1 Frames

| Column | Items | Data |
|---|---|---|
| Shop for | Men · Women · Kids (photo tiles) | Static labels. **TODO (client):** real product photos for each tile. No stock photos of people; people only with written consent. |
| Shape | Rectangle · Square · Round · Cat-eye · Aviator | Static list from the mockup. Shape is one of the client's filters (Q27). **TODO (client):** confirm the shapes stocked. |
| Brands | A short list of brands and an "All brands →" link | Database (`frames`). **TODO (client):** frame brands stocked; mockups use `DUMMY` C4. |
| Price range | Everyday "from ₹…" · Premium "from ₹…" · Kids "from ₹…" | The minimum price per tier from the database. Frames show the exact ₹ price (Q21, Q22). **TODO (client):** tier names and price boundaries. |

There is no rim-type (full / half / rimless) column; the client didn't ask for that filter. Add it only if the client requests it.

Ends with "View all frames →", linking to `/frames`.

### 5.2 Sunglasses

| Column | Items | Data |
|---|---|---|
| Shop for | Men · Women · Kids (photo tiles) | Static labels. **TODO (client):** photos. |
| Lens type | Polarized · UV protection · Tinted · Power sunglasses | Static |
| Shape | Aviator · Wayfarer · Round · Square | Static list from the mockup. **TODO (client):** confirm. |
| Price range | Everyday "from ₹…" · Branded "from ₹…" | Database (`frames` where category = sunglasses). **TODO (client):** tiers. |

Ends with "View all sunglasses →", linking to `/sunglasses`.

### 5.3 Lenses

| Column | Items | Data |
|---|---|---|
| Spectacle lenses | Single vision · Bifocal · Progressive · Blue-cut / computer · Photochromic | Static. Single vision, bifocal and progressive are on the prescription card. **TODO (client):** confirm blue-cut and photochromic. |
| All branded lenses | Lens brand names, plus "Not sure? Book an eye test →" | Database (`lenses`). The client says "All branded lenses available". **TODO (client):** the actual brand names; mockups use `DUMMY` C6. |

Contact lenses, reading glasses and care products are **removed** until the client confirms they sell them. The client's list of services (Q92) doesn't include them.

### 5.4 Eye care (services + photo cards)

**Our services** column, linking to the matching sections of `/eye-care`. These are the client's services at both branches (Q92):
- Eye testing
- Instant lens fitting (spherical powers)
- Frame adjustment
- Frame repair

Three cards:
1. Book an eye test, linking to `/book-eye-test`
2. Our branches, linking to `/contact`
3. Eye camps, linking to `/eye-camps`

**TODO (client):** real photos of the test room, each storefront and a past eye camp. The mockup uses icons as placeholders.

**TODO (client):** is the eye test free? Mockups may say "Free eye test" tagged `DUMMY` (D7). The live site must not say "free" until the client confirms it.

## 6. Mobile accordion menu

- The bar shows the logo, the hamburger and the WhatsApp icon. The 7 items are hidden behind the hamburger, in the same order.
- The hamburger opens a **full-screen** menu with a navy background and the design-system typography.
- The four mega-menu items (Frames, Sunglasses, Lenses, Eye care) show their column links stacked, opening with **+** and closing with **−**. Only one section is open at a time.
- The plain links (Home, About, Contact) go straight to the page.
- The menu closes when a link is followed, when the close button is pressed, or when Esc is pressed on a connected keyboard.
- Page scroll is locked while the menu is open.
- Brand and price rows follow the same database rules as on desktop (section 5).

## 7. Sticky bottom bar (mobile)

Always visible at the bottom of the screen on mobile, below the tablet breakpoint.

| Button | Action |
|---|---|
| Call | Opens a branch picker: Indresham `tel:9550685417`, Patelguda `tel:` its number (`DUMMY` D2) |
| WhatsApp | Opens a branch picker: `https://wa.me/91<number>` for the chosen branch |
| Book test | `/book-eye-test` |

- It must not cover page content. Pages need bottom padding equal to the bar's height.
- It stays visible while the accordion menu is open.
- Each branch has its own number (Q87, Q96), so Call and WhatsApp open a two-option branch picker. *Proposal for client review.* Both numbers come from `src/lib/site-config.ts`.

## 8. Behaviour and accessibility

- **Desktop:** mega menus open on hover and on click or Enter. They close on Esc, when the mouse leaves the menu and panel, or when another top-level item opens.
- **Keyboard:** Tab moves through the top-level items. Enter or Space opens a mega menu, and focus can move into the panel. Esc closes the panel and returns focus to its trigger.
- **Screen readers:** triggers use `aria-expanded` and `aria-controls`. Panels are real lists of links. Icon buttons have accessible labels ("Search", "Chat on WhatsApp", "Open menu").
- **Active page:** the current section shows the gold underline from the design.
- **Animation:** panels fade and slide in over 300 ms or less. There is no animation when the user's system is set to reduced motion.
- **Colours and type:** use only design-system tokens (`CLAUDE.md`), with navy `#0D1B2A` for the bar, gold `#F5C842` for the active underline and CTA, and white text.
- **Touch targets:** at least 44 × 44 px. Buttons are pill-shaped and 48 px tall.

## 9. Acceptance criteria

Done when:

1. Every page shows the utility bar, the main bar with exactly 7 top-level items in the order in section 4.2, and the footer.
2. The logo and the "Home" item both link to `/`; "Home" is marked as the current page on the home page.
3. There are no cart or account icons anywhere, and no favourites icon in the navigation. The WhatsApp icon lets the customer choose a branch and opens a chat with that branch's number (Indresham 9550685417).
4. "Book an eye test" in the utility bar goes to `/book-eye-test`.
5. **Desktop (1440 px):**
   - Frames, Sunglasses, Lenses and Eye care each open a panel on hover and on click.
   - Each panel closes on Esc and when the mouse leaves.
   - Home, About and Contact navigate directly.
   - Eye camps is reached from the Eye care panel, and the Eye care item is underlined on `/eye-camps` pages.
6. **Keyboard only:** every menu item and panel link can be reached and used with Tab, Enter and Esc, with visible focus styles.
7. **Mobile (360 px):**
   - The hamburger opens a full-screen accordion. Product sections expand and collapse with + / −. Plain links navigate.
   - There's no horizontal scrolling.
8. **Mobile sticky bar:** at 360 px the Call, WhatsApp and Book test buttons are always visible and work. Call and WhatsApp reach the chosen branch's number. Page content isn't hidden behind the bar.
9. **Product data:**
   - Brands, lens brands and "from ₹" prices in the menus come from the database. When an admin approves an active frame, the menu updates without a code change. Draft frames never appear.
   - A category with no products shows no price.
10. **No invented data:** on the live site, no brand names, prices or "free eye test" claims appear unless they come from the client or the database. Mockups and development may use only the `DUMMY` values in `docs/dummy-data.md`, visibly tagged.
11. **Legacy wording:** the site never says "25 years". Any year count is calculated from 1999.
12. **Active page:** the active top-level item shows the gold underline on its section's pages.
13. **Tests:** Playwright tests at 360, 768 and 1440 px cover:
    - mega menus with mouse and keyboard;
    - the mobile accordion;
    - the sticky bar;
    - the WhatsApp and phone links.

    The tests pass with no console errors.
14. **Reduced motion:** with reduced motion on, menus open without animation.
15. **Light / dark mode:**
    - The toggle switches every page.
    - The choice survives reloads and page changes, with no flash of the other mode on load.
    - With no choice made, the site follows the device setting.
    - All text keeps readable contrast in both modes.

## 10. Open items summary

| Item | Owner |
|---|---|
| Patelguda phone/WhatsApp number | Client |
| Year count next to "Since 1999"? | Client |
| New logo file (asked for 2026-10-21) and tagline | Client |
| Frame brands and lens brand names | Client, then entered by staff in admin |
| Price tiers and "from ₹" boundaries | Client |
| Shapes stocked; blue-cut and photochromic lenses; whether contact lenses, reading glasses or care products are sold | Client |
| Is the eye test free? | Client |
| Real photos for Men/Women/Kids tiles and Eye care cards | Client |
| Branch picker for Call / WhatsApp (proposal) | Client to approve |
| Search behaviour | Developer: decided 2026-11-09, `Requirements_Search.md` (results page, sprint 5.6 part B) |
| Utility bar on mobile | Decided 2026-10-23: a shortened strip ("Since 1999 · Open 7 days, 9 AM–9:30 PM") as in the mockup; calls and booking move to the sticky bar |

Answered on 2026-10-09: opening time (9:00 AM–9:30 PM), separate numbers per branch (9550685417 = Indresham), "Since 1999" shown prominently.

## 11. Search engines (sprint 5.6 part C, added 2026-11-09)

Not in the original plan; added in sprint 5.6 so search engines find every page the menus lead to.

- **`/sitemap.xml`:** the public pages (Home, About, Frames, Sunglasses, Lenses, Eye care, Book an eye test, Eye camps, Gallery, Contact, Privacy), every live frame and pair of sunglasses, and every visible eye camp. Never the staff area, search results, not-found pages or photo addresses. It updates with the pages: a staff save that changes the catalogue or camps changes it too.
- **`/robots.txt`:** keeps crawlers out of `/admin` and `/api/`, and gives the sitemap's address. Search results stay crawlable so their `noindex` is seen.
- **Share images:** a frame's share image is its first photo (`Requirements_Frames.md`). Every other page shares one site-wide image in the brand colours with the name "VS Lens Mart" and "Since 1999" in the heading font. It has no logo until the new logo is approved (`DUMMY` D8).
- Both use the site's address, `DUMMY` D4 until the domain is bought; `npm run check:launch` already lists it.
