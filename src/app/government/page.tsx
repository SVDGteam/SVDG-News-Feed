import { getAllArticles } from '@/lib/db'
import CategoryPageClient from '@/components/CategoryPageClient'
import CategoryHero from '@/components/CategoryHero'
import { getCategoryConfig } from '@/data/categories'

export const dynamic = 'force-dynamic'

export default function GovernmentPage() {
  const cat = getCategoryConfig('Government News')!
  return (
    <div>
      <CategoryHero category={cat} />
      <CategoryPageClient
        articles={getAllArticles()}
        category="Government News"
        description={cat.description}
      />
    </div>
  )
}
