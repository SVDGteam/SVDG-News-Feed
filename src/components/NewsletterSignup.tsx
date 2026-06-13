'use client'

import { FormEvent, useState } from 'react'
import { withBasePath } from '@/lib/basePath'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface Props {
  source: string
  variant?: 'default' | 'compact'
}

export default function NewsletterSignup({ source, variant = 'default' }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch(withBasePath('/api/subscribe'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.')
      }

      setStatus('success')
      setMessage(
        data.alreadySubscribed
          ? "You're already on the list."
          : "You're in — look for the next Weekly Rundown."
      )
      setEmail('')
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  const inputClass =
    'flex-1 min-w-0 text-sm border border-white/15 bg-white/5 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-svdg-crayola placeholder:text-svdg-french-gray/50'

  const buttonClass =
    variant === 'compact'
      ? 'svdg-btn svdg-btn--accent !text-[11px] !px-4 !py-2 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed'
      : 'svdg-btn svdg-btn--accent whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed'

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col sm:flex-row gap-2 sm:gap-3 w-full ${variant === 'compact' ? 'max-w-sm' : 'max-w-md'}`}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        className={inputClass}
        aria-label="Email address"
      />
      <button type="submit" className={buttonClass} disabled={status === 'loading'}>
        {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
      </button>
      {message && (
        <p
          className={`text-xs sm:basis-full ${
            status === 'error' ? 'text-red-300' : 'text-svdg-sky-dancer'
          }`}
        >
          {message}
        </p>
      )}
    </form>
  )
}
