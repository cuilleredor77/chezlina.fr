import { usePageTitle } from '../hooks/usePageTitle'

export default function PageHero({ crumb, eyebrow, title, lede, photo }) {
  usePageTitle(title, lede)
  const style = photo
    ? {
        background: `linear-gradient(90deg, ${photo.tint}b8 0%, ${photo.tint}78 48%, ${photo.tint}20 100%), url(${photo.src}) ${photo.position || '50% 50%'}/cover no-repeat`,
      }
    : undefined
  return (
    <section className={`page-hero ${photo ? 'page-hero-photo' : ''}`} style={style}>
      <div className="shell">
        <span className="breadcrumb">Accueil / {crumb}</span>
        {eyebrow && <span className="eyebrow light">{eyebrow}</span>}
        <h1>{title}</h1>
        {lede && <p className="lede">{lede}</p>}
      </div>
      {photo && <span className="page-hero-deco" aria-hidden="true" />}
    </section>
  )
}
