import { Link } from 'react-router-dom'

export default function FloatingReserve() {
  return (
    <div className="floating-reserve">
      <button
        type="button"
        className="back-to-top"
        aria-label="Remonter en haut de page"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        ↑
      </button>
      <Link to="/reservation" className="button button-primary">
        ✳ Réserver
      </Link>
    </div>
  )
}
