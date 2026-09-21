import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-top">
          <img src="/images/logo-chez-lina-vertical.png" alt="Chez Lina" className="footer-logo" />
          <h3>Une mère, quatre filles, un héritage.</h3>
          <p>L&rsquo;héritage congolais de Mama Lina, porté par ses quatre filles à Brunoy.</p>
        </div>

        <div className="footer-grid">
          <div>
            <h4>Découvrir</h4>
            <ul>
              <li><Link to="/la-carte">La carte</Link></li>
              <li><Link to="/notre-histoire">Notre histoire</Link></li>
              <li><Link to="/galerie">Galerie</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4>Chez Lina</h4>
            <p>29 rue de Montgeron<br />91800 Brunoy</p>
          </div>
          <div>
            <h4>Nous contacter</h4>
            <ul>
              <li><a href="https://wa.me/33651197751" target="_blank" rel="noreferrer"><strong>WhatsApp</strong><br />06 51 19 77 51</a></li>
              <li><a href="mailto:restaurant.chezlina@gmail.com"><strong>E-mail</strong><br />restaurant.chezlina@gmail.com</a></li>
            </ul>
          </div>
          <div>
            <h4>Nous suivre</h4>
            <ul>
              <li><a href="https://www.instagram.com/restaurant.chezlina/" target="_blank" rel="noreferrer">Chez Lina</a></li>
              <li><a href="https://www.instagram.com/cuillere.dor/" target="_blank" rel="noreferrer">Cuillère d&rsquo;Or</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Chez Lina</span>
          <div className="footer-legal">
            <Link to="/mentions-legales">Mentions légales</Link>
            <Link to="/politique-confidentialite">Confidentialité</Link>
            <Link to="/gestion-des-cookies">Cookies</Link>
            <Link to="/accessibilite">Accessibilité</Link>
            <a href="https://www.google.com/maps/search/?api=1&query=Chez+Lina+restaurant+29+rue+de+Montgeron+91800+Brunoy" target="_blank" rel="noreferrer">Donner un avis sur Google</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
