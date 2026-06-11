# Dispatch

*A SVDG Product*

Internal news intelligence platform for [Silicon Valley Defense Group](https://siliconvalleydefense.org).

## What it does

One clean internal site where SVDG staff can track, organize, and surface defense innovation news — sorted by category, recency, and relevance score.

**Tabs:** Weekly Rundown · Industry News · Investor News · Government News · Sponsor News · Opinions · International · Archive · Search

**Key features:**
- Relevance scoring (0–100) across recency, SVDG relevance, source quality, workstream fit, and sponsor/NatSec100 relevance
- Manual add/edit article form with score override and a sponsor picker drawn from the SVDG sponsor roster
- Auto-archive for articles older than 60 days
- Search, sort, and filter on every page, plus a dedicated cross-category Search page (includes the archive)
- Sponsor News page includes a directory of all current SVDG sponsors with links
- "Why it matters" field on every article — makes this feel like an intelligence product, not a link dump
- Visual identity follows the SVDG Design System (Space Grotesk / Lato / IBM Plex Mono, Admiral blue + Sky Dancer accent, corner-bracket motif)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app seeds itself with sample data on first run (stored at `data/articles.json`).

To reset to seed data: `POST /api/seed` (dev only).

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **JSON file database + Upstash Redis overlay** — see "Data storage" below

## Data storage

`data/articles.json` is the base dataset — committed to git, updated by the
daily research job, and bundled with every deploy.

Vercel's runtime filesystem is read-only, so live writes (the browser
extension, the dashboard's Add/Edit forms, and like/dislike voting) can't
modify that file in production. Instead, those writes go to a small "overlay"
stored in Upstash Redis (connected via Vercel's Storage tab as `dispatch-db`,
free tier — `KV_REST_API_URL`/`KV_REST_API_TOKEN` env vars). `getAllArticles()`
merges the file and the overlay on every read, so newly-added articles from
the daily research job and live edits/votes/submissions all show up together
— no manual resync needed.

Locally (and in `scripts/add-candidates.ts`), where those env vars aren't set,
everything reads/writes `data/articles.json` directly, exactly as before.

`src/lib/kv.ts` is a tiny dependency-free Upstash REST client (plain `fetch`,
no SDK).

## Project structure

```
src/
├── types/article.ts          # Full Article type and related types
├── data/
│   ├── categories.ts         # Category config, regions, workstreams, tags
│   ├── sponsors.ts            # SVDG sponsor roster (name + website)
│   └── seed.ts               # 25+ sample articles
├── lib/
│   ├── scoring.ts            # Relevance score calculation (0–100)
│   ├── archive.ts            # 60-day archive logic
│   ├── db.ts                 # JSON file database adapter
│   └── filters.ts            # Filter, sort, and search utilities
├── components/
│   ├── Navigation.tsx
│   ├── ArticleCard.tsx
│   ├── ArticleForm.tsx       # Add/edit form with live score calculation
│   ├── CategoryPageClient.tsx
│   ├── FilterBar.tsx
│   ├── RelevanceBadge.tsx
│   └── CategoryBadge.tsx
├── middleware.ts              # Optional shared-password gate (off by default)
└── app/
    ├── page.tsx              # Weekly Rundown (Home)
    ├── industry/page.tsx
    ├── investor/page.tsx
    ├── government/page.tsx
    ├── sponsor/page.tsx
    ├── opinions/page.tsx
    ├── international/page.tsx
    ├── archive/page.tsx
    ├── search/page.tsx        # Cross-category search
    ├── add/page.tsx
    ├── article/[id]/edit/page.tsx
    └── api/articles/         # REST API routes
```

## Brand assets

`public/brand/` and `public/fonts/` contain logos and Space Grotesk font files copied from the SVDG Design System. Brand colors and type are defined as CSS variables and Tailwind tokens in `src/app/globals.css` and `tailwind.config.ts` (palette: Berkeley, Admiral, Sapphire, Crayola, Sky, Pea Coat, Sky Dancer accent).

## Relevance scoring

| Component | Max Points |
|---|---|
| Recency | 30 |
| SVDG Relevance (High/Medium/Low) | 35 |
| Source Quality | 15 |
| Workstream Relevance | 10 |
| Sponsor / NatSec100 | 10 |
| **Total** | **100** |

Score labels: **High** (85–100) · **Medium-High** (65–84) · **Medium** (40–64) · **Low** (<40)

## Team access (password gate — enabled)

The site sits behind a shared-password "front door" via `src/middleware.ts`,
with an in-site `/login` page (not a browser popup):

- Once `SITE_PASSWORD` is set (locally via `.env.local`, or as an environment
  variable on the hosting platform), visiting any page redirects to `/login`
  until the correct username/password is submitted. A session cookie (1 year)
  is then set, and browsers can offer to save the credentials like any other
  login form.
- Username defaults to `svdg` (override with `SITE_USERNAME`).
- Leave `SITE_PASSWORD` unset to go back to fully open access (e.g., for
  local dev if you don't want to log in every time — just don't create
  `.env.local`, or comment the line out).

**Local dev:** create `.env.local` (gitignored, never committed) with:

```
SITE_USERNAME=svdg
SITE_PASSWORD=<shared team password>
```

**Deploying to Vercel:**

1. In the Vercel project → **Settings → Environment Variables**, add
   `SITE_PASSWORD` (and optionally `SITE_USERNAME`) for the Production (and
   Preview, if desired) environment.
2. Redeploy — the gate is active immediately for all routes.
3. Share the username/password with the team over a private channel (Slack
   DM, 1Password, etc.) — **never commit it to the repo or put it in this
   README**.

This is a lightweight team front door, not per-user accounts. If individual
logins (e.g., SVDG staff sign-in, role-based access, "who liked what") are
wanted later, that would mean swapping in a proper auth provider (NextAuth,
Clerk, etc.) — a bigger change best scoped as its own phase.

## Automated research pipeline (Phase 1 — built)

A scheduled job ("svdg-daily-research") runs daily and proposes new candidate
articles for review:

- `src/data/sources.ts` — the approved source universe (70 outlets,
  newsletters, trackers, and institutions), tagged by priority, region, and
  use case. Treated as a rotating pool, not a daily checklist.
- `docs/research-job-brief.md` — the playbook the research job follows: which
  sources to sample, how to score and tag candidates, the output schema, and
  the quality bar (3–8 high-signal items per day, fewer or zero is fine).
- `scripts/add-candidates.ts` — CLI that validates `data/candidates.json`,
  dedupes by URL against `data/articles.json`, computes the relevance score,
  and appends accepted articles with `addedBy: "AI Candidate"`. Run manually
  with:

  ```bash
  npx tsx scripts/add-candidates.ts data/candidates.json
  ```

  (If `npx tsx` fails on esbuild platform mismatches, use
  `node scripts/add-candidates-plain.cjs data/candidates.json` instead — same
  logic, no esbuild dependency.)

New candidates get `status: "Reviewed"` automatically when they have a title,
publication date, and source — which is true for nearly all AI candidates, so
they appear ready to read in the app (`npm run dev`) without sitting in the
"Needs Review" queue. Only candidates missing that core info land as `"New"`
and need a manual look.

## Newsletter inbox parsing (Phase 2 — built)

The daily research job also checks Simone's Gmail (simone@siliconvalleydefense.org)
for newsletters auto-labeled **"News Depot"** (Tectonic, Payload, Punchbowl,
etc.):

- New "News Depot" threads are opened via Claude in Chrome and read with
  `get_page_text` (avoids token-limit issues with very long newsletters).
- Canonical article URLs are extracted per-source — Punchbowl Defense/Tech
  editions (one candidate per edition; general Hill-politics editions are
  skipped), and Tectonic/Payload via WebSearch for the published URL.
- Extracted stories feed into the same scoring/dedupe/insertion pipeline as
  the rest of the research job.

See `docs/research-job-brief.md` (Step 2) for the full process.

## Roadmap (not built yet)

- **Phase 3:** Browser extension — save an article in under 10 seconds
- **Phase 4:** AI summarization, tagging, and relevance scoring pipeline
- **Phase 5:** Events Tracker
- **Phase 6:** Career Center
- **Phase 7:** Per-user accounts / role-based access (see "Team access" above for the current shared-password gate)

---

*For internal SVDG use only.*
