import { accessEmail, accessConfigured, deniedPage, json } from './_crm/lib.js'

// Redirige les adresses secondaires vers le domaine principal (301),
// pour qu'une seule version du site soit indexée.
const CANONICAL_HOST = 'chezlina.fr'
const REDIRECT_HOSTS = new Set(['www.chezlina.fr', 'chezlina-fr.pages.dev'])

const isAdmin = (p) => p === '/admin' || p.startsWith('/admin/')
const isCrmApi = (p) => p === '/api/crm' || p.startsWith('/api/crm/')

export async function onRequest(context) {
  const { request, next } = context
  const url = new URL(request.url)
  if (REDIRECT_HOSTS.has(url.hostname)) {
    url.hostname = CANONICAL_HOST
    url.protocol = 'https:'
    url.port = ''
    return Response.redirect(url.toString(), 301)
  }
  const path = url.pathname
  if (!isAdmin(path) && !isCrmApi(path)) return next()
  try {
    return await guard(context, url, path)
  } catch (e) {
    return isCrmApi(path) ? json({ error: e.message }, 500) : deniedPage('Service indisponible : ' + e.message, 500)
  }
}

// CRM (chezlina.fr/admin) : Cloudflare Access demande un code envoyé à l'adresse autorisée ;
// la fonction revérifie le jeton Access à chaque requête. Jamais indexé.
async function guard({ request, next, env }, url, path) {
  // Écritures : seulement depuis le site lui-même.
  const origin = request.headers.get('origin')
  if (request.method !== 'GET' && request.method !== 'HEAD' && origin && origin !== url.origin) return json({ error: 'Origine refusée.' }, 403)

  const email = await accessEmail(env, request)
  if (!email) {
    if (isCrmApi(path)) return json({ error: 'Connexion requise.' }, 401)
    return deniedPage(accessConfigured(env)
      ? 'Accès réservé. Connectez-vous avec l’adresse e-mail autorisée.'
      : 'Accès pas encore configuré (Cloudflare Access).')
  }
  // Les fichiers du CRM sont dans public/admin/ ; /admin sans barre finale casserait les liens relatifs.
  if (path === '/admin') return Response.redirect(url.origin + '/admin/', 301)

  const res = await next()
  const out = new Response(res.body, res)
  out.headers.set('x-robots-tag', 'noindex, nofollow')
  out.headers.set('cache-control', 'no-store')
  return out
}
