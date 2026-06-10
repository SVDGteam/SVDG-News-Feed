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
        <div className="max-w-[60%] sm:max-w-[50%] md:max-w-md">
          {isSponsor && (
            <Image
              src="/brand/logomark-white.png"
              alt="SVDG"
              width={287}
              height={300}
              className="w-9 h-auto sm:w-11 md:w-12 mb-2 md:mb-3"
            />
          )}
          <span className="eyebrow text-svdg-sky-dancer">Category</span>
          <h1 className="text-xl sm:text-2xl md:text-4xl font-display font-bold text-white mt-1 leading-tight">
            {category.label}
          </h1>
          <p className="hidden md:block text-sm text-svdg-french-gray mt-2 max-w-sm">
            {category.description}
          </p>
        </div>
      </div>
    </div>
  )
}
