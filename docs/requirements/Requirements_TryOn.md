# Requirements: Virtual try-on

Status: **Draft, 2026-11-09.** The developer approved the plan; the client has not yet seen a try-on screen. A mockup of the customer screens goes to the client before the 6.1 customer UI is built.
Routes: no new page. Try-on opens as a panel on `/frames/[slug]` and `/sunglasses/[slug]` (and from `?tryon=1` on those addresses), and as a switch on `/frames` and `/sunglasses`. Staff work on the existing frame form (`/admin/frames/new`, `/admin/frames/[id]`).
Phase: 6, after launch (`ROADMAP.md` section 8). Built behind a site switch that is off by default, so it never holds up the launch.
Sources: `docs/client-answers.md` form Q9 (Virtual Try-On listed as a CTA), Q40–50 (try-on), Q32–37 (frame photos, staff upload, approval); `ROADMAP.md` section 8; `Requirements_Frames.md`, `Requirements_Admin.md`, `Requirements_Privacy.md`; the developer's working prototype (`vto image/index.html`, outside the repo, 2026-11-09).

**Dummy values:** sample try-on pictures for the seed frames are `DUMMY` C25 (`docs/dummy-data.md`), development only. Real try-on pictures come from the client's own front-view frame photos.

## 1. Purpose

Let a customer see a frame on their own face before visiting, on any device and without installing an app, then share the look on WhatsApp or come in to try the real frame. It supports the shop's main goal (enquire on WhatsApp or visit a branch); it is a preview, not a fitting.

What the client asked for:

| # | Question | Answer | How this module meets it |
|---|---|---|---|
| 40 | What do you expect from try-on? | Not sure | This document is the proposal; confirm with the client (section 12) |
| 41 | Without installing an app? | Yes | Runs in the browser |
| 42 | Devices | Android, iPhone, desktop, tablet, other | Section 9 |
| 43 | Switch frames while the camera stays open? | Not sure | Photo mode (6.1) switches frames on the same photo; camera mode is 6.5 |
| 44 | Compare two or more frames? | Yes | Hold to compare (with / without) in 6.1; two looks side by side in 6.3 |
| 45 | Take a photo after trying? | Yes | "Save image" in 6.1 |
| 46 | Share the result on WhatsApp? | Yes | 6.3, section 4.5 |
| 47 | Every frame or selected frames? | Selected frames only | A per-frame "Try-on" switch set by staff (section 6) |
| 48 | Should the try-on work with? | Both | Read as "photo and live camera": photo first (6.1), camera later (6.5). **TODO (client):** confirm what "Both" meant |
| 49 | QR code on a physical frame opens it in try-on? | Yes | 6.4, section 7 |
| 50 | In-store TV / large screen? | Not sure | Not planned; the pages work on a large screen in a browser |

## 2. Releases

| Release | Scope |
|---|---|
| 6.1 | Staff try-on switch and picture clean-up; the try-on panel on frame detail pages (upload a photo, sliders, hold to compare, save image) |
| 6.2 | "See frames on you" switch on the listings |
| 6.3 | Share the result (WhatsApp through the phone's share sheet) and compare two looks |
| 6.4 | A printable QR code per frame. Needs the real domain (Q156) |
| 6.5 | Live camera |

## 3. Site switch

- `TRYON_ENABLED` (environment variable, read on the server). Off by default, and off on the launch build until the client approves try-on.
- When off: no try-on button, switch, panel, QR link handling or model download anywhere; `?tryon=1` is ignored; the staff form still shows the try-on fields so frames can be prepared in advance, with a note "Try-on is not switched on for the website yet."

## 4. Customer flow

### 4.1 Where it starts

- **Frame detail:** a "Try it on" button in the actions, only for a live frame with try-on on (section 6). It sits with the secondary actions, below "Enquire on WhatsApp", which stays the primary action.
- **Listings (6.2):** a "See frames on you" switch above the results, only when at least one listed frame has try-on.
- **QR (6.4):** `/frames/<slug>?tryon=1` (or `/sunglasses/...`) opens the detail page with the panel open.
- **Not on Home, the hero or the menu.** The hero keeps its two buttons. Adding a try-on entry anywhere else is a client decision.

### 4.2 The try-on panel

A dialog over the detail page (full screen on phones):

1. **Notice, before any photo:** "Your photo stays on this device. It isn't uploaded or saved by VS Lens Mart." with a link to `/privacy#tryon`.
2. **Choose a photo:** "Take a selfie" (opens the camera app on phones) and "Choose a photo". Tips: face the camera, glasses off, good light.
3. **Detecting:** the face models download the first time (progress shown; several MB, measured in 6.1, then cached by the browser). Messages for: no face found, more than one face (uses the largest and says so), photo too small, models failed to load (with "Try again").
4. **Result:** the frame drawn on the photo, lined up with the eyes and tilted with the head.
5. **Controls:** Size, Up / down and Tilt sliders, and Reset. "Hold to compare" shows the photo without the frame while pressed.
6. **Other frames:** a strip of other try-on frames of the same kind (frames or sunglasses), so the customer can switch without uploading again.
7. **Actions:** "Save image" (6.1), "Share" (6.3), "Enquire on WhatsApp" about this frame (same branch picker and message as the detail page), "Use another photo", "Remove my photo".
8. **Preview note:** "Preview only. Size and fit may look different in person. Try it on at a branch." No medical or fitting claims.

### 4.3 Keeping the photo between pages

- After detection, a downscaled copy of the photo (longest side at most 1024 px, JPEG) and the detected points are kept in `sessionStorage` (`vslm-tryon`), so the listing (6.2) and other frames can use them without a new upload.
- `sessionStorage` is cleared by the browser when the tab closes. "Remove my photo" clears it at once, on every page that shows the photo.
- Nothing is kept in `localStorage`, cookies, IndexedDB or on the server.

### 4.4 Saved image

- A JPEG of the photo with the frame, plus a small strip at the bottom: "VS Lens Mart", the brand and model, and the frame's web address. No price, so a shared image never shows an old price.
- File name: `vs-lens-mart-<frame-code>.jpg`.

### 4.5 Share (6.3)

- A `wa.me` link can't carry an image. On phones and tablets that support sharing files, "Share" opens the device's share sheet with the image and the text "<brand> <model> at VS Lens Mart: <link>"; the customer picks WhatsApp and the contact.
- Elsewhere (most desktops): the image is saved, then `https://wa.me/?text=<same text>` opens, and a note says "Attach the saved image in WhatsApp."
- Like the detail page's share, it never sends to the shop's number by default.

### 4.6 Compare (6.3)

- "Save this look" keeps up to 4 looks (frame + slider values, not extra copies of the photo) for this tab.
- "Compare" shows two looks side by side (stacked on phones), each with the frame name and a link to its page.

## 5. Listing "on you" (6.2)

- After a photo is set up (from any try-on panel, or from the switch's own "Add a photo" step), turning the switch on replaces the card photo of each try-on frame with the customer wearing it. Frames without try-on keep their normal photo and get no label.
- Face detection is never repeated per card: each card only draws the frame picture onto the stored photo, cropped to the eyes, and only when the card scrolls into view.
- The switch state lives in the address bar (`?onme=1`) like the other listing filters, but does nothing for someone who has no photo stored, so a shared link never shows another person's face.
- Filters, sort, Saved and "Load more" work as before. "Remove my photo" turns the switch off.

## 6. Staff: try-on picture (6.1)

On the frame form, a new "Try-on" section:

| Field | Notes |
|---|---|
| Try-on on / off | Off by default. Can't be turned on without a try-on picture |
| Front-view photo | One photo of the frame straight from the front, arms folded or open, on a plain white background. Separate from the 5 product photos |
| Clean-up | Done in the staff member's browser before upload: background removal with a strength slider; left and right trim sliders to cut off the arm tips; a crop to the frame |
| Lens line | The staff member drags a marker to the height of the lens centres; the left and right lens centres are found from the cleaned picture and can be adjusted |
| Preview | The cleaned picture on a sample face (`DUMMY` C25 sample until a consented staff photo is provided), with the same drawing as the customer panel |

- Only the cleaned, see-through PNG is uploaded, through `src/lib/storage.ts` and the existing upload checks. The server also checks that it is a PNG with transparency. The server never edits images.
- Guidance on screen: "Plain white background, frame straight from the front, no reflections on the lenses, nothing else in the photo."
- **Approval:** follows the frame rules. On a new frame it goes live with the frame's approval. On an approved frame, turning try-on on or changing the picture goes live straight away, like other edits (`DUMMY` C22 decision, which the client still has to confirm).
- The frames list gets a "Try-on" filter and a small badge, so staff can see which frames have it.

## 7. QR codes (6.4)

- On the frame's admin page: "Print QR" makes a printable label with the QR code (to `/<frames|sunglasses>/<slug>?tryon=1`), the frame code, brand and model.
- Only for frames with try-on on, and only once the site has its real domain (Q156). Before that the button explains why it's unavailable.
- Label size and printing (stickers, tags, a stand card) to agree with the client.

## 8. Data and security

- **New columns on `frames`:** `tryon_enabled` (boolean, default false), `tryon_path` (text), and the lens centres in the picture as fractions of its width and height. A database check: `tryon_enabled` requires `tryon_path`.
- The existing `frames` row-level security covers them; no new table.
- **Picture file:** `frames/<frame id>/tryon-<random>.png`. `/media` serves it only when the frame is live (approved, active) and try-on is on; staff can see it while editing.
- **Customer photos never reach the server.** Detection and drawing run in the browser. No analytics or error reports include the photo or the detected points.
- **Models:** MediaPipe Face Landmarker (decision 2026-11-09: one library for photo now and live camera later). Its code, WebAssembly files and model are installed from npm or copied into `public/tryon/`, never loaded from a CDN or Google's servers.
- **Privacy page:** a new `#tryon` section (section 10, acceptance 8).

## 9. Devices and performance

- Android (Chrome), iPhone and iPad (Safari), desktop (Chrome, Edge, Safari, Firefox), at 360, 768 and 1440 px. Uses the graphics card where possible and falls back to the processor.
- Nothing try-on related loads until the customer opens the panel or the listing switch: Lighthouse scores and page weight for `/frames` and frame detail stay as they were at launch.
- A photo is detected in under 3 s on a mid-range phone once the models are cached.
- 6.2: scrolling stays smooth with 24 cards drawn; each card is drawn once and reused.

## 10. Accessibility

- The panel is a native `<dialog>`: focus moves in and returns to "Try it on"; Esc closes.
- Sliders have visible labels and values and work with arrow keys.
- "Hold to compare" also works by holding Space; a "Show without frame" toggle is offered for anyone who can't hold a button.
- The result image has alt text: "Your photo wearing the <brand> <model>".
- Status messages (loading, no face found) are announced.
- No animation with reduced motion; the frame appears without a fade.
- Light and dark mode through the shared colour roles.

## 11. Acceptance criteria

Done when:

1. With `TRYON_ENABLED` off, no page shows anything about try-on and no model file is requested.
2. With it on, "Try it on" appears only on live frames with try-on on; a frame without it shows no try-on button.
3. Staff can upload a front-view photo on a phone at 360 px, clean it, set the lens line, preview it and save; try-on can't be turned on without a picture; the database refuses `tryon_enabled` without `tryon_path`.
4. A customer can choose a photo, see the frame on their face, use the sliders, hold to compare and save the image, on Android, iPhone and desktop.
5. **Privacy:** during try-on, no request carries the photo or the face points (checked in the tests' network log); "Remove my photo" clears `vslm-tryon`; closing the tab clears it.
6. The try-on picture of a draft, hidden or try-on-off frame is not served by `/media` to the public.
7. (6.2) With a photo set, the listing switch shows try-on frames on the customer's face, other frames unchanged; a link with `?onme=1` opened without a photo shows the normal listing.
8. `/privacy` explains try-on (photo stays on the device, nothing saved by the shop).
9. (6.3) Share opens the share sheet with the image on a phone, and the save-then-WhatsApp fallback on desktop.
10. (6.4) A printed QR opens the frame with the panel open.
11. Playwright tests at 360, 768 and 1440 px, with no console errors; detection tests use a test photo of a person who agreed to it, kept out of git.
12. **Live site:** no `DUMMY` C25 pictures; real front-view photos only.

## 12. Open items

| Item | Owner | Until then |
|---|---|---|
| What the client expects from try-on (Q40 "Not sure"); show them the try-on mockup | Client | This document |
| "Both" in Q48: photo and live camera? | Client | Photo first, camera in 6.5 |
| Which frames get try-on, and who takes the front-view photos | Client | Staff choose; the client photographs frames (Q32, Q33) |
| Switching frames with the camera open (Q43), in-store screen (Q50) | Client | Decided before 6.5 |
| QR label size and where it goes on the frame | Client | 6.4 |
| Domain for the QR codes (Q156) | Client | 6.4 waits |
| Does turning try-on on for an approved frame need approval? | Client | `DUMMY` C22: no |
| Sample face for the staff preview and the tests | Developer | `DUMMY` C25; a consented staff photo later |
