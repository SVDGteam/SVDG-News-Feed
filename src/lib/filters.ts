import { Article, Category, Region, ArticleStatus } from '@/types/article'

export interface FilterState {
  search: string
  category?: Category
  region?: Region
  status?: ArticleStatus
  source?: string
  sponsor?: string
  tag?: string
  includeArchived?: boolean
}

export type SortKey = 'relevance' | 'datePublished' | 'dateAdded'
export type SortDir = 'desc' | 'asc'

export function filterArticles(
  articles: Article[],
  filters: FilterState,
  sort: SortKey = 'relevance',
  sortDir: SortDir = 'desc'
): Article[] {
  let result = [...articles]

  // Archive filter
  if (!filters.includeArchived) {
    result = result.filter((a) => !a.isArchived)
  }

  // Category filter
  if (filters.category) {
    result = result.filter((a) => a.categories.includes(filters.category!))
  }

  // Region filter
  if (filters.region) {
    result = result.filter((a) => a.region === filters.region)
  }

  // Status filter
  if (filters.status) {
    result = result.filter((a) => a.status === filters.status)
  }

  // Source filter
  if (filters.source) {
    result = result.filter(
      (a) => a.source.toLowerCase() === filters.source!.toLowerCase()
    )
  }

  // Sponsor filter
  if (filters.sponsor) {
    result = result.filter(
      (a) =>
        a.sponsorName?.toLowerCase().includes(filters.sponsor!.toLowerCase()) ||
        a.companyMentions.some((c) =>
          c.toLowerCase().includes(filters.sponsor!.toLowerCase())
        )
    )
  }

  // Tag filter
  if (filters.tag) {
    result = result.filter((a) =>
      a.tags.some((t) => t.toLowerCase() === filters.tag!.toLowerCase())
    )
  }

  // Full-text search
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.shortDescription.toLowerCase().includes(q) ||
        (a.whyItMatters ?? '').toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q) ||
        (a.author ?? '').toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)) ||
        a.companyMentions.some((c) => c.toLowerCase().includes(q)) ||
        (a.sponsorName ?? '').toLowerCase().includes(q)
    )
  }

  // Sort
  result.sort((a, b) => {
    let cmp = 0
    if (sort === 'relevance') {
      cmp = b.relevanceScore - a.relevanceScore
    } else if (sort === 'datePublished') {
      cmp = new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime()
    } else if (sort === 'dateAdded') {
      cmp = new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    }
    return sortDir === 'asc' ? -cmp : cmp
  })

  return result
}

export function getUniqueSources(articles: Article[]): string[] {
  const sources = new Set(articles.map((a) => a.source))
  return Array.from(sources).sort()
}

export function getUniqueSponsors(articles: Article[]): string[] {
  const sponsors = new Set(
    articles
      .filter((a) => a.sponsorName)
      .map((a) => a.sponsorName as string)
  )
  return Array.from(sponsors).sort()
}

export function getUniqueTags(articles: Article[]): string[] {
  const tags = new Set(articles.flatMap((a) => a.tags))
  return Array.from(tags).sort()
}
