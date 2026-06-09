import { getAllArticles } from '@/lib/db'
import CategoryPageClient from '@/components/CategoryPageClient'
import { getCategoryConfig } from '@/data/categories'

export const dynamic = 'force-dynamic'

export default function InternationalPage() {
  const cat = getCategoryConfig('International')!
  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 mb-1">{cat.label}</h1>
      <CategoryPageClient
        articles={getAllArticles()}
        category="International"
        description={cat.description}
        showRegionFilter
      />
    </div>
  )
}
