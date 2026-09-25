import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'

const photos = [
  { src: '/images/table-reportage.webp', alt: 'Une table réunissant plusieurs plats Chez Lina', tag: 'La table', title: 'Plusieurs saveurs, un même moment de partage' },
  { src: '/images/dorade-braisee.webp', alt: 'Dorade braisée et condiment frais', tag: 'La braise', title: 'Dorade braisée et condiment frais' },
  { src: '/images/brochettes-boeuf.webp', alt: 'Brochettes, alloco et sauce maison', tag: 'À partager', title: 'Brochettes, alloco et sauce maison' },
  { src: '/images/mouton-braise.webp', alt: 'Mouton braisé servi avec de la chikwangue', title: 'Mouton braisé' },
  { src: '/images/entree-signature.webp', alt: 'Entrée signature portée à deux mains', title: 'Entrée signature' },
  { src: '/images/aubergine-signature.webp', alt: 'Aubergine grillée sur sauce crémeuse', title: 'Création végétale' },
  { src: '/images/panga-braise.jpg', alt: 'Panga entier braisé, garni d’herbes fraîches et servi avec un citron grillé', title: 'Panga braisé' },
  { src: '/images/entrecote-grillee.jpg', alt: 'Entrecôte grillée et frites maison', title: 'Entrecôte grillée' },
  { src: '/images/mouton-chikwangue.jpg', alt: 'Mouton braisé et chikwangue en gros plan', title: 'Mouton et chikwangue' },
  { src: '/images/poisson-braise-taboule.jpg', alt: 'Poisson entier braisé et son taboulé frais', title: 'Poisson braisé' },
  { src: '/images/aubergine-brochette-detail.jpg', alt: 'Aubergine braisée en brochette, sauce crémeuse', title: 'Aubergine en brochette' },
  { src: '/images/tempura-manioc-detail.jpg', alt: 'Tempura de manioc et sa sauce verte', title: 'Tempura de manioc' },
  { src: '/images/poulet-grille-riz-olives.jpg', alt: 'Poulet grillé, riz épicé et olives', title: 'Poulet grillé' },
  { src: '/images/planche-partager-detail.jpg', alt: 'Assortiment de bouchées de la planche à partager', title: 'Planche à partager' },
  { src: '/images/moment-partage.jpg', alt: 'Une bouchée trempée dans la sauce maison', title: 'À déguster ensemble' },
]

export default function Galerie() {
  const [openIndex, setOpenIndex] = useState(null)
  const isOpen = openIndex !== null

  useEffect(() => {
    if (!isOpen) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpenIndex(null)
      if (e.key === 'ArrowRight') setOpenIndex((i) => (i + 1) % photos.length)
      if (e.key === 'ArrowLeft') setOpenIndex((i) => (i - 1 + photos.length) % photos.length)
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const current = isOpen ? photos[openIndex] : null

  return (
    <>
      <PageHero
        crumb="La maison en images"
        eyebrow="Cuisine, gestes, partage"
        title="La maison en images"
        lede="Les plats et les gestes de Chez Lina."
        photo={{ src: '/images/plat-signature.webp', tint: '#1d1411', position: '50% 54%' }}
      />

      <section className="section split" style={{ padding: 0 }}>
        <img src="/images/geste-service.webp" alt="Main servant une bouchée sur un plateau à partager" />
        <div className="split-copy">
          <span className="eyebrow">Le geste</span>
          <h2>Le soin jusque dans le dernier geste.</h2>
          <p>Dresser, ajuster, servir : chaque détail compte jusqu&rsquo;à votre table.</p>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <span className="eyebrow">{photos.length} photos</span>
          <h2>Les assiettes de la maison.</h2>
          <div className="gallery-grid" style={{ marginTop: 20 }}>
            {photos.map((f, i) => (
              <figure key={f.src}>
                <button type="button" className="gallery-thumb" onClick={() => setOpenIndex(i)} aria-label={`Agrandir : ${f.title}`}>
                  <img src={f.src} alt={f.alt} loading={i < 3 ? 'eager' : 'lazy'} />
                </button>
                <figcaption className="gallery-caption">
                  {f.tag && <span className="eyebrow light" style={{ marginBottom: 4 }}>{f.tag}</span>}
                  <div>{f.title}</div>
                </figcaption>
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

      {isOpen && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={current.title} onClick={() => setOpenIndex(null)}>
          <button type="button" className="lightbox-close" aria-label="Fermer" onClick={() => setOpenIndex(null)}>✕</button>
          <button
            type="button"
            className="lightbox-nav lightbox-prev"
            aria-label="Photo précédente"
            onClick={(e) => { e.stopPropagation(); setOpenIndex((i) => (i - 1 + photos.length) % photos.length) }}
          >
            ‹
          </button>
          <figure className="lightbox-figure" onClick={(e) => e.stopPropagation()}>
            <img src={current.src} alt={current.alt} />
            <figcaption>{current.title} <span>· {openIndex + 1}/{photos.length}</span></figcaption>
          </figure>
          <button
            type="button"
            className="lightbox-nav lightbox-next"
            aria-label="Photo suivante"
            onClick={(e) => { e.stopPropagation(); setOpenIndex((i) => (i + 1) % photos.length) }}
          >
            ›
          </button>
        </div>
      )}
    </>
  )
}
