import { Category } from '@/types/article'
import { getCategoryConfig, getDisplayLabel } from '@/data/categories'
import CategoryIcon from './CategoryIcon'

interface Props {
  category: Category
  size?: 'sm' | 'xs'
}

export default function CategoryBadge({ category, size = 'sm' }: Props) {
  const config = getCategoryConfig(category)
  const sizeClass = size === 'xs' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
  const iconClass = size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold ${sizeClass} ${config?.bgColor ?? 'bg-white/5 border-white/10'} ${config?.color ?? 'text-slate-300'}`}
    >
      {config && <CategoryIcon id={config.id} className={iconClass} />}
      {config ? getDisplayLabel(config) : category}
    </span>
  )
}
