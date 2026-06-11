'use client'

import { useEffect, useState } from 'react'

const TEXT = 'Dispatch'
const TYPE_SPEED_MS = 110
const START_DELAY_MS = 300

export default function TypewriterHero() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (count >= TEXT.length) return
    const delay = count === 0 ? START_DELAY_MS : TYPE_SPEED_MS
    const t = setTimeout(() => setCount((c) => c + 1), delay)
    return () => clearTimeout(t)
  }, [count])

  return (
    <span className="flex items-center gap-2 font-display font-bold tracking-tight text-4xl md:text-5xl text-white leading-none">
      <span>{TEXT.slice(0, count)}</span>
      <span className="inline-block w-2.5 h-9 md:h-11 bg-svdg-sky-dancer animate-pulse shrink-0" aria-hidden="true" />
    </span>
  )
}
