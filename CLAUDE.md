# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Bilingual (ES/EN) landing page for Rayo Innovación y Consultoría con IA / Thunderbolt Innovation and AI Consulting. Static HTML, no build step, no dependencies. Deployed on Cloudflare Pages (Git-connected, build output dir = `public/`) at rayoaiconsulting.mx.

Everything served lives in `public/`. `functions/` stays at the repo root (Pages requires it there); repo-root files like this one are not published.

## Commands

- Preview: `python3 -m http.server 8000 -d public` → http://localhost:8000. Don't open `index.html` via `file://`: the CSP (`script-src 'self'`) can block `main.js`.
- Syntax check: `node --check public/main.js && node --input-type=module --check < functions/_middleware.js`
- Self-checks are `console.assert` calls in `main.js`; they show in the browser console on load.
- `functions/_middleware.js` only runs on Cloudflare Pages (`npx wrangler pages dev public` to emulate locally). The project must stay a Pages project: on a Worker, `functions/` is ignored.

## Architecture

**i18n.** Spanish is the source text, written in `index.html`. Every translatable element has `data-i18n="key"`; `main.js` snapshots the Spanish `innerHTML` at load and holds English in the `en` dict. Adding text = add `data-i18n` in HTML + the same key in `en`. Values are set with `innerHTML`, so they may contain markup (e.g. `<em>`) and must never contain user input.

**Language selection** (in priority order): saved choice in `localStorage` (EN/ES toggle) → `<html data-country>` stamped by `functions/_middleware.js` from Cloudflare's `request.cf.country` (US → `en`, else `es`) → browser-timezone fallback (`isUS()`), used in local previews.

**Contact form.** Native `<dialog>` opened by the "Escríbenos" button. There is no backend: on submit, `main.js` validates, sanitizes (`clean`/`line`), and opens a `mailto:` to the address in `TO`. Select values are checked against the `ALLOWED` allowlist. The user explicitly asked for security on this form, so keep the layered validation: HTML attributes (`pattern`, `maxlength`, `type=email`), JS re-validation, and `encodeURIComponent` on everything in the mailto. If a form service replaces mailto, it must re-validate server-side and `form-action` in the CSP must be updated.

**CSP lives in two places that must stay in sync:** the `<meta http-equiv>` in `index.html` (for local preview) and `_headers` (production; also adds `frame-ancestors`, HSTS, etc.). No inline scripts or `on*` attributes; all JS goes in `main.js`. External images/fonts/scripts need CSP changes first.

**Projects section.** Portfolio of the firm's real work (AulaPuntual and Analytika, screenshots in `public/img/`, taken with headless Chrome at 1280×800). Add new ones as another `.card.project` in the same grid.

## Gotchas

- Every file in `public/` is public. Keep screenshots, notes and scratch files outside it.
