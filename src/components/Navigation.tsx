'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { CATEGORIES } from '@/data/categories'

const NAV_ITEMS = [
  { label: 'Weekly Rundown', href: '/' },
  ...CATEGORIES.map((c) => ({ label: c.label, href: `/${c.slug}` })),
  { label: 'Archive', href: '/archive' },
  { label: 'Search', href: '/search' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <header className="bg-svdg-pea-coat sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo / brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image src="/brand/logomark.svg" alt="" width={24} height={24} className="opacity-90" />
            <span className="font-display font-bold tracking-tight text-base text-white leading-none">
              SVDG&apos;s Red Folder
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
                    nav-text px-3 py-1.5 text-[11px] whitespace-nowrap transition-colors border-b-2
                    ${isActive
                      ? 'text-svdg-sky-dancer border-svdg-sky-dancer'
                      : 'text-white/60 border-transparent hover:text-white hover:border-white/30'
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
            className="svdg-btn svdg-btn--accent ml-3 shrink-0 !text-[11px] !px-3 !py-1.5"
          >
            + Add
          </Link>
        </div>
      </div>
    </header>
  )
}
