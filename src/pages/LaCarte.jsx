import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import { formules, menuSections, drinksSections, wineSections } from '../data/menu'

export default function LaCarte() {
  return (
    <>
      <PageHero
        crumb="La carte du moment"
        eyebrow="Braise, sauces et transmission"
        title="La carte du moment"
        lede="Une cuisine franco-africaine généreuse."
        photo={{ src: '/images/viande-braisee.webp', tint: '#1d1411', position: '50% 58%' }}
      />

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="shell">
          <p>Notre carte célèbre la braise, les sauces maison et les produits qui relient nos deux cultures.</p>
          <p style={{ fontStyle: 'italic', color: 'var(--brown-muted)' }}>
            L&rsquo;héritage de Mama Lina inspire l&rsquo;esprit de la maison : accueillir, transmettre et partager.
          </p>

          <span className="eyebrow">Chez Lina</span>
          <h2>Nos formules</h2>

          <div className="formules-card">
            <p className="formules-note">{formules.note}</p>
            <div className="formules-row">
              {formules.items.map((f) => (
                <div className="formule-col" key={f.name}>
                  {f.lines ? (
                    <>
                      <strong>{f.name}</strong>
                      {f.lines.map((line) => (
                        <div className="formule-col-head" key={line.label}>
                          <span>{line.label}</span>
                          <span className="formule-price">{line.price}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      <div className="formule-col-head">
                        <strong>{f.name}</strong>
                        <span className="formule-price">{f.price}</span>
                      </div>
                      <p>{f.subtitle}</p>
                    </>
                  )}
                  <p className="formule-desc">{f.description}</p>
                  {f.note && <p className="formule-note">{f.note}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="section-divider" aria-hidden="true">
            <span />
            <span className="section-divider-mark">◇</span>
            <span />
          </div>
        </div>
      </section>

      <section className="section section-cream" style={{ paddingTop: 0 }}>
        <div className="shell">
          {menuSections.filter((s) => s.title === 'Les entrées').map((section) => (
            <div className={`menu-box ${section.dark ? 'menu-box-dark' : ''}`} key={section.title} style={{ marginBottom: 36 }}>
              <span className="menu-box-corner" aria-hidden="true" />
              <span className="eyebrow">{section.eyebrow}</span>
              <h2>{section.title}</h2>
              {section.items.map((item) => (
                <div className="menu-item" key={item.name}>
                  {item.image && <img className="menu-item-thumb" src={item.image} alt="" />}
                  <div className="menu-item-body">
                    <div className="menu-item-top">
                      <span className="menu-item-name">{item.name}</span>
                      {!item.priceOptions && <span className="menu-item-price">{item.price}</span>}
                    </div>
                    {item.description && <div className="menu-item-desc">{item.description}</div>}
                    {item.priceOptions && (
                      <div className="menu-price-stack">
                        {item.priceOptions.map((opt) => (
                          <span className="menu-price-option" key={opt.label}>
                            <small>{opt.label}</small>
                            <strong>{opt.price}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div className="menu-columns">
            <div className="menu-column">
              {menuSections.filter((s) => s.column === 'left').map((section) => (
                <div className={`menu-box ${section.dark ? 'menu-box-dark' : ''}`} key={section.title}>
                  <span className="menu-box-corner" aria-hidden="true" />
                  <span className="eyebrow">{section.eyebrow}</span>
                  <h2>{section.title}</h2>
                  {section.items.map((item) => (
                    <div className="menu-item" key={item.name}>
                      {item.image && <img className="menu-item-thumb" src={item.image} alt="" />}
                      <div className="menu-item-body">
                        <div className="menu-item-top">
                          <span className="menu-item-name">{item.name}</span>
                          {!item.priceOptions && <span className="menu-item-price">{item.price}</span>}
                        </div>
                        {item.description && <div className="menu-item-desc">{item.description}</div>}
                        {item.priceOptions && (
                          <div className="menu-price-stack">
                            {item.priceOptions.map((opt) => (
                              <span className="menu-price-option" key={opt.label}>
                                <small>{opt.label}</small>
                                <strong>{opt.price}</strong>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="menu-column">
              {menuSections.filter((s) => s.column === 'right' && s.title !== 'Les entrées').map((section) => (
                <div className={`menu-box ${section.dark ? 'menu-box-dark' : ''}`} key={section.title}>
                  <span className="menu-box-corner" aria-hidden="true" />
                  <span className="eyebrow">{section.eyebrow}</span>
                  <h2>{section.title}</h2>
                  {section.items.map((item) => (
                    <div className="menu-item" key={item.name}>
                      {item.image && <img className="menu-item-thumb" src={item.image} alt="" />}
                      <div className="menu-item-body">
                        <div className="menu-item-top">
                          <span className="menu-item-name">{item.name}</span>
                          {!item.priceOptions && <span className="menu-item-price">{item.price}</span>}
                        </div>
                        {item.description && <div className="menu-item-desc">{item.description}</div>}
                        {item.priceOptions && (
                          <div className="menu-price-stack">
                            {item.priceOptions.map((opt) => (
                              <span className="menu-price-option" key={opt.label}>
                                <small>{opt.label}</small>
                                <strong>{opt.price}</strong>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <span className="eyebrow">À boire</span>
          <h2>La carte des boissons</h2>
          <p style={{ color: 'var(--brown-muted)' }}>Boissons chaudes, boissons maison, softs, bières, vins et champagne.</p>
          <div className="drinks-panel">
            {drinksSections.map((section) => (
              <div className="drinks-col" key={section.title}>
                <h3>{section.title}</h3>
                {section.items.map((item) => (
                  <div className="menu-item menu-item-plain" key={item.name}>
                    <span className="menu-item-name" style={{ fontWeight: 500 }}>{item.name}</span>
                    <span className="menu-item-price">{item.price}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="shell">
          <span className="eyebrow light">La cave</span>
          <h2>Vins et champagne</h2>
          {wineSections.map((section) => (
            <div key={section.title} style={{ marginTop: 28 }}>
              <h3 style={{ color: 'var(--gold)', fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{section.title}</h3>
              {section.items.map((item) => (
                <div className="wine-item" key={item.name} style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                  <span>{item.name}</span>
                  <span className="wine-prices" style={{ color: 'var(--gold)' }}>
                    {item.glass && <span>Verre {item.glass}</span>}
                    {item.bottle && <span>Bouteille {item.bottle}</span>}
                  </span>
                </div>
              ))}
            </div>
          ))}
          <p style={{ marginTop: 24, fontSize: '0.85rem', opacity: 0.8 }}>Tarifs provisoires à la bouteille.</p>
        </div>
      </section>

      <section className="cta-band">
        <img src="/images/la-carte-hero.jpg" alt="Assortiment de plats Chez Lina" />
        <div className="shell">
          <span className="eyebrow light">À votre table</span>
          <h2>Goûter la carte</h2>
          <p style={{ maxWidth: 480, color: '#f0e4d8' }}>Choisissez une table ou préparez une commande à emporter.</p>
          <Link to="/reservation" className="button button-primary">Réserver ou commander</Link>
        </div>
      </section>
    </>
  )
}
