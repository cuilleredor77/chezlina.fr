import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import { formules, menuSections } from '../data/menu'

const plats = menuSections.filter((s) => s.title === 'Les viandes' || s.title === 'Les poissons').flatMap((s) => s.items)
const petitsPrix = formules.items.filter((f) => f.price)

export default function AEmporter() {
  return (
    <>
      <PageHero
        crumb="À emporter à Brunoy"
        eyebrow="Commande · Retrait sur place"
        title="Plats à emporter à Brunoy"
        titleNote="Cuisine franco-africaine et congolaise"
        lede="Commandez vos plats braisés et récupérez-les au 29 rue de Montgeron."
        photo={{ src: '/images/brochettes-boeuf.webp', tint: '#1d1411', position: '50% 50%' }}
      />

      <section className="section">
        <div className="shell grid grid-2">
          <div>
            <span className="eyebrow">Comment ça marche</span>
            <h2>Commander en trois étapes</h2>
            <ol className="steps-list">
              <li>Choisissez « À emporter » sur la page Réserver ou commander.</li>
              <li>Indiquez le jour et l&rsquo;heure de retrait, au moins 30 minutes après votre commande.</li>
              <li>Votre demande part sur WhatsApp : nous la confirmons, vous passez la récupérer.</li>
            </ol>
            <div className="button-row" style={{ marginTop: 20 }}>
              <Link to="/reservation?type=emporter" className="button button-primary">Commander à emporter</Link>
              <a className="button button-outline" href="tel:+33651197751">06 51 19 77 51</a>
            </div>
          </div>
          <div>
            <span className="eyebrow">Horaires de retrait</span>
            <h2>Quand passer ?</h2>
            <p>Du mardi au vendredi<br />11 h 45–14 h 45 · 18 h 45–23 h 45</p>
            <p>Samedi<br />11 h 45–23 h 45 (service continu)</p>
            <p>Fermé le dimanche et le lundi</p>
            <p style={{ marginTop: 20 }}>Chez Lina · 29 rue de Montgeron, 91800 Brunoy</p>
          </div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="shell">
          <span className="eyebrow">À emporter</span>
          <h2>Les plats braisés de la maison</h2>
          <ul className="takeaway-list">
            {plats.map((p) => (
              <li key={p.name}>
                <span><strong>{p.name}</strong> — {p.description}</span>
                <span className="formule-price">{p.price}</span>
              </li>
            ))}
          </ul>
          <p style={{ color: 'var(--brown-muted)' }}>
            Accompagnements en supplément : chikwangue, attiéké, alloco makemba, foutou banane, riz rouge ou riz blanc.
          </p>

          <h3 style={{ marginTop: 40 }}>Les petits prix</h3>
          <ul className="takeaway-list">
            {petitsPrix.map((f) => (
              <li key={f.name}>
                <span><strong>{f.name}</strong> ({f.subtitle.toLowerCase()}) — {f.description}</span>
                <span className="formule-price">{f.price}</span>
              </li>
            ))}
          </ul>
          <p style={{ color: 'var(--brown-muted)' }}>{formules.note}</p>

          <div className="button-row" style={{ marginTop: 24 }}>
            <Link to="/la-carte" className="button button-outline">Voir toute la carte</Link>
            <Link to="/cuisine-congolaise-essonne" className="button button-outline">Notre cuisine congolaise</Link>
          </div>
        </div>
      </section>
    </>
  )
}
