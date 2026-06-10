import { getAllArticles } from '@/lib/db'
import CategoryPageClient from '@/components/CategoryPageClient'
import PageHeading from '@/components/PageHeading'
import { getCategoryConfig } from '@/data/categories'

export const dynamic = 'force-dynamic'

export default function InvestorPage() {
  const cat = getCategoryConfig('Investor News')!
  return (
    <div>
      <PageHeading eyebrow="Category" title={cat.label} />
      <CategoryPageClient
        articles={getAllArticles()}
        category="Investor News"
        description={cat.description}
      />
    </div>
  )
}
