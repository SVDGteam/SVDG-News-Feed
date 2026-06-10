import { getAllArticles } from '@/lib/db'
import CategoryPageClient from '@/components/CategoryPageClient'
import { getCategoryConfig } from '@/data/categories'

export const dynamic = 'force-dynamic'

export default function InternationalPage() {
  const cat = getCategoryConfig('International')!
  return (
    <div>
      <span className="eyebrow text-svdg-sky">Category</span>
      <h1 className="text-2xl mb-3">{cat.label}</h1>
      <CategoryPageClient
        articles={getAllArticles()}
        category="International"
        description={cat.description}
        showRegionFilter
      />
    </div>
  )
}
