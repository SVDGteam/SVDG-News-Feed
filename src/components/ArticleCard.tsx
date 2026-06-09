import Link from 'next/link'
import { Article } from '@/types/article'
import RelevanceBadge from './RelevanceBadge'
import CategoryBadge from './CategoryBadge'
import { getArticleAgeLabel } from '@/lib/archive'

interface Props {
  article: Article
  compact?: boolean
}

const STATUS_STYLES: Record<string, string> = {
  New: 'bg-orange-100 text-orange-700 border-orange-200',
  Reviewed: 'bg-slate-100 text-slate-600 border-slate-200',
  Featured: 'bg-blue-100 text-blue-700 border-blue-200',
  Rejected: 'bg-red-100 text-red-700 border-red-200',
  Archived: 'bg-slate-100 text-slate-500 border-slate-200',
}

export default function ArticleCard({ article, compact = false }: Props) {
  const ageLabel = getArticleAgeLabel(article.datePublished)

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all group">
      {/* Top row: categories + score + status */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        {article.categories.map((cat) => (
          <CategoryBadge key={cat} category={cat} size="xs" />
        ))}
        {article.region && article.region !== 'US' && (
          <span className="text-[10px] px-1.5 py-0.5 rounded border bg-indigo-50 border-indigo-200 text-indigo-700 font-medium">
            {article.region}
          </span>
        )}
        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${STATUS_STYLES[article.status] ?? ''}`}>
          {article.status}
        </span>
        <div className="ml-auto">
          <RelevanceBadge score={article.relevanceScore} isOverridden={article.isScoreOverridden} />
        </div>
      </div>

      {/* Title */}
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block font-semibold text-slate-900 text-sm leading-snug mb-1 group-hover:text-blue-700 transition-colors"
      >
        {article.title}
      </a>

      {/* Source + date + author */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
        <span className="font-medium text-slate-600">{article.source}</span>
        <span>·</span>
        <span>{ageLabel}</span>
        {article.author && (
          <>
            <span>·</span>
            <span>{article.author}</span>
          </>
        )}
        {article.sponsorName && (
          <>
            <span>·</span>
            <span className="text-amber-700 font-medium">↗ {article.sponsorName}</span>
          </>
        )}
      </div>

      {/* Short description */}
      <p className="text-sm text-slate-700 leading-relaxed mb-2">
        {article.shortDescription}
      </p>

      {/* Why it matters */}
      {!compact && article.whyItMatters && (
        <div className="bg-blue-50 border border-blue-100 rounded px-3 py-2 mb-2">
          <span className="text-[10px] uppercase tracking-wide text-blue-500 font-semibold mr-1">
            Why it matters ·
          </span>
          <span className="text-xs text-slate-700">{article.whyItMatters}</span>
        </div>
      )}

      {/* Tags + edit link */}
      <div className="flex flex-wrap items-center justify-between gap-1 mt-1">
        <div className="flex flex-wrap gap-1">
          {article.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
          {article.tags.length > 5 && (
            <span className="text-[10px] text-slate-400">+{article.tags.length - 5}</span>
          )}
        </div>
        <Link
          href={`/article/${article.id}/edit`}
          className="text-[10px] text-slate-400 hover:text-blue-600 transition-colors"
        >
          Edit
        </Link>
      </div>
    </div>
  )
}
