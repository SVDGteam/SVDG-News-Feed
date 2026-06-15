import { NextRequest, NextResponse } from 'next/server'
import { getAllArticles, createArticle } from '@/lib/db'
import { ArticleFormData, Category } from '@/types/article'
import { CATEGORIES } from '@/data/categories'
import { enrichExtensionSubmission } from '@/lib/articleEnrichment'

export const dynamic = 'force-dynamic'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

// Endpoint for the SVDG Dispatch browser extension (see /extension and
// docs/EXTENSION_SETUP.md). Lets team members clip the page they're reading
// straight into the shared database, auto-scored and marked Reviewed (see
// src/lib/articleEnrichment.ts) — no manual review queue required.
//
// Protected by a shared secret (EXTENSION_API_SECRET) sent as
// `x-api-key`. Set the same value in Vercel and in the extension's
// options page.
export async function POST(req: NextRequest) {
  const secret = process.env.EXTENSION_API_SECRET
  const key = req.headers.get('x-api-key')

  if (!secret || key !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS })
  }

  let body: {
    title?: string
    url?: string
    source?: string
    description?: string
    categories?: string[]
    tags?: string
    notes?: string
    addedByName?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: CORS })
  }

  const url = (body.url || '').trim()
  const title = (body.title || '').trim()

  if (!url || !title) {
    return NextResponse.json({ error: 'title and url are required' }, { status: 400, headers: CORS })
  }

  // De-dupe: if this URL is already in the database, just return it instead
  // of creating a second copy.
  const existing = (await getAllArticles()).find((a) => a.url === url)
  if (existing) {
    return NextResponse.json(existing, { status: 200, headers: CORS })
  }

  let source = (body.source || '').trim()
  if (!source) {
    try {
      source = new URL(url).hostname.replace(/^www\./, '')
    } catch {
      source = 'Unknown'
    }
  }

  const validLabels = new Set(CATEGORIES.map((c) => c.label))
  const categories = (body.categories || []).filter((c): c is Category => validLabels.has(c as Category))
  const finalCategories = categories.length ? categories : (['Industry News'] as Category[])

  // A team member chose to clip this — that's a vote of confidence, so we
  // auto-fill the scoring fields and skip "Needs Review" instead of leaving
  // it Medium/Medium/blank. See src/lib/articleEnrichment.ts.
  const enrichment = await enrichExtensionSubmission(source.toLowerCase(), finalCategories)

  const form: ArticleFormData = {
    title,
    url,
    source,
    author: '',
    datePublished: new Date().toISOString().split('T')[0],
    categories: finalCategories,
    tags: (body.tags || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    shortDescription: (body.description || '').trim() || title,
    whyItMatters: (body.notes || '').trim(),
    region: enrichment.region,
    sponsorName: '',
    companyMentions: '',
    status: 'Reviewed',
    isFeatured: false,
    svdgRelevanceLevel: 'High',
    sourceQualityLevel: enrichment.sourceQualityLevel,
    workstreams: enrichment.workstreams,
    sponsorNatSec100Relevance: enrichment.sponsorNatSec100Relevance,
    addedBy: 'Browser Extension',
  }

  const article = await createArticle(form)
  return NextResponse.json(article, { status: 201, headers: CORS })
}
