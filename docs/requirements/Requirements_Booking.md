# Requirements: Book an eye test

Status: Approved by the client 2026-10-21 (mockups reviewed together on Google Meet; changes applied).
Route: `/book-eye-test`
Plan version: v1.2 (pages table: "Branch, date, time slot, name, phone, consent | appointments table"; sprint 5.4)
Sources:
- `docs/client-answers.md`: form Q75–82 (appointments), Q52 (customer data), Q90 (hours), Q139 (retention)
- `CLAUDE.md` ("Data security")
- `ROADMAP.md`: sprint 5.4, "Call or WhatsApp to reschedule"; online cancel is a later module
- `docs/requirements/Requirements_HomePage.md` 3.12 (the band hands over `?branch=&date=`)
- `docs/dummy-data.md`

**Dummy values:** where the client hasn't answered, mockups and development use the `DUMMY` values from `docs/dummy-data.md`, visibly tagged. They never go live. "TODO (client)" means the real value is still needed before launch.

**Security first:** this is the site's first form with personal data. It follows `CLAUDE.md` exactly:
- The public form may **insert** into `appointments` but never read it.
- Server-side validation (Zod) in a server action.
- A consent checkbox (DPDP Act 2023) and a link to `/privacy`.
- No secrets in the browser.

Build it in Plan Mode with high effort (sprint 5.4).

## 1. Purpose

Let a customer book an eye test at either branch in under a minute on a phone, then confirm it on WhatsApp. Staff see bookings in the admin panel (`Requirements_Admin.md`). There's no customer account, no online payment and no online cancellation in the MVP.

## 2. The form: 3 short steps on one page

Steps sit on one page, not separate pages, so nothing is lost on a slow phone connection. Each step stays visible once completed, with an "Edit" link.

### Step 1 · Branch and day

| Field | Type | Rules |
|---|---|---|
| Branch | Two large radio cards: Indresham / Patelguda (address and hours on each) | Required |
| Date | A row of the next 14 days as chips ("Today", "Tomorrow", "Sat 17 Oct"…), plus "Pick another date" (date input) | Required. From today up to 30 days ahead (`DUMMY` C18) |

- **Prefill:** `?branch=patelguda&date=2026-10-20` from the home page band pre-selects both. Invalid values are ignored.

### Step 2 · Time

- **Slots:** 20-minute slots from 9:00 AM to 9:00 PM, the last start 30 minutes before closing (9:30 PM, Q90). Shown as chips grouped Morning / Afternoon / Evening.
- **Limits:**
  - Slots less than **2 hours** from now are not offered (Q80 blank → `DUMMY`).
  - Slots that are **full** are shown disabled with "Full". Capacity is 2 bookings per slot per branch (Q76–78 "Not sure" → `DUMMY` C18).
- **Closed days:** none (open 7 days). Holidays such as Diwali day come from admin (Q91, `DUMMY` D3); on a closed day all slots show "Closed".
- **Availability check:** availability is fetched **as counts only** (slot → booked/capacity) from a server function. The browser never receives other customers' names, numbers or bookings.

### Step 3 · Your details

| Field | Type | Rules |
|---|---|---|
| Full name | Text | Required, 2–60 characters |
| Mobile number | Tel, `+91` prefix shown | Required. 10-digit Indian mobile (starts 6–9). Used for the booking only |
| Who is the test for? | Radio: Myself / Someone else (e.g. my child or parent) | Optional, default Myself |
| Anything we should know? | Textarea | Optional, max 300 characters, e.g. "I wear glasses for reading" |
| Consent | Checkbox, unticked | **Required:** "I agree that VS Lens Mart may use my name and number to manage this booking and contact me about it. [Privacy policy]" |
| (Hidden) | Honeypot field + submit-time check | Spam protection; no CAPTCHA |

- **Data minimisation:** no age, email or prescription on this form, even though Q52 lists them for customer records. Those belong to the store management system (later phase), collected in store.
- **Area or address (optional, client change 2026-10-21):** one optional text field, max 150 characters, shown to staff on the booking in `/admin`. It's never required, the consent text names it ("name, number and address (if given)"), and it's deleted with the booking after the retention period (`DUMMY` D9).
- **Submit button:** "Confirm booking". It shows a spinner and is disabled while sending.

## 3. Validation and errors

- **Client side** (instant, for convenience): required fields and phone format. Errors appear under each field and in an error summary at the top that links to each field.
- **Server side** (the real check, Zod in the server action): every field is validated again.
  - The date and slot must be in the allowed window, not full and not closed. The capacity check and the insert happen in one transaction, so two people can't take the last place.
  - The consent value is stored with a timestamp.
- **Error states:**

| Case | Message |
|---|---|
| Slot filled meanwhile | "Sorry, 4:20 PM just filled up. Please pick another time." (back to step 2, chosen day kept) |
| Server or network error | "We couldn't save your booking. Please try again, or call the branch." with Call / WhatsApp for the chosen branch. Entered details stay filled in |
| Too many attempts | "Please wait a minute and try again." (rate limit per device and IP) |

## 4. Confirmation (same page, after success)

- **Heading:** "You're booked!"
- **Summary:** branch, day, time, name, the last 4 digits of the number, and a booking reference (random, e.g. `VS-7K3M`; never a running number).
- **Primary: "Send to the branch on WhatsApp".** This opens `wa.me/<branch number>` with a prefilled message: "Hi VS Lens Mart, I've booked an eye test at Indresham on Sat 17 Oct at 4:20 PM. Ref VS-7K3M. Name: …".
  - This is the MVP's WhatsApp confirmation (Q81), sent by the customer; automatic messages come later.
  - In mockups the dummy Patelguda number never dials.
- **Secondary:** "Add to calendar" (an `.ics` download made in the browser from the details just entered).
- **Change or cancel:** "Need to change or cancel? Call or WhatsApp the branch." (Q79; online changes are a later module.)
- **Note:** "The eye test takes 5–20 minutes. Please bring your current glasses." (Q75). "Free" only tagged `DUMMY` (D7).
- **Data rule:** the confirmation shows only what the customer just submitted, plus the reference returned by the insert. It never reads the appointments table, so refreshing the page doesn't show the booking again.

## 5. Page layout

- **Header:** breadcrumb Home › Book an eye test; `h1` "Book your eye test"; one line: "Takes a minute. Pick a branch, a day and a time."
- **Desktop:** the form on the left (about 60%); a sticky summary card on the right showing the choices so far (branch, day, time), with branch hours and "Prefer to call?" Call / WhatsApp.
- **Mobile:** one column. The summary collapses into a bar above the submit button, and the sticky Call / WhatsApp / Book bar is hidden on this page (it would duplicate the form).

## 6. Data and security (`appointments`)

| Column | Notes |
|---|---|
| id | UUID |
| reference | Random short code shown to the customer |
| branch_id, date, slot_start | Required |
| name, phone | Required |
| for_whom, note | Optional |
| consent_at | Timestamp; required |
| status | `booked` → `attended` / `no_show` / `cancelled` (set by staff) |
| created_at | |

- **Row-level security:** anonymous users can **insert only**. No select, update or delete. Staff (admin and staff roles) can read and update.
- **Availability:** a server function returns counts per slot for one branch and day, with no personal data.
- **Retention:** deleted after the period on `/privacy` (`DUMMY` D9: 1 year).
- **No secrets:** the browser never connects to the database; the booking is saved by a server action running with the public role (insert only).

## 7. Behaviour and accessibility

- **Groups:** every group is a `<fieldset>` with a `<legend>`, so branch, day and time are proper radio groups operable with the keyboard (arrow keys).
- **Labels:** visible labels on every field (no placeholder-only labels), `autocomplete="name"` and `tel`, and `inputmode="numeric"` for the phone.
- **Errors:** announced (`aria-live`), and focus moves to the error summary on a failed submit.
- **Touch:** all chips and buttons are at least 44 px.
- **Motion and theme:** nothing animates with reduced motion, and light/dark mode use the shared colour roles.
- **SEO:**
  - Title: "Book an eye test | VS Lens Mart, Indresham and Patelguda".
  - The confirmation state is not indexed.

## 8. Acceptance criteria

Done when:

1. **Booking flow:** a customer can book on a 360 px phone in three steps, and sees the confirmation with a random reference.
2. **Prefill:** `?branch=` and `?date=` from the home page are applied, and invalid values are ignored.
3. **Slot rules:**
   - Only slots within opening hours, at least 2 hours ahead, and up to 30 days out are offered.
   - Full and closed slots can't be picked.
4. **Validation:** a missing name, a bad number or unticked consent block the submission with clear messages, both in the browser and on the server.
5. **Security:**
   - A logged-out request can insert an appointment, but **cannot read** any appointment (tested in Playwright and in SQL).
   - The availability call returns counts only.
6. **Race condition:** two simultaneous bookings for the last place: one succeeds, the other gets "just filled up".
7. **WhatsApp:** "Send to the branch on WhatsApp" opens the chosen branch's number with the full prefilled message.
8. **Change or cancel:** the confirmation tells the customer to call or WhatsApp; there's no online cancel in the MVP.
9. **Consent:** stored with a timestamp, and the privacy link works.
10. **Live site:** no `DUMMY` values (slot capacity, notice, window, "Free"); everything is keyboard-accessible, readable in light and dark mode, and has no console errors.

## 9. Open items

| Item | Owner | Mockup uses |
|---|---|---|
| Appointments per hour and per slot (Q76, Q78) | Client | `DUMMY` C18: 20-min slots, 2 per slot |
| Prevent double booking? (Q77) | Client | Yes, by capacity |
| Minimum notice (Q80) | Client | `DUMMY` 2 hours |
| How far ahead people can book | Client | `DUMMY` 30 days |
| Holidays per branch (Q91) | Client | `DUMMY` D3 |
| Walk-ins welcome too? | Client | "Booking means less waiting" |
| Is the eye test free? | Client | `DUMMY` D7 |
| Who at the shop checks new bookings, and how often? (Q82 "Both") | Client | Admin bookings list |

## 10. Build notes (sprint 5.4 part A, 2026-10-24)

Decisions made while building. They don't change what the customer sees.

- **Rules in one place:** `src/lib/booking-rules.ts` holds the DUMMY C18 numbers, the slot rules and the form checks, used by both the browser and the server action. "Today" and "now" are always India time.
- **Last place:** the server takes a short lock on the branch, day and time before counting and saving, so two people can't take the last place (tested with two real connections at once).
- **The public role never reads a booking back.** The reference is made on the server and returned without reading the table; slot availability comes from `slot_counts()`, which has only times and counts.
- **Spam and abuse:** a hidden field and a 3-second minimum fill time get a convincing "You're booked!" that saves nothing; there's also a per-minute limit. The limit tells visitors apart only once `TRUSTED_IP_HEADER` is set at deployment (as for staff sign-in); until then everyone shares one, more generous limit.
- **Days are shown once the page has loaded,** because the page is pre-rendered and "today" must be the visitor's day in India, not the build day.
- **The address field** is shown on this form (client change 2026-10-21) and named in the consent text.
- "Free eye test" is shown with the `DUMMY` D7 tag until the client confirms; `check:launch` lists D7 and C18.

