import { getAllArticles } from '@/lib/db'
import CategoryPageClient from '@/components/CategoryPageClient'
import { getCategoryConfig } from '@/data/categories'

export const dynamic = 'force-dynamic'

export default function InvestorPage() {
  const cat = getCategoryConfig('Investor News')!
  return (
    <div>
      <span className="eyebrow text-svdg-admiral">Category</span>
      <h1 className="text-2xl mb-3">{cat.label}</h1>
      <CategoryPageClient
        articles={getAllArticles()}
        category="Investor News"
        description={cat.description}
      />
    </div>
  )
}
