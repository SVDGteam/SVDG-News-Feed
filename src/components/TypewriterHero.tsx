'use client'

import { useEffect, useState } from 'react'

const TEXT = 'Dispatch'
const TYPE_SPEED_MS = 110
const START_DELAY_MS = 300
const STORAGE_KEY = 'svdg-dispatch-typed'

export default function TypewriterHero() {
  const [count, setCount] = useState(0)
  const [skip, setSkip] = useState(false)

  // Only play the typing animation the first time the page is opened
  // (per browser tab/session) — subsequent visits show the full text immediately.
  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) {
      setCount(TEXT.length)
      setSkip(true)
    }
  }, [])

  useEffect(() => {
    if (skip) return
    if (count >= TEXT.length) {
      sessionStorage.setItem(STORAGE_KEY, '1')
      return
    }
    const delay = count === 0 ? START_DELAY_MS : TYPE_SPEED_MS
    const t = setTimeout(() => setCount((c) => c + 1), delay)
    return () => clearTimeout(t)
  }, [count, skip])

  return (
    <span className="flex items-center gap-2 font-display font-bold tracking-tight text-4xl md:text-5xl text-white leading-none">
      <span>{TEXT.slice(0, count)}</span>
      <span className="inline-block w-2.5 h-9 md:h-11 bg-svdg-sky-dancer animate-pulse shrink-0" aria-hidden="true" />
    </span>
  )
}
