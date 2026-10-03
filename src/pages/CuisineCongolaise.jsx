import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'

const signatures = [
  { src: '/images/mouton-chikwangue.jpg', alt: 'Mouton braisé et chikwangue', title: 'Mouton braisé, chikwangue', text: 'La braise lente et la chikwangue, pain de manioc emblématique du Congo.' },
  { src: '/images/entree-signature.webp', alt: 'Tarte fine tomate, burrata et saka-saka', title: 'Tarte fine au saka-saka', text: 'Les feuilles de manioc du saka-saka rencontrent la tomate, le bissap et une burrata crémeuse.' },
  { src: '/images/panga-braise.jpg', alt: 'Panga entier braisé et foutou banane', title: 'Panga braisé, foutou banane', text: 'Poisson braisé, sauce aux trois poivrons et foutou banane.' },
  { src: '/images/dorade-braisee.webp', alt: 'Dorade braisée et attiéké', title: 'Dorade braisée, attiéké', text: 'Sauce vierge à la mangue verte, herbes fraîches et attiéké.' },
]

const sides = ['Chikwangue', 'Attiéké', 'Alloco makemba', 'Foutou banane', 'Riz rouge']

export default function CuisineCongolaise() {
  return (
    <>
      <PageHero
        crumb="Cuisine congolaise en Essonne"
        eyebrow="Héritage congolais · Brunoy"
        title="Restaurant congolais en Essonne"
        titleNote="La cuisine de Mama Lina à Brunoy"
        lede="Braise, manioc et sauces maison : une cuisine congolaise transmise de mère en filles."
        photo={{ src: '/images/mouton-braise.webp', tint: '#1d1411', position: '50% 55%' }}
      />

      <section className="section">
        <div className="shell">
          <span className="eyebrow">Des rives du Congo au Val d&rsquo;Yerres</span>
          <h2 style={{ maxWidth: 680 }}>Une table congolaise au cœur de l&rsquo;Essonne</h2>
          <p style={{ maxWidth: 680 }}>
            Chez Lina est né de l&rsquo;histoire de Mama Lina, qui a apporté sa cuisine congolaise à Brunoy. Ses quatre
            filles font aujourd&rsquo;hui vivre cet héritage au 29 rue de Montgeron : la braise, le manioc, les sauces
            longuement travaillées et les plats posés au centre de la table.
          </p>
          <p style={{ maxWidth: 680 }}>
            Cette cuisine dialogue avec les gestes de la cuisine française : dressages précis, produits de saison,
            techniques maîtrisées. Le résultat est une cuisine franco-africaine généreuse, à partager, à quelques minutes
            de Yerres, Montgeron, Épinay-sous-Sénart et de tout le Val d&rsquo;Yerres.
          </p>
        </div>
      </section>

      <section className="section section-cream">
        <div className="shell">
          <span className="eyebrow">Dans l&rsquo;assiette</span>
          <h2>Les saveurs congolaises de la carte</h2>
          <div className="grid grid-2" style={{ marginTop: 32 }}>
            {signatures.map((s) => (
              <article className="card" key={s.title}>
                <img src={s.src} alt={s.alt} loading="lazy" />
                <div className="card-body">
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </article>
            ))}
          </div>

          <h3 style={{ marginTop: 48 }}>Les accompagnements</h3>
          <p>{sides.join(' · ')}</p>

          <h3 style={{ marginTop: 32 }}>Pour finir</h3>
          <p>
            Beignets à la sauce à l&rsquo;arachide, et côté boissons, le bissap maison et le gingembre maison, sans alcool.
          </p>

          <div className="button-row" style={{ marginTop: 28 }}>
            <Link to="/la-carte" className="button button-primary">Voir toute la carte</Link>
            <Link to="/notre-histoire" className="button button-outline">L&rsquo;histoire de Mama Lina</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell grid grid-2">
          <div>
            <span className="eyebrow">Venir chez nous</span>
            <h2>Chez Lina, Brunoy (91)</h2>
            <p style={{ fontSize: '1.1rem' }}>29 rue de Montgeron<br />91800 Brunoy</p>
            <p>Du mardi au vendredi, 11 h 45–14 h 45 et 18 h 45–23 h 45<br />Le samedi, 11 h 45–23 h 45 en service continu<br />Fermé le dimanche (privatisation possible) et le lundi</p>
          </div>
          <div>
            <span className="eyebrow">Sur place ou chez vous</span>
            <h2>Réserver ou emporter</h2>
            <p>
              Réservez une table pour le déjeuner ou le dîner, ou emportez vos plats congolais préférés.
            </p>
            <div className="button-row">
              <Link to="/reservation?type=table" className="button button-primary">Réserver une table</Link>
              <Link to="/a-emporter-brunoy" className="button button-outline">Plats à emporter</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
