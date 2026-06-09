import { Article } from '@/types/article'

const ARCHIVE_THRESHOLD_DAYS = 60

export function isArticleArchived(article: Article): boolean {
  if (article.isArchived) return true
  if (article.status === 'Archived') return true

  const published = new Date(article.datePublished)
  const now = new Date()
  const diffMs = now.getTime() - published.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  return diffDays > ARCHIVE_THRESHOLD_DAYS
}

export function shouldAutoArchive(datePublished: string): boolean {
  const published = new Date(datePublished)
  const now = new Date()
  const diffMs = now.getTime() - published.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays > ARCHIVE_THRESHOLD_DAYS
}

export function getArticleAgeLabel(datePublished: string): string {
  const published = new Date(datePublished)
  const now = new Date()
  const diffMs = now.getTime() - published.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
  return `${Math.floor(diffDays / 365)}y ago`
}
