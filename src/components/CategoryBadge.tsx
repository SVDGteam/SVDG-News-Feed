import { Category } from '@/types/article'
import { getCategoryConfig, getDisplayLabel } from '@/data/categories'

interface Props {
  category: Category
  size?: 'sm' | 'xs'
}

export default function CategoryBadge({ category, size = 'sm' }: Props) {
  const config = getCategoryConfig(category)
  const sizeClass = size === 'xs' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'

  return (
    <span
      className={`inline-block rounded-full border font-semibold ${sizeClass} ${config?.bgColor ?? 'bg-white/5 border-white/10'} ${config?.color ?? 'text-slate-300'}`}
    >
      {config ? getDisplayLabel(config) : category}
    </span>
  )
}
