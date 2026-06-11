'use client'

import { Article } from '@/types/article'
import ArticleCard from './ArticleCard'
import { useIdentity } from './IdentityProvider'
import { TEAM_MEMBERS } from '@/lib/identity'

interface Props {
  articles: Article[]
}

export default function ReadingListClient({ articles }: Props) {
  const { userName, setUserName } = useIdentity()

  if (!userName) {
    return (
      <div className="bg-svdg-surface/95 border border-white/10 rounded-lg px-6 py-12 text-center">
        <p className="text-sm text-svdg-french-gray mb-3">
          Pick your name in the top right to see your personal reading list.
        </p>
        <select
          value=""
          onChange={(e) => setUserName(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-full border border-white/15 bg-svdg-surface-2 text-slate-200 cursor-pointer"
        >
          <option value="" disabled>
            Who&apos;s reading?
          </option>
          {TEAM_MEMBERS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
    )
  }

  const saved = articles
    .filter((a) => a.shortlistedBy?.includes(userName))
    .sort((a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime())

  if (saved.length === 0) {
    return (
      <div className="bg-svdg-surface/95 border border-white/10 rounded-lg px-6 py-12 text-center text-sm text-svdg-french-gray">
        Nothing saved yet, {userName}. Hit &quot;Save&quot; on any article to add it here.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {saved.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}
