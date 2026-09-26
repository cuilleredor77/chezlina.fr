import { Link } from 'react-router-dom'
import { trackEvent } from '../lib/analytics'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand-column">
          <img src="/images/logo-chez-lina-vertical.png" alt="Chez Lina" className="footer-logo" />
          <div>
            <p className="footer-line">Une mère, quatre filles, un héritage.</p>
            <p className="footer-brand-copy">L&rsquo;héritage congolais de Mama Lina, porté par ses quatre filles à Brunoy.</p>
          </div>
        </div>

        <nav className="footer-nav" aria-label="Navigation de pied de page">
          <h2>Découvrir</h2>
          <Link to="/la-carte">La carte</Link>
          <Link to="/notre-histoire">L’histoire de Mama Lina</Link>
          <Link to="/galerie">La maison en images</Link>
          <Link to="/contact">Nous trouver</Link>
        </nav>

        <div className="footer-address">
          <h2>Chez Lina</h2>
          <a
            className="footer-location-link"
            href="https://www.google.com/maps/search/?api=1&query=Chez+Lina+restaurant+29+rue+de+Montgeron+91800+Brunoy"
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent('click_itineraire')}
          >
            29 rue de Montgeron<br />91800 Brunoy
          </a>
          <div className="footer-hours">
            <strong>Horaires</strong>
            <p>Mardi–samedi<br />11 h 45–15 h · 18 h 30–23 h 45</p>
            <p>Dimanche<br />11 h 45–15 h 30 (midi uniquement)</p>
            <p className="footer-hours-closed">Fermé le lundi</p>
          </div>
        </div>

        <div className="footer-contact">
          <h2>Nous contacter</h2>
          <a className="footer-contact-link footer-call-link" href="tel:+33651197751" onClick={() => trackEvent('click_tel')}>
            <span>Appeler</span>
            <small>06 51 19 77 51</small>
          </a>
          <a className="footer-contact-link footer-whatsapp-link" href="https://wa.me/33651197751" target="_blank" rel="noreferrer" onClick={() => trackEvent('click_whatsapp')}>
            <span>WhatsApp</span>
            <small>06 51 19 77 51</small>
          </a>
          <a className="footer-contact-link footer-email-link" href="mailto:contact@chezlina.fr">
            <span>E-mail</span>
            <small>contact@chezlina.fr</small>
          </a>
        </div>

        <div className="footer-social">
          <h2>Nous suivre</h2>
          <div className="social-links" aria-label="Réseaux sociaux">
            <a className="social-link" href="https://www.instagram.com/chezlina.brunoy/" target="_blank" rel="noreferrer" aria-label="Instagram de Chez Lina">
              <span className="social-logo-frame">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="12" cy="12" r="4.25" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  <circle className="social-icon-dot" cx="17.5" cy="6.7" r="1" fill="currentColor" />
                </svg>
              </span>
              <span>Chez Lina</span>
            </a>
            <a className="social-link" href="https://www.tiktok.com/@chezlina.brunoy" target="_blank" rel="noreferrer" aria-label="TikTok de Chez Lina">
              <span className="social-logo-frame">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15.5 3c.3 2.2 1.7 3.8 3.9 4v2.6a6.6 6.6 0 0 1-3.9-1.3v6.1A5.4 5.4 0 1 1 10.1 9v2.7a2.7 2.7 0 1 0 2.7 2.7V3h2.7z" fill="currentColor" />
                </svg>
              </span>
              <span>TikTok</span>
            </a>
            <a className="social-link social-link-partner" href="https://www.instagram.com/cuillere.dor/" target="_blank" rel="noreferrer" aria-label="Cuillère d&rsquo;Or, traiteur événementiel (Instagram)">
              <span className="social-logo-frame social-logo-partner">
                <img className="partner-social-logo" src="/images/logo-cuillere-dor.png" alt="" />
              </span>
              <span>
                Cuillère d&rsquo;Or
                <small style={{ display: 'block', fontWeight: 400, opacity: 0.75 }}>Traiteur événementiel</small>
              </span>
            </a>
          </div>
        </div>
      </div>

      <div className="shell footer-bottom">
        <p>© {new Date().getFullYear()} Chez Lina · Site conçu par Snap-me</p>
        <div className="footer-legal">
          <Link to="/mentions-legales">Mentions légales</Link>
          <Link to="/politique-confidentialite">Confidentialité</Link>
          <Link to="/gestion-des-cookies">Cookies</Link>
          <Link to="/accessibilite">Accessibilité</Link>
        </div>
        <a
          className="footer-review-link"
          href="https://www.google.com/maps/search/?api=1&query=Chez+Lina+restaurant+29+rue+de+Montgeron+91800+Brunoy"
          target="_blank"
          rel="noreferrer"
        >
          Donner un avis sur Google
        </a>
      </div>
    </footer>
  )
}
