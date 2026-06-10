import Link from 'next/link'
import ArticleForm from '@/components/ArticleForm'

export default function AddArticlePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="text-sm text-svdg-french-gray hover:text-svdg-sky">← Home</Link>
        <span className="text-white/20">/</span>
        <h1 className="text-xl">Add Article</h1>
      </div>
      <ArticleForm />
    </div>
  )
}
