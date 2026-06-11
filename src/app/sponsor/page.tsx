import { getAllArticles } from '@/lib/db'
import CategoryPageClient from '@/components/CategoryPageClient'
import CategoryHero from '@/components/CategoryHero'
import SponsorRosterEditor from '@/components/SponsorRosterEditor'
import { getCategoryConfig } from '@/data/categories'
import { getAllSponsors } from '@/lib/sponsors'

export const dynamic = 'force-dynamic'

export default async function SponsorPage() {
  const cat = getCategoryConfig('Sponsor News')!
  return (
    <div>
      <CategoryHero category={cat} />

      <SponsorRosterEditor initialSponsors={await getAllSponsors()} />

      <CategoryPageClient
        articles={await getAllArticles()}
        category="Sponsor News"
        description={cat.description}
        showSponsorFilter
      />
    </div>
  )
}
