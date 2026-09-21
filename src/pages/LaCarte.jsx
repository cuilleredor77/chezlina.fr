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
        lede="Une cuisine franco-africaine généreuse. Notre carte célèbre la braise, les sauces maison et les produits qui relient nos deux cultures. L’héritage de Mama Lina inspire l’esprit de la maison : accueillir, transmettre et partager."
      />

      <section className="section">
        <div className="shell">
          <span className="eyebrow">Chez Lina</span>
          <h2>Nos formules</h2>
          <p style={{ maxWidth: 640, color: 'var(--brown-muted)' }}>{formules.note}</p>
          <div className="grid grid-3" style={{ marginTop: 32 }}>
            {formules.items.map((f) => (
              <div className="formule-card" key={f.name}>
                <h3 style={{ fontSize: '1.1rem' }}>{f.name}</h3>
                <p style={{ color: 'var(--brown-muted)', margin: 0 }}>{f.subtitle}</p>
                <div className="price">{f.price}</div>
                <p style={{ fontSize: '0.9rem' }}>{f.description}</p>
                {f.note && <p style={{ fontSize: '0.82rem', color: 'var(--rust)', margin: 0 }}>{f.note}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="shell">
          {menuSections.map((section) => (
            <div className="menu-block" key={section.title}>
              <div className="menu-block-head">
                <div>
                  <span className="eyebrow">{section.eyebrow}</span>
                  <h2 style={{ margin: 0 }}>{section.title}</h2>
                </div>
              </div>
              {section.items.map((item) => (
                <div className="menu-item" key={item.name}>
                  <div>
                    <div className="menu-item-name">{item.name}</div>
                    {item.description && <div className="menu-item-desc">{item.description}</div>}
                  </div>
                  <div className="menu-item-price">{item.price}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <span className="eyebrow">À boire</span>
          <h2>La carte des boissons</h2>
          <p style={{ color: 'var(--brown-muted)' }}>Boissons chaudes, boissons maison, softs, bières, vins et champagne.</p>
          <div className="grid grid-2" style={{ marginTop: 24 }}>
            {drinksSections.map((section) => (
              <div key={section.title}>
                <h3 style={{ fontSize: '1.1rem' }}>{section.title}</h3>
                {section.items.map((item) => (
                  <div className="menu-item" key={item.name}>
                    <div className="menu-item-name" style={{ fontWeight: 500 }}>{item.name}</div>
                    <div className="menu-item-price">{item.price}</div>
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
