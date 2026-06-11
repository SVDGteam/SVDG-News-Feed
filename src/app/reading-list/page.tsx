import { getAllArticles } from '@/lib/db'
import ReadingListClient from '@/components/ReadingListClient'

export const dynamic = 'force-dynamic'

export default async function ReadingListPage() {
  return (
    <div>
      <div className="mb-6 pl-3 border-l-2 border-svdg-sky-dancer/40">
        <span className="eyebrow text-svdg-sky-dancer">Personal</span>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-white mt-1 leading-tight">
          Your Reading List
        </h1>
        <p className="text-sm text-svdg-french-gray leading-relaxed max-w-2xl mt-1">
          Articles you&apos;ve saved for later. Only visible to you.
        </p>
      </div>

      <ReadingListClient articles={await getAllArticles()} />
    </div>
  )
}
