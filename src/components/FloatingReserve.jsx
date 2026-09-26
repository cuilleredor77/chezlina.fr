import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { trackEvent } from '../lib/analytics'

export default function FloatingReserve() {
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const update = () => setShowTop(window.scrollY > 520)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div className="floating-reserve">
      {showTop && (
        <button
          type="button"
          className="back-to-top"
          aria-label="Remonter en haut de page"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          ↑
        </button>
      )}
      <a
        href="tel:+33651197751"
        className="back-to-top floating-call"
        aria-label="Appeler Chez Lina"
        onClick={() => trackEvent('click_tel')}
      >
        📞
      </a>
      <Link to="/reservation" className="button button-primary">
        ✳ Réserver
      </Link>
    </div>
  )
}
