import { useCallback, useEffect, useState } from 'react'
import { reviews } from '../data/reviews'

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
                <strong>{r.name}</strong>
                <div className="proof-stars" aria-label="5 étoiles sur 5">★★★★★</div>
              </div>
              <blockquote>« {r.text} »</blockquote>
              <figcaption><span>Avis Google · Visité en août</span></figcaption>
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
