import { CSSProperties } from 'react'

export default function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <div
      className="svdg-bracket mb-4"
      style={{ '--bk-color': 'var(--svdg-sky)', '--bk-inset': '14px' } as CSSProperties}
    >
      <div className="svdg-bracket__tl" />
      <div className="svdg-bracket__br" />
      <div className="svdg-bracket__body">
        <span className="eyebrow text-svdg-sky">{eyebrow}</span>
        <h1 className="text-2xl mt-1 mb-1">{title}</h1>
        {description && <p className="text-sm text-svdg-french-gray">{description}</p>}
      </div>
    </div>
  )
}
