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
    <header className="bg-svdg-pea-coat sticky top-0 z-50 border-b border-white/10 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-svdg-sky-dancer/50 to-transparent" />
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo / brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="bg-white rounded-md p-1 flex items-center justify-center shrink-0">
              <Image src="/brand/logomark.svg" alt="SVDG" width={20} height={21} />
            </span>
            <span className="flex flex-col gap-0.5 leading-none">
              <span className="flex items-center gap-1 font-display font-bold tracking-tight text-base text-white leading-none">
                Dispatch
                <span className="inline-block w-[6px] h-[14px] bg-svdg-sky-dancer animate-pulse" aria-hidden="true" />
              </span>
              <span className="nav-text text-[9px] text-svdg-sky-dancer leading-none">
                A SVDG Product
              </span>
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
