import { getAllArticles } from '@/lib/db'
import CategoryPageClient from '@/components/CategoryPageClient'
import PageHeading from '@/components/PageHeading'
import { getCategoryConfig } from '@/data/categories'

export const dynamic = 'force-dynamic'

export default function OpinionsPage() {
  const cat = getCategoryConfig('Opinions')!
  return (
    <div>
      <PageHeading eyebrow="Category" title={cat.label} />
      <CategoryPageClient
        articles={getAllArticles()}
        category="Opinions"
        description={cat.description}
      />
    </div>
  )
}
