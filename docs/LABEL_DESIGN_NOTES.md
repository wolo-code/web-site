# Wolo label design notes

## Variant naming

- Current implemented variant: `minimalist`.
- The label config stores variant per entry (`Config/Labels.json`) so a future full/QR variant can coexist.

## Minimalist variant (mirrors current app label style)

- Uses the real Wolo lockup asset from the project:
  - `Root/Resource/logo_full.svg`
- Plain rectangular border in brand blue (`#69b7cf`).
- Footer is a blue filled bar attached to the bottom of the bordered label with white text:
  - `Scan or enter at www.wolo.codes`
- No rounded code box, no viewfinder brackets, no QR code.
- Region text is small and blue.
- Three code words are the largest text and black, rendered heavier to match app label emphasis.
- Region and address use the same type family as the code text.

## Output naming scheme

For each label entry:

- Canonical output:
  - `<slug>-<title-kebab>-<variant>.svg`
  - `<slug>-<title-kebab>-<variant>.png`
- Compatibility alias (slug-only):
  - `<slug>.svg`
  - `<slug>.png`

The `/labels` gallery uses the canonical variant/title filename, while slug anchors remain stable via `#<slug>`.
