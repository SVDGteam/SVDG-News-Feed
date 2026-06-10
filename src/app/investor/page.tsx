import { getAllArticles } from '@/lib/db'
import CategoryPageClient from '@/components/CategoryPageClient'
import CategoryHero from '@/components/CategoryHero'
import { getCategoryConfig } from '@/data/categories'

export const dynamic = 'force-dynamic'

export default function InvestorPage() {
  const cat = getCategoryConfig('Investor News')!
  return (
    <div>
      <CategoryHero category={cat} />
      <CategoryPageClient
        articles={getAllArticles()}
        category="Investor News"
        description={cat.description}
      />
    </div>
  )
}
