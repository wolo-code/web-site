# Wolo label design notes

## Variant naming

- Current implemented variant: `minimalist`.
- The label config stores variant per entry (`Config/Labels.json`) so a future full/QR variant can coexist.

## Minimalist variant (mirrors current app label style)

- Uses the real Wolo logo assets from the project:
  - `Root/Resource/logo_wolo.svg`
  - `Root/Resource/logo_code.svg`
- Plain rectangular border in brand blue (`#69b7cf`).
- Footer text is integrated with the border by interrupting the lower border line under the text area:
  - `Scan or enter at www.wolo.codes`
- No rounded code box, no viewfinder brackets, no QR code.
- Region text is small and blue.
- Three code words are the largest text and black.
- Traditional address text is smaller.

## Output naming scheme

For each label entry:

- Canonical output:
  - `<slug>-<title-kebab>-<variant>.svg`
  - `<slug>-<title-kebab>-<variant>.png`
- Compatibility alias (slug-only):
  - `<slug>.svg`
  - `<slug>.png`

The `/labels` gallery uses the canonical variant/title filename, while slug anchors remain stable via `#<slug>`.
