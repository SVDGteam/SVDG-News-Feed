import { getAllArticles } from './db'
import { getEffectiveScore } from './scoring'
import { Article } from '@/types/article'

export interface WeeklyDigest {
  articles: Article[]
  weekStr: string
}

// Active articles published in the last 7 days, ranked by effective score
// (relevance score + team like/dislike adjustments), top `limit`.
export function getWeeklyDigest(limit = 6): WeeklyDigest {
  const allArticles = getAllArticles()
  const active = allArticles.filter((a) => !a.isArchived)

  const now = new Date()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(now.getDate() - 7)

  const articles = active
    .filter((a) => new Date(a.datePublished) >= sevenDaysAgo)
    .sort((a, b) => getEffectiveScore(b) - getEffectiveScore(a))
    .slice(0, limit)

  const weekStr = (() => {
    const d = new Date()
    const mon = new Date(d)
    mon.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    const fri = new Date(mon)
    fri.setDate(mon.getDate() + 4)
    const fmt = (dd: Date) => dd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `Week of ${fmt(mon)} – ${fmt(fri)}`
  })()

  return { articles, weekStr }
}
