const GA_ID = 'G-8HSGTY7BWX'
const CONSENT_KEY = 'chezlina-analytics-consent'

let loaded = false

function loadGtag() {
  if (loaded) return
  loaded = true
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)
  window.gtag('js', new Date())
  window.gtag('config', GA_ID)
}

export function getConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY)
  } catch {
    return null
  }
}

export function setConsent(value) {
  try {
    localStorage.setItem(CONSENT_KEY, value)
  } catch {
    // ignore storage errors (private browsing, etc.)
  }
  if (value === 'granted') loadGtag()
}

export function resetConsent() {
  try {
    localStorage.removeItem(CONSENT_KEY)
  } catch {
    // ignore storage errors (private browsing, etc.)
  }
}

export function initAnalyticsIfConsented() {
  if (getConsent() === 'granted') loadGtag()
}

export function trackPageView(path) {
  if (getConsent() === 'granted' && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', { page_path: path })
  }
}
