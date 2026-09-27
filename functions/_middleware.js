// Redirige les adresses secondaires vers le domaine principal (301),
// pour qu'une seule version du site soit indexée.
const CANONICAL_HOST = 'chezlina.fr'
const REDIRECT_HOSTS = new Set(['www.chezlina.fr', 'chezlina-fr.pages.dev'])

export async function onRequest({ request, next }) {
  const url = new URL(request.url)
  if (REDIRECT_HOSTS.has(url.hostname)) {
    url.hostname = CANONICAL_HOST
    url.protocol = 'https:'
    url.port = ''
    return Response.redirect(url.toString(), 301)
  }
  return next()
}
