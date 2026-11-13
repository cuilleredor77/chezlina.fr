// Version en ligne du CRM (chezlina.fr/admin) : les données sont lues et écrites dans la base Cloudflare D1
// au lieu du localStorage, pour être partagées entre appareils. Chargé avant app.js.
// Hors de /admin (ouverture locale avec node serve.mjs), ce fichier ne fait rien : le CRM garde le localStorage.
'use strict';
(function () {
  if (!/^\/admin(\/|$)/.test(location.pathname)) return;

  const API = '/api/crm';
  let synced = new Map(); // id → JSON de la demande telle qu'enregistrée en ligne
  let revs = new Map(); // id → date de dernière écriture côté serveur
  let syncedMeta = ''; // réglages + numéros de devis tels qu'enregistrés
  let chain = Promise.resolve();

  async function call(method, path, body, keepalive) {
    const res = await fetch(API + path, {
      method,
      headers: body ? { 'content-type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
      cache: 'no-store',
      keepalive: !!keepalive,
    });
    if (res.status === 401) { location.href = '/admin/connexion'; throw new Error('connexion expirée'); }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { const err = new Error(data.error || ('erreur ' + res.status)); err.status = res.status; err.data = data; throw err; }
    return data;
  }

  const metaOf = (db) => JSON.stringify({ settings: db.settings, seq: db.seq });

  function remember(state) {
    synced = new Map(state.demandes.map((r) => [r.data.id, JSON.stringify(r.data)]));
    revs = new Map(state.demandes.map((r) => [r.data.id, r.updated_at]));
    syncedMeta = JSON.stringify({ settings: state.settings || {}, seq: state.seq || {} });
  }

  window.CRM_API = {
    /** Lit toutes les données en ligne. */
    async pull() {
      const state = await call('GET', '/etat');
      remember(state);
      return { demandes: state.demandes.map((r) => r.data), settings: state.settings || {}, seq: state.seq || {} };
    },
    /** Envoie seulement ce qui a changé depuis la dernière lecture ou écriture. */
    push(db, keepalive) {
      chain = chain.catch(() => {}).then(async () => {
        const ids = new Set();
        for (const d of db.demandes) {
          ids.add(d.id);
          const json = JSON.stringify(d);
          if (synced.get(d.id) === json) continue;
          try {
            const r = await call('PUT', '/demandes/' + encodeURIComponent(d.id), { data: d, base: revs.get(d.id) || null }, keepalive);
            revs.set(d.id, r.updated_at);
          } catch (e) {
            if (e.status === 409) { const c = new Error('conflit'); c.conflict = true; throw c; }
            throw e;
          }
          synced.set(d.id, json);
        }
        for (const id of [...synced.keys()]) {
          if (ids.has(id)) continue;
          await call('DELETE', '/demandes/' + encodeURIComponent(id), null, keepalive);
          synced.delete(id); revs.delete(id);
        }
        const meta = metaOf(db);
        if (meta !== syncedMeta) {
          const r = await call('PUT', '/reglages', { settings: db.settings, seq: db.seq }, keepalive);
          db.seq = r.seq || db.seq; // numéros de devis : le serveur garde le plus grand
          syncedMeta = metaOf(db);
        }
      });
      return chain;
    },
    async logout() {
      await call('POST', '/deconnexion');
      location.href = '/admin/connexion';
    },
  };

  // Lien « Déconnexion » dans la barre du haut.
  const nav = document.getElementById('nav');
  if (nav) {
    const a = document.createElement('a');
    a.href = '#'; a.textContent = 'Déconnexion';
    a.onclick = (e) => { e.preventDefault(); window.CRM_API.logout().catch(() => { location.href = '/admin/connexion'; }); };
    nav.appendChild(a);
  }
})();
