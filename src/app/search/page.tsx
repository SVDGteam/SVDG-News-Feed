import { getAllArticles } from '@/lib/db'
import SearchPageClient from './SearchPageClient'

export const dynamic = 'force-dynamic'

export default function SearchPage() {
  return (
    <div>
      <span className="eyebrow text-svdg-sky">SVDG&apos;s Red Folder</span>
      <h1 className="text-2xl mb-1">Search</h1>
      <p className="text-sm text-svdg-french-gray mb-4">
        Search and filter across every category — including the archive — in one place.
      </p>
      <SearchPageClient articles={getAllArticles()} />
    </div>
  )
}
