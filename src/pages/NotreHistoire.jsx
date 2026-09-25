import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'

const roots = [
  { num: '01', title: 'La terre', text: 'Manioc, banane plantain et épices rappellent les racines de la famille.' },
  { num: '02', title: 'Le feu', text: 'La braise apporte aux plats leur cuisson lente et leur caractère.' },
  { num: '03', title: 'La table', text: 'Le repas réunit les générations et fait circuler les souvenirs.' },
]

const values = [
  { num: '01', title: 'Recevoir', text: 'Accueillir chaque convive avec chaleur et simplicité.' },
  { num: '02', title: 'Transmettre', text: 'Faire circuler une mémoire familiale sans la figer.' },
  { num: '03', title: 'Réunir', text: 'Créer une table où deux cultures dialoguent naturellement.' },
]

export default function NotreHistoire() {
  return (
    <>
      <PageHero
        crumb="Mama Lina, du Congo à Brunoy"
        eyebrow="Une mère, quatre filles, un héritage."
        title="Mama Lina, du Congo à Brunoy"
        lede="L’héritage congolais de Mama Lina, transmis à ses quatre filles."
        photo={{ src: '/images/table-partage.webp', tint: '#2d1e1a', position: '70% 50%' }}
      />

      <section className="section split" style={{ padding: 0 }}>
        <img className="portrait-medallion" src="/images/mama-lina-portrait-v2.png" alt="Mama Lina, le visage et le prénom à l’origine de la maison" />
        <div className="split-copy">
          <span className="eyebrow">À l&rsquo;origine</span>
          <h2>Une mère, un prénom, une manière de recevoir.</h2>
          <p>
            Chez Lina est née d&rsquo;une histoire familiale. Celle de Mama Lina et de quatre filles qui ont choisi de faire
            vivre son sens du partage dans un restaurant à Brunoy.
          </p>
          <p>
            Son héritage se reconnaît dans l&rsquo;attention portée aux personnes, le soin donné aux plats et la conviction
            qu&rsquo;une table peut réunir des histoires et des cultures différentes.
          </p>
        </div>
      </section>

      <section className="quote-section">
        <div className="shell">
          <span className="eyebrow light">Les mots de la maison</span>
          <blockquote>« Son prénom est devenu notre enseigne. Sa façon de rassembler est devenue notre manière de recevoir. »</blockquote>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <span className="eyebrow">Des rives du Congo à Brunoy</span>
          <h2 style={{ maxWidth: 620 }}>Des racines portées avec fierté.</h2>
          <p style={{ maxWidth: 640, color: 'var(--brown-muted)' }}>
            Les racines congolaises de Mama Lina traversent l&rsquo;histoire familiale et la cuisine de Chez Lina. On les
            retrouve dans la braise, le manioc, les sauces longuement travaillées et les plats déposés au centre de la
            table. À Brunoy, cette mémoire dialogue avec les gestes de la cuisine française contemporaine.
          </p>
          <p style={{ maxWidth: 640, color: 'var(--brown-muted)' }}>
            Mama Lina a transmis cet héritage à ses quatre filles, qui le font vivre à leur manière.
          </p>

          <div className="grid grid-3" style={{ marginTop: 32 }}>
            {roots.map((r) => (
              <div key={r.num}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--rust)' }}>{r.num}</span>
                <h3 style={{ fontSize: '1.2rem' }}>{r.title}</h3>
                <p style={{ color: 'var(--brown-muted)' }}>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-maroon">
        <div className="shell">
          <span className="eyebrow light">De Mama Lina aux quatre sœurs</span>
          <h2 style={{ color: '#fff' }}>Trois valeurs transmises.</h2>
          <div className="grid grid-3" style={{ marginTop: 32 }}>
            {values.map((v) => (
              <div key={v.num}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--gold)' }}>{v.num}</span>
                <h3 style={{ color: '#fff', fontSize: '1.2rem' }}>{v.title}</h3>
                <p style={{ color: '#f3e2dc' }}>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section split-photos" style={{ padding: 0 }}>
        <div className="split-photos-media">
          <img src="/images/table-reportage.webp" alt="Plusieurs plats Chez Lina réunis autour d’une table" />
          <img src="/images/geste-service.webp" alt="Un geste de service autour d’un plateau à partager" />
        </div>
        <div className="split-copy">
          <span className="eyebrow">Aujourd&rsquo;hui, à Brunoy</span>
          <h2>L&rsquo;histoire continue dans l&rsquo;assiette.</h2>
          <p>
            Braise, sauces maison, produits choisis et dressages précis donnent une forme actuelle à cet héritage. Une
            cuisine généreuse, pensée pour être partagée.
          </p>
          <Link to="/la-carte" className="button button-primary" style={{ alignSelf: 'flex-start' }}>Découvrir la carte</Link>
        </div>
      </section>

      <section className="cta-band">
        <img src="/images/table-reportage.webp" alt="Table dressée Chez Lina" />
        <div className="shell">
          <span className="eyebrow light">À votre tour</span>
          <h2>Prendre place à la table de Chez Lina</h2>
          <p style={{ maxWidth: 480, color: '#f0e4d8' }}>Réservez votre table ou préparez une commande à emporter.</p>
          <Link to="/reservation" className="button button-primary">Réserver ou commander</Link>
        </div>
      </section>
    </>
  )
}
