import { CSSProperties } from 'react'
import { CategoryConfig, getDisplayLabel } from '@/data/categories'

// Inline SVG so it renders with no network request, no basePath, no proxy.
// Paths are the SVDG logomark; fill="white" overrides the brand colour palette.
function SVDGLogomark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 438 459"
      xmlns="http://www.w3.org/2000/svg"
      fill="white"
      aria-label="SVDG"
      className={className}
    >
      <path d="m58.4769 183.354 38.1004-18.572c6.8987 13.463 18.7787 22.521 40.5907 22.521 21.813 0 26.231-6.965 26.231-13.235 0-9.98-11.05-13.929-40.038-20.655-28.721-6.737-56.8786-18.334-56.8786-49.446 0-31.1121 31.4787-49.4458 64.8946-49.4458 33.416 0 56.602 12.7683 70.686 36.6776l-37.28 18.3332c-6.632-11.607-15.734-18.7995-33.416-18.7995-13.807 0-20.706 5.8037-20.706 12.3015 0 7.431 4.695 12.541 34.79 20.199 29.275 7.431 62.127 16.013 62.127 50.369 0 31.34-29.818 49.912-71.793 49.912-41.9753 0-66.5453-16.251-77.3184-40.16z" />
      <path d="m192.677 54.5212h49.419l43.77 124.3248 43.77-124.3248h49.42l-64.389 168.9928h-57.612l-64.388-168.9928z" />
      <path d="m252 459h165.503 20.497v-20.497-165.503h-20.497v165.503h-165.503z" />
      <path d="m186 0h-165.5029-20.4971v20.4971 165.5029h20.4971v-165.5029h165.5029z" />
      <path d="m207.111 310.496c0 47.798-35.352 84.497-81.772 84.497h-67.339v-168.993h67.339c46.42 0 81.772 36.698 81.772 84.496zm-37.035 0c0-28.967-18.275-47.321-44.737-47.321h-28.8584v94.632h28.8584c26.452 0 44.737-18.344 44.737-47.321z" />
      <path d="m382.953 319.073c0 51.869-35.853 83.375-83.005 83.375-52.937 0-90.948-39.268-90.948-87.985 0-48.716 38.734-88.463 88.304-88.463 32.237 0 59.433 15.993 73.626 38.779l-32.723 18.906c-6.972-11.143-22.135-19.873-41.141-19.873-28.395 0-49.569 21.091-49.569 50.901s20.214 49.934 52.936 49.934c22.373 0 37.051-9.937 43.073-26.179h-44.994v-33.931h84.451v14.546z" />
    </svg>
  )
}

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
          <SVDGLogomark className="w-7 h-auto sm:w-8 md:w-10 shrink-0" />
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
