// Shared SVG icon components used across multiple Dispatch components.

export function BookmarkIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
      <path d="M5 3h10v14l-5-3-5 3V3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
