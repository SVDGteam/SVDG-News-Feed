import { getAllArticles } from '@/lib/db'
import CategoryPageClient from '@/components/CategoryPageClient'
import CategoryHero from '@/components/CategoryHero'
import { getCategoryConfig } from '@/data/categories'

export const dynamic = 'force-dynamic'

export default async function OpinionsPage() {
  const cat = getCategoryConfig('Opinions')!
  return (
    <div>
      <CategoryHero category={cat} />
      <CategoryPageClient
        articles={await getAllArticles()}
        category="Opinions"
        description={cat.description}
      />
    </div>
  )
}
