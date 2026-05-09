# Saints matchday Loop

Southampton FC StadiumLoop — matchday companion app delivered via NFC tap. Single-file HTML + assets, served as a static site through Railway.

Built on Loop Platform Spec v1.0 + StadiumLoop Build Principles v1.0.

## What's in the deploy

```
southampton-stmarys-loop.html   the app — single self-contained file
saints-manifest.json            PWA manifest
service-worker.js               minimal pass-through SW (cache-on-fetch)
package.json                    declares the start command + serve dependency
serve.json                      static-server config: rewrites, headers, cache rules
railway.json                    Nixpacks builder + healthcheck config
.gitignore

southampton-logo.png            crest (used in lots of places)
southampton-logo-192.png        PWA launcher icon (Android)
southampton-logo-512.png        PWA launcher icon (high-DPI / splash)
stmarys-map.jpg                 ground map for the Ground Map sheet

players-<surname>.png           player headshots (16 + Roerslev = 17)
archive-<topic>.png             Saints Stories archive thumbnails (7)
```

## Run it locally

```sh
npm install
npm run dev
```

Opens at `http://localhost:3000`. Root URL serves the Saints HTML via the rewrite in `serve.json`.

## Push to Railway

1. Create a new Railway project, link it to this folder's git repo.
2. Railway auto-detects the `package.json` + Nixpacks builder.
3. `npm start` is the start command. Railway provides the `PORT` env var.
4. Once deployed, Railway gives you a public `https://...up.railway.app` URL.
5. Open the URL on your phone — you'll see the app full-screen. Use Add to Home Screen (iPhone) or the install banner (Android) to get the standalone PWA experience with the red Saints crest as the launcher icon.

## NFC tags

Programme NFC tags to point at the deployed URL. Optionally add a `?loop=<context>` query string so different tap points open different surfaces:

```
https://saints.up.railway.app/                       → Home (default)
https://saints.up.railway.app/?loop=mom              → Man of the Match
https://saints.up.railway.app/?loop=music            → Matchday Music
https://saints.up.railway.app/?loop=programme        → Saints Stories
https://saints.up.railway.app/?loop=donate           → Back the Foundation
https://saints.up.railway.app/?loop=bar              → Match Day Menu
```

Aliases supported: `vote/motm` → `mom`, `stories/archive/rack` → `programme`, `back-the-club/fundraise/foundation` → `donate`, `food/menu` → `bar`, `track/tunes` → `music`.

## Match-specific config

Inside the HTML there are a few inline values that the matchday content team will swap each home game:

- `CURRENT_MATCH_ID` — `saints-2026-04-21-bristol-city` (vote dedup key).
- `candidates` array — MoM vote candidates (id, name, position note, hero flag, starting %).
- Match strip live state (currently set to `Live · 78'` at 2-2 vs Bristol City).
- `mgDecisions` array — five Manager mini-game decision cards keyed to the match's real second-half moments.
- `competitions` object + `compConfig` — Win sheet data.
- `videos` array — Saints YouTube video IDs (channel ID `UCxvXjfiIHQ2O6saVx_ZFqnw`).
- `newsItems` — production swap-in: `fetch('/wp-json/wp/v2/posts?per_page=8&_embed')`.

Production CMS plan (per StadiumLoop principles §11): Directus on Railway, one project per venue at Phase 1 (~£10–15/mo per venue), shared backend at ~5 venues. Schema versioned via `directus schema snapshot`.

## Spec deviations (fork-level — master spec unchanged)

- "Did you know?" copy on Home awe-callout label (Master Spec §8.2 bans this — Stu approved override 08.05.26 for Saints fork only).
- Six-context carousel, not the canonical five (Music + Stories both kept). Within the principles' "never sprawl above seven" allowance.

## Audit pass — fixes 1–5 applied

1. Viewport zoom unlocked (was `user-scalable=no, maximum-scale=1`) — WCAG 1.4.4.
2. Touch targets ≥44×44 across all secondary controls — WCAG 2.5.5.
3. `--ink-muted` darkened from `#8A8A8A` to `#6E6E6E` for AA on small text.
4. Inter weights dropped from 5 to 4; on-screen weight count reduced.
5. PWA manifest wired + Apple touch icons + iOS standalone meta.

## Spec compliance

Built against the Loop Platform Master Spec v1.0 and the StadiumLoop Build Principles v1.0. The §12 build-checklist passes 14 of 15 items at full score, with item 11 (six-context carousel) flagged as a deliberate, approved deviation.

## Notes

- The Master HTML (`stadiumloop-master-v1.html`, `stadiumloop-master-v2.html`) and the Eastleigh fork are excluded from this deploy via `.gitignore`. They live in the same project folder for reference.
- The misnamed `Southampton-logo.png.png` from an earlier asset drop is gitignored — the canonical lowercase `southampton-logo.png` is what the HTML references.
