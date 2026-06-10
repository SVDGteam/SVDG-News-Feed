import { NextRequest, NextResponse } from 'next/server'
import { getAllArticles, createArticle } from '@/lib/db'
import { ArticleFormData, Category } from '@/types/article'
import { CATEGORIES } from '@/data/categories'

export const dynamic = 'force-dynamic'

// Endpoint for the SVDG Dispatch browser extension (see /extension and
// docs/EXTENSION_SETUP.md). Lets team members clip the page they're reading
// straight into the shared database for AI scoring + review.
//
// Protected by a shared secret (EXTENSION_API_SECRET) sent as
// `x-api-key`. Set the same value in Vercel and in the extension's
// options page.
export async function POST(req: NextRequest) {
  const secret = process.env.EXTENSION_API_SECRET
  const key = req.headers.get('x-api-key')

  if (secret && key !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const url = (body.url || '').trim()
  const title = (body.title || '').trim()

  if (!url || !title) {
    return NextResponse.json({ error: 'title and url are required' }, { status: 400 })
  }

  // De-dupe: if this URL is already in the database, just return it instead
  // of creating a second copy.
  const existing = getAllArticles().find((a) => a.url === url)
  if (existing) {
    return NextResponse.json(existing, { status: 200 })
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

  const form: ArticleFormData = {
    title,
    url,
    source,
    author: '',
    datePublished: new Date().toISOString().split('T')[0],
    categories: categories.length ? categories : ['Industry News'],
    tags: (body.tags || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    shortDescription: (body.description || '').trim() || title,
    whyItMatters: (body.notes || '').trim(),
    region: undefined,
    sponsorName: '',
    companyMentions: '',
    status: 'New',
    isFeatured: false,
    svdgRelevanceLevel: 'Medium',
    sourceQualityLevel: 'Medium',
    workstreams: [],
    sponsorNatSec100Relevance: 'None',
    addedBy: 'Browser Extension',
  }

  const article = createArticle(form)
  return NextResponse.json(article, { status: 201 })
}
