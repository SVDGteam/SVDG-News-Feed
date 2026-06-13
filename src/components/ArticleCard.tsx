'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Article, ReactionType } from '@/types/article'
import RelevanceBadge from './RelevanceBadge'
import CategoryBadge from './CategoryBadge'
import { getArticleAgeLabel } from '@/lib/archive'
import { getEffectiveScore } from '@/lib/scoring'
import { useIdentity } from './IdentityProvider'
import { useArticleActions } from '@/hooks/useArticleActions'
import { BookmarkIcon } from './icons'

interface Props {
  article: Article
}

const STATUS_STYLES: Record<string, string> = {
  New: 'bg-orange-500/25 text-orange-300 border-orange-400/45',
  Reviewed: 'bg-white/10 text-slate-300 border-white/20',
  Featured: 'bg-blue-500/25 text-blue-300 border-blue-400/45',
  Rejected: 'bg-red-500/25 text-red-300 border-red-400/45',
  Archived: 'bg-white/10 text-slate-400 border-white/15',
}

function ThumbsUpIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
      <path d="M2 18h2.5a1 1 0 001-1v-7a1 1 0 00-1-1H2v9zM6.5 9.5l3-6.5a2 2 0 012 2v3h4a1.5 1.5 0 011.46 1.83l-1.2 5.5A2 2 0 0114 17h-7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ThumbsDownIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
      <path d="M2 2h2.5a1 1 0 011 1v7a1 1 0 01-1 1H2V2zM6.5 10.5l3 6.5a2 2 0 002-2v-3h4a1.5 1.5 0 001.46-1.83l-1.2-5.5A2 2 0 0014 3H6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={filled ? '2.5' : '1.5'}>
      <path d="M4 10.5l3.5 3.5L16 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ArticleCard({ article }: Props) {
  const ageLabel = getArticleAgeLabel(article.datePublished)
  const [expanded, setExpanded] = useState(false)
  const { userName: userId } = useIdentity()
  const { reactions, readBy, shortlistedBy, pending, handleReaction: _handleReaction, handlePersonalize: _handlePersonalize } =
    useArticleActions(article.id, {
      reactions: article.reactions ?? {},
      readBy: article.readBy ?? [],
      shortlistedBy: article.shortlistedBy ?? [],
    })

  const userReaction = userId ? reactions[userId] : undefined
  const isRead = !!userId && readBy.includes(userId)
  const isShortlisted = !!userId && shortlistedBy.includes(userId)
  const likes = Object.values(reactions).filter((r) => r === 'like').length
  const dislikes = Object.values(reactions).filter((r) => r === 'dislike').length
  const effectiveScore = getEffectiveScore({ relevanceScore: article.relevanceScore, reactions })

  function handleReaction(type: ReactionType, e: React.MouseEvent) {
    if (!userId) return
    _handleReaction(userId, type, e)
  }

  function handlePersonalize(field: 'read' | 'shortlisted', e: React.MouseEvent) {
    if (!userId) return
    _handlePersonalize(userId, field, e)
  }

  return (
    <div
      onClick={() => setExpanded((v) => !v)}
      className="bg-svdg-surface/95 border border-white/10 rounded-lg p-4 hover:border-svdg-sky hover:bg-svdg-surface transition-all group cursor-pointer"
    >
      {/* Top row: categories + score + status + expand toggle */}
      <div className="flex items-start justify-between gap-1.5 mb-2">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {article.categories.map((cat) => (
            <CategoryBadge key={cat} category={cat} size="xs" />
          ))}
          {article.region && article.region !== 'US' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full border bg-indigo-500/25 border-indigo-400/45 text-indigo-300 font-semibold">
              {article.region}
            </span>
          )}
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${STATUS_STYLES[article.status] ?? ''}`}>
            {article.status}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isRead && (
            <span title="You've read this" className="text-emerald-400">
              <CheckIcon filled />
            </span>
          )}
          <RelevanceBadge score={effectiveScore} isOverridden={article.isScoreOverridden} />
          <span className="text-svdg-french-gray group-hover:text-svdg-sky transition-colors">
            <ChevronIcon open={expanded} />
          </span>
        </div>
      </div>

      {/* Title */}
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="block font-semibold text-white text-lg leading-snug mb-1 group-hover:text-svdg-sky transition-colors"
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

      {/* Like / dislike — always visible, even when collapsed */}
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={(e) => handleReaction('like', e)}
          title="Like — adds 10 points to relevance"
          className={`flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border font-semibold transition-colors ${
            userReaction === 'like'
              ? 'bg-emerald-500/25 border-emerald-400/55 text-emerald-300'
              : 'border-white/10 text-svdg-french-gray hover:border-emerald-400/30 hover:text-emerald-300'
          }`}
        >
          <ThumbsUpIcon filled={userReaction === 'like'} />
          {likes}
        </button>
        <button
          type="button"
          onClick={(e) => handleReaction('dislike', e)}
          title="Dislike — subtracts 10 points from relevance"
          className={`flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border font-semibold transition-colors ${
            userReaction === 'dislike'
              ? 'bg-red-500/25 border-red-400/55 text-red-300'
              : 'border-white/10 text-svdg-french-gray hover:border-red-400/30 hover:text-red-300'
          }`}
        >
          <ThumbsDownIcon filled={userReaction === 'dislike'} />
          {dislikes}
        </button>

        <span className="w-px h-4 bg-white/10" aria-hidden="true" />

        <button
          type="button"
          onClick={(e) => handlePersonalize('read', e)}
          disabled={!userId}
          title={userId ? (isRead ? 'Mark as unread' : 'Mark as read') : 'Pick your name in the top right to track read articles'}
          className={`flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            isRead
              ? 'bg-emerald-500/25 border-emerald-400/55 text-emerald-300'
              : 'border-white/10 text-svdg-french-gray hover:border-emerald-400/30 hover:text-emerald-300'
          }`}
        >
          <CheckIcon filled={isRead} />
          {isRead ? 'Read' : 'Mark read'}
        </button>

        <button
          type="button"
          onClick={(e) => handlePersonalize('shortlisted', e)}
          disabled={!userId}
          title={userId ? (isShortlisted ? 'Remove from your reading list' : 'Add to your reading list') : 'Pick your name in the top right to use a reading list'}
          className={`flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            isShortlisted
              ? 'bg-svdg-crayola/25 border-svdg-crayola/55 text-svdg-sky'
              : 'border-white/10 text-svdg-french-gray hover:border-svdg-crayola/30 hover:text-svdg-sky'
          }`}
        >
          <BookmarkIcon filled={isShortlisted} />
          {isShortlisted ? 'Saved' : 'Save'}
        </button>
      </div>

      {expanded && (
        <>
          {/* Short description */}
          <p className="text-sm text-slate-300 leading-relaxed mb-2">
            {article.shortDescription}
          </p>

          {/* Why it matters */}
          {article.whyItMatters && (
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
                  className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full font-medium"
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
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] text-svdg-french-gray hover:text-svdg-sky transition-colors"
            >
              Edit
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
