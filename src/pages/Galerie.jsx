import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'

const featured = [
  { src: '/images/table-reportage.webp', alt: 'Une table réunissant plusieurs plats Chez Lina', caption: 'La table', title: 'Plusieurs saveurs, un même moment de partage' },
  { src: '/images/dorade-braisee.webp', alt: 'Dorade braisée et condiment frais', caption: 'La braise', title: 'Dorade braisée et condiment frais' },
  { src: '/images/brochettes-boeuf.webp', alt: 'Brochettes, alloco et sauce maison', caption: 'À partager', title: 'Brochettes, alloco et sauce maison' },
]

const more = [
  { src: '/images/mouton-braise.webp', alt: 'Mouton braisé servi avec de la chikwangue', title: 'Mouton braisé' },
  { src: '/images/entree-signature.webp', alt: 'Entrée signature portée à deux mains', title: 'Entrée signature' },
  { src: '/images/aubergine-signature.webp', alt: 'Aubergine grillée sur sauce crémeuse', title: 'Création végétale' },
  { src: '/images/panga-braise.jpg', alt: 'Panga entier braisé, garni d’herbes fraîches et servi avec un citron grillé', title: 'Panga braisé' },
]

export default function Galerie() {
  return (
    <>
      <PageHero
        crumb="La maison en images"
        eyebrow="Cuisine, gestes, partage"
        title="La maison en images"
        lede="Les plats et les gestes de Chez Lina."
        photo={{ src: '/images/plat-signature.webp', tint: '#1d1411', position: '50% 54%' }}
      />

      <section className="section">
        <div className="shell">
          <div className="gallery-grid">
            {featured.map((f) => (
              <figure key={f.src}>
                <img src={f.src} alt={f.alt} />
                <figcaption className="gallery-caption">
                  <span className="eyebrow light" style={{ marginBottom: 4 }}>{f.caption}</span>
                  <div>{f.title}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="section split" style={{ padding: 0 }}>
        <img src="/images/geste-service.webp" alt="Main servant une bouchée sur un plateau à partager" />
        <div className="split-copy">
          <span className="eyebrow">Le geste</span>
          <h2>Le soin jusque dans le dernier geste.</h2>
          <p>Dresser, ajuster, servir : chaque détail compte jusqu&rsquo;à votre table.</p>
        </div>
      </section>

      <section className="section section-cream">
        <div className="shell">
          <span className="eyebrow">Encore à découvrir</span>
          <h2>Les assiettes de la maison.</h2>
          <div className="gallery-grid" style={{ marginTop: 28 }}>
            {more.map((f) => (
              <figure key={f.src}>
                <img src={f.src} alt={f.alt} />
                <figcaption className="gallery-caption">{f.title}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <img src="/images/viande-braisee.webp" alt="Viande braisée Chez Lina" />
        <div className="shell">
          <span className="eyebrow light">Venez goûter</span>
          <h2>La suite se découvre à table.</h2>
          <Link to="/reservation" className="button button-primary">Réserver ou commander</Link>
        </div>
      </section>
    </>
  )
}
