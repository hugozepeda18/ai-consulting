# Runbook

## Run locally

```sh
cd ~/Desktop/ai-consulting
python3 -m http.server 8000 -d public
```

Open http://localhost:8000. Stop with `Ctrl+C`.

Don't open `public/index.html` by double-clicking it (`file://`): the CSP blocks `main.js` there.

## Test the language detection (optional)

The plain server above picks the language from your timezone. To run the real Cloudflare middleware (country → EN/ES):

```sh
npx wrangler pages dev public
```

Open the URL it prints (usually http://localhost:8788).

To switch language by hand, use the EN/ES button; the choice is saved in the browser. Clear it with `localStorage.clear()` in the browser console.

## Check before pushing

```sh
node --check public/main.js && node --input-type=module --check < functions/_middleware.js
```

Then open the browser console on the local page: any failed `console.assert` self-check shows up there.

## Deploy

Push to `main`. Cloudflare Pages deploys automatically to rayoaiconsulting.mx.
