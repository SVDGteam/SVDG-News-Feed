import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { AUTH_COOKIE_NAME, computeAuthToken, safeRedirectTarget } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const redirectTarget = safeRedirectTarget(
    typeof searchParams.redirect === 'string' ? searchParams.redirect : undefined
  )
  const hasError = searchParams.error === '1'

  // Already signed in? Skip the form.
  const sitePassword = process.env.SITE_PASSWORD
  if (sitePassword) {
    const siteUsername = process.env.SITE_USERNAME || 'svdg'
    const expectedToken = await computeAuthToken(siteUsername, sitePassword)
    const cookieToken = cookies().get(AUTH_COOKIE_NAME)?.value
    if (cookieToken === expectedToken) {
      redirect(redirectTarget)
    }
  }

  const inputClass =
    'w-full text-sm border border-white/15 bg-white/5 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-svdg-crayola'

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <span className="bg-white rounded-md p-2 flex items-center justify-center">
            <Image src="/brand/logomark.svg" alt="SVDG" width={28} height={30} />
          </span>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 font-display font-bold text-xl text-white leading-none">
              Dispatch
              <span className="inline-block w-[7px] h-[16px] bg-svdg-sky-dancer animate-pulse" aria-hidden="true" />
            </div>
            <div className="nav-text text-[10px] text-svdg-sky-dancer mt-1.5">
              An SVDG Product
            </div>
          </div>
        </div>

        <form
          method="POST"
          action="/api/login"
          className="bg-svdg-surface border border-white/10 rounded-lg p-6 space-y-4"
        >
          <div>
            <h1 className="text-base font-semibold text-white mb-1">Sign in</h1>
            <p className="text-sm text-svdg-french-gray">
              Use the shared team credentials to access Dispatch.
            </p>
          </div>

          {hasError && (
            <div className="text-sm text-red-300 bg-red-500/15 border border-red-400/30 rounded px-3 py-2">
              Incorrect username or password.
            </div>
          )}

          <input type="hidden" name="redirect" value={redirectTarget} />

          <div>
            <label htmlFor="username" className="block text-xs font-semibold text-svdg-french-gray uppercase tracking-wide mb-1.5">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-svdg-french-gray uppercase tracking-wide mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={inputClass}
            />
          </div>

          <button type="submit" className="svdg-btn svdg-btn--accent w-full justify-center">
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
