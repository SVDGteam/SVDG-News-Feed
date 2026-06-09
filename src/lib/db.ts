/**
 * Simple JSON-file database adapter for the MVP.
 * Designed to be swapped for Prisma/Postgres/Supabase later.
 * All functions are synchronous file I/O — fine for local/dev use.
 */

import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { Article, ArticleFormData } from '@/types/article'
import { SEED_ARTICLES } from '@/data/seed'
import { calcRelevanceScore, ScoreInputs } from '@/lib/scoring'
import { shouldAutoArchive } from '@/lib/archive'

const DB_PATH = path.join(process.cwd(), 'data', 'articles.json')

// ── Ensure data directory and file exist ───────────────────────────────────
function ensureDB(): void {
  const dir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(DB_PATH)) {
    const seeded = seedArticles()
    fs.writeFileSync(DB_PATH, JSON.stringify(seeded, null, 2))
  }
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

// ── Read all ───────────────────────────────────────────────────────────────
export function getAllArticles(): Article[] {
  ensureDB()
  const raw = fs.readFileSync(DB_PATH, 'utf-8')
  const articles: Article[] = JSON.parse(raw)

  // Auto-archive based on age
  let dirty = false
  const updated = articles.map((a) => {
    if (!a.isArchived && shouldAutoArchive(a.datePublished)) {
      dirty = true
      return { ...a, isArchived: true, status: 'Archived' as const, updatedAt: new Date().toISOString() }
    }
    return a
  })

  if (dirty) fs.writeFileSync(DB_PATH, JSON.stringify(updated, null, 2))
  return updated
}

// ── Get by id ──────────────────────────────────────────────────────────────
export function getArticleById(id: string): Article | null {
  const all = getAllArticles()
  return all.find((a) => a.id === id) ?? null
}

// ── Create ─────────────────────────────────────────────────────────────────
export function createArticle(form: ArticleFormData): Article {
  const all = getAllArticles()
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

  all.push(article)
  fs.writeFileSync(DB_PATH, JSON.stringify(all, null, 2))
  return article
}

// ── Update ─────────────────────────────────────────────────────────────────
export function updateArticle(id: string, form: ArticleFormData): Article | null {
  const all = getAllArticles()
  const idx = all.findIndex((a) => a.id === id)
  if (idx === -1) return null

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
    ...all[idx],
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

  all[idx] = updated
  fs.writeFileSync(DB_PATH, JSON.stringify(all, null, 2))
  return updated
}

// ── Delete ─────────────────────────────────────────────────────────────────
export function deleteArticle(id: string): boolean {
  const all = getAllArticles()
  const filtered = all.filter((a) => a.id !== id)
  if (filtered.length === all.length) return false
  fs.writeFileSync(DB_PATH, JSON.stringify(filtered, null, 2))
  return true
}

// ── Reset to seed (dev utility) ────────────────────────────────────────────
export function resetToSeed(): Article[] {
  const seeded = seedArticles()
  fs.writeFileSync(DB_PATH, JSON.stringify(seeded, null, 2))
  return seeded
}
