# wolo-web-site
wolo.codes app's website code

## Wolo label generator

Sample labels are data-driven from `Config/Labels.json`.

1. Add or edit entries in `Config/Labels.json` (`slug`, `region`, `words`, `url`, `address`).
2. Generate assets:
   ```bash
   cd tools/label-generator
   npm install
   npm run build
   ```
3. The script writes:
   - `Root/Resource/labels/<slug>.svg`
   - `Root/Resource/labels/<slug>.png` (2x export for sharing/social posts)
   - stress-test render (not in gallery):
     - `Root/Resource/labels/tests/kathmandu-longest-words-test.svg`
     - `Root/Resource/labels/tests/kathmandu-longest-words-test.png`
4. Ensure each generated file has a matching row in `Config/URL.tsv` so baked web-public output serves:
   - `/labels/<slug>.svg`
   - `/labels/<slug>.png`

The `/labels` page reads the same JSON file, so adding a label is one data entry plus running the generator.
