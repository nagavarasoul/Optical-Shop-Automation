# Requirements: Search

Status: **Approved by the developer 2026-11-09; built in sprint 5.6 part B.** There is no mockup of the results page; it reuses the signed-off frame cards, lens cards and empty states, and is shown to the client at the next review.
Route: `/search?q=<words>`
Plan: `ROADMAP.md` sprint 5.6 ("basic search"), section 6 ("Basic search in 5.6"). Sources: `Requirements_Navigation.md` 4.3 (the Search icon: "site search across frames, sunglasses and lenses"), `Requirements_NotFound.md` (the 404 page's search form), `Requirements_Frames.md` and `Requirements_Lenses.md` (cards and fields).

## 1. Purpose

Let a customer who knows what they want (a brand, a model, a frame code from a tag in the shop, a colour or a lens type) find it in one step, without going through the menus and filters. It is a basic search: whole words, no suggestions while typing, no spelling correction.

## 2. Where it starts

- **Header:** the Search icon opens the panel that is already built (`nav.tsx`). Submitting it goes to `/search?q=...`.
- **404 page:** the search form on the not-found page (`Requirements_NotFound.md`) goes to the same address.
- **Results page:** its own search field at the top, filled with the current words, so the customer can change them.
- Nothing else links to `/search`, and it is not in the menu or the footer.

## 3. What is searched

Only what the public can already see: approved, active frames and sunglasses, and active lenses, read through the existing cached public lists (`getCatalogue`, `getLenses`). No new database query or table.

| Kind | Fields searched |
|---|---|
| Frames and sunglasses | Brand, model, frame code, category (Eyeglasses, Computer glasses, Sunglasses), gender, colour, shape, material; sunglasses also lens type and lens colour |
| Lenses | Brand, name, lens type (the names in `src/lib/lens-rules.ts`, e.g. Single vision, Progressive, Photochromic), features |

**Matching:**
- Case doesn't matter, and spaces, hyphens and dots inside a code don't either: "rb 5154", "RB5154" and "rb-5154" all find RB5154; "vsf0012" finds VSF-0012.
- Every word must match somewhere in the item ("black round" finds black round frames, not every black frame). A word matches the start of a word in the item, so "aviat" finds "Aviator".
- Small words that would match almost everything are ignored: "a", "an", "the", "for", "and", "with", "glasses", "frame", "frames", "specs". If only these are typed, the page asks for something more specific.
- The words are trimmed to 60 characters. They are never put into a database query (the lists are already loaded), never saved and never logged.

**Order:**
1. An exact frame code (the whole search is one code).
2. Items whose brand or model matches.
3. Everything else that matches.
Within each, the listing's normal order (in stock first, then newest).

## 4. Results page

| # | Part | Content |
|---|---|---|
| 1 | Page head | Short page head like the listings. Breadcrumb Home › Search; `h1` "Search results for “<words>”" (or "Search" when empty); the search field, filled in |
| 2 | Count | "<n> results" (announced politely to screen readers) |
| 3 | Frames | Heading "Frames (<n>)"; the same frame cards as `/frames` (photo, brand, model, price, "Sold out", heart); up to 24 |
| 4 | Sunglasses | The same, "Sunglasses (<n>)" |
| 5 | Lenses | "Lenses (<n>)"; the same lens cards as `/lenses`; each links to `/lenses?brand=<brand>&type=<type>` |
| 6 | Too many | When a group has more than 24: "Showing 24 of <n>. Add a word, such as a brand, colour or shape, to narrow it down." plus a link to the full listing |

- Groups with no results are left out. Groups appear in the order above.
- **Empty search** (`/search` or only small words): the search field, "Search by brand, model, frame code, colour or lens type.", and links to Frames, Sunglasses and Lenses.
- **No results:** "No results for “<words>”." with tips (check the spelling, use fewer words, try a brand or a frame code), links to Frames, Sunglasses and Lenses, and "Ask us on WhatsApp" (branch picker, prefilled "Hi VS Lens Mart, I'm looking for: <words>").
- The words are shown as text only, never as HTML.

## 5. Behaviour and accessibility

- **SEO:** title "Search: <words> | VS Lens Mart" (or "Search | VS Lens Mart"); `noindex`, because search result pages shouldn't appear in Google. Not in the sitemap.
- **Focus:** the search field is not focused automatically (it would open the phone keyboard), except when the page has no words yet on a desktop-size screen.
- **Loading:** the page reads the address at request time, so the results sit behind `<Suspense>` with a short "Searching…" fallback; the header and footer show at once.
- **Cards:** the same accessibility as the listings (labels, alt text, hearts with `aria-pressed`, 44 px targets).
- **Animation:** cards use the listing's fade in; none with reduced motion.
- **Light / dark mode:** shared colour roles. Mobile-first; 2-column cards at 360 px like the listings.

## 6. Acceptance criteria

Done when:

1. The header search and the 404 search both open `/search?q=<words>` with results.
2. A frame code finds that frame first, typed with or without spaces or hyphens, in any case.
3. A brand finds its frames, sunglasses and lenses, each in its own group with a count.
4. Two words find only items that match both.
5. Drafts, hidden frames and inactive lenses are never found (tested against the database).
6. Empty search, small words only and no results each show their message; no results offers WhatsApp with the words in the message.
7. Words with HTML or script characters are shown as plain text.
8. More than 24 matches in a group shows 24 and the "narrow it down" note.
9. The page is `noindex`, keyboard-accessible, readable in light and dark mode, with no sideways scroll at 360 px and no console errors.
10. Playwright tests at 360, 768 and 1440 px, with expected results worked out from the database.

## 7. Not in this version

- Suggestions while typing, spelling correction, "did you mean".
- Searching pages (About, Eye care, eye camps, the gallery).
- Filters on the results page (the listings have them).
- Saving or counting what people search for.

## 8. Open items

| Item | Owner | Until then |
|---|---|---|
| Show the results page to the client | Developer | Reuses signed-off cards |
| Should eye camps be searchable too? | Client | No |
| **Search on phones:** the signed-off design hides the Search icon below 768 px (`site-chrome.css`), so on a phone the only way in is the 404 page. Add a search field to the phone menu, or a search icon in the phone header? | Client (design change) | Unchanged: no phone entry point |

## 9. Build notes (sprint 5.6 part B, 2026-11-09)

- **Code:** matching and order in `src/lib/search.ts` (plain functions, used by the page and the tests); the page in `src/app/(site)/search/page.tsx`; the frame cards and search field in `src/components/search/search-client.tsx`.
- **Codes:** a word with a digit may match inside a field written without its spaces (so "rb 5154" and "vsf0012" work); letters-only words match only the start of a word, so "men" doesn't find "women".
- **Phones:** results use the listings' two-column grid, not the related-frames swipe row. Styles are a marked "Live additions" block at the end of `src/styles/pages.css`.
- **Checked:** 360 and 1440 px, light and dark; HTML typed into the search shows as plain text.
