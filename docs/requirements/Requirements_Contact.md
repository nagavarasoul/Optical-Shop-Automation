# Requirements: Contact

Status: Approved by the client 2026-10-21 (mockups reviewed together on Google Meet; changes applied).
Route: `/contact` (anchor `#branches` for the branch section)
Plan version: v1.2 (pages table: "Both branches with maps, hours, phone, WhatsApp, enquiry form | branches, enquiries"; sprint 5.4)
Sources:
- `docs/client-answers.md`: WhatsApp answers 1–5 (name, addresses, phone, email, hours); feature list ("Branch locator with map, hours and phone", "Contact / enquiry form with WhatsApp and click-to-call"); form Q30 (enquire about a frame), Q131 (payment methods), Q83–87 (WhatsApp), Q88–92 (branches, hours, holidays, services), Q95 (separate branch pages), Q154 (WhatsApp is the primary CTA)
- `CLAUDE.md` ("Data security", shop facts from `site-config.ts`)
- `ROADMAP.md`: sprint 5.4 (enquiry form, both branches with maps and their own numbers, consent, privacy)
- `docs/requirements/Requirements_Booking.md` (same form rules, security and consent pattern)
- `docs/prescription_card.jpg` (Indresham address and number)
- `docs/dummy-data.md`

**Dummy values:** where the client hasn't answered, mockups and development use the `DUMMY` values from `docs/dummy-data.md`, visibly tagged. They never go live. "TODO (client)" means the real value is still needed before launch.

**Security:** the enquiry form follows the booking form exactly:
- The public form may **insert** into `enquiries` but never read it.
- Server-side validation (Zod) in a server action, a consent checkbox (DPDP Act 2023) and a link to `/privacy`.
- No secrets in the browser.

## 1. Purpose

Help a customer reach the right branch quickly: see where each shop is, when it's open and how to get there, then call, WhatsApp or send a short enquiry. WhatsApp is the main way to get in touch (Q154); the form is for people who prefer to write and wait for a reply. Many pages link here (`/contact#branches`): the home quick cards, Frames, Frame detail, Eye care and the utility bar.

## 2. Branch data (`branches` table, edited by the admin at `/admin/branches`; seeded from `site-config.ts`)

| Field | Indresham | Patelguda |
|---|---|---|
| Name | VS Lens Mart, Indresham | VS Lens Mart, Patelguda |
| Address | Plot No 30/Part Block-B, Survey No's 177, 178, 179, Citizens Colony, Indresham, Patancheruvu, Sangareddy (Q88, card) | Falcon One Shopping Plaza, near Rainbow Meadows, beside Apollo Pharmacy, Ellenki College, Patelguda (Q89) |
| Phone / WhatsApp | 9550685417 (card) | `DUMMY` D2 `+91 00000 00000`. **TODO (client)** |
| Hours | 9:00 AM–9:30 PM, Monday–Sunday (Q90) | Same |
| Holidays | `DUMMY` D3: open all year except Diwali day (Q91 "Not sure") | Same |
| Services | Eye testing, instant lens fitting for spherical powers, frame adjustment, frame repair (Q92) | Same |
| Map | Google Maps pin. **TODO (client):** the shop's Google Maps link or exact pin | Same |

- One `branches` row per branch, so footer, booking, contact and the branch picker all read the same facts.
- **No separate page per branch** for now (Q95 "Not sure"). Each branch gets its own anchor (`#indresham`, `#patelguda`) so links can point to one branch.

## 3. Page layout

| # | Section | Content |
|---|---|---|
| 1 | Page hero | Short navy hero. Breadcrumb Home › Contact; eyebrow "CONTACT"; `h1` "Visit us or *say hello.*"; subtext "Two branches, open 7 days, 9:00 AM–9:30 PM." |
| 2 | Quick actions | Three cards: **WhatsApp us** (branch picker, primary), **Call us** (branch picker), **Book an eye test** (`/book-eye-test`) |
| 3 | Our branches (`#branches`) | Two branch cards side by side (stacked on phones), see 3.1 |
| 4 | Send us a message | The enquiry form (section 4), with a short side note: "Faster on WhatsApp", and the email address `DUMMY` D1 |
| 5 | Small FAQ | 3–4 short answers: "Do I need an appointment?" (walk-ins welcome; booking means less waiting), "Can I get my frame repaired?" (Q92), "Do both branches have the same frames?" (some frames are at one branch only; ask before visiting), "How can I pay?" (Cash and UPI, Q131; whether "Other" means card is **TODO (client)**) |
| 6 | Call to action | Gold band: "Ready for an eye test?" with "Book an eye test" and "Explore our frames" |

### 3.1 Branch card

- Branch name, "Open now" / "Closed now · opens 9:00 AM" (from the hours, India time), full address.
- Hours line: "Mon–Sun · 9:00 AM–9:30 PM", plus the holiday note (`DUMMY` D3).
- Services as small tags (Q92).
- Buttons: **Directions** (Google Maps, opens in a new tab), **Call** (`tel:`), **WhatsApp** (`wa.me/<branch number>` with "Hi VS Lens Mart, I have a question for the Indresham branch."). The Patelguda buttons don't dial while D2 is a dummy.
- **Map:** a Google Maps embed under each card. It loads only when scrolled into view (or on tap, "Show map"), to keep the page fast on phones. Its iframe has a title ("Map of the Indresham branch").
- Landmark line for Patelguda: "Beside Apollo Pharmacy, near Ellenki College" (from Q89).

## 4. The enquiry form

| Field | Type | Rules |
|---|---|---|
| Name | Text | Required, 2–60 characters |
| Mobile number | Tel, `+91` prefix shown | Required. 10-digit Indian mobile (starts 6–9) |
| Area or address | Text | Optional, max 150 characters (client change 2026-10-21). Shown to staff on the enquiry in `/admin` |
| Branch | Radio: Indresham / Patelguda / Either | Required, default Either |
| Topic | Select: Frames · Sunglasses · Lenses · Eye test · Repair or adjustment · Something else | Required |
| Message | Textarea | Required, 10–500 characters, with a live character count |
| How should we reply? | Radio: WhatsApp / Phone call | Optional, default WhatsApp |
| Consent | Checkbox, unticked | **Required:** "I agree that VS Lens Mart may use my name, number and address (if given) to reply to this message. [Privacy policy]" |
| (Hidden) | Honeypot field + submit-time check | Spam protection; no CAPTCHA |

- **Prefill:** `?topic=frames&frame=VSF-1024` (for example from a frame page) pre-selects the topic and starts the message with "About frame VSF-1024: ". Invalid values are ignored. Frame detail's main button stays "Enquire on WhatsApp"; this is the fallback for people without WhatsApp.
- **No email field:** the shop replies by WhatsApp or phone. This keeps the data to name, number and an optional area.
- **Submit button:** "Send message". It shows a spinner and is disabled while sending.

### 4.1 Validation and errors

The same pattern as booking:
- **Client side:** errors under each field and an error summary at the top that links to each field.
- **Server side** (Zod in the server action): every field again; the consent value is stored with a timestamp; rate limit per device and IP.

| Case | Message |
|---|---|
| Server or network error | "We couldn't send your message. Please try again, or WhatsApp us." with the branch picker. Entered details stay filled in |
| Too many attempts | "Please wait a minute and try again." |

### 4.2 After sending (same page)

- **Heading:** "Thanks, we've got your message."
- **Text:** "We'll reply on WhatsApp within a day." (reply time `DUMMY` C21; the channel follows "How should we reply?").
- **Summary:** topic, branch, and the last 4 digits of the number. It shows only what was just submitted and never reads the `enquiries` table.
- **Buttons:** "Need it sooner? WhatsApp us" (branch picker, or the chosen branch) and "Back to frames".

### 4.3 Staff side

- New enquiries appear in the admin panel (`Requirements_Admin.md`) with status `new` → `replied` → `closed`.
- No automatic email or WhatsApp alert in the MVP; email alerts are a later module. **TODO (client):** who checks enquiries, and how often.

## 5. Data and security (`enquiries`)

| Column | Notes |
|---|---|
| id | UUID |
| name, phone | Required |
| branch | `indresham` / `patelguda` / `either` |
| topic, message | Required |
| frame_code | Optional, from the prefill |
| reply_by | `whatsapp` / `call` |
| consent_at | Timestamp; required |
| status | `new` → `replied` → `closed` (set by staff) |
| created_at | |

- **Row-level security:** anonymous users can **insert only**. No select, update or delete. Staff (admin and staff roles) can read and update; only admin deletes.
- **Retention:** deleted after the period on `/privacy` (`DUMMY` D9: 1 year).
- **Branches table:** public read, staff write.

## 6. Behaviour and accessibility

- **Contact links:** `tel:` and `wa.me` links have clear labels ("Call the Indresham branch"), not just icons.
- **Form:** visible labels, `<fieldset>` and `<legend>` for radio groups, `autocomplete="name"` and `tel`, `inputmode="numeric"` for the phone; errors announced (`aria-live`) and focus moves to the error summary on a failed submit.
- **Open now:** worked out in India time (IST), with a text label (not colour alone).
- **Touch:** all buttons and radios at least 44 px; the sticky Call / WhatsApp / Book bar stays on this page.
- **Motion and theme:** nothing animates with reduced motion; light/dark mode use the shared colour roles. Map embeds keep their normal colours in dark mode.
- **SEO:**
  - Title: "Contact | VS Lens Mart, Indresham and Patelguda".
  - `OpticianStore` (LocalBusiness) structured data for each branch: name, address, phone, opening hours. The Patelguda phone is left out while it's a dummy.
  - The "sent" state is not indexed.

## 7. Acceptance criteria

Done when:

1. **Branches:** `/contact#branches` scrolls to the two branch cards. Each shows the address, hours, services, open/closed status, and Directions, Call and WhatsApp for its **own** number, all read from `site-config.ts` / `branches`.
2. **Maps:** each map loads only when scrolled into view or tapped, and Directions opens the right place in Google Maps.
3. **Enquiry form:** a customer can send an enquiry on a 360 px phone and sees the thank-you state.
4. **Prefill:** `?topic=` and `?frame=` are applied; invalid values are ignored.
5. **Validation:** a missing name, a bad number, a too-short message or unticked consent block the submission with clear messages, both in the browser and on the server.
6. **Security:** a logged-out request can insert an enquiry but **cannot read** any (tested in Playwright and in SQL).
7. **Consent:** stored with a timestamp, and the privacy link works.
8. **Live site:** no `DUMMY` values (Patelguda number, email, holidays, reply time); keyboard-accessible, readable in light and dark mode, no horizontal scroll at 360 px and no console errors.

## 8. Open items

| Item | Owner | Mockup uses |
|---|---|---|
| Patelguda phone / WhatsApp number (Q87, Q96) | Client | `DUMMY` D2 |
| Enquiry email (answer 4 "We will update it shortly") | Client | `DUMMY` D1 |
| Holidays per branch (Q91 "Not sure") | Client | `DUMMY` D3 |
| Google Maps links / exact pins for both shops | Client | Map placeholders; Directions searches the address |
| How fast the shop replies to enquiries, and who checks them | Client | `DUMMY` C21: "within a day" |
| What "Other" payment means (Q131: Cash, UPI, Other) | Client | "Cash and UPI" only |
| Separate page per branch (Q95 "Not sure") | Client | One page with an anchor per branch |
| WhatsApp Business account (Q83 "Planning to create one") | Client | Normal `wa.me` links work without it |

## 9. Build notes (sprint 5.4 part B, 2026-10-24)

Decisions made while building. They don't change what the customer sees.

- **Maps:** a Google Maps embed that needs no API key (`maps.google.com/maps?q=<address>&output=embed`). It loads only when its card is scrolled near, or on "Show map", so no request goes to Google before then. "Directions" uses the branch's `map_url` when the admin sets one, otherwise a Google Maps search for the address. Exact pins are still a TODO for the client.
- **Open now / Closed now** is worked out in the visitor's browser in India time and refreshes every minute, because the page is pre-rendered. It's shown as text on a pill, not colour alone.
- **The holiday line** comes from the `branch_closures` table (the next closed day, for that branch or both), so it changes when the admin edits holidays. The seed's Diwali row is still `DUMMY` D3.
- **The enquiry form** uses the same checks, spam trap and per-minute limit as the booking form, and the public role can only add an enquiry.
- **Prefill:** `?topic=` accepts the dashed form (`eye-test`); `?frame=` accepts only a frame code in the staff form's format, and a message that's only the prefilled "About frame …:" isn't accepted.
- **Mobile number field:** up to 16 characters, so "+91 98765 43210" fits. The mockup's limit of 14 cut it off; the server keeps only the 10 digits.
- **Search engines:** `OpticianStore` data per branch from the `branches` table, with the Patelguda phone left out while it's a placeholder.
- **Placeholders:** the email (D1), the reply time (C21) and the holiday (D3) are tagged in development and listed by `check:launch`.

