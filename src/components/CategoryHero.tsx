import { CSSProperties } from 'react'
import { CategoryConfig, getDisplayLabel } from '@/data/categories'

export default function CategoryHero({ category }: { category: CategoryConfig }) {
  const isSponsor = category.id === 'sponsor'

  return (
    <div
      className="svdg-category-hero mb-6 h-28 sm:h-32 md:h-36 flex items-center"
      style={
        {
          backgroundImage: `url(${category.heroImage})`,
        } as CSSProperties
      }
    >
      <div className="svdg-category-hero__content flex items-center gap-3 md:gap-4 px-5 sm:px-6 md:px-8 max-w-[60%] sm:max-w-[50%] md:max-w-md">
        {isSponsor && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/brand/logomark-white.png"
            alt="SVDG"
            width={287}
            height={300}
            className="w-7 h-auto sm:w-8 md:w-10 shrink-0"
          />
        )}
        <div>
          <span className="eyebrow text-svdg-sky-dancer">Category</span>
          <h1 className="text-lg sm:text-xl md:text-3xl font-display font-bold text-white mt-1 leading-tight">
            {getDisplayLabel(category)}
          </h1>
        </div>
      </div>
    </div>
  )
}
