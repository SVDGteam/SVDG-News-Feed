import Link from 'next/link'
import { getAllArticles } from '@/lib/db'
import ArticleCard from '@/components/ArticleCard'
import { filterArticles } from '@/lib/filters'
import { Article } from '@/types/article'

function SectionHeader({ title, count, href }: { title: string; count?: number; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-3 border-b border-svdg-timberwolf pb-1.5">
      <h2 className="eyebrow text-svdg-pea-coat">{title}</h2>
      <div className="flex items-center gap-3">
        {count !== undefined && (
          <span className="text-xs text-svdg-french-gray">{count} item{count !== 1 ? 's' : ''}</span>
        )}
        {href && (
          <Link href={href} className="nav-text text-[10px] text-svdg-admiral hover:text-svdg-berkeley">
            View all →
          </Link>
        )}
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-4 py-6 text-center text-sm text-slate-400">
      {message}
    </div>
  )
}

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const allArticles = getAllArticles()
  const active = allArticles.filter((a) => !a.isArchived)

  const now = new Date()
  const fourteenDaysAgo = new Date(now)
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  // Featured
  const featured = active
    .filter((a) => a.isFeatured)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 4)

  // Highest relevance (last 14 days, not already featured)
  const recentHigh = active
    .filter((a) => !a.isFeatured && new Date(a.datePublished) >= fourteenDaysAgo)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
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
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 3)

  // Needs review
  const needsReview = active
    .filter((a) => a.status === 'New')
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())

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
      <div className="mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <span className="eyebrow text-svdg-admiral">SVDG&apos;s Red Folder</span>
            <h1 className="text-2xl mt-1">Weekly Rundown</h1>
            <p className="text-sm text-svdg-french-gray mt-0.5">{weekStr}</p>
          </div>
          <div className="flex gap-2">
            {needsReview.length > 0 && (
              <span className="svdg-tag svdg-tag--outline border-amber-400 text-amber-700">
                {needsReview.length} need review
              </span>
            )}
            <span className="svdg-tag svdg-tag--muted">
              {active.length} active articles
            </span>
          </div>
        </div>
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mb-8">
          <SectionHeader title="Featured This Week" count={featured.length} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {featured.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      {/* Highest relevance */}
      {recentHigh.length > 0 && (
        <section className="mb-8">
          <SectionHeader title="Highest Relevance · Last 14 Days" count={recentHigh.length} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {recentHigh.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recently added */}
        <section>
          <SectionHeader title="Recently Added" count={recentlyAdded.length} />
          <div className="space-y-3">
            {recentlyAdded.length > 0
              ? recentlyAdded.map((a) => <ArticleCard key={a.id} article={a} compact />)
              : <EmptyState message="No articles added yet" />
            }
          </div>
        </section>

        {/* Sponsor mentions */}
        <section>
          <SectionHeader title="Sponsor Mentions" href="/sponsor" count={sponsorMentions.length} />
          <div className="space-y-3">
            {sponsorMentions.length > 0
              ? sponsorMentions.map((a) => <ArticleCard key={a.id} article={a} compact />)
              : <EmptyState message="No sponsor news this week" />
            }
          </div>
        </section>
      </div>

      {/* International watch */}
      {internationalWatch.length > 0 && (
        <section className="mt-8">
          <SectionHeader title="International Watch" href="/international" count={internationalWatch.length} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {internationalWatch.map((a) => (
              <ArticleCard key={a.id} article={a} compact />
            ))}
          </div>
        </section>
      )}

      {/* Needs review */}
      {needsReview.length > 0 && (
        <section className="mt-8">
          <SectionHeader title="Needs Review" count={needsReview.length} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {needsReview.map((a) => (
              <ArticleCard key={a.id} article={a} compact />
            ))}
          </div>
        </section>
      )}

      {/* Stats bar */}
      <div className="mt-10 border-t border-svdg-timberwolf pt-4 flex flex-wrap gap-6 text-xs text-svdg-french-gray">
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
            <Link key={href} href={href} className="hover:text-svdg-admiral transition-colors">
              {label} <span className="font-semibold text-svdg-pea-coat">{count}</span>
            </Link>
          )
        })}
        <Link href="/archive" className="hover:text-svdg-admiral transition-colors">
          Archive <span className="font-semibold text-svdg-pea-coat">{allArticles.filter((a) => a.isArchived).length}</span>
        </Link>
      </div>
    </div>
  )
}
