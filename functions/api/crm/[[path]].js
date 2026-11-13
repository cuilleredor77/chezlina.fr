// API du CRM Chez Lina. La connexion est vérifiée avant, dans functions/_middleware.js.
//   GET    /api/crm/etat            toutes les demandes, réglages et numéros de devis
//   PUT    /api/crm/demandes/:id    enregistre une demande { data, base } (base = updated_at lu ; 409 si modifiée ailleurs)
//   DELETE /api/crm/demandes/:id    supprime une demande
//   PUT    /api/crm/reglages        { settings, seq } ; les numéros de devis gardent le plus grand
import { db, ensureSchema, json } from '../../_crm/lib.js'

const MAX_BYTES = 500_000

async function readKv(env, key, fallback) {
  const row = await db(env).prepare('SELECT value FROM kv WHERE key = ?').bind(key).first()
  try { return row ? JSON.parse(row.value) : fallback } catch { return fallback }
}
const writeKv = (env, key, value) => db(env).prepare('INSERT INTO kv (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at')
  .bind(key, JSON.stringify(value), new Date().toISOString()).run()

async function body(request) {
  const text = await request.text()
  if (text.length > MAX_BYTES) throw Object.assign(new Error('Données trop volumineuses.'), { status: 413 })
  try { return JSON.parse(text) } catch { throw Object.assign(new Error('JSON invalide.'), { status: 400 }) }
}

export async function onRequest({ request, env, params }) {
  try {
    await ensureSchema(env)
    const parts = [].concat(params.path || [])
    const [resource, id] = parts
    const method = request.method

    if (method === 'GET' && resource === 'etat' && !id) {
      const rows = (await db(env).prepare('SELECT data, updated_at FROM demandes ORDER BY created_at').all()).results
      return json({
        demandes: rows.map((r) => ({ data: JSON.parse(r.data), updated_at: r.updated_at })),
        settings: await readKv(env, 'settings', {}),
        seq: await readKv(env, 'seq', {}),
      })
    }

    if (resource === 'demandes' && id && /^[\w-]{1,64}$/.test(id)) {
      if (method === 'PUT') {
        const { data, base } = await body(request)
        if (!data || typeof data !== 'object' || data.id !== id) return json({ error: 'Demande invalide.' }, 400)
        const current = await db(env).prepare('SELECT updated_at FROM demandes WHERE id = ?').bind(id).first()
        if (current && base !== current.updated_at) return json({ error: 'Demande modifiée sur un autre appareil.', updated_at: current.updated_at }, 409)
        const now = new Date().toISOString()
        if (current) {
          const r = await db(env).prepare('UPDATE demandes SET data = ?, updated_at = ? WHERE id = ? AND updated_at = ?').bind(JSON.stringify(data), now, id, current.updated_at).run()
          if (!r.meta.changes) return json({ error: 'Demande modifiée sur un autre appareil.' }, 409)
        } else {
          await db(env).prepare('INSERT INTO demandes (id, data, created_at, updated_at) VALUES (?, ?, ?, ?)').bind(id, JSON.stringify(data), now, now).run()
        }
        return json({ ok: true, updated_at: now })
      }
      if (method === 'DELETE') {
        await db(env).prepare('DELETE FROM demandes WHERE id = ?').bind(id).run()
        return json({ ok: true })
      }
    }

    if (method === 'PUT' && resource === 'reglages' && !id) {
      const { settings, seq } = await body(request)
      if (settings && typeof settings === 'object') await writeKv(env, 'settings', settings)
      const merged = await readKv(env, 'seq', {})
      for (const [year, n] of Object.entries(seq && typeof seq === 'object' ? seq : {})) {
        if (/^\d{4}$/.test(year) && Number.isInteger(n) && n > (merged[year] || 0)) merged[year] = n
      }
      await writeKv(env, 'seq', merged)
      return json({ ok: true, seq: merged })
    }

    return json({ error: 'Introuvable.' }, 404)
  } catch (e) {
    return json({ error: e.message }, e.status || 500)
  }
}
