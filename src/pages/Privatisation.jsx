import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import FaqList from '../components/FaqList'
import { faqFor } from '../data/faq'
import { trackEvent } from '../lib/analytics'

const occasions = [
  { title: 'Anniversaire', text: 'Fêter une date qui compte, entre proches, dans une salle rien que pour vous.' },
  { title: 'Baptême', text: 'Réunir les familles autour d’une table généreuse, pensée pour le partage.' },
  { title: 'Repas d’entreprise', text: 'Un déjeuner d’équipe, un pot de départ ou un repas clients à Brunoy.' },
]

const steps = [
  'Remplissez le formulaire en choisissant « Privatiser la salle » : date, créneau (midi, soir ou toute la journée), nombre d’invités et type d’événement.',
  'Votre demande part par e-mail. Faites-la au moins 72 h à l’avance ; pour un besoin urgent, appelez-nous au 06 51 19 77 51.',
  'Nous vous envoyons un devis personnalisé sous 48 h, avec le menu choisi ensemble.',
]

const privatisationFaq = faqFor('privatisation')

export default function Privatisation() {
  return (
    <>
      <PageHero
        crumb="Privatisation et événements"
        eyebrow="Événements privés · Brunoy"
        title="Privatiser un restaurant à Brunoy"
        titleNote="Anniversaire, baptême, repas d’entreprise"
        lede="La salle de Chez Lina, rien que pour vous et vos invités."
        photo={{ src: '/images/table-partage.webp', tint: '#2d1e1a', position: '50% 50%' }}
      />

      <section className="section">
        <div className="shell">
          <span className="eyebrow">Vos événements chez nous</span>
          <h2 style={{ maxWidth: 680 }}>Une table de famille pour vos moments importants</h2>
          <p style={{ maxWidth: 680 }}>
            Chez Lina est né d&rsquo;une manière de recevoir : celle de Mama Lina, qui réunissait les siens autour de plats
            généreux. Ses quatre filles ouvrent aujourd&rsquo;hui la salle du 29 rue de Montgeron à vos événements privés,
            avec une cuisine franco-africaine aux racines congolaises, faite pour être partagée.
          </p>
          <div className="grid grid-3" style={{ marginTop: 32 }}>
            {occasions.map((o) => (
              <div key={o.title}>
                <h3 style={{ fontSize: '1.2rem' }}>{o.title}</h3>
                <p style={{ color: 'var(--brown-muted)' }}>{o.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="shell privatisation-block">
          <span className="eyebrow light">Tarif</span>
          <h2>Location de salle à partir de 450 €</h2>
          <p style={{ maxWidth: 560 }}>
            Le repas est en supplément, selon le menu choisi. Capacité et disponibilités sur demande, au midi, au soir ou
            pour toute la journée.
          </p>
          <div className="button-row" style={{ marginTop: 8 }}>
            <Link to="/reservation?type=privatisation" className="button button-primary" onClick={() => trackEvent('click_privatisation')}>Demander un devis</Link>
            <a className="button button-ghost-light" href="tel:+33651197751" onClick={() => trackEvent('click_tel')}>06 51 19 77 51</a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell grid grid-2">
          <div>
            <span className="eyebrow">Comment ça marche</span>
            <h2>Votre devis en trois étapes</h2>
            <ol className="steps-list">
              {steps.map((s) => <li key={s}>{s}</li>)}
            </ol>
          </div>
          <div>
            <span className="eyebrow">Pour vos invités</span>
            <h2>Le menu, choisi avec vous</h2>
            <p>
              Le menu se construit avec vous au moment du devis. Pour vous inspirer, notre carte : viandes et poissons
              braisés, mouton et chikwangue, planche à partager de 10 ou 25 pièces, cocktails et mocktails maison, bissap et
              gingembre maison, vins et champagne.
            </p>
            <div className="button-row">
              <Link to="/la-carte" className="button button-outline">Voir la carte</Link>
              <Link to="/galerie" className="button button-outline">La maison en images</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="shell">
          <span className="eyebrow">Bon à savoir</span>
          <h2>Questions fréquentes sur la privatisation</h2>
          <FaqList items={privatisationFaq} />
        </div>
      </section>

      <section className="cta-band">
        <img src="/images/plateau-bouchees-reportage.webp" alt="Planche de bouchées à partager Chez Lina" />
        <div className="shell">
          <span className="eyebrow light">Votre événement</span>
          <h2>Réservons votre date</h2>
          <p style={{ maxWidth: 480, color: '#f0e4d8' }}>Chez Lina · 29 rue de Montgeron, 91800 Brunoy</p>
          <div className="button-row">
            <Link to="/reservation?type=privatisation" className="button button-primary" onClick={() => trackEvent('click_privatisation')}>Demander un devis</Link>
            <a className="button button-ghost-light" href="mailto:contact@chezlina.fr">contact@chezlina.fr</a>
          </div>
        </div>
      </section>
    </>
  )
}
