import { getAllArticles } from '@/lib/db'
import CategoryPageClient from '@/components/CategoryPageClient'
import CategoryHero from '@/components/CategoryHero'
import { getCategoryConfig } from '@/data/categories'

export const dynamic = 'force-dynamic'

export default function InternationalPage() {
  const cat = getCategoryConfig('International')!
  return (
    <div>
      <CategoryHero category={cat} />
      <CategoryPageClient
        articles={getAllArticles()}
        category="International"
        description={cat.description}
        showRegionFilter
      />
    </div>
  )
}
