# Daily Research Job Brief

This is the playbook for the recurring AI research job that finds new candidate
articles for **SVDG's Red Folder**. Read this in full before each run.

## Context

SVDG's Red Folder is an internal news intelligence platform for Silicon Valley
Defense Group staff. It tracks defense innovation news across six categories:
Industry News, Investor News, Government News, Sponsor News, Opinions, and
International. The goal is a small, high-signal daily feed — not an aggregator.

## Step 1 — Pick sources for this run

Read `src/data/sources.ts`. This is a **universe of approved sources, not a
daily checklist**. Each run:

- Pick a rotating subset of roughly 8–12 sources.
- Always include a few priority-1 sources (newsletters/trackers like Tectonic,
  Pryzm, Payload, Punchbowl, plus 2–3 priority-1 search sources).
- Sample 2–4 priority-2 sources, rotating which ones across runs so coverage
  spreads out over a week or two.
- Include a priority-3 source only occasionally.
- It's fine — good, even — to skip most of the list on any given day.

## Step 2 — Check Gmail "News Depot" for new newsletters

Simone's inbox (simone@siliconvalleydefense.org) auto-labels incoming
newsletters (Tectonic, Payload, Punchbowl, Pryzm, etc.) with the Gmail label
**"News Depot"**. Every run:

1. Use the Gmail tools to search `label:"News Depot"` for threads received
   since the last run (use judgment on the window — roughly the last 24–48
   hours, wider after weekends/holidays).
2. For each new thread, open it via Claude in Chrome rather than the Gmail
   `get_thread` tool (which can blow the token limit on long newsletters):
   navigate to `https://mail.google.com/mail/u/3/#all/<threadId>` — `/u/3/`
   is the account index for simone@siliconvalleydefense.org in this browser
   profile (if a different account loads, use the account switcher in the
   top-right to pick "Simone Montandon / simone@siliconvalleydefense.org" and
   re-navigate). Then call `get_page_text` to pull clean plaintext.
3. Extract canonical article links:
   - **Punchbowl**: only the **Defense** and **Tech** editions are in scope —
     skip general AM/Midday/PM Hill-politics editions. Use
     `javascript_tool` to run `document.querySelectorAll('a[href]')` and find
     the "View in Browser" link (`link.punchbowl.news/click/.../<base64>`),
     then base64-decode the embedded path segment to recover the canonical
     `https://punchbowl.news/?p=<id>` URL. That link points to the whole
     edition, not individual stories — treat each edition as **one**
     candidate, picking its single best story or theme.
   - **Tectonic / Payload**: "Read Online" links are `pyld.omeclk.com`
     tracking redirects and aren't usable as a stored URL — use WebSearch to
     find the canonical published article on `tectonicdefense.com` /
     `payloadspace.com` matching the headline.
4. Feed everything extracted here into Steps 4–6 below alongside whatever
   came from Step 3's source sweep.

## Step 3 — Search for recent, relevant news

For each chosen source, look for items published in roughly the last 24–48
hours (use judgment near weekends/holidays — widen the window if needed).

Focus on stories relevant to SVDG's mission: defense innovation, dual-use
technology, venture capital and private equity in defense, DoD acquisition
reform, NatSec100 companies, SVDG sponsors, AUKUS/NATO/allied defense tech
(UK, Europe, Australia), and policy/legislative developments (NDAA,
appropriations, export controls).

## Step 4 — Apply a high quality bar

Do **not** try to capture everything. Target **3–8 candidate articles per
run**, total. A good candidate is:

- Substantive (a real development — funding, contract, policy change, product
  launch, significant analysis) rather than routine/incremental news.
- Clearly mappable to one of the six categories and at least one workstream.
- From a credible, identifiable source with a real URL.

If a run doesn't turn up anything that clears this bar, it's fine to produce
zero or one candidate. Quality over quantity, every time.

## Step 5 — Check for duplicates

Before finalizing, read `data/articles.json` and skip any story whose URL (or
an extremely close duplicate — same story, different outlet, already covered)
is already in the database. The insertion script also dedupes by URL as a
backstop, but checking up front avoids wasted effort.

## Step 6 — Score each candidate

For each candidate, set these fields thoughtfully — they drive the relevance
score (0–100):

- **svdgRelevanceLevel** (`High` / `Medium` / `Low`) — how directly relevant
  to SVDG's mission and member interests. High = NatSec100, sponsors, major
  policy shifts, capital formation. Medium = broader industry/ecosystem news.
  Low = tangential but still worth surfacing.
- **sourceQualityLevel** (`High` / `Medium` / `Low`) — credibility/rigor of
  the source. Major trade press, official government sources, and top think
  tanks = High. General business press = Medium.
- **workstreams** — choose from: `NatSec100`, `Policy`, `Industry Council`,
  `Event Briefing`, `Sponsor Engagement`, `Newsletter`, `International /
  Australia`, `Capital Formation`. Pick 0–2 that genuinely apply.
- **sponsorNatSec100Relevance** (`Direct` / `Ecosystem` / `None`) — `Direct`
  if the article is specifically about a current SVDG sponsor or a NatSec100
  company; `Ecosystem` if it's about the broader space they operate in;
  otherwise `None`. Check `src/data/sponsors.ts` for the current sponsor list.
- **categories** — one or more of: `Industry News`, `Investor News`,
  `Government News`, `Sponsor News`, `Opinions`, `International`.
- **tags** — pull from `src/data/categories.ts` → `SUGGESTED_TAGS` where they
  fit; it's fine to add a new tag if nothing existing matches.
- **region** — `US`, `Europe`, `UK`, `Australia`, or `Other` if applicable.

## Step 7 — Write candidates to `data/candidates.json`

Write a JSON array of candidate objects matching this shape (see
`scripts/add-candidates.ts` for the authoritative schema and validation
rules):

```json
[
  {
    "title": "Headline of the article",
    "url": "https://...",
    "source": "Outlet name",
    "author": "Author name (optional)",
    "datePublished": "2026-06-09",
    "categories": ["Industry News"],
    "tags": ["Defense Startup", "AI"],
    "shortDescription": "1-2 sentence neutral summary of what happened.",
    "whyItMatters": "1-2 sentences on why this matters to SVDG — professional but informal, like a sharp colleague's take.",
    "region": "US",
    "sponsorName": "",
    "companyMentions": "Company A, Company B",
    "svdgRelevanceLevel": "Medium",
    "sourceQualityLevel": "High",
    "workstreams": ["Capital Formation"],
    "sponsorNatSec100Relevance": "None"
  }
]
```

Tone for `shortDescription` and `whyItMatters`: professional but informal —
the voice of a sharp, plugged-in colleague flagging something worth a read,
not a press release and not overly academic.

## Step 8 — Run the insertion script

```bash
npx tsx scripts/add-candidates.ts data/candidates.json
```

This validates each candidate, dedupes against `data/articles.json`, computes
the relevance score, sets `addedBy: "AI Candidate"`, and appends accepted
articles to `data/articles.json`. It prints a summary of what was added and
what was skipped (and why).

Status is set automatically: candidates with a title, datePublished, and
source get `status: "Reviewed"` (author is a bonus, not required) — this
covers nearly all AI candidates, since those three fields are required to
pass validation anyway. Only candidates somehow missing that core info land
as `"New"` and need a manual look.

If `npx tsx` fails with an esbuild platform-mismatch error (can happen in
sandboxed environments without registry access to install the matching
`@esbuild/*` binary), use the plain-Node fallback instead — it's logically
identical, just without the TypeScript/esbuild step:

```bash
node scripts/add-candidates-plain.cjs data/candidates.json
```

## Step 9 — Report back

Summarize the run for Simone: how many candidates were added (with titles and
scores), how many were skipped and why, and which sources were checked this
run. Candidates with complete core metadata appear as "Reviewed" and ready to
read in the app (`npm run dev`); any landing as "New" need a manual look.

## Step 10 — Clean up

Delete or clear `data/candidates.json` after a successful run so the next
run starts fresh and nothing gets double-processed.
