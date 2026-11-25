# Requirements: Privacy policy

Status: Approved by the client 2026-10-21 (mockups reviewed together on Google Meet; changes applied). Next: legal review of the wording before launch.
Route: `/privacy` (linked from the footer and from the consent box on every form)
Plan version: v1.2 (routes list; `CLAUDE.md` "Data security": "The site needs a `/privacy` page"; sprint 5.4)
Sources:
- `CLAUDE.md` ("Data security": consent checkbox on every form with a name and phone, DPDP Act 2023, retention `DUMMY`)
- `ROADMAP.md`: sprint 5.4; Google Analytics is later and "needs a consent banner and a privacy policy update first"
- `docs/client-answers.md`: form Q136–142 (data and privacy), Q146 (customer photos), Q155 (analytics)
- `docs/open-questions.md` (retention, correction/deletion requests)
- What the site actually collects: `Requirements_Booking.md` section 6, `Requirements_Contact.md` section 5, `Requirements_Frames.md` (favourites on the device), `Requirements_Gallery.md` (consent rule), `Requirements_Admin.md` (who can see the data)
- `docs/dummy-data.md` D1, D9

**Dummy values:** where the client hasn't answered, mockups and development use the `DUMMY` values from `docs/dummy-data.md`, visibly tagged. They never go live. "TODO (client)" means the real value is still needed before launch.

**Not legal advice:** this file describes what the page says and how it's built. The final wording must be checked by someone qualified in Indian data-protection law before launch (open item). The page must never claim more than the site actually does.

## 1. Purpose

Tell customers, in plain English, what the website collects, why, who can see it, how long it's kept and how to ask for it to be corrected or deleted. It backs up the consent box on the booking and contact forms (DPDP Act 2023) and builds trust: a family shop that's careful with people's details.

## 2. Principles the page and the site must follow

- **Say only what's true.** Every item in section 4 matches a real field in the database or a real browser storage key. A new form field or tracking tool means updating this page **before** it goes live.
- **Collect little.** The website asks only for a name, a mobile number and what's needed for the booking or message. No accounts, no online payments, no prescriptions, no email address.
- **Plain words.** Short sentences, no legal jargon where a plain word works, and a short "In short" summary at the top.
- **Easy to act on.** Every right in section 4.6 has a clear way to use it: WhatsApp, call, email or visit a branch.

## 3. Page layout

| # | Section | Content |
|---|---|---|
| 1 | Page hero | Short navy hero. Breadcrumb Home › Privacy; eyebrow "PRIVACY"; `h1` "Your details, *looked after.*"; "Last updated: [date]" |
| 2 | In short | A highlighted box with 5 points: we only ask for your name and number when you book or write to us · we use them only to reply or manage your booking · only our staff can see them · we delete them after 1 year `DUMMY` (D9) · ask us any time to see, correct or delete them |
| 3 | Contents | Links to each section. A sticky side list on desktop; a collapsible "On this page" on phones |
| 4 | Policy sections | Section 4 below, each with an anchor (`#collect`, `#use`, `#share`, `#keep`, `#rights`, …) |
| 5 | Contact card | "Questions about your details?" with WhatsApp (branch picker, prefilled "Hi VS Lens Mart, I have a question about my details on your website."), Call, the email (`DUMMY` D1), and both branch addresses |

No gold call-to-action band: this page shouldn't sell.

## 4. Policy content (plain-English draft)

### 4.1 Who we are (`#who`)
VS Lens Mart, an optical shop with branches in Indresham and Patelguda (addresses from `site-config.ts`). We decide how the details collected on this website are used. **TODO (client):** the legal owner's name (person or firm) as it should appear.

### 4.2 What we collect, and why (`#collect`)

| When | What we collect | Why |
|---|---|---|
| You book an eye test | Name, mobile number, branch, date and time, who the test is for, your optional note, the time you agreed | To hold your slot and contact you about it |
| You send a message on the contact page | Name, mobile number, branch, topic, your message, how you'd like us to reply, the frame code if you came from a frame, the time you agreed | To reply to you |
| You message or call us on WhatsApp or phone | What you choose to send us | To reply. WhatsApp is run by Meta under its own terms |
| You save favourites or choose light / dark mode | Nothing is sent to us. They're saved only in your own browser (`vslm-favourites`, `vslm-theme`) | So the site remembers your choices on that device |
| You use virtual try-on (Phase 6, `#tryon`; only once try-on is switched on) | Nothing is sent to us. Your photo is processed in your own browser and kept only until you close the tab or tap "Remove my photo" (`vslm-tryon`). Images you save or share are yours | So you can see frames on your face |
| Photos of people in our gallery or eye-camp pages | Only with that person's written permission | To show our shop and our community work |

**We don't collect:** passwords or accounts (customers don't log in), payment details, prescriptions, your email address, or your location. There's no advertising and no visitor tracking on the site today.

### 4.3 How we use it (`#use`)
Only for the reason it was given: to manage your booking or answer your message. We don't sell it, use it for advertising or send marketing messages. If we ever want to send reminders or offers, we'll ask first.

### 4.4 Who can see it, and who helps us (`#share`)
- **Our staff:** only signed-in VS Lens Mart staff can see bookings and messages, in our staff area.
- **Service providers** that run the website for us and store the data on our behalf: our website hosting provider, which also runs the database (DigitalOcean is the likely choice). **TODO (developer):** name the provider and where the data is stored once deployment is decided.
- **Google Maps:** the maps on our contact page are provided by Google and load only when you scroll to them or tap "Show map". Google may then set its own cookies.
- We share details with anyone else only if the law requires it.

### 4.5 How long we keep it (`#keep`)
Booking and enquiry details are deleted **1 year** after they're made `DUMMY` (D9). This is done automatically. **TODO (client):** confirm the period (Q139 blank, Q63 "for a limited period").

### 4.6 Your rights (`#rights`)
Under the Digital Personal Data Protection Act, 2023, you can ask us to:
- tell you what details we hold about you;
- correct or complete them;
- delete them;
- stop using them (withdraw your consent). This doesn't affect anything we did before you asked.
You can also name someone to act for you if you can't.

**How:** WhatsApp or call either branch, email us (`DUMMY` D1), or visit a branch. We'll reply within **30 days** `DUMMY` (C23). If you're not happy with our answer, you can complain to the Data Protection Board of India.

### 4.7 Children (`#children`)
Parents or guardians can book an eye test for a child using their own name and number. Please don't send us a child's details through the website beyond what's needed for the booking.

### 4.8 Keeping it safe (`#security`)
The site uses a secure connection (HTTPS). The public forms can only **add** a booking or message; nobody outside our staff can read them back. Staff sign in to see them, and access is removed when someone leaves.

### 4.9 Changes (`#changes`)
If this policy changes, we'll update this page and the "Last updated" date. Big changes (for example, adding visitor analytics) will be shown on the site before they happen.

### 4.10 Contact (`#contact`)
Person to contact about your details: **[Name / role]** `DUMMY` (C23: "The shop owner"). Reach them through the contact card below.

## 5. Behaviour and accessibility

- **Readable:** body text at least 16 px, lines at most about 70 characters, real headings (`h2` per section) so screen readers can jump between them.
- **Contents:** plain anchor links; the current section is highlighted while scrolling on desktop (no animation with reduced motion). `main [id] { scroll-margin-top }` keeps headings clear of the sticky header.
- **Print:** a print style without the header, sticky bar or contact buttons.
- **Light / dark mode:** the shared colour roles.
- **SEO:** title "Privacy policy | VS Lens Mart"; indexed (customers search for it); no structured data needed.
- **Sticky bar:** stays on this page.

## 6. Build notes (not shown on the page)

- **Fonts:** load Inter and Plus Jakarta Sans with `next/font`, which serves them from our own site, so no visitor request goes to Google Fonts. (The mockups still use Google Fonts.)
- **Maps:** the Google Maps embed must stay lazy (scroll or tap), as section 4.4 says.
- **Retention job:** a scheduled database job deletes `appointments` and `enquiries` older than the period in 4.5. The number lives in one setting, shown on this page from the same value.
- **Consent record:** `consent_at` on every booking and enquiry (already in the Booking and Contact requirements).
- **Analytics (later, Q155):** only after a consent banner exists and this page is updated (`ROADMAP.md`).

## 7. Acceptance criteria

Done when:

1. `/privacy` is linked from the footer on every page and from the consent box on the booking and contact forms, and each link opens the page.
2. **Matches reality:** every field stored by the booking and contact forms, and every browser storage key the site uses, is listed in 4.2; nothing listed there is missing from the site.
3. **Rights:** each right in 4.6 has a working contact route (WhatsApp, call, email, visit), and the contact card's buttons go to the right branch.
4. **Retention:** the period shown matches the automatic deletion job's setting.
5. **No third-party requests on load** other than what 4.4 lists (Google Maps only after scroll or tap); fonts are self-hosted on the live site.
6. Contents links work on a 360 px phone and with the keyboard; the page reads clearly in light and dark mode; no horizontal scroll.
7. **Live site:** no `DUMMY` values (retention, response time, contact person, email), and the wording has been checked by a qualified person (open item).

## 8. Open items

| Item | Owner | Mockup uses |
|---|---|---|
| Legal review of the wording against the DPDP Act and its Rules | Client (qualified adviser) | Plain-English draft, marked for review |
| Legal owner's name for "Who we are" | Client | "VS Lens Mart" |
| Retention period (Q139 blank, Q63) | Client | `DUMMY` D9: 1 year |
| Correction / deletion requests (Q140 "Not sure") | Client | Offered, as the Act requires; reply in 30 days `DUMMY` C23 |
| Person to contact about personal data | Client | `DUMMY` C23: "The shop owner" |
| Enquiry email | Client | `DUMMY` D1 |
| Who can see customer data (Q136 blank) | Client | Signed-in staff only (`Requirements_Admin.md`) |
| Hosting provider and data location | Developer | TODO note |
| Google Analytics (Q155) | Later | Not on the site; page says so |

## 9. Build notes (sprint 5.4 part C, 2026-10-24)

- **Matches reality:** "What we collect" now names the optional **area or address** on both forms (client change 2026-10-21), which the mockup's table didn't. A test checks that the page names every stored field and browser key.
- **Retention:** one setting, `RETENTION_DAYS` in `src/lib/site-config.ts` (`DUMMY` D9, 365). The page's wording ("1 year") is worked out from it, and `purge_expired()` in the database uses the same number. It runs after each booking or message and whenever staff open the Bookings or Enquiries list, so nothing older stays around while the site is in use. It refuses a period under 30 days. At deployment, also run it daily from the host's scheduler.
- **Hosting provider:** still a TODO for the developer (named once deployment is decided); the page says "our website hosting provider".
- **No third-party requests on load:** fonts are served by the site itself (`next/font`), there's no tracking, and Google Maps loads only on the contact page when scrolled to. Tested.
- **Contents:** always open beside the text on desktop; a collapsed "On this page" on phones that closes after a tap; the section being read is marked.
- **Placeholders:** D1 (email), D9 (retention), C23 (contact person, 30-day reply, legal owner's name) are tagged in development and listed by `check:launch`. The wording still needs the client's legal review before launch.
