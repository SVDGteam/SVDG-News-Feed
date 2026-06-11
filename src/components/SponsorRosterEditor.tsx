'use client'

import { useState } from 'react'
import { Sponsor } from '@/data/sponsors'

interface Props {
  initialSponsors: Sponsor[]
}

export default function SponsorRosterEditor({ initialSponsors }: Props) {
  const [sponsors, setSponsors] = useState<Sponsor[]>(initialSponsors)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !website.trim() || pending) return
    setPending(true)
    setError('')
    try {
      const res = await fetch('/api/sponsors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), website: website.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to add sponsor')
        return
      }
      setSponsors(data)
      setName('')
      setWebsite('')
    } catch {
      setError('Failed to add sponsor')
    } finally {
      setPending(false)
    }
  }

  async function handleRemove(sponsorName: string) {
    if (pending) return
    setPending(true)
    setError('')
    try {
      const res = await fetch('/api/sponsors', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: sponsorName }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to remove sponsor')
        return
      }
      setSponsors(data)
    } catch {
      setError('Failed to remove sponsor')
    } finally {
      setPending(false)
    }
  }

  return (
    <details className="mb-4 bg-svdg-surface/95 border border-white/10 rounded-lg">
      <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium text-white select-none flex items-center justify-between gap-2">
        <span>
          SVDG Sponsor Roster <span className="text-svdg-french-gray font-normal">({sponsors.length})</span>
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setEditing((v) => !v)
          }}
          className={`text-xs px-3 py-1 rounded-full border font-semibold transition-colors ${
            editing
              ? 'bg-blue-500/25 border-blue-400/45 text-blue-300'
              : 'bg-transparent border-white/15 text-svdg-french-gray hover:border-white/30 hover:text-white'
          }`}
        >
          {editing ? 'Done' : 'Edit'}
        </button>
      </summary>

      <div className="px-4 pb-4">
        {editing && (
          <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2 mb-3 pb-3 border-b border-white/10">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-wide text-svdg-french-gray">Sponsor name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Anduril Industries"
                className="text-xs border border-white/15 rounded-full px-3 py-1.5 bg-svdg-surface-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-svdg-crayola"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-wide text-svdg-french-gray">Website</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="e.g. anduril.com"
                className="text-xs border border-white/15 rounded-full px-3 py-1.5 bg-svdg-surface-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-svdg-crayola"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="text-xs font-semibold bg-blue-500/25 border border-blue-400/45 hover:bg-blue-500/35 text-blue-300 px-4 py-1.5 rounded-full disabled:opacity-50"
            >
              Add sponsor
            </button>
            {error && <span className="text-xs text-red-400">{error}</span>}
          </form>
        )}

        <div className="flex flex-wrap gap-1.5">
          {sponsors.map((s) => (
            <span
              key={s.name}
              className="inline-flex items-center gap-1.5 svdg-tag svdg-tag--outline normal-case tracking-normal"
            >
              <a
                href={`https://${s.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {s.name}
              </a>
              {editing && (
                <button
                  type="button"
                  onClick={() => handleRemove(s.name)}
                  disabled={pending}
                  title={`Remove ${s.name}`}
                  className="text-svdg-french-gray hover:text-red-400 disabled:opacity-50"
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      </div>
    </details>
  )
}
