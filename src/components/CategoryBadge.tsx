import { Category } from '@/types/article'
import { getCategoryConfig } from '@/data/categories'

interface Props {
  category: Category
  size?: 'sm' | 'xs'
}

export default function CategoryBadge({ category, size = 'sm' }: Props) {
  const config = getCategoryConfig(category)
  const sizeClass = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'

  return (
    <span
      className={`inline-block rounded border font-medium ${sizeClass} ${config?.bgColor ?? 'bg-white/5 border-white/10'} ${config?.color ?? 'text-slate-300'}`}
    >
      {category}
    </span>
  )
}
