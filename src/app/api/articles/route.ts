import { NextRequest, NextResponse } from 'next/server'
import { getAllArticles, createArticle } from '@/lib/db'
import { ArticleFormData } from '@/types/article'

export async function GET() {
  try {
    const articles = await getAllArticles()
    return NextResponse.json(articles)
  } catch (err) {
    console.error('[api/articles GET]', err)
    return NextResponse.json({ error: 'Failed to read articles' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: ArticleFormData = await req.json()
    const article = await createArticle(body)
    return NextResponse.json(article, { status: 201 })
  } catch (err) {
    console.error('[api/articles POST]', err)
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
  }
}
