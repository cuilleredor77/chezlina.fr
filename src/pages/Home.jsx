import { Link } from 'react-router-dom'
import HeroCarousel from '../components/HeroCarousel'
import RandomGoogleReviews from '../components/RandomGoogleReviews'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Home() {
  usePageTitle(null, "L'héritage congolais de Mama Lina, porté par ses quatre filles dans un restaurant franco-africain contemporain à Brunoy.")
  return (
    <>
      <HeroCarousel />

      <section className="section">
        <div className="shell">
          <span className="eyebrow">Le restaurant</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', maxWidth: 640 }}>Un héritage de famille, à table.</h1>
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
          <h2 style={{ color: '#fff' }}>Les premiers avis.</h2>
          <div className="proof-summary">
            <span className="proof-score">5,0/5</span>
            <div>
              <div className="proof-stars">★★★★★</div>
              <span>14 avis Google</span>
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

      <section className="cta-band">
        <img src="/images/plateau-bouchees-reportage.webp" alt="Planche à partager Chez Lina" />
        <div className="shell">
          <span className="eyebrow light">Votre prochaine table</span>
          <h2>Préparer votre venue</h2>
          <p style={{ maxWidth: 480, color: '#f0e4d8' }}>Choisissez une table ou préparez une commande à emporter.</p>
          <div className="button-row">
            <Link to="/reservation" className="button button-primary">Réserver ou commander</Link>
            <a className="button button-ghost-light" href="https://wa.me/33651197751?text=Bonjour%20Chez%20Lina%2C%20je%20souhaite%20faire%20une%20demande." target="_blank" rel="noreferrer">Écrire sur WhatsApp</a>
          </div>
        </div>
      </section>
    </>
  )
}
