'use client'

import { useState, useMemo } from 'react'
import { Article, Category, Region } from '@/types/article'
import ArticleCard from '@/components/ArticleCard'
import FilterBar from '@/components/FilterBar'
import { CATEGORIES } from '@/data/categories'
import { filterArticles, getUniqueSources, getUniqueTags, getUniqueSponsors, SortKey } from '@/lib/filters'

export default function SearchPageClient({ articles }: { articles: Article[] }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [source, setSource] = useState('')
  const [tag, setTag] = useState('')
  const [region, setRegion] = useState('')
  const [sponsor, setSponsor] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState<SortKey>('relevance')
  const [includeArchived, setIncludeArchived] = useState(true)

  const sources = useMemo(() => getUniqueSources(articles), [articles])
  const tags = useMemo(() => getUniqueTags(articles), [articles])
  const sponsors = useMemo(() => getUniqueSponsors(articles), [articles])
  const categories = useMemo(() => CATEGORIES.map((c) => c.label), [])

  const filtered = useMemo(() =>
    filterArticles(articles, {
      search,
      category: (category as Category) || undefined,
      region: (region as Region) || undefined,
      status: (status as any) || undefined,
      source: source || undefined,
      sponsor: sponsor || undefined,
      tag: tag || undefined,
      includeArchived,
    }, sort),
    [articles, search, category, region, status, source, sponsor, tag, sort, includeArchived]
  )

  return (
    <>
      <FilterBar
        sources={sources}
        tags={tags}
        sponsors={sponsors}
        categories={categories}
        showRegionFilter
        showSponsorFilter
        showCategoryFilter
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
        category={category}
        onCategory={setCategory}
        sort={sort}
        onSort={setSort}
        includeArchived={includeArchived}
        onIncludeArchived={setIncludeArchived}
        count={filtered.length}
        categoryLabel="all SVDG news"
      />

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg px-6 py-12 text-center text-sm text-svdg-french-gray">
          {search.trim()
            ? `No articles match "${search}". Try a different keyword or adjust your filters.`
            : 'No articles match your filters.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </>
  )
}
