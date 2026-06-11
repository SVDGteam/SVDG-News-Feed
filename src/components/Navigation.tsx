'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { CATEGORIES, getDisplayLabel } from '@/data/categories'
import { TEAM_MEMBERS } from '@/lib/identity'
import { useIdentity } from '@/components/IdentityProvider'

const RUNDOWN_ITEM = { label: 'Weekly Rundown', href: '/' }

const NAV_ITEMS: { label: string; href: string; id?: string }[] = [
  ...CATEGORIES.map((c) => ({ label: getDisplayLabel(c), href: `/${c.slug}`, id: c.id })),
  { label: 'All Articles', href: '/archive' },
]

// Per-category accent colors for nav tabs — mirrors the colors used on
// CategoryBadge / CategoryHero so each section reads consistently across the site.
// Class names are written out in full (not interpolated) so Tailwind's JIT picks them up.
const NAV_ACCENTS: Record<string, { dot: string; text: string; border: string; hoverText: string; hoverBorder: string }> = {
  industry: { dot: 'bg-blue-300', text: 'text-blue-300', border: 'border-blue-300', hoverText: 'hover:text-blue-300', hoverBorder: 'hover:border-blue-300/60' },
  investor: { dot: 'bg-emerald-300', text: 'text-emerald-300', border: 'border-emerald-300', hoverText: 'hover:text-emerald-300', hoverBorder: 'hover:border-emerald-300/60' },
  government: { dot: 'bg-purple-300', text: 'text-purple-300', border: 'border-purple-300', hoverText: 'hover:text-purple-300', hoverBorder: 'hover:border-purple-300/60' },
  sponsor: { dot: 'bg-amber-300', text: 'text-amber-300', border: 'border-amber-300', hoverText: 'hover:text-amber-300', hoverBorder: 'hover:border-amber-300/60' },
  international: { dot: 'bg-indigo-300', text: 'text-indigo-300', border: 'border-indigo-300', hoverText: 'hover:text-indigo-300', hoverBorder: 'hover:border-indigo-300/60' },
  opinions: { dot: 'bg-rose-300', text: 'text-rose-300', border: 'border-rose-300', hoverText: 'hover:text-rose-300', hoverBorder: 'hover:border-rose-300/60' },
}

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
                An SVDG Product
              </span>
            </span>
          </Link>

          {/* Nav — scrollable on mobile */}
          <nav className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide ml-4">
            <Link
              href={RUNDOWN_ITEM.href}
              className={`
                nav-text px-3 py-1.5 text-[11px] whitespace-nowrap transition-colors border-b-2
                ${pathname === '/'
                  ? 'text-svdg-sky-dancer border-svdg-sky-dancer'
                  : 'text-white/60 border-transparent hover:text-white hover:border-white/30'
                }
              `}
            >
              {RUNDOWN_ITEM.label}
            </Link>

            <span className="w-px h-5 bg-white/15 mx-2 shrink-0" aria-hidden="true" />

            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href)
              const accent = item.id ? NAV_ACCENTS[item.id] : undefined

              if (accent) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      nav-text px-3 py-1.5 text-[11px] whitespace-nowrap transition-colors border-b-2 inline-flex items-center gap-1.5
                      ${isActive
                        ? `${accent.text} ${accent.border}`
                        : `text-white/60 border-transparent ${accent.hoverText} ${accent.hoverBorder}`
                      }
                    `}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${accent.dot} ${isActive ? '' : 'opacity-40'}`}
                      aria-hidden="true"
                    />
                    {item.label}
                  </Link>
                )
              }

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

          {/* Personal: reading list + identity, kept compact so the
              category nav has room to breathe */}
          <div className="flex items-center gap-1.5 ml-3 shrink-0">
            <Link
              href="/reading-list"
              title="Your reading list"
              className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${
                pathname === '/reading-list'
                  ? 'bg-svdg-crayola/25 border-svdg-crayola/55 text-svdg-sky'
                  : 'border-white/15 text-svdg-french-gray hover:border-white/30 hover:text-white'
              }`}
            >
              <BookmarkIcon />
            </Link>
            <AccountMenu />
          </div>

          {/* Add button */}
          <Link
            href="/add"
            className="svdg-btn svdg-btn--accent ml-2 shrink-0 !text-[11px] !px-3 !py-1.5"
          >
            + Add
          </Link>
        </div>
      </div>
    </header>
  )
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 3h10v14l-5-3-5 3V3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Compact "who's reading" picker — a small avatar showing your initial.
// Click to open a short dropdown and pick/change your name.
function AccountMenu() {
  const { userName, setUserName } = useIdentity()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={userName ? `Reading as ${userName} — click to change` : "Who's reading? Click to set your name"}
        className={`w-7 h-7 rounded-full border flex items-center justify-center text-[11px] font-bold transition-colors ${
          userName
            ? 'bg-svdg-sky-dancer/15 border-svdg-sky-dancer/40 text-svdg-sky-dancer'
            : 'border-white/15 text-svdg-french-gray hover:border-white/30 hover:text-white'
        }`}
      >
        {userName ? userName[0].toUpperCase() : '?'}
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-32 bg-svdg-pea-coat border border-white/15 rounded-lg shadow-lg overflow-hidden z-50">
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-svdg-french-gray border-b border-white/10">
            Who&apos;s reading?
          </div>
          {TEAM_MEMBERS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                setUserName(name)
                setOpen(false)
              }}
              className={`block w-full text-left px-3 py-1.5 text-xs transition-colors ${
                name === userName
                  ? 'text-svdg-sky-dancer font-semibold'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
