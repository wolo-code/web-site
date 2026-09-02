# Agent instructions (web-site)

Follow workspace conventions in `E:\Web\AGENTS.md` and `E:\AGENTS.md`.

## Native publish

Prefer Dockerless native Tiggu: `. E:\Web\project\PublishRunner.ps1; Invoke-WoloNativeTiggu -Kind site`. Full merge: `E:\Web\project\render-native.ps1`. See parent AGENTS for Apache `:8084` + Host `wolo.local` requirements.

## Resource → URL list

**Resource → URL list:** When you add a file under `root/Resource/` that must appear in production (covers, logos, static images), also add a matching row to the site’s bake URL list (`config/Url.tsv` / `URL.tsv`, and `Url_<lang>.tsv` when language-specific). Empty Path + Name + Extension → public `/{name}.{ext}` (usual for covers like `faq.svg`). Path `resource/` → public `/resource/{name}.{ext}`. Live PHP may work from Resource alone; baked Firebase/`web-public` only gets assets Tiggu fetches from that list. Do not hand-edit `interim/`/`public/`/`web-public` for new assets—update Resource + Url list, then bake and publish.

## Cutie Framework

`root/Framework` is a submodule (`blank-org/cutie-framework`). Keep Framework submodule standing rules intact: commit the submodule SHA in the same change set when it moves; if cutie-framework has unpushed commits, push that repo first, then pin the SHA here.
