<!--
Guidance for AI coding agents working in the Fialgo Connect repository.
Keep this short (20-50 lines) and strictly grounded in discoverable patterns.
-->
# Copilot instructions — Fialgo Connect

Quick context
- This repo contains three main areas: a web frontend (root Vite + React/TypeScript app), a `mobile-app` (Expo/React Native), and a `python_bridge` (Windows-only MT5 sync bridge).
- Key manifests: `package.json` (root web app), `mobile-app/package.json`, `python_bridge/requirements.txt` and `bun.lockb`.

What to do first
- Look at `package.json` (root) to run the web dev server: `npm install` then `npm run dev` (Vite). For production builds use `npm run build`.
- For the mobile app: open `mobile-app/README.md` and run `npm install` then `npx expo start` inside `mobile-app`.
- For MT5 sync: open `python_bridge/README.md`, set `config.env` (ACTIVATION_KEY) and run `python mt5_sync.py` on Windows after `pip install -r requirements.txt`.

Important patterns & conventions
- Migration / DB scripts are top-level JS/CJS files with explicit names (e.g. `add_fee_column.js`, `alter_db.js`, `apply_final_consistency.cjs`). They run as one-off scripts and mutate the database — review carefully before editing or running.
- Files starting with `add_` or `apply_` typically modify persisted data; preserve idempotency and avoid duplicating side-effects.
- There are many `candidate_*.json` files — they are data snapshots/fixtures. Treat them as large, canonical inputs; do not change without clear intent.
- Mobile app uses Expo and file-based routing under `mobile-app/app`. UI changes live there.
- Web frontend uses Vite + TypeScript + Tailwind + shadcn-style components (see root `package.json` and `src` / components patterns).

Integration points
- The web app uses `@supabase/supabase-js` — expect API interactions with a Supabase backend (look for env keys and client initialization). Search for `supabase` when wiring API calls.
- The `python_bridge/mt5_sync.py` syncs MT5 trades to the web app/journal via the activation key and the web API. Changes to web API shape affect the bridge.

Editing guidance (actionable)
- If you modify API shapes or auth: update both the web server client usage and `python_bridge` config (ACTIVATION_KEY, any endpoints) and run an integration sanity check by starting the bridge locally.
- When changing UI or components, run `npm run dev` (root) or `npx expo start` (mobile-app) and validate visually. Many components expect Tailwind classes and TypeScript types.
- When adding or editing DB scripts (top-level `*.js` / `*.cjs`), add a brief comment at the top describing intended effect and whether the script is idempotent.

Quick references
- Web manifest: `package.json` (root) — dev/build/test scripts.
- Mobile app: `mobile-app/README.md`, `mobile-app/app/` — Expo project and routing.
- Python bridge: `python_bridge/README.md`, `python_bridge/mt5_sync.py`, `python_bridge/config.env` (activation key).
- DB/migration scripts: top-level `add_*.js`, `alter_db.js`, `apply_*.cjs`.
- Large fixtures: `candidate_*.json` (do not alter lightly).

When in doubt
- Run the existing README workflows first (they are the best source of truth). If a README is empty (root README.md is mostly a placeholder), prefer the `package.json`, `mobile-app/README.md`, and `python_bridge/README.md` files.
- If you need to change runtime commands, prefer editing `package.json` scripts (web) or adding small helper scripts rather than changing developer assumptions.

If anything here is unclear or you want more depth (examples of API clients, sample env values, or lists of high-risk files), tell me which area to expand and I will iterate.
