'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CATEGORIES } from '@/data/categories'

const NAV_ITEMS = [
  { label: 'Weekly Rundown', href: '/' },
  ...CATEGORIES.map((c) => ({ label: c.label, href: `/${c.slug}` })),
  { label: 'Archive', href: '/archive' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <header className="bg-svdg-navy border-b border-svdg-slate sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-white font-semibold tracking-tight text-base">
              SVDG
            </span>
            <span className="text-blue-300 font-light text-sm hidden sm:inline">
              News Intelligence
            </span>
          </Link>

          {/* Nav — scrollable on mobile */}
          <nav className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide ml-4">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-3 py-1.5 rounded text-sm whitespace-nowrap transition-colors
                    ${isActive
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-slate-300 hover:text-white hover:bg-svdg-slate'
                    }
                  `}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Add button */}
          <Link
            href="/add"
            className="ml-3 shrink-0 bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1.5 rounded transition-colors font-medium"
          >
            + Add
          </Link>
        </div>
      </div>
    </header>
  )
}
