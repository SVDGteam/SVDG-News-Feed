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
  New: 'bg-orange-500/15 text-orange-300 border-orange-400/30',
  Reviewed: 'bg-white/5 text-slate-300 border-white/15',
  Featured: 'bg-blue-500/15 text-blue-300 border-blue-400/30',
  Rejected: 'bg-red-500/15 text-red-300 border-red-400/30',
  Archived: 'bg-white/5 text-slate-400 border-white/10',
}

export default function ArticleCard({ article, compact = false }: Props) {
  const ageLabel = getArticleAgeLabel(article.datePublished)

  return (
    <div className="bg-svdg-surface/70 border border-white/10 rounded-lg p-4 hover:border-svdg-sky hover:bg-svdg-surface transition-all group">
      {/* Top row: categories + score + status */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        {article.categories.map((cat) => (
          <CategoryBadge key={cat} category={cat} size="xs" />
        ))}
        {article.region && article.region !== 'US' && (
          <span className="text-[10px] px-1.5 py-0.5 rounded border bg-indigo-500/15 border-indigo-400/30 text-indigo-300 font-medium">
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
        className="block font-semibold text-white text-sm leading-snug mb-1 group-hover:text-svdg-sky transition-colors"
      >
        {article.title}
      </a>

      {/* Source + date + author */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-svdg-french-gray mb-2">
        <span className="font-medium text-slate-300">{article.source}</span>
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
            <span className="text-amber-300 font-medium">↗ {article.sponsorName}</span>
          </>
        )}
      </div>

      {/* Short description */}
      <p className="text-sm text-slate-300 leading-relaxed mb-2">
        {article.shortDescription}
      </p>

      {/* Why it matters */}
      {!compact && article.whyItMatters && (
        <div className="bg-white/5 border border-white/10 rounded px-3 py-2 mb-2">
          <span className="text-[10px] uppercase tracking-wide text-svdg-sky font-semibold mr-1 font-mono">
            Why it matters ·
          </span>
          <span className="text-xs text-slate-300">{article.whyItMatters}</span>
        </div>
      )}

      {/* Tags + edit link */}
      <div className="flex flex-wrap items-center justify-between gap-1 mt-1">
        <div className="flex flex-wrap gap-1">
          {article.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="text-[10px] bg-white/5 text-slate-300 px-1.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
          {article.tags.length > 5 && (
            <span className="text-[10px] text-svdg-french-gray">+{article.tags.length - 5}</span>
          )}
        </div>
        <Link
          href={`/article/${article.id}/edit`}
          className="text-[10px] text-svdg-french-gray hover:text-svdg-sky transition-colors"
        >
          Edit
        </Link>
      </div>
    </div>
  )
}
