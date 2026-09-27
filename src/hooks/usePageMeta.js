import { useEffect } from 'react'
import { pageMeta, fullTitle } from '../data/pageMeta'

const SITE_URL = 'https://chezlina.fr'

function setAttr(selector, attr, value) {
  const el = document.querySelector(selector)
  if (el) el.setAttribute(attr, value)
}

// Met à jour titre, description, canonical et Open Graph lors de la navigation interne,
// avec exactement les mêmes valeurs que le HTML pré-rendu.
export function usePageMeta(pathname) {
  useEffect(() => {
    const meta = pageMeta[pathname]
    if (!meta) return
    const title = fullTitle(pathname)
    const url = `${SITE_URL}${pathname}`
    document.title = title
    setAttr('meta[name="description"]', 'content', meta.description)
    setAttr('link[rel="canonical"]', 'href', url)
    setAttr('meta[property="og:title"]', 'content', title)
    setAttr('meta[property="og:description"]', 'content', meta.description)
    setAttr('meta[property="og:url"]', 'content', url)
  }, [pathname])
}
