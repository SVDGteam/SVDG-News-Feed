import { getAllArticles } from '@/lib/db'
import ArchivePageClient from './ArchivePageClient'

export const dynamic = 'force-dynamic'

export default function ArchivePage() {
  const all = getAllArticles()
  const archived = all.filter((a) => a.isArchived)
  return (
    <div>
      <div className="mb-4">
        <span className="eyebrow text-svdg-admiral">SVDG&apos;s Red Folder</span>
        <h1 className="text-2xl mb-1">Archive</h1>
        <p className="text-sm text-svdg-french-gray">
          Articles published more than 60 days ago. Fully searchable and filterable.
        </p>
      </div>
      <ArchivePageClient articles={archived} />
    </div>
  )
}
