# wolo-web-site
wolo.codes app's website code

## Wolo label generator

Sample labels are data-driven from `Config/Labels.json`.

1. Add or edit entries in `Config/Labels.json`:
   - `title` (place name, used in output filename)
   - `slug` (stable label id / gallery anchor)
   - `variant` (currently `minimalist`)
   - `extra_variants` (optional array; use `["code"]` to export compact code-only artwork)
   - `section` (city/region line)
   - `address1` (textual address line 1)
   - `address2` (second address line)
   - `code` (Wolo code string, e.g. `kathmandu.mask.net.soil`; renderer uses last 3 words)
   - `url` (live code URL)
2. Generate assets:
   ```bash
   cd tools/label-generator
   npm install
   npm run build
   ```
3. The script writes:
   - canonical variant/title files:
     - `Root/Resource/labels/<slug>-<title-kebab>-<variant>.svg`
     - `Root/Resource/labels/<slug>-<title-kebab>-<variant>.png` (2x export)
   - compatibility aliases (to keep slug-only paths working):
     - `Root/Resource/labels/<slug>.svg`
     - `Root/Resource/labels/<slug>.png`
   - stress-test render (not in gallery):
     - `Root/Resource/labels/tests/kathmandu-longest-words-test-longest-words-test-minimalist.svg`
     - `Root/Resource/labels/tests/kathmandu-longest-words-test-longest-words-test-minimalist.png`
4. Ensure each generated file has a matching row in `Config/URL.tsv` so baked web-public output serves:
   - `/labels/<slug>-<title-kebab>-<variant>.svg`
   - `/labels/<slug>-<title-kebab>-<variant>.png`
   - (optional backward compatibility) `/labels/<slug>.svg|png`

The `/labels` page reads the same JSON file, so adding a label is one data entry plus running the generator.

## Dynamic label URL

- Route: `/label`
- Served as a normal site page (component `Root/HTML/Component/Label.php`) with browser rendering from `/label-runtime.js`.
- This works in both local Apache/PHP rendering and baked Firebase static hosting because rendering is client-side.
- The renderer reuses the web-app label download pattern (`html2canvas` + PNG download link behavior) adapted from `web-app/Root/JS/Component/Root/QR.js`.
- Params:
  - `title` (optional)
  - `section` (required, left-aligned in the code frame; rendered in 80% black `#333333`)
  - `address1` (required; textual address line 1)
  - `address2` (required; second address line)
  - `code` (required unless `url` is provided; words are derived from code path using current Wolo format)
  - `url` (optional fallback if `code` omitted; path is parsed for code)
  - `variant` (optional: `minimalist` or `code`; `code` ignores title/address params)
- The page renders SVG in-browser and includes a **Download PNG** button.

Examples:

- `/label?title=Boudhanath%20Stupa&section=Kathmandu&address1=Boudha%20Stupa%20Rd&address2=Kathmandu%2044600%2C%20Nepal&code=kathmandu.mask.net.soil`
- `/label?section=Kathmandu&address1=Inner%20Ring%20Road&address2=Nepal&code=kathmandu.river.mango.bell` (no title layout)

Design notes are documented in `docs/LABEL_DESIGN_NOTES.md`.
