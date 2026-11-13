// CRM Chez Lina en ligne : base D1 (binding DB) et contrôle de l'accès.
// La connexion est faite par Cloudflare Access (code envoyé à l'adresse autorisée) devant chezlina.fr/admin et /api/crm.
// Ici, chaque requête est revérifiée : jeton Access signé, bonne application, adresse dans ADMIN_EMAILS.
// Variables du projet Pages : ACCESS_TEAM_DOMAIN (ex. https://chezlina.cloudflareaccess.com), ACCESS_AUD, ADMIN_EMAILS.
// Ce fichier n'exporte aucun onRequest : ce n'est pas une route.

export function db(env) {
  if (!env.DB) throw new Error('Base de données D1 indisponible (binding DB manquant).')
  return env.DB
}

// Tables créées au premier appel (une seule fois par instance).
let ready = null
export function ensureSchema(env) {
  if (!ready) {
    ready = db(env).batch([
      db(env).prepare('CREATE TABLE IF NOT EXISTS demandes (id TEXT PRIMARY KEY, data TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)'),
      db(env).prepare('CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)'),
    ]).catch((e) => { ready = null; throw e })
  }
  return ready
}

function cookieOf(request, name) {
  const part = (request.headers.get('cookie') || '').split(/;\s*/).find((p) => p.startsWith(name + '='))
  return part ? decodeURIComponent(part.slice(name.length + 1)) : ''
}

const b64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0))
const allowedEmails = (env) => String(env.ADMIN_EMAILS || '').toLowerCase().split(/[\s,;]+/).filter(Boolean)
const teamDomain = (env) => String(env.ACCESS_TEAM_DOMAIN || '').trim().replace(/\/+$/, '').replace(/^(?!https:\/\/)/, 'https://')

export function accessConfigured(env) {
  return !!(env.ACCESS_TEAM_DOMAIN && env.ACCESS_AUD && allowedEmails(env).length)
}

// Clés publiques de Cloudflare Access, gardées une heure par instance.
let certs = { at: 0, keys: [] }
async function accessKeys(env) {
  if (Date.now() - certs.at < 3_600_000 && certs.keys.length) return certs.keys
  const res = await fetch(teamDomain(env) + '/cdn-cgi/access/certs')
  if (!res.ok) throw new Error('Clés Cloudflare Access illisibles (' + res.status + ').')
  certs = { at: Date.now(), keys: (await res.json()).keys || [] }
  return certs.keys
}

/** Adresse e-mail de la personne connectée par Cloudflare Access, ou null. */
export async function accessEmail(env, request) {
  // Test en local uniquement (wrangler pages dev) : jamais défini en production.
  if (env.DEV_ACCESS_EMAIL && new URL(request.url).hostname === 'localhost') return env.DEV_ACCESS_EMAIL
  if (!accessConfigured(env)) return null
  const token = request.headers.get('cf-access-jwt-assertion') || cookieOf(request, 'CF_Authorization')
  const parts = token.split('.')
  if (parts.length !== 3) return null
  let header, payload
  try {
    header = JSON.parse(new TextDecoder().decode(b64url(parts[0])))
    payload = JSON.parse(new TextDecoder().decode(b64url(parts[1])))
  } catch { return null }
  if (header.alg !== 'RS256') return null
  const jwk = (await accessKeys(env)).find((k) => k.kid === header.kid)
  if (!jwk) return null
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify'])
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64url(parts[2]), new TextEncoder().encode(parts[0] + '.' + parts[1]))
  if (!ok) return null
  const now = Date.now() / 1000
  const aud = [].concat(payload.aud || [])
  if (!aud.includes(String(env.ACCESS_AUD).trim())) return null
  if (payload.iss !== teamDomain(env)) return null
  if (!payload.exp || payload.exp < now) return null
  const email = String(payload.email || '').toLowerCase()
  return allowedEmails(env).includes(email) ? email : null
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

/** Page affichée si l'accès est refusé ou pas encore configuré. */
export function deniedPage(message, status = 403) {
  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Chez Lina · Espace privé</title>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@500;600&display=swap" rel="stylesheet">
<style>
:root{--cream:#fffaf2;--espresso:#3a271f;--muted:#75645c}
*{box-sizing:border-box}html,body{margin:0}
body{min-height:100vh;display:grid;place-items:center;background:var(--espresso);color:var(--espresso);font:15px/1.5 'Avenir Next',Avenir,'Segoe UI',Arial,sans-serif;padding:16px}
main{background:var(--cream);border-radius:14px;padding:28px 24px;width:100%;max-width:400px;box-shadow:0 18px 50px rgba(0,0,0,.25)}
h1{font-family:'EB Garamond',Georgia,serif;font-weight:600;font-size:30px;margin:0}
p{color:var(--muted);margin:8px 0 0}
a{display:inline-block;margin-top:18px;font-weight:600;padding:11px 18px;border-radius:999px;background:var(--espresso);color:var(--cream);text-decoration:none}
</style></head><body><main>
<h1>Chez Lina</h1><p>Demandes et devis · espace privé</p>
<p>${esc(message)}</p>
<a href="/cdn-cgi/access/logout">Changer d’adresse e-mail</a>
</main></body></html>`
  return new Response(html, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' } })
}

export const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' },
})
