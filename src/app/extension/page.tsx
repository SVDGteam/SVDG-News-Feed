import Image from 'next/image'
import { CSSProperties } from 'react'
import { BASE_PATH } from '@/lib/basePath'

export const metadata = {
  title: 'SVDG Hub — Browser Extension',
  description: 'One extension to clip articles to Dispatch and add events to Circuit.',
}

const INSTALL_STEPS = [
  {
    title: 'Download & unzip',
    body: 'Click the download button above. Find the downloaded dispatch-clipper.zip and unzip it — you should get a folder called "extension" or "dispatch-clipper".',
  },
  {
    title: 'Open Chrome extensions',
    body: (
      <>
        Go to{' '}
        <code className="bg-white/10 text-svdg-sky px-1.5 py-0.5 rounded font-mono-svdg text-xs">
          chrome://extensions
        </code>{' '}
        in a new tab, then turn on{' '}
        <strong className="text-white">Developer mode</strong> (top right).
      </>
    ),
  },
  {
    title: 'Load unpacked',
    body: 'Click "Load unpacked" and select the unzipped folder. The SVDG Hub icon should appear in your toolbar — pin it for quick access.',
  },
  {
    title: 'Add your API keys',
    body: (
      <>
        Click the icon → <strong className="text-white">Settings</strong>. The site URLs are pre-filled.
        Ask Simone for the API keys (one for Dispatch, one for Circuit), paste them in, and hit Save.
      </>
    ),
  },
]

export default function ExtensionPage() {
  return (
    <div>
      {/* Hero */}
      <div
        className="svdg-bracket bg-svdg-surface/40 mb-8 rounded-lg"
        style={{ '--bk-color': 'var(--svdg-sky-dancer)', '--bk-inset': '24px' } as CSSProperties}
      >
        <div className="svdg-bracket__tl" />
        <div className="svdg-bracket__br" />
        <div className="svdg-bracket__body flex flex-col items-center text-center gap-4 py-6">
          <span className="bg-white rounded-xl p-2.5 flex items-center justify-center shrink-0">
            <Image src="/brand/logomark.svg" alt="SVDG" width={36} height={38} />
          </span>
          <div>
            <span className="eyebrow text-svdg-sky-dancer">Browser Extension</span>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-white mt-2 leading-tight">
              SVDG Hub
            </h1>
            <p className="text-sm md:text-base text-svdg-french-gray mt-3 max-w-xl mx-auto">
              One extension for the whole SVDG platform. Toggle between{' '}
              <strong className="text-white">Dispatch</strong> to clip articles and{' '}
              <strong className="text-white">Circuit</strong> to add events — right from your browser toolbar.
            </p>
          </div>
          <a
            href={`${BASE_PATH}/extension/dispatch-clipper.zip`}
            download
            className="svdg-btn svdg-btn--accent"
          >
            ↓ Download for Chrome
          </a>
        </div>
      </div>

      {/* Mode toggle explainer */}
      <section className="mb-8">
        <h2 className="text-xl font-display font-bold tracking-tight text-white mb-1">Two modes, one icon</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="bg-svdg-surface/95 border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="svdg-tag svdg-tag--accent">Dispatch</span>
            </div>
            <p className="text-sm text-svdg-french-gray leading-relaxed">
              Dark theme. Clip the page you&apos;re reading — title, URL, source, and description are
              pre-filled. Pick categories and hit <strong className="text-white">Add to Dispatch</strong>.
              It lands with status <strong className="text-white">New</strong> for scoring and review.
            </p>
          </div>
          <div className="bg-svdg-surface/95 border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="svdg-tag" style={{ background: 'rgba(18,84,172,0.2)', color: '#56ccf2', borderColor: 'rgba(18,84,172,0.4)' }}>Circuit</span>
            </div>
            <p className="text-sm text-svdg-french-gray leading-relaxed">
              Light theme. Add a defense event to the shared calendar — fill in dates, event type,
              format, location, and why it matters. Hit <strong className="text-white">Add to Circuit</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Setup steps */}
      <section className="mb-8">
        <h2 className="text-xl font-display font-bold tracking-tight text-white mb-1">Setup</h2>
        <p className="text-sm text-svdg-french-gray mb-4">
          Chrome doesn&apos;t allow auto-installing unpacked extensions, so it&apos;s a quick
          one-time install — about a minute.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INSTALL_STEPS.map((step, i) => (
            <div key={step.title} className="bg-svdg-surface/95 border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="svdg-tag svdg-tag--accent">{i + 1}</span>
                <h3 className="text-sm font-display font-bold text-white">{step.title}</h3>
              </div>
              <p className="text-sm text-svdg-french-gray leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section>
        <h2 className="text-xl font-display font-bold tracking-tight text-white mb-1">Tips</h2>
        <div className="bg-svdg-surface/95 border border-white/10 rounded-lg p-4 text-sm text-svdg-french-gray leading-relaxed space-y-2">
          <p>
            The extension remembers which mode you last used — it will open in Dispatch or Circuit
            mode automatically next time.
          </p>
          <p>
            Clipping the same link twice in Dispatch won&apos;t create a duplicate.
          </p>
          <p>
            If you see an <strong className="text-white">Unauthorized</strong> error, open Settings
            and make sure both API keys are filled in correctly. Ask Simone if you need them.
          </p>
        </div>
      </section>
    </div>
  )
}
