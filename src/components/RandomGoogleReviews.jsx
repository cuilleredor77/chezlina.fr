import { useCallback, useEffect, useState } from 'react'
import { reviews } from '../data/reviews'

// Pastille avec l'initiale de l'auteur, couleur stable selon le nom (pas de photo Google reprise)
const AVATAR_COLORS = ['#b95332', '#123b35', '#c47a2c', '#984027', '#1f5a50', '#8a5a2b']

function getInitial(name) {
  return name.trim().charAt(0).toLocaleUpperCase('fr-FR')
}

function getAvatarColor(name) {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 997
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function pickThree(exclude = []) {
  const pool = reviews.map((_, i) => i).filter((i) => !exclude.includes(i))
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, 3)
}

export default function RandomGoogleReviews() {
  const [indices, setIndices] = useState([0, 2, 9])
  const refresh = useCallback(() => setIndices((prev) => pickThree(prev)), [])

  useEffect(() => {
    refresh()
    const id = window.setInterval(refresh, 12000)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className="proof-grid" aria-label="Sélection aléatoire d’avis Google">
        {indices.map((i) => {
          const r = reviews[i]
          return (
            <figure key={`${r.name}-${i}`}>
              <div className="review-card-head">
                <span className="review-author">
                  <span className="review-avatar" aria-hidden="true" style={{ background: getAvatarColor(r.name) }}>{getInitial(r.name)}</span>
                  <strong>{r.name}</strong>
                </span>
                <div className="proof-stars" aria-label="5 étoiles sur 5">★★★★★</div>
              </div>
              <blockquote>« {r.text} »</blockquote>
              <figcaption><span>Avis Google</span></figcaption>
            </figure>
          )
        })}
      </div>
      <button className="review-refresh" type="button" onClick={refresh}>
        <span aria-hidden="true">↻</span> Voir d&rsquo;autres avis
      </button>
    </>
  )
}
