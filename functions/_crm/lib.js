// CRM Chez Lina en ligne : base D1 (binding DB) et connexion par mot de passe (variable ADMIN_PASSWORD).
// Modèle : espace /admin de Cuillère d'Or. Le cookie porte un jeton aléatoire ; la base n'en garde que l'empreinte.
// Ce fichier n'exporte aucun onRequest : ce n'est pas une route.

export const COOKIE = 'cl_admin'
const SESSION_DAYS = 14
const MAX_TRIES = 5
const TRY_WINDOW_MIN = 15

const hex = (buf) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')
export const sha256 = async (text) => hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))
const randomToken = () => hex(crypto.getRandomValues(new Uint8Array(32)))

function safeEqual(a, b) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

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
      db(env).prepare('CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, expires_at TEXT NOT NULL, revoked_at TEXT, ip TEXT, agent TEXT)'),
      db(env).prepare('CREATE TABLE IF NOT EXISTS login_tries (ip TEXT NOT NULL, at TEXT NOT NULL)'),
    ]).catch((e) => { ready = null; throw e })
  }
  return ready
}

export function cookieOf(request, name) {
  const part = (request.headers.get('cookie') || '').split(/;\s*/).find((p) => p.startsWith(name + '='))
  return part ? decodeURIComponent(part.slice(name.length + 1)) : ''
}

export function passwordConfigured(env) {
  return typeof env.ADMIN_PASSWORD === 'string' && env.ADMIN_PASSWORD.length >= 10
}

async function checkPassword(env, candidate) {
  if (!passwordConfigured(env)) return false
  // Comparaison d'empreintes de même longueur : pas de fuite par le temps de réponse.
  return safeEqual(await sha256('cl:' + candidate), await sha256('cl:' + env.ADMIN_PASSWORD))
}

const ipOf = (request) => request.headers.get('cf-connecting-ip') || ''

/** Vérifie le mot de passe (5 essais par adresse IP toutes les 15 minutes). Renvoie le cookie, ou un message d'erreur. */
export async function login(env, request, password) {
  await ensureSchema(env)
  const ip = ipOf(request)
  const since = new Date(Date.now() - TRY_WINDOW_MIN * 60_000).toISOString()
  await db(env).prepare('DELETE FROM login_tries WHERE at < ?').bind(since).run()
  const tries = await db(env).prepare('SELECT COUNT(*) AS n FROM login_tries WHERE ip = ?').bind(ip).first()
  if ((tries?.n || 0) >= MAX_TRIES) return { error: `Trop d’essais. Réessayer dans ${TRY_WINDOW_MIN} minutes.` }
  if (!(await checkPassword(env, String(password || '')))) {
    await db(env).prepare('INSERT INTO login_tries (ip, at) VALUES (?, ?)').bind(ip, new Date().toISOString()).run()
    return { error: 'Mot de passe incorrect.' }
  }
  await db(env).prepare('DELETE FROM login_tries WHERE ip = ?').bind(ip).run()
  const token = randomToken()
  const now = new Date()
  await db(env).prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now.toISOString()).run()
  await db(env).prepare('INSERT INTO sessions (id, created_at, expires_at, ip, agent) VALUES (?, ?, ?, ?, ?)')
    .bind(await sha256(token), now.toISOString(), new Date(now.getTime() + SESSION_DAYS * 86_400_000).toISOString(), ip, (request.headers.get('user-agent') || '').slice(0, 200)).run()
  return { cookie: `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DAYS * 86400}` }
}

export async function isLoggedIn(env, request) {
  const token = cookieOf(request, COOKIE)
  if (!/^[a-f0-9]{64}$/.test(token)) return false
  await ensureSchema(env)
  const row = await db(env).prepare('SELECT expires_at, revoked_at FROM sessions WHERE id = ?').bind(await sha256(token)).first()
  return !!row && !row.revoked_at && row.expires_at > new Date().toISOString()
}

export async function logout(env, request) {
  const token = cookieOf(request, COOKIE)
  if (/^[a-f0-9]{64}$/.test(token)) {
    await ensureSchema(env)
    await db(env).prepare('UPDATE sessions SET revoked_at = ? WHERE id = ?').bind(new Date().toISOString(), await sha256(token)).run()
  }
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

export function loginPage(message = '', status = 200) {
  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Chez Lina · Connexion</title>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@500;600&display=swap" rel="stylesheet">
<style>
:root{--cream:#fffaf2;--line:#eadfd2;--gold:#f4d7a7;--espresso:#3a271f;--muted:#75645c;--bad:#b42318}
*{box-sizing:border-box}html,body{margin:0}
body{min-height:100vh;display:grid;place-items:center;background:var(--espresso);color:var(--espresso);font:15px/1.5 'Avenir Next',Avenir,'Segoe UI',Arial,sans-serif;padding:16px}
form{background:var(--cream);border-radius:14px;padding:28px 24px;width:100%;max-width:360px;box-shadow:0 18px 50px rgba(0,0,0,.25)}
h1{font-family:'EB Garamond',Georgia,serif;font-weight:600;font-size:30px;margin:0}
p{color:var(--muted);margin:2px 0 20px}
label{display:block;font-size:13px;font-weight:600;margin-bottom:6px}
input{width:100%;font:inherit;padding:11px 12px;border:1px solid var(--line);border-radius:10px;background:#fff}
button{margin-top:16px;width:100%;font:inherit;font-weight:600;padding:12px;border:0;border-radius:999px;background:var(--espresso);color:var(--cream);cursor:pointer}
.err{color:var(--bad);font-size:14px;margin:12px 0 0}
</style></head><body>
<form method="post" action="/admin/connexion">
<h1>Chez Lina</h1><p>Demandes et devis · espace privé</p>
<label for="pw">Mot de passe</label>
<input id="pw" name="password" type="password" autocomplete="current-password" required autofocus>
${message ? `<p class="err">${esc(message)}</p>` : ''}
<button type="submit">Se connecter</button>
</form></body></html>`
  return new Response(html, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' } })
}

export const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' },
})
