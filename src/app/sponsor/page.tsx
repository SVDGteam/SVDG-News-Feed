import { getAllArticles } from '@/lib/db'
import CategoryPageClient from '@/components/CategoryPageClient'
import { getCategoryConfig } from '@/data/categories'
import { SPONSORS } from '@/data/sponsors'

export const dynamic = 'force-dynamic'

export default function SponsorPage() {
  const cat = getCategoryConfig('Sponsor News')!
  return (
    <div>
      <span className="eyebrow text-svdg-admiral">Category</span>
      <h1 className="text-2xl mb-3">{cat.label}</h1>

      <details className="mb-4 bg-white border border-svdg-timberwolf rounded-lg">
        <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium text-svdg-pea-coat select-none">
          SVDG Sponsor Roster <span className="text-svdg-french-gray font-normal">({SPONSORS.length})</span>
        </summary>
        <div className="px-4 pb-4 flex flex-wrap gap-1.5">
          {SPONSORS.map((s) => (
            <a
              key={s.name}
              href={`https://${s.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="svdg-tag svdg-tag--outline hover:bg-svdg-platinum transition-colors normal-case tracking-normal"
            >
              {s.name}
            </a>
          ))}
        </div>
      </details>

      <CategoryPageClient
        articles={getAllArticles()}
        category="Sponsor News"
        description={cat.description}
        showSponsorFilter
      />
    </div>
  )
}
