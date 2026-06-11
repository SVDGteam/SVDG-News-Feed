import Image from 'next/image'
import Link from 'next/link'
import { CSSProperties } from 'react'
import { getWeeklyDigest } from '@/lib/newsletter'
import ArticleCard from '@/components/ArticleCard'
import NewsletterSignup from '@/components/NewsletterSignup'
import { CATEGORIES, getDisplayLabel } from '@/data/categories'

export const dynamic = 'force-dynamic'

export default async function NewsletterPage() {
  const { articles: digest, weekStr } = await getWeeklyDigest(6)

  return (
    <div>
      {/* Hero */}
      <div
        className="svdg-bracket bg-svdg-surface/40 mb-8 rounded-lg"
        style={{ '--bk-color': 'var(--svdg-sky-dancer)', '--bk-inset': '24px' } as CSSProperties}
      >
        <div className="svdg-bracket__tl" />
        <div className="svdg-bracket__br" />
        <div className="svdg-bracket__body flex flex-col items-center text-center gap-4 py-6">
          <span className="bg-white rounded-xl p-2.5 flex items-center justify-center shrink-0">
            <Image src="/brand/logomark.svg" alt="SVDG" width={36} height={38} />
          </span>
          <div>
            <span className="eyebrow text-svdg-sky-dancer">Newsletter</span>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-white mt-2 leading-tight">
              The Weekly Rundown
            </h1>
            <p className="text-sm md:text-base text-svdg-french-gray mt-3 max-w-xl mx-auto">
              The same scored, curated intelligence your team reads in Dispatch — delivered to your inbox
              every Friday. Top stories across industry, investor, government, sponsor, and international
              defense-tech news.
            </p>
          </div>
          <NewsletterSignup source="newsletter-page" />
        </div>
      </div>

      {/* What's inside */}
      <section className="mb-8">
        <h2 className="text-xl font-display font-bold tracking-tight text-white mb-1">What&apos;s inside</h2>
        <p className="text-sm text-svdg-french-gray mb-4">
          Every issue rounds up the highest-relevance stories across all six Dispatch categories.
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={`/${c.slug}`}
              className="svdg-tag svdg-tag--outline hover:bg-white/10 transition-colors normal-case tracking-normal"
            >
              {getDisplayLabel(c)}
            </Link>
          ))}
        </div>
      </section>

      {/* This week's preview */}
      <section>
        <div className="mb-4 pb-3 border-b border-white/10 flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-xl font-display font-bold tracking-tight text-white">This Week&apos;s Top Stories</h2>
          <span className="nav-text text-[10px] text-svdg-french-gray">{weekStr} · preview</span>
        </div>
        {digest.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
            {digest.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        ) : (
          <div className="bg-svdg-surface/95 border border-white/10 rounded-lg px-4 py-6 text-center text-sm text-svdg-french-gray">
            No stories from the past week yet — check back soon.
          </div>
        )}
      </section>
    </div>
  )
}
