import { getScoreColor, getScoreLabel } from '@/lib/scoring'

interface Props {
  score: number
  showBreakdown?: boolean
  isOverridden?: boolean
}

export default function RelevanceBadge({ score, isOverridden }: Props) {
  const label = getScoreLabel(score)
  const colorClass = getScoreColor(score)

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-semibold whitespace-nowrap ${colorClass}`}
      title={`Relevance: ${score}/100${isOverridden ? ' (manually set)' : ''}`}
    >
      {score}
      <span className="opacity-60 font-normal hidden sm:inline">· {label}</span>
      {isOverridden && (
        <span className="opacity-60" title="Score manually overridden">✎</span>
      )}
    </span>
  )
}
