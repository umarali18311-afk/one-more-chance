# Pixtre (Prompt 1 foundation)
React + Vite + React Router, with a Netlify Function (`netlify/functions/pexels.mjs`) proxying the Pexels API.

## Environment variable
`PEXELS_API_KEY` — set it only in Netlify (Site settings → Environment variables) and, for local work, in a git-ignored `.env`. Never commit it. `.env.example` lists the name only.

## Run
- `npm install`
- `npm run dev` (Netlify CLI: serves the app and the `/api/*` function together)
- `npm run build` → `dist/`

## Diagnosing "no photos/videos load"
Visit `/api/_status` directly on the deployed site (not through the app — just
the bare URL in a browser tab). It never prints the key itself, only:
- `keyConfigured: false` → `PEXELS_API_KEY` isn't set for this deploy in Netlify.
- `keyConfigured: true, pexelsStatus: 401 or 403` → the key is set but Pexels rejected it (wrong/revoked key).
- `keyConfigured: true, pexelsStatus: 200, itemCount: 1` → the key and routing both work; a UI-level issue would be the remaining suspect.
- A response that starts with `<!doctype html>` instead of JSON → the `/api/*` request never reached the function at all (routing/redirect problem, or `netlify.toml` wasn't picked up by the deploy).

Netlify's function logs (Site → Logs → Functions → `pexels`) also show one
sanitized line per request (route + HTTP status), useful without DevTools.

## Structure
- `src/lib/api.js` — provider layer (`media.*`), favorites store (swap for Supabase in Prompt 3)
- `src/ui.jsx` — shared components; `src/pages.jsx` — route pages
- `netlify.toml` — build + SPA fallback
