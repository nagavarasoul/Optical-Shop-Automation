# Open Questions for the Client

Last updated 2026-10-09, after the Google Form response of 2026-10-07 and the prescription card (`Q` numbers refer to the questionnaire in `docs/client-answers.md`).

Everything still open here has a placeholder in `docs/dummy-data.md`, so work can continue. These questions still need real answers before launch.

## 1. Original questions: status

| Question | Status | Notes |
|---|---|---|
| Customer enquiry email address | Pending | Not covered by the form. |
| White menu bar in light mode? | **To confirm** | Developer proposal 2026-10-23: the main menu bar is white with navy text in light mode (navy in dark mode, utility strip stays navy). The client approved a navy bar on 2026-10-21. Show both and ask. **Lighthouse, 2026-11-09:** on the white bar the gold "VS" in the logo has a contrast of 1.58 to 1 (readable text needs 4.5), so it fails the accessibility check; on the signed-off navy bar it passes. A point for the navy bar. |
| Small brass labels on cream (light mode) | **To confirm** | Lighthouse, 2026-11-09: brand names on frame cards and section eyebrows in Brass `#C9A227` on Cream `#FAF6EE` have a contrast of 2.24 to 1 (readable text needs 4.5). They are the signed-off colours, so they were left as they are. Options: a darker brass for small text in light mode (a new token), or navy-secondary `#1E3A5F` for these labels. Needs the client's agreement to a colour change. |
| Shop, staff, frame and eye camp photos | Pending | Client will photograph and upload frames (Q32, Q33). Who provides shop/staff photos is blank (Q144); hero photo or video "Not sure" (Q11). Until a real hero photo arrives (with everyone's consent), the homepage hero has no photo; the category tiles and welcome photo also wait for photos. |
| Founding story and founder details (1999) | Pending | Not covered by the form. |
| "Vision of 25 years" vs 27 years (or "Since 1999") | **Partly answered** | "Since 1999" prominent: Yes (Q12). Highlight the 25/27 years: "Not sure" (Q13). Keep computing years in code. |
| Opening time: 9:00 AM or 9:30 AM? | **Answered** | 9:00 AM–9:30 PM, both branches (Q90), matching the WhatsApp answer. Holidays the same for both branches: "Not sure" (Q91). |
| Is the phone/WhatsApp number the same for both branches? | **Answered: no, but number missing** | Separate numbers per branch (Q87, Q96). 9550685417 is Indresham (prescription card). The Patelguda number is still missing. WhatsApp Business not set up yet, "Planning to create one" (Q83). |
| Lens brands to list | Pending | Still only "All branded". |
| Sample prescription card | **Answered** | `docs/prescription_card.jpg`; fields in `docs/dummy-data.md` section 1. It has no PD field (see section 2). |
| Is the eye test free? | Pending | Not covered by the form. Eye test takes 5–20 min (Q75). |
| Logo: final version and spelling | Pending | On 2026-10-21 the client asked for a new logo; mockups use the placeholder (`DUMMY` D8). No high-res PNG/SVG of the old one exists (Q2), and the old `docs/logo.png` (removed from the repository 2026-11-25; still in git history) spells "FAMLY". On 2026-10-23 five SVG concepts were drawn for the client to choose from (`mockups/logo-concepts.html`). Open: which one (or the client's own file), and who gives the final approval. |
| Domain name | **Answered: none** | No domain yet (Q156). Who buys it and pays for hosting/APIs is blank (Q158, Q159). |

## 2. Contradictions in the form answers

| Topic | Answers | Ask |
|---|---|---|
| Editing prescriptions | Staff can modify prescriptions: Yes (Q107). Prescription editable after submission: Only Admin (Q64). | Can staff edit a prescription, or only admin? |
| Editing orders | Staff can "Manage orders" (Q105). Staff can modify orders: Only Admin (Q108). | Can staff create orders but not change them? |
| Staff reports and inventory | Staff can "View reports" and "Manage inventory" (Q105). Sales reports / inventory access: "Not sure" (Q109, Q110). | What exactly can staff see? |
| Google reviews | Show Google reviews: Yes (Q152). No Google Business Profile for either branch (Q150, Q151). | Profiles must be created (and get reviews) first. Help set them up? |
| WhatsApp contact | Contact the shop directly on WhatsApp: "Not sure" (Q84). WhatsApp as the primary CTA: Yes (Q154). | Confirm WhatsApp is the main button. |
| Low stock | Low stock = "Below 100" (Q117), with about 300 frames in total (Q18). | Per frame model, or total stock? 100 of one model seems unlikely. |
| Record retention | Prescriptions kept "For a limited period" (Q63). Retention period blank (Q139). | How long? Needed for the privacy policy (DPDP Act). |
| Branch 1 address | WhatsApp: "party block - B". Form: "part block - B" (Q88). | **Resolved:** the prescription card says "Part". |
| PD (pupillary distance) | Always used, all fields (Q58). The prescription card has no PD field. | Is PD recorded, and where? |

## 3. Scope decisions (developer, 2026-10-09)

Decided by the developer and applied to `CLAUDE.md`, `ROADMAP.md` and `Requirements_Navigation.md`. **Tell the client** about each decision; they can still ask for changes.

| Request | Form | Decision |
|---|---|---|
| **Store management system**: customer registration, prescriptions, orders, inventory, billing, reports, 5+ staff accounts, audit log | Q51–74, Q102–135 | **Later phase**, a second project (`ROADMAP.md` section 7). Must not delay the website. |
| **Customer accounts**: login, own history, update details, online order status | Q54–56, Q72 | **Later**, part of the store management system. |
| **Automated WhatsApp messages** | Q81–85 | **Later**, part of the store management system; needs WhatsApp Business and an API provider. `wa.me` links work now with a normal number. |
| **Admin approval before a frame goes live** | Q37 | **MVP.** Frames go draft → approved. |
| **Admin vs staff roles** | Q103–110, Q137 | **MVP: two roles** (needed for approval). 5+ accounts and the audit log come later. |
| **Sold-out label** | Q24, Q39, Q115 | **MVP.** Availability field separate from `is_active`. |
| **Frame fields and filters** | Q20, Q27, Q29, Q30 | **MVP.** Client's fields and filters; no rim-type filter unless asked. WhatsApp share and enquiry. |
| **Same frame at both branches** | Q25, Q113 | **MVP, simple:** "Available at: Indresham / Patelguda / both". Stock counts later. |
| **Favourites** | Q28 | **MVP**, saved on the device only, no login. |
| **Separate number per branch** | Q87, Q96 | **MVP.** Both numbers in `site-config.ts`; Call/WhatsApp open a branch picker (proposal for client review). |
| **Social links** | Q153 | **MVP**, in the footer (`DUMMY` URLs until provided). |
| **Services** | Q92 | **MVP.** Eye care lists the 4 services; contact lenses, reading glasses and care products are removed from the menu until confirmed. |
| **Homepage CTAs incl. Virtual Try-On** | Q9 | Two hero buttons; WhatsApp us / Visit store as quick cards; **no Try-on button** until try-on exists. |
| **Brand feel** | Q4, Q7 | Tone is now "trusted family shop, premium quality at affordable prices". |
| **Model-wearing photos** | Q35 | Only real staff or customers with written consent; product-only photos until then. |
| **Cancel / reschedule appointments** | Q79 | **MVP:** "Call or WhatsApp to reschedule". Online cancellation later. |
| **Google reviews** | Q150–152 | Manual testimonials for now. **Recommend the client creates a Google Business Profile** (helps local search). |
| **Google Analytics** | Q155 | **Later**; needs a consent banner and a privacy policy update first. |
| **Data retention** | Q63, Q139, Q140 | `DUMMY` period on `/privacy` (`docs/dummy-data.md` D9; store-system records X7); client to confirm. |
| **Virtual try-on details** | Q40–50 | **Phase 6, after launch** (decision 2026-11-09; `ROADMAP.md` section 8, `Requirements_TryOn.md`). Photo try-on on selected frames, listing "on you", WhatsApp share, QR codes, then live camera. Never holds up the launch. |
| **Eye camp details**: number of participants; registration "Not sure" | Q99, Q100 | Fits 5.5; record in `Requirements_EyeCamps.md`. |

## 4. Still unanswered

Blank in the form:
- **Homepage:** main headline (Q8), what goes above the fold (Q10).
- **Branch holidays:** which days is each branch closed (festivals, holidays), and are they the same for both branches? (Q91, "Not sure"). Until then the seed has one placeholder closed day, Diwali (`DUMMY` D3); the admin adds the real days at `/admin/holidays`.
- **Branches:** which frames are at which branch (Q93); branch picker or branch pages, "Not sure" (Q94, Q95).
- **Eye camps:** who organises them and how often (Q97, Q98).
- **Staff:** who is the administrator (Q102); audit log (Q111, Q112, Q141); what happens when staff leave (Q142).
- **Inventory:** current system and problems (Q121, Q125–128).
- **Data:** who can see customer data (Q136), retention (Q139), correction/deletion requests (Q140).
- **Content:** who writes the text, provides photos and testimonials (Q143–145); permission to publish customer photos, "Will confirm later" (Q146).
- **Google/social:** search keywords (Q149); the actual YouTube, Facebook and Instagram links (Q153).
- **Domain and maintenance:** who owns the accounts, who pays, maintenance expectations (Q158–160).
- **Virtual try-on (Phase 6):** what the client expects (Q40 "Not sure"), shown with a try-on mockup; what "Both" means in Q48 (photo and live camera?); which frames get try-on and who photographs them from the front; switching frames with the camera open (Q43) and an in-store screen (Q50); QR label size and placement; the domain for the QR codes (Q156).

"Other" was ticked without details in Q35, Q85, Q100, Q104, Q105, Q131 and Q153. Ask what each "Other" means.
