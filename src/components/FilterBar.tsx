'use client'

import { Region, ArticleStatus, Category } from '@/types/article'
import { SortKey } from '@/lib/filters'

interface Props {
  sources: string[]
  tags: string[]
  sponsors?: string[]
  regions?: Region[]
  categories?: Category[]
  showRegionFilter?: boolean
  showSponsorFilter?: boolean
  showCategoryFilter?: boolean
  search: string
  onSearch: (v: string) => void
  source: string
  onSource: (v: string) => void
  tag: string
  onTag: (v: string) => void
  region: string
  onRegion: (v: string) => void
  sponsor: string
  onSponsor: (v: string) => void
  status: string
  onStatus: (v: string) => void
  category?: string
  onCategory?: (v: string) => void
  sort: SortKey
  onSort: (v: SortKey) => void
  includeArchived?: boolean
  onIncludeArchived?: (v: boolean) => void
  count: number
  categoryLabel: string
}

export default function FilterBar({
  sources, tags, sponsors = [], regions = [], categories = [], showRegionFilter = false, showSponsorFilter = false,
  showCategoryFilter = false,
  search, onSearch, source, onSource, tag, onTag, region, onRegion,
  sponsor, onSponsor, status, onStatus, category, onCategory, sort, onSort,
  includeArchived, onIncludeArchived, count, categoryLabel,
}: Props) {
  return (
    <div className="bg-svdg-surface/70 border border-white/10 rounded-lg p-3 mb-4">
      {/* Search + count */}
      <div className="flex items-center gap-2 mb-3">
        <input
          type="search"
          placeholder={`Search ${categoryLabel}…`}
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="flex-1 text-sm border border-white/15 bg-white/5 text-white rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-svdg-crayola placeholder-svdg-french-gray"
        />
        <span className="text-xs text-svdg-french-gray shrink-0">{count} article{count !== 1 ? 's' : ''}</span>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value as SortKey)}
          className="text-xs border border-white/15 rounded px-2 py-1.5 bg-svdg-surface-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-svdg-crayola"
        >
          <option value="relevance">Sort: Relevance</option>
          <option value="datePublished">Sort: Date Published</option>
          <option value="dateAdded">Sort: Date Added</option>
        </select>

        {/* Category */}
        {showCategoryFilter && onCategory && (
          <select
            value={category ?? ''}
            onChange={(e) => onCategory(e.target.value)}
            className="text-xs border border-white/15 rounded px-2 py-1.5 bg-svdg-surface-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-svdg-crayola"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}

        {/* Source */}
        <select
          value={source}
          onChange={(e) => onSource(e.target.value)}
          className="text-xs border border-white/15 rounded px-2 py-1.5 bg-svdg-surface-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-svdg-crayola"
        >
          <option value="">All Sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Tag */}
        <select
          value={tag}
          onChange={(e) => onTag(e.target.value)}
          className="text-xs border border-white/15 rounded px-2 py-1.5 bg-svdg-surface-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-svdg-crayola"
        >
          <option value="">All Tags</option>
          {tags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Region */}
        {showRegionFilter && (
          <select
            value={region}
            onChange={(e) => onRegion(e.target.value)}
            className="text-xs border border-white/15 rounded px-2 py-1.5 bg-svdg-surface-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-svdg-crayola"
          >
            <option value="">All Regions</option>
            {(regions.length > 0 ? regions : ['US', 'Europe', 'UK', 'Australia', 'Other'] as Region[]).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        )}

        {/* Sponsor */}
        {showSponsorFilter && sponsors.length > 0 && (
          <select
            value={sponsor}
            onChange={(e) => onSponsor(e.target.value)}
            className="text-xs border border-white/15 rounded px-2 py-1.5 bg-svdg-surface-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-svdg-crayola"
          >
            <option value="">All Sponsors</option>
            {sponsors.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}

        {/* Status */}
        <select
          value={status}
          onChange={(e) => onStatus(e.target.value)}
          className="text-xs border border-white/15 rounded px-2 py-1.5 bg-svdg-surface-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-svdg-crayola"
        >
          <option value="">All Status</option>
          {(['New', 'Reviewed', 'Featured', 'Rejected', 'Archived'] as ArticleStatus[]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Include archived */}
        {onIncludeArchived && (
          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={includeArchived ?? false}
              onChange={(e) => onIncludeArchived(e.target.checked)}
              className="rounded"
            />
            Include archived
          </label>
        )}

        {/* Clear */}
        {(search || source || tag || region || sponsor || status || category) && (
          <button
            onClick={() => {
              onSearch(''); onSource(''); onTag('')
              onRegion(''); onSponsor(''); onStatus('')
              onCategory && onCategory('')
            }}
            className="text-xs text-svdg-sky hover:underline ml-auto"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
