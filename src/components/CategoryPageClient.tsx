'use client'

import { useState, useMemo } from 'react'
import { Article, Category, Region } from '@/types/article'
import ArticleCard from './ArticleCard'
import FilterBar from './FilterBar'
import { filterArticles, getUniqueSources, getUniqueTags, getUniqueSponsors, SortKey } from '@/lib/filters'
import { SPONSOR_NAMES } from '@/data/sponsors'

interface Props {
  articles: Article[]
  category: Category
  description: string
  showRegionFilter?: boolean
  showSponsorFilter?: boolean
  defaultRegion?: Region
}

export default function CategoryPageClient({
  articles,
  category,
  description,
  showRegionFilter = false,
  showSponsorFilter = false,
  defaultRegion,
}: Props) {
  const [search, setSearch] = useState('')
  const [source, setSource] = useState('')
  const [tag, setTag] = useState('')
  const [region, setRegion] = useState(defaultRegion ?? '')
  const [sponsor, setSponsor] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState<SortKey>('relevance')
  const [includeArchived, setIncludeArchived] = useState(false)

  const sources = useMemo(() => getUniqueSources(articles.filter(a => a.categories.includes(category))), [articles, category])
  const tags = useMemo(() => getUniqueTags(articles.filter(a => a.categories.includes(category))), [articles, category])
  // For Sponsor News, offer the full SVDG sponsor roster (not just sponsors with existing articles)
  const sponsors = useMemo(
    () => (category === 'Sponsor News' ? SPONSOR_NAMES : getUniqueSponsors(articles.filter(a => a.categories.includes(category)))),
    [articles, category]
  )

  const filtered = useMemo(() =>
    filterArticles(articles, {
      search,
      category,
      region: region as Region || undefined,
      status: status as any || undefined,
      source: source || undefined,
      sponsor: sponsor || undefined,
      tag: tag || undefined,
      includeArchived,
    }, sort),
    [articles, search, category, region, status, source, sponsor, tag, sort, includeArchived]
  )

  return (
    <div>
      <div className="mb-5 pl-3 border-l-2 border-svdg-sky-dancer/40">
        <p className="text-sm text-svdg-french-gray leading-relaxed max-w-2xl">{description}</p>
      </div>

      <FilterBar
        sources={sources}
        tags={tags}
        sponsors={sponsors}
        showRegionFilter={showRegionFilter}
        showSponsorFilter={showSponsorFilter}
        search={search}
        onSearch={setSearch}
        source={source}
        onSource={setSource}
        tag={tag}
        onTag={setTag}
        region={region}
        onRegion={setRegion}
        sponsor={sponsor}
        onSponsor={setSponsor}
        status={status}
        onStatus={setStatus}
        sort={sort}
        onSort={setSort}
        includeArchived={includeArchived}
        onIncludeArchived={setIncludeArchived}
        count={filtered.length}
        categoryLabel={category}
      />

      {filtered.length === 0 ? (
        <div className="bg-svdg-surface/95 border border-white/10 rounded-lg px-6 py-12 text-center text-sm text-svdg-french-gray">
          No articles found. Try adjusting your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
