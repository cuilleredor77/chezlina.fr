import { isLoggedIn, login, loginPage, json, passwordConfigured } from './_crm/lib.js'

// Redirige les adresses secondaires vers le domaine principal (301),
// pour qu'une seule version du site soit indexée.
const CANONICAL_HOST = 'chezlina.fr'
const REDIRECT_HOSTS = new Set(['www.chezlina.fr', 'chezlina-fr.pages.dev'])

const isAdmin = (p) => p === '/admin' || p.startsWith('/admin/')
const isCrmApi = (p) => p === '/api/crm' || p.startsWith('/api/crm/')

export async function onRequest(context) {
  const { request, next, env } = context
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
    return isCrmApi(path) ? json({ error: e.message }, 500) : loginPage('Service indisponible : ' + e.message, 500)
  }
}

// CRM (chezlina.fr/admin) : tout est fermé sans connexion, et jamais indexé.
async function guard({ request, next, env }, url, path) {
  // Écritures : seulement depuis le site lui-même.
  const origin = request.headers.get('origin')
  if (request.method !== 'GET' && request.method !== 'HEAD' && origin && origin !== url.origin) return json({ error: 'Origine refusée.' }, 403)

  if (path === '/admin/connexion') {
    if (!passwordConfigured(env)) return loginPage('Mot de passe pas encore configuré (variable ADMIN_PASSWORD sur Cloudflare).', 503)
    if (request.method === 'POST') {
      const form = await request.formData().catch(() => null)
      const result = await login(env, request, form?.get('password'))
      if (result.error) return loginPage(result.error, 401)
      return new Response(null, { status: 303, headers: { location: '/admin/', 'set-cookie': result.cookie, 'cache-control': 'no-store' } })
    }
    if (await isLoggedIn(env, request)) return Response.redirect(url.origin + '/admin/', 303)
    return loginPage()
  }

  if (!(await isLoggedIn(env, request))) {
    if (isCrmApi(path)) return json({ error: 'Connexion requise.' }, 401)
    return Response.redirect(url.origin + '/admin/connexion', 303)
  }
  // Les fichiers du CRM sont dans public/admin/ ; /admin sans barre finale casserait les liens relatifs.
  if (path === '/admin') return Response.redirect(url.origin + '/admin/', 301)

  const res = await next()
  const out = new Response(res.body, res)
  out.headers.set('x-robots-tag', 'noindex, nofollow')
  out.headers.set('cache-control', 'no-store')
  return out
}
