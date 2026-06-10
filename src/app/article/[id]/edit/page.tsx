import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticleById } from '@/lib/db'
import ArticleForm from '@/components/ArticleForm'

interface Props { params: { id: string } }

export const dynamic = 'force-dynamic'

export default async function EditArticlePage({ params }: Props) {
  const article = await getArticleById(params.id)
  if (!article) notFound()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="text-sm text-svdg-french-gray hover:text-svdg-sky">← Home</Link>
        <span className="text-white/20">/</span>
        <h1 className="text-xl">Edit Article</h1>
      </div>
      <div className="bg-blue-500/15 border border-blue-400/30 rounded px-3 py-2 text-xs text-slate-300 mb-4">
        <span className="font-medium">Editing:</span> {article.title}
      </div>
      <ArticleForm article={article} />
    </div>
  )
}
