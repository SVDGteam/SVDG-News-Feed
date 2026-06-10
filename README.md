# SVDG's Red Folder

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
- **JSON file database** — swap for Postgres/Supabase/Prisma when ready

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

## Public access (eventual)

The site is currently designed for internal use with no login. For an eventual public-facing deployment, `src/middleware.ts` includes an **optional, off-by-default** shared-password gate using HTTP Basic Auth:

1. Set `SITE_PASSWORD` (and optionally `SITE_USERNAME`, default `svdg`) as environment variables on the hosting platform (e.g., Vercel project settings).
2. Once `SITE_PASSWORD` is set, every page and API route requires that username/password over HTTPS.
3. Leave `SITE_PASSWORD` unset for internal/dev use — the site stays open, exactly as it is today.

This is a lightweight "front door," not per-user accounts. If individual logins (e.g., SVDG staff sign-in, role-based access) are wanted later, that would mean swapping in a proper auth provider (NextAuth, Clerk, etc.) — a bigger change best scoped as its own phase.

## Roadmap (not built yet)

- **Phase 1:** Recurring AI-enabled research across approved sources
- **Phase 2:** Newsletter inbox parsing (Tectonic, Payload, Punchbowl, etc.)
- **Phase 3:** Browser extension — save an article in under 10 seconds
- **Phase 4:** AI summarization, tagging, and relevance scoring pipeline
- **Phase 5:** Events Tracker
- **Phase 6:** Career Center
- **Phase 7:** Public launch — shared-password gate (see "Public access" above), then per-user accounts if needed

---

*For internal SVDG use only.*
