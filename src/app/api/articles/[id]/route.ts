import { NextRequest, NextResponse } from 'next/server'
import { getArticleById, updateArticle, deleteArticle } from '@/lib/db'
import { ArticleFormData } from '@/types/article'

interface Params { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const article = await getArticleById(params.id)
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(article)
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const body: ArticleFormData = await req.json()

    // Saving an edit is itself a review — if someone opens an article and
    // hits "Save Changes" without touching the Status dropdown, take it out
    // of the "Needs Review" queue rather than leaving it stuck on "New".
    if (body.status === 'New') {
      body.status = 'Reviewed'
    }

    const updated = await updateArticle(params.id, body)
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const ok = await deleteArticle(params.id)
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
