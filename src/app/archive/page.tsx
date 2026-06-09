import { getAllArticles } from '@/lib/db'
import ArchivePageClient from './ArchivePageClient'

export const dynamic = 'force-dynamic'

export default function ArchivePage() {
  const all = getAllArticles()
  const archived = all.filter((a) => a.isArchived)
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-900 mb-0.5">Archive</h1>
        <p className="text-sm text-slate-500">
          Articles published more than 60 days ago. Fully searchable and filterable.
        </p>
      </div>
      <ArchivePageClient articles={archived} />
    </div>
  )
}
