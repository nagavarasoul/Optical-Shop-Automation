# Requirements: Eye Camps (listing and camp detail)

Status: Approved by the client 2026-10-21 (mockups reviewed together on Google Meet; changes applied).
Routes: `/eye-camps` (listing) and `/eye-camps/[slug]` (one camp)
Plan version: v1.2 (pages table: "Upcoming and past camps, camp detail pages with photos | eye_camps + camp_photos"; sprint 5.5)
Sources:
- `docs/client-answers.md`: feature list "Eye camps section, upcoming and past, managed by the admin"; form Q16, Q97–101, Q146
- `docs/requirements/Requirements_Navigation.md` ("Eye camps" is a top-level link)
- `docs/requirements/Requirements_HomePage.md` 3.8 and `Requirements_About.md` 3.9 (they link here)
- `docs/dummy-data.md`
- `CLAUDE.md`

**Dummy values:** where the client hasn't answered, mockups and development use the `DUMMY` values from `docs/dummy-data.md`, visibly tagged. They never go live. "TODO (client)" means the real value is still needed before launch.

## 1. Purpose

Show the shop's community work: when and where the next free camp is, and a lasting record of past camps with photos and how many people were checked. It builds trust ("we give back") and brings people to the camps and the shop. Staff add and update camps in admin.

**Registration (Q99 "Not sure"):** no sign-up form in the MVP. Camps are walk-in. People can ask questions on WhatsApp. This also avoids collecting personal data for camps. If the client wants registration later, it becomes a small form like the booking page.

## 2. Camp data (`eye_camps` + `camp_photos`, managed in admin)

From Q100: Photos, Description, Location, Date, Number of participants, Other.

| Field | Shown | Notes |
|---|---|---|
| Title | Everywhere | e.g. "Free Eye Camp, Patelguda" |
| Slug | URL | From title + date |
| Date, start and end time | Everywhere | Upcoming or past is worked out from the date automatically |
| Location name and address | Everywhere | Plus a Google Maps link |
| Organised with | Detail | Optional partner, e.g. a school or residents' association (Q97 blank → `DUMMY`) |
| Description | Detail, short version on cards | Plain text |
| What's offered | Detail (upcoming) | Short list entered by staff, e.g. "Vision check", "Advice on glasses". No medical promises |
| Number of participants | Past camps | Entered by staff after the camp (Q100) |
| Photos | Past camps (up to 12), cover on cards | `camp_photos`. Photos with people only with permission (Q146 "Will confirm later") |
| Visible | Never | Hidden camps never appear |

- **Past camps stay visible permanently** (Q101). There's no auto-delete.

## 3. Listing page `/eye-camps`

| # | Section | Content |
|---|---|---|
| 1 | Page hero | Short navy hero. Breadcrumb Home › Eye camps; eyebrow "IN THE COMMUNITY"; `h1` "Free eye camps, *close to home.*"; subtext "Since 1999 we've taken eye checks to schools, villages and neighbourhoods around Indresham and Patelguda." with a "{n} camps · {people} people checked" stat line totalled from past camps |
| 2 | Next camp | The nearest upcoming camp as a large card: date block (day, month), title, time, place, a short description, "What's offered" tags. Buttons: **Directions** (Maps), **Add to calendar** (`.ics`), **Share on WhatsApp** (`wa.me/?text=`, the customer picks the contact), "Details →" |
| 3 | More upcoming | Other upcoming camps as compact rows (date, title, place, Details →). Hidden if none |
| 4 | Past camps | Grid of cards: cover photo, date, title, place, "{n} people checked". Year chips (All · 2026 · 2025 · …) filter it, and the filter is kept in the URL (`?year=2025`). Newest first, 9 at a time with "Load more" |
| 5 | Bring a camp to your community | Band: "Run a school, society or village group? We can bring an eye camp to you." with **Ask on WhatsApp** (branch picker, prefilled "Hi VS Lens Mart, we'd like to organise an eye camp at …") |
| 6 | Call to action | Gold band: "Can't wait for the next camp?" with "Book an eye test" |

**Empty states:**

| Case | Shows |
|---|---|
| No upcoming camp | Section 2 becomes: "No camps scheduled right now. Ask us on WhatsApp, or see our past camps below." |
| No past camps | Section 4 is hidden |
| No camps at all | Hero, the "Bring a camp" band and the CTA only |
| Year with no camps | Not offered (chips come from the data) |

## 4. Camp detail `/eye-camps/[slug]`

- **Layout:** breadcrumb Home › Eye camps › title; a status badge, **Upcoming** (gold) or **Past**; `h1` title; a facts row (date, time, place, organised with).
- **Upcoming camp:**
  - the description and "What's offered";
  - "What to bring" (`DUMMY` C19: "Your current glasses, if you have them");
  - a map placeholder with **Directions**, **Add to calendar** and **Share on WhatsApp**;
  - "Questions? Ask on WhatsApp".
- **Past camp:**
  - the description and "{n} people checked";
  - a **photo gallery** (up to 12, a grid that opens a larger view with previous/next and Esc to close);
  - "Thank you" text.
- **Both:** "More camps", up to 3 others (upcoming first).
- **Missing camp** (wrong slug, or hidden): "This camp isn't available" with a link to `/eye-camps`.
- **SEO:**
  - Title: "{title}, {date} | VS Lens Mart eye camps".
  - Upcoming camps get `Event` structured data (date, location, free entry only if confirmed).

## 5. Behaviour and accessibility

- **Dates:** written in full (e.g. "Sun, 15 Nov 2026"), with a `<time datetime>` element. "Upcoming" or "Past" is decided by the date, so camps move to Past on their own.
- **Year chips:** `aria-pressed`, at least 44 px.
- **Gallery:** each photo is a button with alt text. The large view is a dialog: it traps focus, closes with Esc and returns focus to the photo, and supports arrow keys and swipe on phones.
- **Animation:** cards fade in on scroll; none with reduced motion.
- **Light / dark mode:** shared colour roles.

## 6. Acceptance criteria

Done when:

1. `/eye-camps` shows the nearest upcoming camp, then other upcoming camps, then past camps newest first, with the shared navigation ("Eye camps" highlighted) and footer.
2. A camp moves from upcoming to past automatically after its date.
3. **Next camp:** Directions, Add to calendar (a valid `.ics`) and Share on WhatsApp (prefilled with title, date, place and link) all work.
4. **Past camps:**
   - Year chips filter them and the URL keeps the year.
   - "Load more" adds 9 at a time.
   - The stat line totals camps and people.
5. **Camp detail:**
   - Upcoming camps show what's offered, what to bring and the actions.
   - Past camps show participants and a keyboard-accessible photo gallery.
   - An unknown slug shows the not-available state.
6. The home page and About links (`/eye-camps`, `/eye-camps/free-eye-camp-patelguda`) open the right pages.
7. **Live site:**
   - No `DUMMY` camps.
   - No photos of people without permission.
   - No medical promises.
   - No registration form (until the client asks for one).
8. **Mobile (360 px):** a single column, the gallery usable by swipe, no horizontal scroll, and content not hidden by the sticky bar.
9. Light and dark mode both read clearly, and nothing animates with reduced motion.

## 7. Open items

| Item | Owner | Mockup uses |
|---|---|---|
| Who organises camps, and with whom (Q97) | Client | `DUMMY` "VS Lens Mart with local groups" |
| How often camps run (Q98) | Client | `DUMMY`: about monthly |
| Real past camps: dates, places, participants, photos | Client | `DUMMY` C19 |
| Registration for camps (Q99 "Not sure") | Client | None; walk-in + WhatsApp |
| Permission to publish photos with people (Q146) | Client | Placeholders only |
| Is every camp free? | Client | "Free" in `DUMMY` titles only |
| What "Other" means in Q100 | Client | — |

## 8. Build notes (sprint 5.5 part B, 2026-10-24)

- **Upcoming or past** is decided in India time: a camp is upcoming on its own day and past from the next day. The listing is cached for at most an hour, so a camp moves to "Past" within the hour after midnight.
- **Addresses:** a new camp's address is made from its title and date (`free-eye-camp-patelguda-2026-11-15`) and never changes afterwards, so shared links keep working. The seed's camps keep their mockup addresses.
- **Next camp actions:** Directions searches Google Maps for the place; Add to calendar is a calendar file made on the page (no server round trip); Share on WhatsApp lets the customer pick the contact.
- **Upcoming camp page:** the mockup's map placeholder is replaced by a short "walk in on the day, no need to register" note (Q99), with Directions in the actions.
- **Photos:** the shared photo viewer (also used by the gallery) opens from each photo, moves with buttons, arrow keys or a swipe, closes with Esc and gives focus back. A photo of people needs the permission tick: the staff form, the server and the database (`camp_photos_consent`) each refuse it otherwise.
- **Staff (`/admin/eye-camps`):** Upcoming / Past, past camps missing a count or photos flagged; the form from `admin-camps.html`. "After the camp" opens once the entered date has passed, so an old camp can also be recorded. Staff hide; only an admin deletes (photo files too).
- **Placeholders:** what's offered and what to bring are `DUMMY` C19 (now in the register, so `check:launch` lists them).
