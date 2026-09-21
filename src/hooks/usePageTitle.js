import { useEffect } from 'react'

export function usePageTitle(title, description) {
  useEffect(() => {
    document.title = title ? `${title} — Chez Lina` : 'Chez Lina — Restaurant à Brunoy'
    if (description) {
      const meta = document.querySelector('meta[name="description"]')
      if (meta) meta.setAttribute('content', description)
    }
  }, [title, description])
}
