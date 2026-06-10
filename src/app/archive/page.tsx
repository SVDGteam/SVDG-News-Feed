import { getAllArticles } from '@/lib/db'
import ArchivePageClient from './ArchivePageClient'
import PageHeading from '@/components/PageHeading'

export const dynamic = 'force-dynamic'

export default async function ArchivePage() {
  const all = await getAllArticles()
  const archived = all.filter((a) => a.isArchived)
  return (
    <div>
      <PageHeading
        eyebrow="An SVDG Product"
        title="Archive"
        description="Articles published more than 60 days ago. Fully searchable and filterable."
      />
      <ArchivePageClient articles={archived} />
    </div>
  )
}
