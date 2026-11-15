# wolo-web-site
wolo.codes app's website code

## Wolo label generator

Sample labels are data-driven from `Config/Labels.json`.

1. Add or edit entries in `Config/Labels.json`:
   - `title` (place name, used in output filename)
   - `slug` (stable label id / gallery anchor)
   - `variant` (currently `minimalist`)
   - `region`, `words`, `url`, `address`
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

Design notes are documented in `docs/LABEL_DESIGN_NOTES.md`.
