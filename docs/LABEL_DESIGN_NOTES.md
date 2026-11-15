# Wolo label design notes

## Variant naming

- Current implemented variant: `minimalist`.
- The label config stores variant per entry (`Config/Labels.json`) so a future full/QR variant can coexist.

## Minimalist variant (mirrors current app label style)

- Uses the real Wolo lockup asset from the project:
  - `Root/Resource/logo_full.svg`
- Uses the app-style four corner brackets around the code block (no continuous rectangle outline).
- Footer is a blue filled bar attached to the bottom of the bordered label with white text:
  - `Scan or enter at www.wolo.codes`
- No rounded code box, no viewfinder brackets, no QR code.
- Region text is small and blue.
- Vertical order: top rule -> logo -> optional title -> section (`\` prefix, 80% black `#333333`) -> bracketed code words (`/` suffix) -> address lines -> scan bar.
- Optional title appears above section; when title is absent, the stack collapses upward without a blank gap.
- Section line (`section`) is left-aligned above the bracketed words.
- Three code words are the largest text and black, derived from the code string (last three dot-separated words).
- Region and address use the same type family as the code text.
- Faint slash-style marks are rendered immediately before section (`\`) and after the code words (`/`).

## Code variant

- Variant name: `code`.
- Includes only: corner brackets + section (`\` prefix) + three words (`/` suffix).
- Excludes: top rule, logo, title, address lines, scan bar.
- Uses a compact square-ish canvas with white background and even padding.
- `/label` supports `variant=code` and ignores title/address params in that mode.

## Output naming scheme

For each label entry:

- Canonical output:
  - `<slug>-<title-kebab>-<variant>.svg`
  - `<slug>-<title-kebab>-<variant>.png`
- Compatibility alias (slug-only):
  - `<slug>.svg`
  - `<slug>.png`

The `/labels` gallery uses the canonical variant/title filename, while slug anchors remain stable via `#<slug>`.

## Dynamic URL rendering

- Route: `/label`
- Route implementation is static-hosting safe:
  - page: `Root/HTML/Component/Label.php`
  - runtime: `Root/Resource/label-runtime.js`
  - shared layout module used by generator + runtime geometry: `Root/Resource/label-layout-shared.mjs` (generator) and `Root/Resource/label-layout-shared.js` (browser-served module path)
- Query params:
  - `title` (optional)
  - `section` (required)
  - `address1` (required textual address line 1)
  - `address2` (required)
  - `code` (required unless `url` is passed)
  - `url` (optional fallback for extracting code path)
- SVG is default output; `format=png` returns PNG.
- `/label` includes a client-side Download PNG action using the web-app `QR.js` export pattern (`html2canvas` + `downloadURI`).
- Static generator (`tools/label-generator/render-label.mjs`) and `/label` runtime both use the same shared layout math so geometry/checks stay in sync.
