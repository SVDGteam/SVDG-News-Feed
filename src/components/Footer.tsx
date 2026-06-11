import Image from 'next/image'
import Link from 'next/link'
import NewsletterSignup from './NewsletterSignup'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-12">
      <div className="max-w-screen-xl mx-auto px-4 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="bg-white rounded-md p-1 flex items-center justify-center shrink-0">
            <Image src="/brand/logomark.svg" alt="SVDG" width={20} height={21} />
          </span>
          <span className="flex flex-col gap-0.5 leading-none">
            <span className="font-display font-bold tracking-tight text-base text-white leading-none">
              Dispatch
            </span>
            <span className="nav-text text-[9px] text-svdg-sky-dancer leading-none">
              An SVDG Product
            </span>
          </span>
        </Link>

        <div className="md:max-w-sm">
          <span className="eyebrow text-svdg-sky-dancer">Weekly Rundown</span>
          <p className="text-sm text-white font-medium mt-1.5 mb-2.5">
            The top defense &amp; dual-use stories, scored and curated — straight to your inbox every Friday.
          </p>
          <NewsletterSignup source="footer" variant="compact" />
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-svdg-french-gray">
          <span>© {new Date().getFullYear()} Silicon Valley Defense Group</span>
          <div className="flex items-center gap-2">
            <Link
              href="/extension"
              className="nav-text inline-flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full border border-white/15 text-svdg-french-gray hover:border-white/30 hover:text-white transition-colors"
            >
              <svg viewBox="0 0 20 20" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M6.5 3.5h3v2a1.25 1.25 0 002.5 0v-2h1.5a1 1 0 011 1v3h2a1.25 1.25 0 010 2.5h2v3a1 1 0 01-1 1h-3v2a1.25 1.25 0 01-2.5 0v-2h-3a1 1 0 01-1-1v-3h-2a1.25 1.25 0 010-2.5h2v-3a1 1 0 011-1z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Get the Browser Extension
            </Link>
            <Link
              href="/newsletter"
              className="nav-text inline-flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full border bg-svdg-sky-dancer/15 border-svdg-sky-dancer/40 text-svdg-sky-dancer hover:bg-svdg-sky-dancer/25 transition-colors"
            >
              <svg viewBox="0 0 20 20" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M2.5 5.5h15v9h-15v-9z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2.5 5.5l7.5 5.5 7.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Subscribe to the Weekly Rundown
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
