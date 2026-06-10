import Image from 'next/image'
import { CSSProperties } from 'react'
import { CategoryConfig } from '@/data/categories'

export default function CategoryHero({ category }: { category: CategoryConfig }) {
  const isSponsor = category.id === 'sponsor'

  return (
    <div
      className="svdg-bracket svdg-category-hero mb-6 h-40 sm:h-48 md:h-56"
      style={
        {
          '--bk-color': 'var(--svdg-sky-dancer)',
          '--bk-inset': '16px',
          backgroundImage: `url(${category.heroImage})`,
        } as CSSProperties
      }
    >
      <div className="svdg-bracket__tl" />
      <div className="svdg-bracket__br" />
      <div className="svdg-bracket__body h-full flex items-center">
        <div className="max-w-[60%] sm:max-w-[50%] md:max-w-md flex items-center gap-3 md:gap-4">
          {isSponsor && (
            <Image
              src="/brand/logomark-white.png"
              alt="SVDG"
              width={287}
              height={300}
              className="w-8 h-auto sm:w-10 md:w-12 shrink-0"
            />
          )}
          <div>
            <span className="eyebrow text-svdg-sky-dancer">Category</span>
            <h1 className="text-xl sm:text-2xl md:text-4xl font-display font-bold text-white mt-1 leading-tight">
              {category.label}
            </h1>
          </div>
        </div>
      </div>
    </div>
  )
}
