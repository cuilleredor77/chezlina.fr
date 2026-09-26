import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const slides = [
  { src: '/images/table-reportage.webp', alt: 'Table dressée au restaurant Chez Lina à Brunoy' },
  { src: '/images/mama-lina-portrait.jpeg', alt: 'Portrait de Mama Lina, à l’origine de Chez Lina', identity: true },
  { src: '/images/poulet-braise-riz-rouge.jpeg', alt: 'Suprême de volaille et riz rouge de la maison Chez Lina' },
  { src: '/images/viande-braisee.webp', alt: 'Viande braisée dressée avec soin Chez Lina' },
  { src: '/images/plateau-partage.webp', alt: 'Plateau de bouchées à partager Chez Lina' },
]

export default function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const touch = useRef(null)

  useEffect(() => {
    if (!playing) return
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % slides.length), 5200)
    return () => window.clearTimeout(t)
  }, [index, playing])

  const go = (delta) => setIndex((i) => (i + delta + slides.length) % slides.length)

  const active = slides[index]

  return (
    <section
      className="hero hero-home"
      aria-roledescription="carrousel"
      aria-label="Cuisine Chez Lina"
      onTouchStart={(e) => {
        const t = e.touches[0]
        touch.current = { x: t.clientX, y: t.clientY }
      }}
      onTouchEnd={(e) => {
        const start = touch.current
        const t = e.changedTouches[0]
        touch.current = null
        if (!start || !t) return
        const dx = t.clientX - start.x
        const dy = t.clientY - start.y
        if (Math.abs(dx) < 45 || Math.abs(dx) <= Math.abs(dy)) return
        go(dx < 0 ? 1 : -1)
      }}
    >
      <div className="hero-slides">
        {slides.map((s, i) => (
          <img
            key={s.src}
            className={`hero-slide ${i === index ? 'is-active' : ''}`}
            src={s.src}
            alt={s.alt}
            aria-hidden={i !== index}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>
      <div className="hero-shade" aria-hidden="true" />

      {active.identity ? (
        <div className="shell hero-copy hero-identity-copy">
          <p className="eyebrow light">L&rsquo;histoire de la maison</p>
          <h1 id="hero-title">Une mère,<br />quatre filles,<br />un héritage.</h1>
          <p className="hero-intro">Un héritage congolais vivant à Brunoy.</p>
          <div className="button-row">
            <Link to="/notre-histoire" className="button button-primary">Découvrir son histoire</Link>
            <Link to="/reservation" className="button button-ghost-light">Réserver ou commander</Link>
          </div>
        </div>
      ) : (
        <div className="shell hero-copy">
          <h1 id="hero-title">
            Chez Lina<span className="sr-only">, </span>
            <span className="eyebrow light hero-title-note">Restaurant franco-africain à Brunoy</span>
          </h1>
          <div className="hero-rating-badge">★ 5,0 · 29 avis Google</div>
          <p className="hero-signature">Deux cultures, une même table.</p>
          <div className="button-row">
            <Link to="/reservation" className="button button-primary">Réserver ou commander</Link>
            <Link to="/galerie" className="button button-ghost-light">Découvrir nos plats</Link>
          </div>
        </div>
      )}

      <div className="hero-carousel-controls shell">
        <div className="carousel-arrows">
          <button type="button" aria-label="Photo précédente" onClick={() => go(-1)}>‹</button>
          <button type="button" aria-label="Photo suivante" onClick={() => go(1)}>›</button>
        </div>
        <div className="carousel-dots" aria-label="Choisir une photo">
          {slides.map((s, i) => (
            <button key={s.src} type="button" aria-label={`Afficher la photo ${i + 1}`} aria-current={i === index} onClick={() => setIndex(i)} />
          ))}
        </div>
        <button className="carousel-play" type="button" aria-label={playing ? 'Mettre le carrousel en pause' : 'Relancer le carrousel'} onClick={() => setPlaying((p) => !p)}>
          {playing ? 'Pause' : 'Lecture'}
        </button>
        <span className="sr-only" aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
          Photo {index + 1} sur {slides.length}
        </span>
      </div>
    </section>
  )
}
