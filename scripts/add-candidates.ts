/**
 * CLI: Insert AI-discovered candidate articles into data/articles.json.
 *
 * Usage:
 *   npx tsx scripts/add-candidates.ts [path-to-candidates.json]
 *
 * Defaults to data/candidates.json if no path is given.
 *
 * Input format: a JSON array of candidate objects, e.g.
 * [
 *   {
 *     "title": "Anduril Raises $1.5B Series G",
 *     "url": "https://example.com/article",
 *     "source": "Defense News",
 *     "author": "Jane Doe",                 // optional
 *     "datePublished": "2026-06-08",        // YYYY-MM-DD
 *     "categories": ["Investor News"],
 *     "tags": ["Venture Capital", "Defense Startup"],
 *     "shortDescription": "One or two sentence summary of the article.",
 *     "whyItMatters": "Why this matters to SVDG.",  // optional
 *     "region": "US",                        // optional: US | Europe | UK | Australia | Other
 *     "sponsorName": "",                      // optional
 *     "companyMentions": "Anduril, Lockheed", // optional, comma-separated
 *     "svdgRelevanceLevel": "High",           // High | Medium | Low
 *     "sourceQualityLevel": "High",           // High | Medium | Low
 *     "workstreams": ["NatSec100", "Capital Formation"],
 *     "sponsorNatSec100Relevance": "Direct"   // Direct | Ecosystem | None
 *   }
 * ]
 *
 * Behavior:
 *   - Skips any candidate whose URL already exists in data/articles.json
 *     (dedupe by exact URL match, case/whitespace-insensitive).
 *   - Skips any candidate missing required fields, with a reason printed.
 *   - Computes relevanceScore + scoreBreakdown via the same scoring logic
 *     used by the app (src/lib/scoring.ts).
 *   - Sets addedBy: 'AI Candidate', isFeatured: false.
 *   - Sets status: 'Reviewed' if the candidate has title, datePublished, and
 *     source (author optional); otherwise 'New' (needs manual review).
 *   - Sets isArchived based on the same 60-day rule the app uses.
 *   - Appends accepted articles to data/articles.json.
 *   - Prints a summary of added / skipped candidates.
 */

import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { calcRelevanceScore, ScoreInputs } from '../src/lib/scoring'
import { shouldAutoArchive } from '../src/lib/archive'
import { CATEGORIES, WORKSTREAMS } from '../src/data/categories'
import {
  Article,
  Category,
  Region,
  SVDGRelevanceLevel,
  SourceQualityLevel,
  Workstream,
  SponsorNatSec100Relevance,
} from '../src/types/article'

const DB_PATH = path.join(process.cwd(), 'data', 'articles.json')

const VALID_CATEGORIES = new Set(CATEGORIES.map((c) => c.label))
const VALID_WORKSTREAMS = new Set(WORKSTREAMS)
const VALID_REGIONS = new Set(['US', 'Europe', 'UK', 'Australia', 'Other'])
const VALID_LEVELS = new Set(['High', 'Medium', 'Low'])
const VALID_SPONSOR_RELEVANCE = new Set(['Direct', 'Ecosystem', 'None'])

interface CandidateInput {
  title?: string
  url?: string
  source?: string
  author?: string
  datePublished?: string
  categories?: string[]
  tags?: string[]
  shortDescription?: string
  whyItMatters?: string
  region?: string
  sponsorName?: string
  companyMentions?: string
  svdgRelevanceLevel?: string
  sourceQualityLevel?: string
  workstreams?: string[]
  sponsorNatSec100Relevance?: string
}

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, '').toLowerCase()
}

function validate(c: CandidateInput): string | null {
  if (!c.title?.trim()) return 'missing title'
  if (!c.url?.trim()) return 'missing url'
  if (!c.source?.trim()) return 'missing source'
  if (!c.datePublished || !/^\d{4}-\d{2}-\d{2}/.test(c.datePublished)) {
    return 'missing or invalid datePublished (expected YYYY-MM-DD)'
  }
  if (!c.shortDescription?.trim()) return 'missing shortDescription'

  if (!c.categories || c.categories.length === 0) return 'missing categories'
  for (const cat of c.categories) {
    if (!VALID_CATEGORIES.has(cat as Category)) return `invalid category: "${cat}"`
  }

  if (!c.svdgRelevanceLevel || !VALID_LEVELS.has(c.svdgRelevanceLevel)) {
    return `invalid svdgRelevanceLevel: "${c.svdgRelevanceLevel}"`
  }
  if (!c.sourceQualityLevel || !VALID_LEVELS.has(c.sourceQualityLevel)) {
    return `invalid sourceQualityLevel: "${c.sourceQualityLevel}"`
  }

  if (!c.workstreams) return 'missing workstreams (use [] if none apply)'
  for (const ws of c.workstreams) {
    if (!VALID_WORKSTREAMS.has(ws as Workstream)) return `invalid workstream: "${ws}"`
  }

  if (!c.sponsorNatSec100Relevance || !VALID_SPONSOR_RELEVANCE.has(c.sponsorNatSec100Relevance)) {
    return `invalid sponsorNatSec100Relevance: "${c.sponsorNatSec100Relevance}"`
  }

  if (c.region && !VALID_REGIONS.has(c.region)) return `invalid region: "${c.region}"`

  if (!c.tags) return 'missing tags (use [] if none apply)'

  return null
}

// A candidate has enough core metadata to skip manual review if it has a
// title, a publication date, and a publication/source. Author is a bonus
// but not required (most newsletter items don't carry a byline).
function hasCoreMetadata(c: CandidateInput): boolean {
  return !!(c.title?.trim() && c.datePublished?.trim() && c.source?.trim())
}

function buildArticle(c: CandidateInput): Article {
  const now = new Date().toISOString()

  const inputs: ScoreInputs = {
    datePublished: c.datePublished as string,
    svdgRelevanceLevel: c.svdgRelevanceLevel as SVDGRelevanceLevel,
    sourceQualityLevel: c.sourceQualityLevel as SourceQualityLevel,
    workstreams: (c.workstreams as Workstream[]) || [],
    sponsorNatSec100Relevance: c.sponsorNatSec100Relevance as SponsorNatSec100Relevance,
  }
  const { score, breakdown } = calcRelevanceScore(inputs)

  return {
    id: uuidv4(),
    title: c.title!.trim(),
    url: c.url!.trim(),
    source: c.source!.trim(),
    author: c.author?.trim() || undefined,
    datePublished: c.datePublished as string,
    dateAdded: now.split('T')[0],
    categories: c.categories as Category[],
    tags: c.tags || [],
    shortDescription: c.shortDescription!.trim(),
    whyItMatters: c.whyItMatters?.trim() || undefined,
    relevanceScore: score,
    scoreBreakdown: breakdown,
    isScoreOverridden: false,
    originalCalculatedScore: undefined,
    status: hasCoreMetadata(c) ? 'Reviewed' : 'New',
    region: (c.region as Region) || undefined,
    sponsorName: c.sponsorName?.trim() || undefined,
    companyMentions: c.companyMentions
      ? c.companyMentions.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
    addedBy: 'AI Candidate',
    isArchived: shouldAutoArchive(c.datePublished as string),
    isFeatured: false,
    svdgRelevanceLevel: c.svdgRelevanceLevel as SVDGRelevanceLevel,
    sourceQualityLevel: c.sourceQualityLevel as SourceQualityLevel,
    workstreams: (c.workstreams as Workstream[]) || [],
    sponsorNatSec100Relevance: c.sponsorNatSec100Relevance as SponsorNatSec100Relevance,
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
    console.error('Pass a path to a JSON array of candidate articles, or create data/candidates.json.')
    process.exit(1)
  }

  if (!fs.existsSync(DB_PATH)) {
    console.error(`No articles database found at ${DB_PATH}. Run the app once (npm run dev) to seed it.`)
    process.exit(1)
  }

  const candidates: CandidateInput[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'))
  const existing: Article[] = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
  const existingUrls = new Set(existing.map((a) => normalizeUrl(a.url)))

  const added: Article[] = []
  const skipped: { title?: string; url?: string; reason: string }[] = []

  for (const candidate of candidates) {
    const error = validate(candidate)
    if (error) {
      skipped.push({ title: candidate.title, url: candidate.url, reason: error })
      continue
    }

    const normalized = normalizeUrl(candidate.url as string)
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
