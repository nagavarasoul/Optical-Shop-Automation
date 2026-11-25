# Requirements: Eye Care

Status: Approved by the client 2026-10-21 (mockups reviewed together on Google Meet; changes applied).
Route: `/eye-care`
Plan version: v1.2 (pages table: "The client's 4 services, eye care tips, FAQ, links to booking, branches and eye camps"; sprint 5.5)
Sources: `docs/client-answers.md` (form Q75 eye-test length, Q92 services, Q131 payment methods; WhatsApp Q11 lenses), `docs/requirements/Requirements_Navigation.md` (Eye care menu: services column + three cards), `docs/dummy-data.md`, `CLAUDE.md`, `CLAUDE.local.md` ("no medical claims")

**Dummy values:** where the client hasn't answered, mockups and development use the `DUMMY` values from `docs/dummy-data.md`, visibly tagged. They never go live. "TODO (client)" means the real value is still needed before launch.

**Health content rule:** this page gives general information, not medical advice. Every tip, symptom list and FAQ answer that goes beyond the client's confirmed facts is `DUMMY` copy (C17) and must be **reviewed and approved by the shop's optometrist** before launch. Nothing diagnoses, promises a cure, or replaces seeing a doctor.

## 1. Purpose

Show the shop's four services clearly, explain what happens at an eye test, answer common questions, and lead to the main action: **book an eye test** (or ask on WhatsApp).

## 2. Section order

| # | Section | Anchor | Content status |
|---|---|---|---|
| 1 | Page hero | | Copy by developer |
| 2 | Our services (4) | `#eye-testing`, `#lens-fitting`, `#frame-adjustment`, `#frame-repair` | Confirmed (Q92) |
| 3 | What happens at your eye test | `#eye-test` | General steps; `DUMMY` C17 for review |
| 4 | When to get your eyes checked | `#when` | `DUMMY` C17, optometrist review |
| 5 | Eye care tips | `#tips` | `DUMMY` C17, optometrist review |
| 6 | FAQ | `#faq` | Confirmed answers + `DUMMY`/TODO where unknown |
| 7 | Quick links: Book · Branches · Eye camps | | Static (same three as the mega menu cards) |
| 8 | Call to action | | Static |

The navigation (Eye care highlighted) and footer are shared.

## 3. Section details

### 3.1 Page hero

- **Layout:** the shorter navy page hero.
  - Breadcrumb: Home › Eye care.
  - Eyebrow: "EYE CARE".
  - `h1`: "Eye care for the *whole family.*"
  - Subtext: "Eye testing, instant lens fitting, frame adjustment and repair, at both our branches, 7 days a week."
- **Buttons:** "Book an eye test" (primary) and "Ask on WhatsApp" (outline, branch picker).
- **Photo:** test room placeholder (TODO (client)).

### 3.2 Our services

Four blocks, each with an anchor that the mega menu links to:

| Service | Anchor | Text | Facts used |
|---|---|---|---|
| Eye testing | `#eye-testing` | "A careful eye test takes 5–20 minutes. We check your distance and near vision and explain your prescription." "Free eye test" only with a `DUMMY` tag (D7). Button: "Book an eye test" | Q75, Q92, prescription card (distance / near) |
| Instant lens fitting | `#lens-fitting` | "Spherical powers fitted while you wait. For other powers we'll tell you when your glasses will be ready." Link: "See lenses →" | Q92 |
| Frame adjustment | `#frame-adjustment` | "Glasses slipping or pressing? We adjust them for a comfortable fit." | Q92 |
| Frame repair | `#frame-repair` | "Loose screws, nose pads and hinges fixed." Charges: **TODO (client)**; until then, "Ask us about your frame." | Q92 |

- Every block says "At both branches".
- No prices are shown for services unless the client confirms them.

### 3.3 What happens at your eye test `#eye-test`

Four numbered steps (the same step style as Lenses):
1. We ask about your eyes, your work and any glasses you use now.
2. We check your vision for distance and near.
3. We explain your prescription in plain words.
4. We help you choose lenses and frames, with exact prices.

Note: "Bring your current glasses and any old prescription." `DUMMY` C17, for optometrist review.

### 3.4 When to get your eyes checked `#when`

- A short list of common reasons, such as:
  - blurred distance or reading vision
  - headaches after reading or screen work
  - squinting
  - it's been a while since your last test
  - a child holding books very close
- This is `DUMMY` C17 copy for optometrist review.
- **Safety note, always shown:** "Sudden loss of vision, eye pain, flashes of light or an eye injury? See a doctor or hospital straight away."

### 3.5 Eye care tips `#tips`

- 4–6 short tip cards with an icon and 1–2 lines each, for example:
  - take regular breaks from screens
  - good light for reading
  - wear sunglasses in bright sun
  - keep your glasses clean
  - regular check-ups for children and older family members
- All `DUMMY` C17 for optometrist review. No product promotion inside tips.

### 3.6 FAQ `#faq`

An accordion (`<details>`/`<summary>`). Each answer is confirmed, `DUMMY` or TODO as marked:

| Question | Answer | Status |
|---|---|---|
| How long does an eye test take? | Usually 5 to 20 minutes. | Confirmed (Q75) |
| Is the eye test free? | "Yes, free at both branches." | `DUMMY` (D7) |
| Do I need an appointment? | "Booking a time means less waiting. You can book online or on WhatsApp." | Walk-ins: TODO (client) |
| How soon can I get my glasses? | "Spherical powers are fitted while you wait. For other powers we'll tell you the date when you order." | Confirmed (Q92) |
| Which lens brands do you have? | "All branded lenses are available. See the lenses page." | Confirmed (WhatsApp Q11) |
| Can you repair my frame? | "Yes, at both branches: screws, nose pads, hinges and adjustments." | Confirmed; charges TODO (client) |
| How can I pay? | "Cash or UPI." | Confirmed (Q131; "Other" still to clarify) |
| Can I use a prescription from another doctor? | "Bring it with you; we'll check it." | TODO (client) |

- Questions stay closed by default, and more than one can be open at a time.
- The answers are plain text (they'll be FAQ structured data on the live site).

### 3.7 Quick links

The same three photo cards as the Eye care mega menu: **Book an eye test** → `/book-eye-test`, **Our branches** → `/contact#branches`, **Eye camps** → `/eye-camps`.

### 3.8 Call to action

A gold band: "Book your eye test today." with "Book an eye test" and "Ask on WhatsApp".

## 4. Behaviour and accessibility

- **Headings:** one `h1`; every section has an `h2`; services and FAQ questions are properly nested.
- **FAQ:** native `<details>`/`<summary>`, which works with a keyboard and screen readers with no script. Each summary is at least 44 px tall.
- **Anchors:** the service anchors and `#faq` land below the sticky header (shared `scroll-margin-top`). Mega-menu links (`/eye-care#lens-fitting` etc.) open the right section.
- **Disclaimer:** shown near the tips and FAQ: "General information only, not medical advice."
- **Animation:** sections fade in on scroll; nothing animates with reduced motion.
- **Light / dark mode:** shared colour roles.
- **SEO:**
  - Title: "Eye care and eye testing | VS Lens Mart, Indresham and Patelguda".
  - `FAQPage` structured data, using confirmed answers only.

## 5. Acceptance criteria

Done when:

1. The sections appear in the order in section 2, with the shared navigation (Eye care highlighted) and footer.
2. **Services:** all four appear, each with its anchor, and the mega-menu service links land on the right one, visible below the header.
3. **Eye test:** the 5–20 minute length appears, and "Free" appears only tagged `DUMMY` (never live until confirmed).
4. **Safety note:** the "see a doctor straight away" note is always visible in the "When to get your eyes checked" section.
5. **FAQ:** opens and closes with mouse, touch and keyboard, and every unconfirmed answer is tagged.
6. **Quick links and CTA:** go to `/book-eye-test`, `/contact#branches` and `/eye-camps`, and WhatsApp opens the branch picker.
7. **Live site:** no `DUMMY` copy; health content is approved by the optometrist; there are no medical promises or diagnoses, and no service prices unless confirmed.
8. **Mobile (360 px):** a single column, the FAQ readable, no horizontal scroll, and content not hidden by the sticky bar.
9. Light and dark mode both read clearly, and nothing animates with reduced motion.

## 6. Open items

| Item | Owner | Mockup uses |
|---|---|---|
| Is the eye test free? | Client | `DUMMY` D7 "Free" |
| Walk-ins welcome, or appointment only? | Client | TODO |
| Frame repair and adjustment charges | Client | "Ask us" |
| Tips, "when to get checked" list, eye-test steps | Client's optometrist (review) | `DUMMY` C17 |
| Using another doctor's prescription | Client | TODO |
| Payment "Other" (Q131): card? | Client | "Cash or UPI" |
| Test-room photo | Client | Placeholder |

## 7. Build notes (sprint 5.5 part D, 2026-10-24)

- **Placeholders:** the eye-test steps, the "when to get checked" list and the tips are tagged `DUMMY` C17 in development (now in the register, so `check:launch` lists it until the shop's optometrist approves them). "Free" is tagged D7 and comes from `EYE_TEST_FREE`.
- **FAQ data for search engines** includes only answers marked confirmed: how long a test takes, how soon glasses are ready, lens brands, frame repair, payment. "Is the eye test free?", "Do I need an appointment?" and "another doctor's prescription" stay on the page but out of the data until the client confirms them. A test checks this.
- **The safety note** ("Sudden loss of vision… see a doctor or hospital straight away") is fixed text, always shown.
- **Quick links** use icon placeholders until the client sends photos (no stock photos).
