# SVDG News Intelligence Platform

Internal news intelligence platform for [Silicon Valley Defense Group](https://siliconvalleydefense.org).

## What it does

One clean internal site where SVDG staff can track, organize, and surface defense innovation news — sorted by category, recency, and relevance score.

**Tabs:** Weekly Rundown · Industry News · Investor News · Government News · Sponsor News · Opinions · International · Archive

**Key features:**
- Relevance scoring (0–100) across recency, SVDG relevance, source quality, workstream fit, and sponsor/NatSec100 relevance
- Manual add/edit article form with score override
- Auto-archive for articles older than 60 days
- Search, sort, and filter on every page
- "Why it matters" field on every article — makes this feel like an intelligence product, not a link dump

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
└── app/
    ├── page.tsx              # Weekly Rundown (Home)
    ├── industry/page.tsx
    ├── investor/page.tsx
    ├── government/page.tsx
    ├── sponsor/page.tsx
    ├── opinions/page.tsx
    ├── international/page.tsx
    ├── archive/page.tsx
    ├── add/page.tsx
    ├── article/[id]/edit/page.tsx
    └── api/articles/         # REST API routes
```

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

## Roadmap (not built yet)

- **Phase 1:** Recurring AI-enabled research across approved sources
- **Phase 2:** Newsletter inbox parsing (Tectonic, Payload, Punchbowl, etc.)
- **Phase 3:** Browser extension — save an article in under 10 seconds
- **Phase 4:** AI summarization, tagging, and relevance scoring pipeline
- **Phase 5:** Events Tracker
- **Phase 6:** Career Center

---

*For internal SVDG use only.*
