/**
 * Article "database" adapter.
 *
 * data/articles.json is the base dataset — committed to git, updated by the
 * daily AI research job, and bundled with every deploy. Vercel's runtime
 * filesystem is read-only, so live writes (the browser extension, the
 * dashboard's Add/Edit forms, and like/dislike voting) can't modify that
 * file directly in production.
 *
 * Instead, live writes go to a small "overlay" stored in Upstash Redis
 * (connected via the Vercel Storage tab — KV_REST_API_URL/KV_REST_API_TOKEN):
 *   - extra:   articles created live, not yet in data/articles.json
 *   - edits:   full replacement articles, keyed by id, for articles that
 *              originate from data/articles.json
 *   - deleted: ids of base articles removed live
 *
 * getAllArticles() merges the file + overlay on every read. When the daily
 * research job adds new articles to data/articles.json and that's deployed,
 * they simply appear in the merged result alongside any live-only articles.
 *
 * If KV_REST_API_URL/KV_REST_API_TOKEN aren't set (local development, and
 * the scripts/ CLI tools), everything falls back to reading/writing
 * data/articles.json directly, exactly as before.
 */

import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { Article, ArticleFormData, ReactionType } from '@/types/article'
import { SEED_ARTICLES } from '@/data/seed'
import { calcRelevanceScore, ScoreInputs } from '@/lib/scoring'
import { shouldAutoArchive } from '@/lib/archive'
import { hasKV, kvGetJSON, kvSetJSON } from '@/lib/kv'

const DB_PATH = path.join(process.cwd(), 'data', 'articles.json')
const OVERLAY_KEY = 'dispatch:overlay'

interface Overlay {
  extra: Article[]
  edits: Record<string, Article>
  deleted: string[]
}

function emptyOverlay(): Overlay {
  return { extra: [], edits: {}, deleted: [] }
}

// ── Seed helper ────────────────────────────────────────────────────────────
function seedArticles(): Article[] {
  const now = new Date().toISOString()
  return SEED_ARTICLES.map((a) => ({
    ...a,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  }))
}

// ── File-based base dataset ─────────────────────────────────────────────────
function ensureFile(): void {
  const dir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(seedArticles(), null, 2))
  }
}

function readFileArticles(): Article[] {
  ensureFile()
  const raw = fs.readFileSync(DB_PATH, 'utf-8')
  return JSON.parse(raw)
}

function writeFileArticles(articles: Article[]): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(articles, null, 2))
}

// ── Overlay (Upstash) helpers ───────────────────────────────────────────────
async function loadOverlay(): Promise<Overlay> {
  if (!hasKV()) return emptyOverlay()
  const overlay = await kvGetJSON<Overlay>(OVERLAY_KEY)
  return overlay ?? emptyOverlay()
}

async function saveOverlay(overlay: Overlay): Promise<void> {
  await kvSetJSON(OVERLAY_KEY, overlay)
}

function applyAutoArchive(articles: Article[]): Article[] {
  return articles.map((a) => {
    if (!a.isArchived && shouldAutoArchive(a.datePublished)) {
      return { ...a, isArchived: true, status: 'Archived' as const }
    }
    return a
  })
}

// ── Read all ───────────────────────────────────────────────────────────────
export async function getAllArticles(): Promise<Article[]> {
  const fileArticles = readFileArticles()

  if (!hasKV()) {
    // Local/dev fallback: original behavior, persisting auto-archive to disk.
    let dirty = false
    const updated = fileArticles.map((a) => {
      if (!a.isArchived && shouldAutoArchive(a.datePublished)) {
        dirty = true
        return { ...a, isArchived: true, status: 'Archived' as const, updatedAt: new Date().toISOString() }
      }
      return a
    })
    if (dirty) writeFileArticles(updated)
    return updated
  }

  const overlay = await loadOverlay()
  const deleted = new Set(overlay.deleted)

  const merged = fileArticles
    .filter((a) => !deleted.has(a.id))
    .map((a) => overlay.edits[a.id] ?? a)

  const extra = overlay.extra.filter((a) => !deleted.has(a.id))

  return applyAutoArchive([...merged, ...extra])
}

// ── Get by id ──────────────────────────────────────────────────────────────
export async function getArticleById(id: string): Promise<Article | null> {
  const all = await getAllArticles()
  return all.find((a) => a.id === id) ?? null
}

// ── Create ─────────────────────────────────────────────────────────────────
export async function createArticle(form: ArticleFormData): Promise<Article> {
  const now = new Date().toISOString()

  const inputs: ScoreInputs = {
    datePublished: form.datePublished,
    svdgRelevanceLevel: form.svdgRelevanceLevel,
    sourceQualityLevel: form.sourceQualityLevel,
    workstreams: form.workstreams,
    sponsorNatSec100Relevance: form.sponsorNatSec100Relevance,
  }
  const { score, breakdown } = calcRelevanceScore(inputs)

  const isOverridden =
    form.manualScoreOverride !== undefined &&
    form.manualScoreOverride !== score

  const article: Article = {
    id: uuidv4(),
    title: form.title,
    url: form.url,
    source: form.source,
    author: form.author || undefined,
    datePublished: form.datePublished,
    dateAdded: now.split('T')[0],
    categories: form.categories,
    tags: form.tags,
    shortDescription: form.shortDescription,
    whyItMatters: form.whyItMatters || undefined,
    relevanceScore: isOverridden ? (form.manualScoreOverride as number) : score,
    scoreBreakdown: breakdown,
    isScoreOverridden: isOverridden,
    originalCalculatedScore: isOverridden ? score : undefined,
    status: form.status,
    region: form.region,
    sponsorName: form.sponsorName || undefined,
    companyMentions: form.companyMentions
      ? form.companyMentions.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
    addedBy: form.addedBy,
    isArchived: shouldAutoArchive(form.datePublished),
    isFeatured: form.isFeatured,
    svdgRelevanceLevel: form.svdgRelevanceLevel,
    sourceQualityLevel: form.sourceQualityLevel,
    workstreams: form.workstreams,
    sponsorNatSec100Relevance: form.sponsorNatSec100Relevance,
    createdAt: now,
    updatedAt: now,
  }

  if (!hasKV()) {
    const all = readFileArticles()
    all.push(article)
    writeFileArticles(all)
    return article
  }

  const overlay = await loadOverlay()
  overlay.extra.push(article)
  await saveOverlay(overlay)
  return article
}

// ── Update ─────────────────────────────────────────────────────────────────
export async function updateArticle(id: string, form: ArticleFormData): Promise<Article | null> {
  const current = await getArticleById(id)
  if (!current) return null

  const now = new Date().toISOString()

  const inputs: ScoreInputs = {
    datePublished: form.datePublished,
    svdgRelevanceLevel: form.svdgRelevanceLevel,
    sourceQualityLevel: form.sourceQualityLevel,
    workstreams: form.workstreams,
    sponsorNatSec100Relevance: form.sponsorNatSec100Relevance,
  }
  const { score, breakdown } = calcRelevanceScore(inputs)
  const isOverridden =
    form.manualScoreOverride !== undefined &&
    form.manualScoreOverride !== score

  const updated: Article = {
    ...current,
    title: form.title,
    url: form.url,
    source: form.source,
    author: form.author || undefined,
    datePublished: form.datePublished,
    categories: form.categories,
    tags: form.tags,
    shortDescription: form.shortDescription,
    whyItMatters: form.whyItMatters || undefined,
    relevanceScore: isOverridden ? (form.manualScoreOverride as number) : score,
    scoreBreakdown: breakdown,
    isScoreOverridden: isOverridden,
    originalCalculatedScore: isOverridden ? score : undefined,
    status: form.status,
    region: form.region,
    sponsorName: form.sponsorName || undefined,
    companyMentions: form.companyMentions
      ? form.companyMentions.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
    addedBy: form.addedBy,
    isArchived: shouldAutoArchive(form.datePublished) || form.status === 'Archived',
    isFeatured: form.isFeatured,
    svdgRelevanceLevel: form.svdgRelevanceLevel,
    sourceQualityLevel: form.sourceQualityLevel,
    workstreams: form.workstreams,
    sponsorNatSec100Relevance: form.sponsorNatSec100Relevance,
    updatedAt: now,
  }

  if (!hasKV()) {
    const all = readFileArticles()
    const idx = all.findIndex((a) => a.id === id)
    if (idx === -1) return null
    all[idx] = updated
    writeFileArticles(all)
    return updated
  }

  const overlay = await loadOverlay()
  const extraIdx = overlay.extra.findIndex((a) => a.id === id)
  if (extraIdx !== -1) {
    overlay.extra[extraIdx] = updated
  } else {
    overlay.edits[id] = updated
  }
  await saveOverlay(overlay)
  return updated
}

// ── Delete ─────────────────────────────────────────────────────────────────
export async function deleteArticle(id: string): Promise<boolean> {
  if (!hasKV()) {
    const all = readFileArticles()
    const filtered = all.filter((a) => a.id !== id)
    if (filtered.length === all.length) return false
    writeFileArticles(filtered)
    return true
  }

  const overlay = await loadOverlay()

  const extraIdx = overlay.extra.findIndex((a) => a.id === id)
  if (extraIdx !== -1) {
    overlay.extra.splice(extraIdx, 1)
    delete overlay.edits[id]
    await saveOverlay(overlay)
    return true
  }

  const fileArticles = readFileArticles()
  if (!fileArticles.some((a) => a.id === id)) return false

  if (!overlay.deleted.includes(id)) overlay.deleted.push(id)
  delete overlay.edits[id]
  await saveOverlay(overlay)
  return true
}

// ── Set/clear a team member's reaction (like/dislike) ──────────────────────
// Pass reaction: null to remove the user's vote (toggle off).
export async function setReaction(id: string, userId: string, reaction: ReactionType | null): Promise<Article | null> {
  const current = await getArticleById(id)
  if (!current) return null

  const reactions = { ...(current.reactions ?? {}) }
  if (reaction === null) {
    delete reactions[userId]
  } else {
    reactions[userId] = reaction
  }

  const updated: Article = {
    ...current,
    reactions,
    updatedAt: new Date().toISOString(),
  }

  if (!hasKV()) {
    const all = readFileArticles()
    const idx = all.findIndex((a) => a.id === id)
    if (idx === -1) return null
    all[idx] = updated
    writeFileArticles(all)
    return updated
  }

  const overlay = await loadOverlay()
  const extraIdx = overlay.extra.findIndex((a) => a.id === id)
  if (extraIdx !== -1) {
    overlay.extra[extraIdx] = updated
  } else {
    overlay.edits[id] = updated
  }
  await saveOverlay(overlay)
  return updated
}

// ── Set a team member's personal state (read / reading list) ──────────────
// Pass `read` and/or `shortlisted` as true/false to add/remove the userId
// from the corresponding list. Omit a field to leave it unchanged.
export async function setPersonalState(
  id: string,
  userId: string,
  state: { read?: boolean; shortlisted?: boolean }
): Promise<Article | null> {
  const current = await getArticleById(id)
  if (!current) return null

  const readBy = new Set(current.readBy ?? [])
  const shortlistedBy = new Set(current.shortlistedBy ?? [])

  if (state.read === true) readBy.add(userId)
  if (state.read === false) readBy.delete(userId)
  if (state.shortlisted === true) shortlistedBy.add(userId)
  if (state.shortlisted === false) shortlistedBy.delete(userId)

  const updated: Article = {
    ...current,
    readBy: Array.from(readBy),
    shortlistedBy: Array.from(shortlistedBy),
    updatedAt: new Date().toISOString(),
  }

  if (!hasKV()) {
    const all = readFileArticles()
    const idx = all.findIndex((a) => a.id === id)
    if (idx === -1) return null
    all[idx] = updated
    writeFileArticles(all)
    return updated
  }

  const overlay = await loadOverlay()
  const extraIdx = overlay.extra.findIndex((a) => a.id === id)
  if (extraIdx !== -1) {
    overlay.extra[extraIdx] = updated
  } else {
    overlay.edits[id] = updated
  }
  await saveOverlay(overlay)
  return updated
}

// ── Reset to seed (dev utility) ────────────────────────────────────────────
export async function resetToSeed(): Promise<Article[]> {
  const seeded = seedArticles()
  writeFileArticles(seeded)
  if (hasKV()) {
    await saveOverlay(emptyOverlay())
  }
  return seeded
}
