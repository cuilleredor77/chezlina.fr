import PageHero from './PageHero'

export default function LegalLayout({ crumb, eyebrow, title, lede, children }) {
  return (
    <>
      <PageHero crumb={crumb} eyebrow={eyebrow} title={title} lede={lede} />
      <section className="section">
        <div className="shell">
          <div className="legal-body">{children}</div>
        </div>
      </section>
    </>
  )
}
