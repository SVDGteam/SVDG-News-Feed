import { getAllArticles } from '@/lib/db'
import SearchPageClient from './SearchPageClient'
import PageHeading from '@/components/PageHeading'

export const dynamic = 'force-dynamic'

export default function SearchPage() {
  return (
    <div>
      <PageHeading
        eyebrow="A SVDG Product"
        title="Search"
        description="Search and filter across every category — including the archive — in one place."
      />
      <SearchPageClient articles={getAllArticles()} />
    </div>
  )
}
