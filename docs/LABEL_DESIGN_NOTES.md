# Wolo label design notes

## Variant naming

- Current implemented variant: `minimalist`.
- The label config stores variant per entry (`Config/Labels.json`) so a future full/QR variant can coexist.

## Minimalist variant (mirrors current app label style)

- Uses the real Wolo lockup asset from the project:
  - `Root/Resource/logo_full.svg`
- Reuses the existing Wolo label frame path from current design (`web-app` `Root/Resource/Label.svg`) instead of a custom rectangle.
- Footer is a blue filled bar attached to the bottom of the bordered label with white text:
  - `Scan or enter at www.wolo.codes`
- No rounded code box, no viewfinder brackets, no QR code.
- Region text is small and blue.
- Optional title appears above region; when title is absent, the stack collapses upward without a blank gap.
- Section line (`section`) is left-aligned.
- Three code words are the largest text and black, derived from the code string (last three dot-separated words).
- Region and address use the same type family as the code text.
- Frame includes the slash-style extents from the current app label shape.

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
- Query params:
  - `title` (optional)
  - `section` (required)
  - `address1` (required textual address line 1)
  - `address2` (required)
  - `code` (required unless `url` is passed)
  - `url` (optional fallback for extracting code path)
- SVG is default output; `format=png` returns PNG.
- Static generator and `/label` both use `tools/label-generator/render-label.mjs`, so layout/style stays in sync.
