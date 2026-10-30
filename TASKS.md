# Tasks

## Next: hide the Gmail address behind Cloudflare Email Routing (2026-10-29)

**Why:** `public/main.js` (`TO`) exposes `hugozepeda6@gmail.com` to anyone/bots. An alias on the
domain forwards to Gmail and can be changed or disabled without touching the inbox.

**You (Cloudflare dashboard, ~5 min):**
1. `rayoaiconsulting.mx` → Email → Email Routing → Get started.
2. Custom address (e.g. `contacto`) → Send to an email → `hugozepeda6@gmail.com`.
3. Click the verification link Cloudflare sends to Gmail.
4. "Add records and enable" (MX + SPF TXT, automatic).
5. Test: email the alias from another account, confirm it lands in Gmail.
6. Turn on 2-step verification for the Gmail account if it isn't already.

**Claude (after step 5, tell it the alias):** set `TO` in `public/main.js` to the alias, grep
`public/` to confirm the Gmail address appears nowhere else, run the syntax check.

---

Claude Code config audit (project level), 2026-10-16. Plan only; nothing below is created yet.

## 1. `.claude/settings.json` — allowlist + deny rules 🟢

**Why:** no project settings exist, so every preview/check command prompts, and nothing blocks a
`git push`. Pages is Git-connected to `origin/main`, so a push is a production deploy of
rayoaiconsulting.mx. Reading `.env*` / `.dev.vars` (wrangler's local secrets file) is denied as a
cheap guard: none exist today, but `wrangler pages dev` is the documented path for local secrets.

**Contents:**
```json
{
  "permissions": {
    "allow": [
      "Bash(python3 -m http.server 8000 -d public)",
      "Bash(node --check public/main.js)",
      "Bash(node --input-type=module --check)",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)"
    ],
    "deny": [
      "Bash(git push:*)",
      "Read(./.env*)",
      "Read(./**/.env*)",
      "Read(./.dev.vars)"
    ]
  }
}
```
`npx wrangler pages dev public` stays un-allowlisted on purpose: `npx` downloads and runs code.

**Verify:** `python3 -m json.tool .claude/settings.json`; in a new session, `/permissions` lists the
rules; the syntax check runs without a prompt; `git push --dry-run` is refused.

## 2. Cloudflare Pages build output dir vs. the staged move to `public/` 🔴

**Why:** the pushed commit (d66d4d6) serves files from the repo root. The index has staged renames
into `public/`, and CLAUDE.md states "build output dir = `public/`". If the Pages project is still set
to the root, the first push after this commit serves no `index.html` (site down) and exposes repo-root
files like CLAUDE.md/TASKS.md.

**Contents:** no file. Confirm in Cloudflare dashboard → Pages → project → Settings → Build that the
output directory is `public` (and the production branch is `main`) *before* pushing the rename commit.

**Missing from you:** what the dashboard currently says.

**Verify:** after the push, https://rayoaiconsulting.mx/ loads, `/CLAUDE.md` returns 404, and
`curl -sI https://rayoaiconsulting.mx/ | grep -i content-security` shows the `_headers` CSP.

## 3. CLAUDE.md: state that pushing `main` deploys production 🟢

**Why:** CLAUDE.md says "Git-connected" but not that `git push` = live deploy; that is the fact that
justifies the push deny rule and the check in item 2.

**Contents:** one line under Commands: "Deploy: push to `main` (Cloudflare Pages auto-builds). Push is
denied in `.claude/settings.json`; the user pushes."

**Verify:** `grep -n "push to \`main\`" CLAUDE.md`.
