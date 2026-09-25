import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'

export default function Contact() {
  return (
    <>
      <PageHero
        crumb="Chez Lina à Brunoy"
        eyebrow="Restaurant franco-africain · Brunoy"
        title="Chez Lina à Brunoy"
        lede="Préparez votre venue ou contactez-nous."
        photo={{ src: '/images/table-partage.webp', tint: '#142c28', position: '50% 48%' }}
      />

      <section className="section">
        <div className="shell grid grid-2">
          <div>
            <span className="eyebrow">Nous trouver</span>
            <h2>Chez Lina</h2>
            <p style={{ fontSize: '1.1rem' }}>29 rue de Montgeron<br />91800 Brunoy</p>

            <h3 style={{ fontSize: '1.1rem', marginTop: 32 }}>Horaires</h3>
            <p>Du mardi au samedi<br />11 h 45–15 h · 18 h 30–23 h 45<br />Dimanche : 11 h 45–15 h 30 (midi uniquement)<br />Fermé le lundi</p>

            <div className="button-row" style={{ marginTop: 20 }}>
              <Link to="/reservation" className="button button-primary">Réserver ou commander</Link>
              <a className="button button-outline" href="https://www.google.com/maps/dir/?api=1&destination=29+rue+de+Montgeron+91800+Brunoy" target="_blank" rel="noreferrer">Google Maps</a>
              <a className="button button-outline" href="https://www.waze.com/ul?q=29%20rue%20de%20Montgeron%2C%2091800%20Brunoy&navigate=yes" target="_blank" rel="noreferrer">Waze</a>
            </div>
          </div>

          <div>
            <span className="eyebrow">Nous contacter</span>
            <nav className="contact-secondary" aria-label="Contacter Chez Lina">
              <a href="tel:+33651197751"><span>Appeler</span><strong>06 51 19 77 51</strong></a>
              <a href="https://wa.me/33651197751" target="_blank" rel="noreferrer"><span>Écrire</span><strong>WhatsApp</strong></a>
              <a href="mailto:contact@chezlina.fr"><span>Écrire</span><strong>E-mail</strong></a>
              <a href="https://www.instagram.com/restaurant.chezlina/" target="_blank" rel="noreferrer"><span>Nous suivre</span><strong>Instagram</strong></a>
            </nav>
          </div>
        </div>
      </section>
    </>
  )
}
