import { getAllArticles } from '@/lib/db'
import CategoryPageClient from '@/components/CategoryPageClient'
import CategoryHero from '@/components/CategoryHero'
import { getCategoryConfig } from '@/data/categories'

export const dynamic = 'force-dynamic'

export default async function IndustryPage() {
  const cat = getCategoryConfig('Industry News')!
  return (
    <div>
      <CategoryHero category={cat} />
      <CategoryPageClient
        articles={await getAllArticles()}
        category="Industry News"
        description={cat.description}
      />
    </div>
  )
}
