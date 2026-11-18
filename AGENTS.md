# Agent instructions (web-site)

Follow workspace conventions in `D:\Wolo\Web\AGENTS.md`.

## Native publish

Prefer Dockerless native Tiggu: `. D:\Wolo\Web\project\PublishRunner.ps1; Invoke-WoloNativeTiggu -Kind site`. Full merge: `D:\Wolo\Web\project\render-native.ps1`. See parent AGENTS for Apache `:8084` + Host `wolo.local` requirements.

## Resource → URL list

**Resource → URL list:** When you add a file under `root/Resource/` that must appear in production (covers, logos, static images), also add a matching row to the site’s bake URL list (`config/Url.tsv` / `URL.tsv`, and `Url_<lang>.tsv` when language-specific). Empty Path + Name + Extension → public `/{name}.{ext}` (usual for covers like `faq.svg`). Path `resource/` → public `/resource/{name}.{ext}`. Live PHP may work from Resource alone; baked Firebase/`web-public` only gets assets Tiggu fetches from that list. Do not hand-edit `interim/`/`public/`/`web-public` for new assets—update Resource + Url list, then bake and publish.

## Canonical local media URLs

- Component media keeps its canonical public URL (`/{slug}.jpg`, `/{slug}.png`, or `/{slug}.svg`) even when the source file is directory-backed at `root/Resource/{slug}/index.{ext}`. Nested slugs follow the same rule, for example `/press_release/launch.svg`.
- In `root/.htaccess`, map directory-backed media with an internal rewrite, never an external `R=...` redirect. External redirects expose the physical `Resource/` path and can cause an HTTP-to-HTTPS bounce behind Caddy.
- Test for the exact index file with `-f` before rewriting; checking only that the directory exists can route a requested extension to a nonexistent file.
- Finish static-media rewrites with Apache 2.4's `[END]` flag so a missing asset cannot re-enter the per-directory rewrite rules and recurse into an HTTP 500. A missing asset should return 404.
- Prove both layers after editing: `curl -skI https://wolo.local/{slug}.{ext}` and `curl -sI -H "Host: wolo.local" http://127.0.0.1:8084/{slug}.{ext}` must return the asset directly with 200 and no `Location` header. Also test one nonexistent asset and require 404.

## Cutie Framework

`root/Framework` is a submodule (`blank-org/cutie-framework`). Keep Framework submodule standing rules intact: commit the submodule SHA in the same change set when it moves; if cutie-framework has unpushed commits, push that repo first, then pin the SHA here.

## Image proportion and credits
- Site config/Image_display.tsv overrides Framework defaults (ole tile|hero, 	ile_fit contain|cover, 	ile_position).
- SVGs default to contained tiles; landscape art like FAQ should use hero + cover (or 	ile + cover) to avoid letterboxing in 160x110 nav tiles.
- config/Image_credits.csv + HTML/Fragment/Image_credit.php power the cover credit popup. Full page renders must use `renderComponentBody()` in HTML/Template/Base.php (not a raw `require getComponentPath`) so covers inject.

## Labels (`/labels`, `/label`)

- Source of truth: `Config/Labels.json`. Each entry has `title`, `slug`, `variant` (`minimalist`), `section` (a sub-location, may be ""), `city` (the city or `Region N`), `address1`, `address2`, `code` (hyphen form, e.g. `india-1112.candle.kiwi.mango`), `extra_variants: ["code"]` and `url`. Without `extra_variants` the gallery row has no bare-code PNG/SVG links.
- Regenerate with `cd tools/label-generator; npm run build`. It rewrites every file in `Root/Resource/labels/`: `<slug>-<title-kebab>-minimalist|code.svg|png` plus the `<slug>.svg|png` alias.
- Add `labels/` rows to `Config/URL.tsv` for the alias, minimalist and code files (svg and png) so the bake publishes them.
- Codes must come from the live wolo.codes encode, verified by opening `https://wolo.codes/<place>.<w1>.<w2>.<w3>`; never invent words. For showcase examples, prefer a cell on the landmark whose words rank well on https://wcodes.org/wordlist (rank 1 is best).
- `/label` renders client-side (static-bake safe) from `Root/HTML/Component/Label.php` and `Root/Resource/label-runtime.js`, sharing layout with the generator through `label-layout-shared.js|mjs`. Framework `Init.js` rewrites the URL on load, so the page must keep its query string. Re-check that after any Framework or label change.
- Design details live in `docs/LABEL_DESIGN_NOTES.md`.
