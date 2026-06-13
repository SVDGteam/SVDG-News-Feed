/**
 * @deprecated Plain-Node fallback for scripts/add-candidates.ts.
 * Prefer add-candidates.ts (the TypeScript source of truth) — changes made here
 * must also be applied there, and the two will silently diverge otherwise.
 * Only use this if `npx tsx scripts/add-candidates.ts` fails with an esbuild
 * platform-mismatch error (common in sandboxed environments without registry
 * access to install the matching @esbuild/* binary).
 *
 * Usage: node scripts/add-candidates-plain.cjs [path-to-candidates.json]
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const DB_PATH = path.join(process.cwd(), 'data', 'articles.json')

const VALID_CATEGORIES = new Set([
  'Industry News',
  'Investor News',
  'Government News',
  'Sponsor News',
  'Opinions',
  'International',
])
const VALID_WORKSTREAMS = new Set([
  'NatSec100',
  'Policy',
  'Industry Council',
  'Event Briefing',
  'Sponsor Engagement',
  'Newsletter',
  'International / Australia',
  'Capital Formation',
])
const VALID_REGIONS = new Set(['US', 'Europe', 'UK', 'Australia', 'Other'])
const VALID_LEVELS = new Set(['High', 'Medium', 'Low'])
const VALID_SPONSOR_RELEVANCE = new Set(['Direct', 'Ecosystem', 'None'])

function normalizeUrl(url) {
  return url.trim().replace(/\/+$/, '').toLowerCase()
}

function validate(c) {
  if (!c.title || !c.title.trim()) return 'missing title'
  if (!c.url || !c.url.trim()) return 'missing url'
  if (!c.source || !c.source.trim()) return 'missing source'
  if (!c.datePublished || !/^\d{4}-\d{2}-\d{2}/.test(c.datePublished)) {
    return 'missing or invalid datePublished (expected YYYY-MM-DD)'
  }
  if (!c.shortDescription || !c.shortDescription.trim()) return 'missing shortDescription'

  if (!c.categories || c.categories.length === 0) return 'missing categories'
  for (const cat of c.categories) {
    if (!VALID_CATEGORIES.has(cat)) return `invalid category: "${cat}"`
  }

  if (!c.svdgRelevanceLevel || !VALID_LEVELS.has(c.svdgRelevanceLevel)) {
    return `invalid svdgRelevanceLevel: "${c.svdgRelevanceLevel}"`
  }
  if (!c.sourceQualityLevel || !VALID_LEVELS.has(c.sourceQualityLevel)) {
    return `invalid sourceQualityLevel: "${c.sourceQualityLevel}"`
  }

  if (!c.workstreams) return 'missing workstreams (use [] if none apply)'
  for (const ws of c.workstreams) {
    if (!VALID_WORKSTREAMS.has(ws)) return `invalid workstream: "${ws}"`
  }

  if (!c.sponsorNatSec100Relevance || !VALID_SPONSOR_RELEVANCE.has(c.sponsorNatSec100Relevance)) {
    return `invalid sponsorNatSec100Relevance: "${c.sponsorNatSec100Relevance}"`
  }

  if (c.region && !VALID_REGIONS.has(c.region)) return `invalid region: "${c.region}"`

  if (!c.tags) return 'missing tags (use [] if none apply)'

  return null
}

// ── scoring.ts logic ────────────────────────────────────────────────────
function calcRecencyScore(datePublished) {
  const published = new Date(datePublished)
  const now = new Date()
  const diffDays = (now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays <= 2) return 30
  if (diffDays <= 7) return 25
  if (diffDays <= 30) return 15
  if (diffDays <= 60) return 5
  return 0
}

function calcSVDGRelevanceScore(level) {
  switch (level) {
    case 'High': return 35
    case 'Medium': return 20
    case 'Low': return 5
  }
}

function calcSourceQualityScore(level) {
  switch (level) {
    case 'High': return 15
    case 'Medium': return 8
    case 'Low': return 3
  }
}

function calcWorkstreamScore(workstreams) {
  if (workstreams.length >= 2) return 10
  if (workstreams.length === 1) return 6
  return 0
}

function calcSponsorNatSec100Score(relevance) {
  switch (relevance) {
    case 'Direct': return 10
    case 'Ecosystem': return 5
    case 'None': return 0
  }
}

function calcRelevanceScore(inputs) {
  const breakdown = {
    recency: calcRecencyScore(inputs.datePublished),
    svdgRelevance: calcSVDGRelevanceScore(inputs.svdgRelevanceLevel),
    sourceQuality: calcSourceQualityScore(inputs.sourceQualityLevel),
    workstreamRelevance: calcWorkstreamScore(inputs.workstreams),
    sponsorNatSec100: calcSponsorNatSec100Score(inputs.sponsorNatSec100Relevance),
  }
  const score = Math.min(
    100,
    breakdown.recency +
      breakdown.svdgRelevance +
      breakdown.sourceQuality +
      breakdown.workstreamRelevance +
      breakdown.sponsorNatSec100
  )
  return { score, breakdown }
}

// ── archive.ts logic ────────────────────────────────────────────────────
const ARCHIVE_THRESHOLD_DAYS = 60
function shouldAutoArchive(datePublished) {
  const published = new Date(datePublished)
  const now = new Date()
  const diffDays = (now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays > ARCHIVE_THRESHOLD_DAYS
}

// A candidate has enough core metadata to skip manual review if it has a
// title, a publication date, and a publication/source. Author is a bonus
// but not required (most newsletter items don't carry a byline).
function hasCoreMetadata(c) {
  return !!(c.title && c.title.trim() && c.datePublished && c.datePublished.trim() && c.source && c.source.trim())
}

function buildArticle(c) {
  const now = new Date().toISOString()
  const inputs = {
    datePublished: c.datePublished,
    svdgRelevanceLevel: c.svdgRelevanceLevel,
    sourceQualityLevel: c.sourceQualityLevel,
    workstreams: c.workstreams || [],
    sponsorNatSec100Relevance: c.sponsorNatSec100Relevance,
  }
  const { score, breakdown } = calcRelevanceScore(inputs)

  return {
    id: crypto.randomUUID(),
    title: c.title.trim(),
    url: c.url.trim(),
    source: c.source.trim(),
    author: (c.author && c.author.trim()) || undefined,
    datePublished: c.datePublished,
    dateAdded: now.split('T')[0],
    categories: c.categories,
    tags: c.tags || [],
    shortDescription: c.shortDescription.trim(),
    whyItMatters: (c.whyItMatters && c.whyItMatters.trim()) || undefined,
    relevanceScore: score,
    scoreBreakdown: breakdown,
    isScoreOverridden: false,
    originalCalculatedScore: undefined,
    status: hasCoreMetadata(c) ? 'Reviewed' : 'New',
    region: c.region || undefined,
    sponsorName: (c.sponsorName && c.sponsorName.trim()) || undefined,
    companyMentions: c.companyMentions
      ? c.companyMentions.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
    addedBy: 'AI Candidate',
    isArchived: shouldAutoArchive(c.datePublished),
    isFeatured: false,
    svdgRelevanceLevel: c.svdgRelevanceLevel,
    sourceQualityLevel: c.sourceQualityLevel,
    workstreams: c.workstreams || [],
    sponsorNatSec100Relevance: c.sponsorNatSec100Relevance,
    reactions: {},
    createdAt: now,
    updatedAt: now,
  }
}

function main() {
  const inputPath = process.argv[2]
    ? path.resolve(process.cwd(), process.argv[2])
    : path.join(process.cwd(), 'data', 'candidates.json')

  if (!fs.existsSync(inputPath)) {
    console.error(`No candidates file found at ${inputPath}`)
    process.exit(1)
  }
  if (!fs.existsSync(DB_PATH)) {
    console.error(`No articles database found at ${DB_PATH}.`)
    process.exit(1)
  }

  const candidates = JSON.parse(fs.readFileSync(inputPath, 'utf-8'))
  const existing = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
  const existingUrls = new Set(existing.map((a) => normalizeUrl(a.url)))

  const added = []
  const skipped = []

  for (const candidate of candidates) {
    const error = validate(candidate)
    if (error) {
      skipped.push({ title: candidate.title, url: candidate.url, reason: error })
      continue
    }

    const normalized = normalizeUrl(candidate.url)
    if (existingUrls.has(normalized)) {
      skipped.push({ title: candidate.title, url: candidate.url, reason: 'duplicate URL — already in database' })
      continue
    }

    const article = buildArticle(candidate)
    added.push(article)
    existingUrls.add(normalized)
  }

  if (added.length > 0) {
    const updated = [...existing, ...added]
    fs.writeFileSync(DB_PATH, JSON.stringify(updated, null, 2))
  }

  console.log(`\nProcessed ${candidates.length} candidate(s) from ${path.relative(process.cwd(), inputPath)}`)
  console.log(`  Added:   ${added.length}`)
  for (const a of added) {
    console.log(`    + [${a.relevanceScore}] ${a.title} (${a.source})`)
  }
  console.log(`  Skipped: ${skipped.length}`)
  for (const s of skipped) {
    console.log(`    - ${s.title || s.url || '(untitled)'} — ${s.reason}`)
  }
  console.log('')
}

main()
