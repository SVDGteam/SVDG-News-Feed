import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

// "Search" and "Archive" were merged into a single "All Articles" page.
export default function SearchPage() {
  redirect('/archive')
}
