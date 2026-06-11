import Link from 'next/link'
import Image from 'next/image'
import { getAllArticles } from '@/lib/db'
import ArticleCard from '@/components/ArticleCard'
import TypewriterHero from '@/components/TypewriterHero'
import { filterArticles } from '@/lib/filters'
import { Article } from '@/types/article'
import { getEffectiveScore } from '@/lib/scoring'

function SectionHeader({
  title,
  description,
  count,
  href,
  icon,
  accent,
}: {
  title: string
  description?: string
  count?: number
  href?: string
  icon?: React.ReactNode
  accent?: string
}) {
  return (
    <div className="mb-4 pb-3 border-b border-white/10">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          {icon && <span className={accent ?? 'text-svdg-sky'}>{icon}</span>}
          <h2 className="text-xl font-display font-bold tracking-tight text-white">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          {count !== undefined && (
            <span className="svdg-tag svdg-tag--muted">{count} item{count !== 1 ? 's' : ''}</span>
          )}
          {href && (
            <Link href={href} className="nav-text text-[10px] text-svdg-sky hover:text-svdg-sky-dancer">
              View all →
            </Link>
          )}
        </div>
      </div>
      {description && (
        <p className="text-xs text-svdg-french-gray mt-1.5">{description}</p>
      )}
    </div>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
      <path d="M10 1.5l2.47 5.27 5.78.7-4.27 4.05 1.13 5.73L10 14.4l-5.11 2.85 1.13-5.73L1.75 7.47l5.78-.7L10 1.5z" />
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
      <path d="M10 1.5l1.4 4.6 4.6 1.4-4.6 1.4L10 13.5l-1.4-4.6-4.6-1.4 4.6-1.4L10 1.5zM16 13l.8 2.6 2.6.8-2.6.8L16 20l-.8-2.6-2.6-.8 2.6-.8L16 13z" />
    </svg>
  )
}

function FlagIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 17.5V2.5M4 3h9.5l-1.5 3 1.5 3H4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StackIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M10 2l8 4-8 4-8-4 8-4zM2 10l8 4 8-4M2 14l8 4 8-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FireIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
      <path d="M10 1c.5 2.5-1.5 3.8-2.5 5.2C6.3 7.7 6 9 6.7 10.3c-1-.4-1.9-1.5-2-2.8C3.4 9 3 10.6 3 12a7 7 0 0014 0c0-3.5-2-5-3-6.5.3 1.5-.4 2.5-1.2 3C13 6 11.5 3.5 10 1z" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="10" cy="10" r="8" />
      <path d="M2 10h16M10 2c2.5 2.2 2.5 13.8 0 16M10 2c-2.5 2.2-2.5 13.8 0 16" strokeLinecap="round" />
    </svg>
  )
}

function StatPill({
  icon,
  value,
  label,
  accent,
}: {
  icon: React.ReactNode
  value: number
  label: string
  accent?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={accent ?? 'text-svdg-sky'}>{icon}</span>
      <span className="text-base font-semibold text-white leading-none">{value}</span>
      <span className="nav-text text-[10px] text-svdg-french-gray leading-none">{label}</span>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-svdg-surface/95 border border-white/10 rounded-lg px-4 py-6 text-center text-sm text-svdg-french-gray">
      {message}
    </div>
  )
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const allArticles = await getAllArticles()
  const active = allArticles.filter((a) => !a.isArchived)

  const now = new Date()
  const fourteenDaysAgo = new Date(now)
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  // Featured
  const featured = active
    .filter((a) => a.isFeatured)
    .sort((a, b) => getEffectiveScore(b) - getEffectiveScore(a))
    .slice(0, 4)

  // Highest relevance (last 14 days, not already featured) — the "must reads"
  const recentHigh = active
    .filter((a) => !a.isFeatured && new Date(a.datePublished) >= fourteenDaysAgo)
    .sort((a, b) => getEffectiveScore(b) - getEffectiveScore(a))
    .slice(0, 5)

  // Recently added
  const recentlyAdded = active
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    .slice(0, 4)

  // Sponsor mentions
  const sponsorMentions = active
    .filter((a) => a.categories.includes('Sponsor News') || !!a.sponsorName)
    .sort((a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime())
    .slice(0, 3)

  // International watch
  const internationalWatch = active
    .filter((a) => a.categories.includes('International'))
    .sort((a, b) => getEffectiveScore(b) - getEffectiveScore(a))
    .slice(0, 3)

  // Needs review
  const needsReview = active
    .filter((a) => a.status === 'New')
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())

  // New today (for the at-a-glance stat row)
  const todayStr = now.toISOString().slice(0, 10)
  const newToday = active.filter((a) => a.dateAdded === todayStr).length

  const weekStr = (() => {
    const d = new Date()
    const mon = new Date(d)
    mon.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    const fri = new Date(mon)
    fri.setDate(mon.getDate() + 4)
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `Week of ${fmt(mon)} – ${fmt(fri)}`
  })()

  return (
    <div>
      {/* Header */}
      <div className="svdg-bracket svdg-hero mb-6" style={{ '--bk-color': 'var(--svdg-sky-dancer)', '--bk-inset': '24px' } as React.CSSProperties}>
        <div className="svdg-bracket__tl" />
        <div className="svdg-bracket__br" />
        <div className="svdg-bracket__body flex flex-col items-center text-center py-2">
          <div className="flex items-center gap-4">
            <span className="bg-white rounded-xl p-2.5 flex items-center justify-center shrink-0">
              <Image src="/brand/logomark.svg" alt="SVDG" width={44} height={46} />
            </span>
            <div className="flex flex-col gap-1.5 items-start">
              <TypewriterHero />
              <span className="nav-text text-xs text-svdg-sky-dancer leading-none">An SVDG Product</span>
            </div>
          </div>

          {/* Weekly Rundown + date (left) and at-a-glance stats (right), below the divider */}
          <div className="mt-5 pt-4 border-t border-white/10 w-full flex flex-wrap items-center justify-between gap-4">
            <div className="text-left">
              <h1 className="text-lg md:text-xl tracking-tight">Weekly Rundown</h1>
              <p className="text-sm text-svdg-french-gray mt-1">{weekStr}</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
              <StatPill icon={<StarIcon />} value={recentHigh.length} label="Must-Reads" accent="text-svdg-sky-dancer" />
              <StatPill icon={<SparkleIcon />} value={newToday} label="New Today" />
              {needsReview.length > 0 && (
                <StatPill icon={<FlagIcon />} value={needsReview.length} label="Need Review" accent="text-amber-300" />
              )}
              <StatPill icon={<StackIcon />} value={active.length} label="Active Articles" />
            </div>
          </div>
        </div>
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mb-8">
          <SectionHeader
            title="Featured This Week"
            description="Hand-picked by the team — start here."
            count={featured.length}
            icon={<StarIcon />}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
            {featured.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      {/* Highest relevance — the "must read" section */}
      {recentHigh.length > 0 && (
        <section className="mb-8 bg-svdg-surface/40 border border-svdg-sky-dancer/25 rounded-lg p-4">
          <SectionHeader
            title="Must-Read · Highest Relevance"
            description="Top-scoring stories from the last 14 days, ranked by relevance (including team likes/dislikes). If you only read one section, read this one."
            count={recentHigh.length}
            icon={<FireIcon />}
            accent="text-svdg-sky-dancer"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
            {recentHigh.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recently added */}
        <section>
          <SectionHeader
            title="Recently Added"
            description="Newest items in the database — click a card to expand it."
            count={recentlyAdded.length}
            icon={<SparkleIcon />}
          />
          <div className="space-y-3">
            {recentlyAdded.length > 0
              ? recentlyAdded.map((a) => <ArticleCard key={a.id} article={a} />)
              : <EmptyState message="No articles added yet" />
            }
          </div>
        </section>

        {/* Sponsor mentions */}
        <section>
          <SectionHeader
            title="Sponsor Mentions"
            description="Coverage involving SVDG sponsor companies."
            href="/sponsor"
            count={sponsorMentions.length}
            icon={<Image src="/brand/logomark-white.png" alt="SVDG" width={16} height={17} />}
          />
          <div className="space-y-3">
            {sponsorMentions.length > 0
              ? sponsorMentions.map((a) => <ArticleCard key={a.id} article={a} />)
              : <EmptyState message="No sponsor news this week" />
            }
          </div>
        </section>
      </div>

      {/* International watch */}
      {internationalWatch.length > 0 && (
        <section className="mt-8">
          <SectionHeader
            title="International Watch"
            description="Defense tech news from the UK, Europe, Australia, and allies."
            href="/international"
            count={internationalWatch.length}
            icon={<GlobeIcon />}
            accent="text-indigo-300"
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
            {internationalWatch.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      {/* Needs review */}
      {needsReview.length > 0 && (
        <section className="mt-8">
          <SectionHeader
            title="Needs Review"
            description="Missing core details (title, date, or source) — give these a quick look before they're fully live."
            count={needsReview.length}
            icon={<FlagIcon />}
            accent="text-amber-300"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
            {needsReview.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      {/* Stats bar */}
      <div className="mt-10 border-t border-white/10 pt-4 flex flex-wrap gap-6 text-xs text-svdg-french-gray">
        {([
          ['Industry News', '/industry'],
          ['Investor News', '/investor'],
          ['Government News', '/government'],
          ['Sponsor News', '/sponsor'],
          ['Opinions', '/opinions'],
          ['International', '/international'],
        ] as [string, string][]).map(([label, href]) => {
          const count = active.filter((a) => a.categories.includes(label as any)).length
          return (
            <Link key={href} href={href} className="hover:text-svdg-sky transition-colors">
              {label} <span className="font-semibold text-white">{count}</span>
            </Link>
          )
        })}
        <Link href="/archive" className="hover:text-svdg-sky transition-colors">
          Archive <span className="font-semibold text-white">{allArticles.filter((a) => a.isArchived).length}</span>
        </Link>
      </div>
    </div>
  )
}
