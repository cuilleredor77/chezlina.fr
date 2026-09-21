import { usePageTitle } from '../hooks/usePageTitle'

export default function PageHero({ crumb, eyebrow, title, lede }) {
  usePageTitle(title, lede)
  return (
    <section className="page-hero">
      <div className="shell">
        <span className="breadcrumb">Accueil / {crumb}</span>
        {eyebrow && <span className="eyebrow light">{eyebrow}</span>}
        <h1>{title}</h1>
        {lede && <p className="lede">{lede}</p>}
      </div>
    </section>
  )
}
