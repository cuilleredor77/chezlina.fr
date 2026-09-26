import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getConsent, setConsent } from '../lib/analytics'

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!getConsent()) setVisible(true)
  }, [])

  const choose = (value) => {
    setConsent(value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="consent-banner" role="dialog" aria-label="Consentement aux cookies de mesure d’audience">
      <p>
        Ce site utilise Google Analytics pour mesurer sa fréquentation. Vous pouvez accepter ou refuser ce suivi à
        tout moment. <Link to="/gestion-des-cookies">En savoir plus</Link>.
      </p>
      <div className="consent-banner-actions">
        <button type="button" className="button button-ghost" onClick={() => choose('denied')}>Refuser</button>
        <button type="button" className="button button-primary" onClick={() => choose('granted')}>Accepter</button>
      </div>
    </div>
  )
}
