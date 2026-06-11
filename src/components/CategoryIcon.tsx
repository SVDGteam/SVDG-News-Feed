interface Props {
  id: string
  className?: string
}

/** Small line icons used inside category badges/pills. */
export default function CategoryIcon({ id, className = 'w-3 h-3' }: Props) {
  const common = {
    viewBox: '0 0 20 20',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    className,
    'aria-hidden': true,
  } as const

  switch (id) {
    case 'industry':
      // Factory / industrial buildings
      return (
        <svg {...common}>
          <path d="M2.5 17V9l4 2.5V9l4 2.5V9l4 2.5V4.5h4V17h-16z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'investor':
      // Trending-up chart line
      return (
        <svg {...common}>
          <path d="M3 13.5l4-4 3 3 6.5-6.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12.5 6h4v4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'government':
      // Columns / landmark
      return (
        <svg {...common}>
          <path d="M2.5 8L10 3.5 17.5 8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 8.5V16M8 8.5V16M12 8.5V16M16 8.5V16M2.5 16.5h15M2.5 18h15" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'sponsor':
      // Star
      return (
        <svg {...common}>
          <path d="M10 2.5l2.18 4.43 4.9.71-3.54 3.46.84 4.88L10 13.6l-4.38 2.38.84-4.88L2.92 7.64l4.9-.71z" strokeLinejoin="round" />
        </svg>
      )
    case 'international':
      // Globe
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="7.25" />
          <path d="M2.75 10h14.5M10 2.75c2.3 2.3 2.3 12.2 0 14.5M10 2.75c-2.3 2.3-2.3 12.2 0 14.5" strokeLinecap="round" />
        </svg>
      )
    case 'opinions':
      // Speech bubble
      return (
        <svg {...common}>
          <path d="M3 4.5h14v8.5H8.5L4.5 16.5v-3.5H3v-8.5z" strokeLinejoin="round" />
        </svg>
      )
    default:
      return null
  }
}
