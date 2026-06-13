import { redirect } from 'next/navigation'
import { BASE_PATH } from '@/lib/basePath'

export const dynamic = 'force-dynamic'

// "Search" and "Archive" were merged into a single "All Articles" page.
export default function SearchPage() {
  redirect(`${BASE_PATH}/archive`)
}
