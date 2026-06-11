import { getAllArticles } from '@/lib/db'
import ArchivePageClient from './ArchivePageClient'
import PageHeading from '@/components/PageHeading'

export const dynamic = 'force-dynamic'

export default async function ArchivePage() {
  return (
    <div>
      <PageHeading
        eyebrow="An SVDG Product"
        title="All Articles"
        description="Search and filter across every category — including the archive — in one place."
      />
      <ArchivePageClient articles={await getAllArticles()} />
    </div>
  )
}
