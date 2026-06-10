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
          <div className="flex items-center gap-4">
            <Link href="/extension" className="nav-text text-svdg-sky hover:text-svdg-sky-dancer transition-colors">
              Get the Browser Extension
            </Link>
            <Link href="/newsletter" className="nav-text text-svdg-sky hover:text-svdg-sky-dancer transition-colors">
              Subscribe to the Weekly Rundown →
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
