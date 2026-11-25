# Requirements: Gallery

Status: Approved by the client 2026-10-21 (mockups reviewed together on Google Meet; changes applied).
Route: `/gallery`
Plan version: v1.2 (pages table: "Shop, eye camp and customer photos with tag filters; linked from About | gallery_photos"; sprint 5.5)
Sources: `docs/client-answers.md` (feature list; form Q144 who provides photos, Q146 permission for customer photos), `docs/requirements/Requirements_About.md` 3.7 (the gallery preview links here), `docs/requirements/Requirements_Navigation.md` (Gallery is linked from About and the footer, not the top menu), `CLAUDE.md` (photos of people only with written consent), `docs/dummy-data.md`

**Dummy values:** where the client hasn't answered, mockups and development use the `DUMMY` values from `docs/dummy-data.md`, visibly tagged. They never go live. "TODO (client)" means the real value is still needed before launch.

**Consent rule:** a photo that shows a customer, staff member or camp visitor goes live only if that person gave written permission. Staff confirm this in admin when uploading. Customer photos stay off the site until the client confirms they can publish them (Q146 "Will confirm later").

## 1. Purpose

Show the real shop, its people and its community work, so visitors trust it before they visit. It's a simple photo page: browse by tag, open a photo larger. Staff add photos in admin.

## 2. Photo data (`gallery_photos`, managed in admin)

| Field | Shown | Notes |
|---|---|---|
| Image | Grid + large view | Resized for the web on upload (thumbnail and large) |
| Tag | Filter chip | One of: **Shop** · **Frames on display** · **Eye camps** · **Team** · **Customers** · **Celebrations**. `DUMMY` C20 list. **TODO (client):** confirm the tags |
| Caption | Large view, alt text | Short, e.g. "The frame wall at Indresham". Required, because it also becomes the alt text |
| Branch | Large view | Indresham / Patelguda / both / none |
| Date | Large view | Month and year |
| Shows people? + consent confirmed | Never shown | Upload is blocked unless consent is ticked when people are shown |
| Visible, order | Never shown | Hidden photos never appear; newest first by default |

- Eye camp photos stay in `camp_photos` on each camp page. Staff can also add a few to the gallery under the **Eye camps** tag.

## 3. Page layout

| # | Section | Content |
|---|---|---|
| 1 | Page hero | Short navy hero. Breadcrumb Home › About › Gallery; eyebrow "GALLERY"; `h1` "Inside *VS Lens Mart.*"; subtext "Our shops, our team and our eye camps, since 1999." |
| 2 | Tag chips | All · Shop · Frames on display · Eye camps · Team · Customers · Celebrations, each with a count. Only tags that have photos appear. The selection is kept in the URL (`?tag=eye-camps`) |
| 3 | Photo grid | 3 columns on desktop, 2 on phones. The first photo of the current filter is larger (2×2). 24 photos at a time, then "Load more" |
| 4 | Large view | A dialog with the photo, caption, branch and date, "n of m", previous / next (arrow keys, swipe), and close (Esc). Focus returns to the photo that was opened |
| 5 | Consent note | "Photos of people are shared with their permission. Want a photo removed? Ask us on WhatsApp." (branch picker, prefilled) |
| 6 | Call to action | Gold band: "See it for yourself." with "Find a branch" and "Book an eye test" |

**Empty states:**

| Case | Shows |
|---|---|
| No photos at all | "Photos coming soon. Visit us at Indresham or Patelguda." with branch links |
| A tag has no photos | Not offered as a chip |

## 4. Behaviour and accessibility

- **Grid tiles:** each tile is a button labelled with its caption. In the grid, images are lazy-loaded and keep their aspect ratio, so the page doesn't jump while loading.
- **Large view:** a native `<dialog>` (focus trap and Esc built in), the same behaviour as the camp gallery. Both pages use one shared script.
- **Tag chips:** `aria-pressed`, at least 44 px, and the count is announced when it changes.
- **Animation:** tiles fade in; nothing animates with reduced motion.
- **Light / dark mode:** shared colour roles.
- **SEO:**
  - Title: "Gallery | VS Lens Mart, Indresham and Patelguda".
  - Every image has alt text from its caption.

## 5. Acceptance criteria

Done when:

1. `/gallery` shows only visible photos, newest first, with the shared navigation and footer. About's "View the gallery" link and the footer link both open it.
2. **Tag chips:**
   - They filter the grid and show counts.
   - `?tag=` in the URL selects a tag, and invalid tags are ignored.
   - Tags without photos aren't shown.
3. **Large view:**
   - It opens from any tile and shows caption, branch, date and "n of m".
   - Previous and next work with buttons, arrow keys and swipe, staying within the current tag.
   - Esc closes it, and focus returns to the tile.
4. "Load more" adds 24 photos at a time.
5. **Consent:** the consent note and the "ask to remove" WhatsApp link are present, and no photo of people appears without recorded consent (an admin upload check).
6. **Live site:** no `DUMMY` photos, and no customer photos until the client confirms permission (Q146).
7. **Mobile (360 px):** a 2-column grid, swipe works in the large view, there's no horizontal scroll, and content isn't hidden by the sticky bar.
8. Light and dark mode both read clearly, and nothing animates with reduced motion.

## 6. Open items

| Item | Owner | Mockup uses |
|---|---|---|
| Photos of shop, team, frames and camps (Q144 blank) | Client | `DUMMY` C20 placeholders |
| Permission to publish customer photos (Q146 "Will confirm later") | Client | "Customers" tag with placeholders, tagged |
| Gallery tags | Client | `DUMMY` C20 list |
| Who uploads gallery photos | Client | Staff, in admin |

## 7. Build notes (sprint 5.5 part C, 2026-10-24)

- **Photos come only from the staff area** (`/admin/gallery`); the seed adds none, so a fresh install shows "Photos coming soon".
- **Upload:** up to 10 photos at a time, each resized in the browser. Each needs a tag and a caption (also its alt text), with the branch and month taken optional. "Shows people" needs the permission tick: the form, the server and the database (`gallery_photos_consent`) each refuse it otherwise.
- **Customers tag:** blocked until the client confirms permission to publish customer photos (Q146). The staff form doesn't offer it, the server refuses it, and the public page leaves out any photo with that tag. One setting turns it on: `CUSTOMER_PHOTOS_ALLOWED` in `src/lib/gallery-rules.ts`.
- **Order:** newest first by the month taken, then by when it was added. Manual ordering isn't built (not needed yet).
- **Staff list:** every photo with its thumbnail, tag, branch and month, an "On the site" switch, and admin-only Delete (the file goes too). Editing a caption means deleting and re-adding for now.
- **Large view:** the shared photo viewer from the camp pages; previous and next stay within the selected tag.
- **Tags in the address** use the label's dashed form (`?tag=eye-camps`, `?tag=frames-on-display`).
