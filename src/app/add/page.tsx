import Link from 'next/link'
import ArticleForm from '@/components/ArticleForm'

export default function AddArticlePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="text-sm text-slate-400 hover:text-blue-600">← Home</Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-xl font-bold text-slate-900">Add Article</h1>
      </div>
      <ArticleForm />
    </div>
  )
}
