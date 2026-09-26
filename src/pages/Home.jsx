import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import HeroCarousel from '../components/HeroCarousel'
import RandomGoogleReviews from '../components/RandomGoogleReviews'
import { usePageTitle } from '../hooks/usePageTitle'
import { trackEvent } from '../lib/analytics'

function getParisDayAndMinutes() {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date())
  const value = Object.fromEntries(parts.map(({ type, value: v }) => [type, v]))
  const weekdayMap = { lun: 1, mar: 2, mer: 3, jeu: 4, ven: 5, sam: 6, dim: 0 }
  const day = weekdayMap[value.weekday.replace('.', '').slice(0, 3).toLowerCase()]
  return { day, minutes: Number(value.hour) * 60 + Number(value.minute) }
}

function getTodayStatus() {
  const { day, minutes } = getParisDayAndMinutes()
  if (day === 1) return 'Fermé aujourd’hui (lundi) · réouvre demain à 11 h 45'
  if (day === 0) {
    if (minutes < 11 * 60 + 45) return 'Ouvre aujourd’hui à 11 h 45'
    if (minutes <= 15 * 60 + 30) return 'Ouvert aujourd’hui · jusqu’à 15 h 30'
    return 'Fermé pour aujourd’hui · réouvre mardi à 11 h 45'
  }
  if (minutes < 11 * 60 + 45) return 'Ouvre aujourd’hui à 11 h 45'
  if (minutes <= 15 * 60) return 'Ouvert aujourd’hui · jusqu’à 15 h'
  if (minutes < 18 * 60 + 30) return 'Réouvre ce soir à 18 h 30'
  if (minutes <= 23 * 60 + 45) return 'Ouvert aujourd’hui · jusqu’à 23 h 45'
  return day === 6 ? 'Fermé pour aujourd’hui · réouvre dimanche à 11 h 45' : 'Fermé pour aujourd’hui · réouvre demain à 11 h 45'
}

function TodayStatusBar() {
  const [status, setStatus] = useState('')

  useEffect(() => {
    setStatus(getTodayStatus())
    const id = window.setInterval(() => setStatus(getTodayStatus()), 60000)
    return () => window.clearInterval(id)
  }, [])

  if (!status) return null

  return (
    <div className="today-status-bar">
      <div className="shell today-status-inner">
        <span className="today-status-text"><span aria-hidden="true">🕒</span> {status}</span>
        <a
          href="https://www.google.com/maps/dir/?api=1&destination=29+rue+de+Montgeron+91800+Brunoy"
          target="_blank"
          rel="noreferrer"
          onClick={() => trackEvent('click_itineraire')}
        >
          Itinéraire ↗
        </a>
      </div>
    </div>
  )
}

export default function Home() {
  usePageTitle(null, "L'héritage congolais de Mama Lina, porté par ses quatre filles dans un restaurant franco-africain contemporain à Brunoy.")
  return (
    <>
      <HeroCarousel />
      <TodayStatusBar />

      <section className="section">
        <div className="shell">
          <span className="eyebrow">Le restaurant</span>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', maxWidth: 640 }}>Un héritage de famille, à table.</h2>
          <p style={{ maxWidth: 620, fontSize: '1.05rem' }}>
            Chez Lina vous accueille à Brunoy autour d&rsquo;une cuisine généreuse et contemporaine, héritée de Mama Lina
            et portée aujourd&rsquo;hui par ses quatre filles.
          </p>

          <div className="grid grid-3" style={{ marginTop: 40 }}>
            <div className="card">
              <img src="/images/morue-frite.webp" alt="Croquettes de morue Chez Lina" />
              <div className="card-body">
                <h3>Cuisine franco-africaine</h3>
                <p>Des saveurs africaines travaillées avec les gestes de la cuisine française.</p>
                <Link to="/la-carte" className="button button-ghost" style={{ marginTop: 16 }}>Découvrir la carte</Link>
              </div>
            </div>
            <div className="card">
              <img src="/images/aubergine-signature.webp" alt="Plat signature Chez Lina" />
              <div className="card-body">
                <h3>Plats signature</h3>
                <p>Des assiettes guidées par la braise, les sauces maison et les produits de saison.</p>
                <Link to="/galerie" className="button button-ghost" style={{ marginTop: 16 }}>Voir la galerie</Link>
              </div>
            </div>
            <div className="card">
              <img src="/images/plat-porte.webp" alt="Table à Chez Lina, Brunoy" />
              <div className="card-body">
                <h3>À Brunoy</h3>
                <p>Une maison de cuisine située au 29 rue de Montgeron.</p>
                <Link to="/contact" className="button button-ghost" style={{ marginTop: 16 }}>Nous trouver</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="quote-section">
        <div className="shell">
          <span className="eyebrow light">Les mots de la maison</span>
          <blockquote>
            « La braise donne le caractère.<br />
            La sauce raconte l&rsquo;histoire.<br />
            La table crée le lien. »
          </blockquote>
          <p style={{ marginTop: 24, color: 'var(--gold)' }}>Mama Lina, à l&rsquo;origine de la maison.</p>
        </div>
      </section>

      <section className="origin-band">
        <div className="shell origin-band-grid">
          <figure className="mama-face-frame">
            <div className="mama-face-circle">
              <span className="mama-face-visual" role="img" aria-label="Portrait illustré de Mama Lina" />
            </div>
            <figcaption>Mama Lina, à l&rsquo;origine de la maison.</figcaption>
          </figure>
          <div>
            <span className="eyebrow light">L&rsquo;origine de la maison</span>
            <h2>Une mère, quatre filles, un héritage.</h2>
            <p>
              Cette maison porte le prénom de Mama Lina et prolonge sa manière de réunir les personnes autour d&rsquo;une table.
            </p>
            <p>
              Ses quatre filles font aujourd&rsquo;hui vivre ses racines congolaises dans une cuisine franco-africaine
              personnelle, généreuse et contemporaine.
            </p>
            <p style={{ fontStyle: 'italic' }}>De Mama Lina à ses quatre filles, un héritage vivant à Brunoy.</p>
            <Link to="/notre-histoire" className="button button-primary" style={{ alignSelf: 'flex-start' }}>Découvrir son histoire</Link>
          </div>
        </div>
      </section>

      <section className="split section-dark" style={{ padding: 0 }}>
        <img src="/images/geste-service.webp" alt="Dressage d’une assiette Chez Lina" />
        <div className="split-copy">
          <span className="eyebrow light">Notre cuisine</span>
          <h2>Deux cultures.<br />Une cuisine.</h2>
          <div className="two-col-list">
            <div>
              <h4>France</h4>
              <p>Précision, dressage, techniques et saisonnalité.</p>
            </div>
            <div>
              <h4>Afrique</h4>
              <p>Braise, épices, sauces, générosité et produits.</p>
            </div>
          </div>
          <Link to="/galerie" className="button button-ghost-light" style={{ alignSelf: 'flex-start', marginTop: 8 }}>Voir nos réalisations</Link>
        </div>
      </section>

      <section className="section section-maroon">
        <div className="shell">
          <span className="eyebrow light">Ils parlent de Chez Lina</span>
          <h2 style={{ color: '#fff' }}>Ce qu&rsquo;ils en disent.</h2>
          <div className="proof-summary">
            <span className="proof-score">5,0/5</span>
            <div>
              <div className="proof-stars">★★★★★</div>
              <span>29 avis Google</span>
            </div>
          </div>
          <RandomGoogleReviews />
          <div className="proof-footer">
            <p style={{ margin: 0 }}>Découvrez les expériences partagées par nos clients.</p>
            <a className="button button-ghost-light" href="https://www.google.com/maps/search/?api=1&query=Chez+Lina+restaurant+29+rue+de+Montgeron+91800+Brunoy" target="_blank" rel="noreferrer">
              Voir tous les avis sur Google
            </a>
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="shell privatisation-block">
          <span className="eyebrow light">Événements privés</span>
          <h2>Privatiser Chez Lina</h2>
          <p style={{ maxWidth: 560 }}>Un anniversaire, un baptême, un repas d&rsquo;entreprise ? Réservez la salle rien que pour vous.</p>
          <p className="privatisation-price">Location de salle à partir de <strong>450 €</strong>, repas en supplément selon le menu choisi.</p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Disponibilités et capacité sur demande.</p>
          <div className="button-row" style={{ marginTop: 8 }}>
            <Link to="/reservation?type=privatisation" className="button button-primary" onClick={() => trackEvent('click_privatisation')}>Demander un devis</Link>
            <a className="button button-ghost-light" href="tel:+33651197751" onClick={() => trackEvent('click_tel')}>Appeler</a>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <img src="/images/plateau-bouchees-reportage.webp" alt="Planche à partager Chez Lina" />
        <div className="shell">
          <span className="eyebrow light">Votre prochaine table</span>
          <h2>Préparer votre venue</h2>
          <p style={{ maxWidth: 480, color: '#f0e4d8' }}>Choisissez une table ou préparez une commande à emporter.</p>
          <div className="hours-chip">
            <span className="hours-chip-icon" aria-hidden="true">🕒</span>
            <div>
              <strong>Mardi–samedi</strong> 11 h 45–15 h · 18 h 30–23 h 45
              <br />
              <strong>Dimanche</strong> 11 h 45–15 h 30 (midi uniquement)
              <span className="hours-chip-closed"> · Fermé le lundi</span>
            </div>
          </div>
          <div className="button-row">
            <Link to="/reservation?type=table" className="button button-primary">Réserver une table</Link>
            <Link to="/reservation?type=emporter" className="button button-primary">Commander à emporter</Link>
            <a className="button button-ghost-light" href="tel:+33651197751" onClick={() => trackEvent('click_tel')}>Appeler</a>
            <a className="button button-ghost-light" href="https://wa.me/33651197751?text=Bonjour%20Chez%20Lina%2C%20je%20souhaite%20faire%20une%20demande." target="_blank" rel="noreferrer" onClick={() => trackEvent('click_whatsapp')}>Écrire sur WhatsApp</a>
          </div>
        </div>
      </section>
    </>
  )
}
