import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="section" style={{ textAlign: 'center' }}>
      <div className="shell">
        <span className="eyebrow">Erreur 404</span>
        <h1>Cette page n&rsquo;existe pas.</h1>
        <p>La page que vous cherchez a peut-être changé d&rsquo;adresse.</p>
        <Link to="/" className="button button-primary">Retour à l&rsquo;accueil</Link>
      </div>
    </section>
  )
}
