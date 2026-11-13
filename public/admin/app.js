// CRM Chez Lina : demandes de privatisation, de groupe, d'événement, de traiteur et d'emporter, et devis.
// Repris du fonctionnement de l'espace /admin de Cuillère d'Or (statuts, tri par action, éditeur de lignes,
// devis imprimable en PDF), adapté au restaurant. Données enregistrées dans ce navigateur (localStorage) ;
// sauvegarde et restauration en JSON depuis « Réglages ».
'use strict';

// ---------- Constantes Chez Lina ----------
const LINA = {
  nom: 'Chez Lina',
  societe: 'LES QUATRE FILLES LINA',
  adresse: '29 rue de Montgeron, 91800 Brunoy',
  tel: '06 51 19 77 51',
  email: 'contact@chezlina.fr',
  site: 'chezlina.fr',
  siret: '109 488 429 00019',
  horaires: 'Du mardi au vendredi de 11h45 à 14h45 et de 18h45 à 23h45 · le samedi de 11h45 à 23h45 en service continu · fermé le dimanche (salle privatisable) et le lundi',
};

const TYPES = {
  privatisation: { label: 'Privatisation de la salle', short: 'Privatisation' },
  groupe: { label: 'Réservation de groupe', short: 'Groupe' },
  evenement: { label: 'Événement', short: 'Événement' },
  traiteur: { label: 'Traiteur', short: 'Traiteur' },
  emporter: { label: 'Commande à emporter', short: 'À emporter' },
};
const OCCASIONS = ['Anniversaire', 'Baptême', 'Repas d’entreprise', 'Pot de départ', 'Mariage', 'Fiançailles', 'Communion', 'Deuil / réception', 'Autre'];
const CRENEAUX = {
  midi: { label: 'Midi', heures: '11h45 – 14h45' },
  soir: { label: 'Soir', heures: '18h45 – 23h45' },
  journee: { label: 'Toute la journée', heures: '11h45 – 23h45' },
  autre: { label: 'Horaire à préciser', heures: '' },
};
const SOURCES = ['Téléphone', 'Site chezlina.fr', 'E-mail', 'Instagram', 'Google', 'Sur place', 'Bouche-à-oreille', 'Autre'];
const STATUS = {
  nouvelle: 'Nouvelle', devis_pret: 'Devis prêt', envoye: 'Envoyé', signe: 'Signé', acompte: 'Acompte reçu',
  solde: 'Soldé', archivee: 'Archivée', abandonnee: 'Abandonnée', refus: 'Refus client',
};
const CONFIRMED = ['signe', 'acompte', 'solde'];
const CLOSED = ['archivee', 'abandonnee', 'refus'];

// Onglets de tri par action, comme dans l'espace Cuillère d'Or.
const TABS = [
  ['traiter', 'À traiter', 'Demandes reçues dont le devis n’est pas encore envoyé'],
  ['attente', 'En attente', 'Devis envoyé il y a moins de 7 jours'],
  ['relancer', 'À relancer', 'Devis envoyé il y a 7 à 45 jours, événement à venir'],
  ['confirmes', 'Confirmés', 'Devis signé, acompte reçu ou soldé, du plus proche au plus lointain'],
  ['sans_reponse', 'Sans réponse', 'Devis envoyé il y a plus de 45 jours, sans retour'],
  ['archives', 'Archives', 'Événements passés, demandes abandonnées ou refusées'],
  ['all', 'Toutes', 'Toutes les demandes'],
];

const DEFAULT_SETTINGS = {
  depositPct: 30,
  validDays: 30,
  balanceWhen: 'le jour de l’événement',
  conditions: [
    'Prix en euros TTC, TVA incluse.',
    'Le nombre définitif d’invités est à confirmer au plus tard 72 h avant l’événement ; il sert de base à la facture.',
    'Le menu est commun à tous les invités, sauf menus enfants et régimes particuliers signalés à l’avance.',
    'Toute boisson ou consommation supplémentaire le jour même est facturée au prix de la carte.',
  ].join('\n'),
  iban: '',
  mailSignature: 'L’équipe Chez Lina',
};

// ---------- Stockage ----------
// En local (node serve.mjs) : localStorage de ce navigateur. En ligne (chezlina.fr/admin) : base D1 partagée
// entre appareils, via window.CRM_API (en-ligne.js).
const KEY = 'chezlina-crm-v1';
const ONLINE = !!window.CRM_API;
let DB = ONLINE ? normalize({}) : load();
function normalize(d) {
  d = d && typeof d === 'object' ? d : {};
  d.demandes = Array.isArray(d.demandes) ? d.demandes : [];
  d.seq = d.seq || {};
  d.settings = Object.assign({}, DEFAULT_SETTINGS, d.settings || {});
  return d;
}
function load() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { d = null; }
  return normalize(d);
}
let saveTimer = null, dirty = false;
function save(now, keepalive) {
  clearTimeout(saveTimer);
  dirty = true;
  const run = ONLINE
    ? () => CRM_API.push(DB, keepalive).then(() => { dirty = false; }).catch((e) => {
      if (e.conflict) { toast('Demande modifiée sur un autre appareil : données rechargées.'); dirty = false; return pullOnline(); }
      toast('Enregistrement en ligne impossible : ' + e.message);
    })
    : () => { try { localStorage.setItem(KEY, JSON.stringify(DB)); dirty = false; } catch (e) { toast('Enregistrement impossible : ' + e.message); } };
  if (now) return run(); else saveTimer = setTimeout(run, ONLINE ? 800 : 250);
}
function pullOnline() {
  return CRM_API.pull().then((d) => { DB = normalize(d); route(); })
    .catch((e) => { app().innerHTML = '<section class="card"><h2>Données indisponibles</h2><p>' + esc(e.message) + '</p></section>'; });
}
// N'écrit à la fermeture que s'il reste une saisie en attente (sinon une page restée ouverte écraserait les données).
window.addEventListener('beforeunload', () => { if (dirty) save(true, true); });
// Autre onglet du CRM : relire les données modifiées là-bas.
window.addEventListener('storage', (e) => { if (!ONLINE && e.key === KEY) { DB = load(); route(); } });
// En ligne : en revenant sur l'onglet, relire ce qui a pu être saisi sur un autre appareil.
document.addEventListener('visibilitychange', () => { if (ONLINE && document.visibilityState === 'visible' && !dirty) pullOnline(); });
const byId = (id) => DB.demandes.find((d) => d.id === id);

// ---------- Outils ----------
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 10);
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const num = (v) => { if (v === '' || v === null || v === undefined) return null; const n = Number(String(v).replace(/\s/g, '').replace(',', '.')); return isFinite(n) ? n : null; };
const eur = (n) => n === null || n === undefined ? 'à chiffrer' : n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/[  ]/g, ' ') + ' €';
const pad = (n) => String(n).padStart(2, '0');
const isoLocal = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const todayISO = () => isoLocal(new Date());
const parseISO = (s) => new Date(s + 'T12:00:00');
const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
function dateFR(iso, weekday) {
  if (!iso) return 'date à préciser';
  const d = parseISO(iso);
  const j = d.getDate() === 1 ? '1er' : d.getDate();
  return (weekday ? JOURS[d.getDay()] + ' ' : '') + j + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear();
}
const MOIS_COURT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const dateShort = (iso) => iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) + '/' + iso.slice(0, 4) : '';
const addDays = (iso, n) => { const d = parseISO(iso); d.setDate(d.getDate() + n); return isoLocal(d); };
const daysAgo = (iso) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
const firstName = (name) => (String(name || '').trim().split(/\s+/)[0] || '').replace(/^./, (c) => c.toUpperCase());
const guests = (d) => (Number(d.adultes) || 0) + (Number(d.enfants) || 0);
function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

// ---------- Devis : construction et totaux ----------
function carteFind(name) {
  for (const s of window.CARTE || []) for (const i of s.items) if (i.name === name) return i;
  return null;
}
function newRef() {
  const y = new Date().getFullYear();
  DB.seq[y] = (DB.seq[y] || 0) + 1;
  return 'CL-' + y + '-' + String(DB.seq[y]).padStart(3, '0');
}
function line(section, label, qty, unit, price, detail) {
  return { id: uid(), section, label, detail: detail || '', qty, unit, price };
}
// Devis de départ, à ajuster dans l'éditeur. Pas de prix public pour la privatisation : la ligne reste « à chiffrer ».
function defaultDevis(d) {
  const lines = [];
  const cr = CRENEAUX[d.creneau] || CRENEAUX.autre;
  if (d.type === 'privatisation') {
    lines.push(line('Privatisation', 'Privatisation de la salle', 1, 'forfait', null,
      [cr.label + (cr.heures ? ' (' + cr.heures + ')' : ''), 'Salle réservée à vos invités, mise en place et service en salle'].join(' · ')));
  }
  if (Number(d.enfants) > 0) {
    const f = carteFind('Formule enfant');
    if (f) lines.push(line('Menu', f.name, Number(d.enfants), 'enf.', f.price, f.detail));
  }
  if (d.type === 'traiteur' && d.livraison) {
    lines.push(line('Options', 'Livraison', 1, 'forfait', null, d.adresseLivraison || ''));
  }
  return {
    issuedOn: todayISO(), version: 1,
    summary: summaryOf(d),
    remarks: '', note: '',
    depositPct: DB.settings.depositPct,
    lines,
  };
}
function summaryOf(d) {
  const t = TYPES[d.type] ? TYPES[d.type].label : 'Demande';
  return t + (d.occasion ? ' · ' + d.occasion : '') + (guests(d) ? ' · ' + guests(d) + ' invités' : '');
}
function totals(d) {
  const lines = (d.devis && d.devis.lines) || [];
  let total = 0, missing = 0;
  for (const l of lines) {
    if (l.price === null || l.price === undefined) { missing++; continue; }
    total += (Number(l.qty) || 0) * l.price;
  }
  total = round2(total);
  const pct = d.devis && d.devis.depositPct !== undefined && d.devis.depositPct !== null ? Number(d.devis.depositPct) : DB.settings.depositPct;
  const deposit = round2(total * pct / 100);
  return { total, missing, pct, deposit, balance: round2(total - deposit) };
}
const unitTxt = (q, u) => (Number(q) > 1 && /^(unité|bouteille|verre|forfait)$/.test(u || '') ? u + 's' : (u || ''));
const lineTotal = (l) => l.price === null || l.price === undefined ? null : round2((Number(l.qty) || 0) * l.price);

// ---------- Tri par action ----------
function lastActivity(d) { return d.lastReminder && d.lastReminder > (d.sentAt || '') ? d.lastReminder : d.sentAt; }
function bucketOf(d, today) {
  if (CLOSED.includes(d.status) || (d.date && d.date < today)) return 'archives';
  if (CONFIRMED.includes(d.status)) return 'confirmes';
  if (!d.sentAt) return 'traiter';
  const days = daysAgo(lastActivity(d));
  return days < 7 ? 'attente' : days <= 45 ? 'relancer' : 'sans_reponse';
}
function alertsOf(d) {
  const out = [];
  const today = todayISO();
  if (!d.date) out.push(['warn', 'Date de l’événement à préciser.']);
  else {
    const day = parseISO(d.date).getDay();
    if (d.date < today && !CLOSED.includes(d.status)) out.push(['bad', 'Date passée.']);
    if (day === 1) out.push(['bad', 'Le lundi, le restaurant est fermé : proposer une autre date.']);
    if (day === 0 && d.type !== 'privatisation') out.push(['warn', 'Le dimanche, le restaurant est fermé au public : seule la privatisation de la salle est possible.']);
    if (day === 0 && d.type === 'privatisation') out.push(['info', 'Dimanche : jour de fermeture, la salle est privatisable.']);
    const delay = (parseISO(d.date) - new Date()) / 3600000;
    if (delay >= 0 && delay < 72 && !CONFIRMED.includes(d.status)) out.push(['bad', 'Moins de 72 h avant l’événement : appeler le client au plus vite.']);
    const same = DB.demandes.filter((x) => x.id !== d.id && x.date === d.date && CONFIRMED.includes(x.status));
    if (same.length) out.push([d.type === 'privatisation' || same.some((x) => x.type === 'privatisation') ? 'bad' : 'warn',
      'Déjà confirmé ce jour-là : ' + same.map((x) => x.clientName + ' (' + (TYPES[x.type] || {}).short + ', ' + (CRENEAUX[x.creneau] || {}).label + ')').join(', ') + '.']);
  }
  if (!d.phone && !d.email) out.push(['warn', 'Aucun téléphone ni e-mail.']);
  const t = totals(d);
  if (t.missing) out.push(['warn', t.missing + ' ligne(s) du devis à chiffrer.']);
  if (d.devis && !d.devis.lines.length) out.push(['warn', 'Le devis ne contient aucune ligne.']);
  return out;
}

// ---------- Rendu ----------
const app = () => document.getElementById('app');
let listTab = 'traiter';
let listQuery = '';

function route() {
  const h = location.hash.replace(/^#\/?/, '');
  const [view, id] = h.split('/');
  document.querySelectorAll('#nav a').forEach((a) => a.classList.toggle('on', a.dataset.nav === (view || 'list')));
  document.title = 'Chez Lina · Demandes et devis';
  if (view === 'nouvelle') return renderNew();
  if (view === 'fiche' && byId(id)) return renderFiche(id);
  if (view === 'devis' && byId(id)) return renderDoc(id);
  if (view === 'contrat' && byId(id) && window.renderContrat) return renderContrat(id);
  if (view === 'agenda') return renderAgenda();
  if (view === 'reglages') return renderSettings();
  return renderList();
}
window.addEventListener('hashchange', () => { if (dirty) save(true); route(); window.scrollTo(0, 0); });

function dateTile(d) {
  if (!d.date) return '<span class="tile"><b>?</b><small>date</small></span>';
  const x = parseISO(d.date);
  return '<span class="tile' + (CONFIRMED.includes(d.status) ? ' signed' : '') + '"><b>' + x.getDate() + '</b><small>' + MOIS_COURT[x.getMonth()] + ' ' + String(x.getFullYear()).slice(2) + '</small></span>';
}
function rowHTML(d) {
  const t = totals(d);
  const cr = CRENEAUX[d.creneau];
  return '<a class="row" href="#/fiche/' + d.id + '">' + dateTile(d) +
    '<div><h3>' + esc(d.clientName || 'Sans nom') + (d.company ? ' <span class="muted small">· ' + esc(d.company) + '</span>' : '') + '</h3>' +
    '<div class="meta"><span class="type">' + esc((TYPES[d.type] || {}).short || '') + '</span>' +
    (d.occasion ? '<span>' + esc(d.occasion) + '</span>' : '') +
    (d.date ? '<span>' + esc(dateFR(d.date, true)) + (cr ? ' · ' + esc(cr.label.toLowerCase()) : '') + '</span>' : '') +
    (guests(d) ? '<span>' + guests(d) + ' invités</span>' : '') +
    '<span>' + esc(d.ref) + '</span></div></div>' +
    '<div class="right"><span class="badge s-' + d.status + '">' + STATUS[d.status] + '</span>' +
    '<span class="amount">' + (t.total || t.missing ? eur(t.missing && !t.total ? null : t.total) : '') + '</span></div></a>';
}

function renderList() {
  const today = todayISO();
  const counts = {};
  DB.demandes.forEach((d) => { const b = bucketOf(d, today); counts[b] = (counts[b] || 0) + 1; });
  counts.all = DB.demandes.length;
  const q = listQuery.trim().toLowerCase();
  let items = DB.demandes.filter((d) => listTab === 'all' || bucketOf(d, today) === listTab);
  if (q) items = DB.demandes.filter((d) => [d.clientName, d.company, d.phone, d.email, d.ref, d.occasion, (TYPES[d.type] || {}).label, dateShort(d.date)].join(' ').toLowerCase().includes(q));
  items.sort((a, b) => listTab === 'archives' ? (b.date || '').localeCompare(a.date || '') : (a.date || '9999').localeCompare(b.date || '9999'));
  const tab = TABS.find((t) => t[0] === listTab);
  app().innerHTML =
    '<div class="head"><div><h1>Demandes et devis</h1><p>Privatisation, groupes, événements, traiteur et à emporter.</p></div>' +
    '<a class="btn primary" href="#/nouvelle">+ Nouvelle demande</a></div>' +
    '<div class="tabs" role="tablist">' + TABS.map(([k, label]) => '<button class="tab' + (k === listTab && !q ? ' on' : '') + '" data-tab="' + k + '">' + label + '<span class="n">' + (counts[k] || 0) + '</span></button>').join('') + '</div>' +
    '<p class="tabhint">' + (q ? 'Recherche dans toutes les demandes.' : esc(tab[2])) + '</p>' +
    '<p><input class="search" id="q" type="search" placeholder="Rechercher : nom, téléphone, n° de devis, date…" value="' + esc(listQuery) + '"></p>' +
    '<div class="list">' + (items.length ? items.map(rowHTML).join('') : '<div class="empty">Aucune demande ici.' + (DB.demandes.length ? '' : ' <a href="#/nouvelle">Saisir la première demande</a>.') + '</div>') + '</div>';
  app().querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => { listTab = b.dataset.tab; listQuery = ''; renderList(); });
  const qi = document.getElementById('q');
  qi.oninput = () => { listQuery = qi.value; const pos = qi.selectionStart; renderList(); const n = document.getElementById('q'); n.focus(); n.setSelectionRange(pos, pos); };
}

// ---------- Formulaire de demande ----------
function field(name, label, value, opts = {}) {
  const req = opts.required ? ' class="req"' : '';
  const attrs = (opts.type ? ' type="' + opts.type + '"' : '') + (opts.min !== undefined ? ' min="' + opts.min + '"' : '') + (opts.placeholder ? ' placeholder="' + esc(opts.placeholder) + '"' : '') + (opts.required ? ' required' : '') + (opts.autocomplete ? ' autocomplete="' + opts.autocomplete + '"' : '') + (opts.inputmode ? ' inputmode="' + opts.inputmode + '"' : '');
  const inner = opts.textarea ? '<textarea name="' + name + '"' + attrs + '>' + esc(value) + '</textarea>'
    : opts.options ? '<select name="' + name + '">' + opts.options.map(([v, l]) => '<option value="' + esc(v) + '"' + (String(v) === String(value ?? '') ? ' selected' : '') + '>' + esc(l) + '</option>').join('') + '</select>'
    : '<input name="' + name + '" value="' + esc(value) + '"' + attrs + '>';
  return '<label class="f' + (opts.full ? ' full' : '') + '"><span' + req + '>' + label + '</span>' + inner + '</label>';
}
function choices(name, map, value) {
  return '<div class="choices">' + Object.entries(map).map(([k, v]) => '<label class="choice"><input type="radio" name="' + name + '" value="' + k + '"' + (k === value ? ' checked' : '') + '>' + esc(v.label || v) + '</label>').join('') + '</div>';
}
function demandeFields(d) {
  return '<div class="grid">' +
    '<div class="full"><span class="small muted" style="font-weight:600">Type de demande</span>' + choices('type', TYPES, d.type) + '</div>' +
    field('occasion', 'Occasion', d.occasion, { options: [['', '—'], ...OCCASIONS.map((o) => [o, o])] }) +
    field('source', 'Demande reçue par', d.source, { options: [['', '—'], ...SOURCES.map((o) => [o, o])] }) +
    field('clientName', 'Nom du client', d.clientName, { required: true, placeholder: 'Prénom NOM', autocomplete: 'name' }) +
    field('company', 'Société / association', d.company, { placeholder: 'Facultatif' }) +
    field('phone', 'Téléphone', d.phone, { type: 'tel', inputmode: 'tel', autocomplete: 'tel' }) +
    field('email', 'E-mail', d.email, { type: 'email', autocomplete: 'email' }) +
    field('date', 'Date de l’événement', d.date, { type: 'date' }) +
    field('creneau', 'Créneau', d.creneau, { options: Object.entries(CRENEAUX).map(([k, v]) => [k, v.label + (v.heures ? ' (' + v.heures + ')' : '')]) }) +
    field('heure', 'Heure d’arrivée / de retrait', d.heure, { placeholder: 'ex. 19h30' }) +
    field('budget', 'Budget indiqué', d.budget, { placeholder: 'Facultatif' }) +
    field('adultes', 'Adultes', d.adultes, { type: 'number', min: 0, inputmode: 'numeric' }) +
    field('enfants', 'Enfants (jusqu’à 12 ans)', d.enfants, { type: 'number', min: 0, inputmode: 'numeric' }) +
    field('adresse', 'Adresse de facturation', d.adresse, { full: true, placeholder: 'Pour un devis au nom d’une société' }) +
    '<label class="f full" data-show="traiteur"><span>Livraison</span><span class="choices"><label class="choice"><input type="checkbox" name="livraison"' + (d.livraison ? ' checked' : '') + '>À livrer</label></span></label>' +
    field('adresseLivraison', 'Adresse de livraison', d.adresseLivraison, { full: true }) +
    field('message', 'Message du client / besoins', d.message, { textarea: true, full: true, placeholder: 'Plats souhaités, allergies, décoration, musique, gâteau apporté…' }) +
    '</div>';
}
function readForm(form, d) {
  const fd = new FormData(form);
  ['type', 'occasion', 'source', 'clientName', 'company', 'phone', 'email', 'date', 'creneau', 'heure', 'budget', 'adresse', 'adresseLivraison', 'message'].forEach((k) => { if (fd.has(k)) d[k] = String(fd.get(k)).trim(); });
  d.adultes = num(fd.get('adultes')) || 0;
  d.enfants = num(fd.get('enfants')) || 0;
  d.livraison = fd.get('livraison') === 'on';
  return d;
}
function toggleDelivery(form) {
  const type = (form.querySelector('[name=type]:checked') || {}).value;
  const liv = form.querySelector('[name=livraison]');
  form.querySelector('[data-show=traiteur]').style.display = type === 'traiteur' ? '' : 'none';
  form.querySelector('[name=adresseLivraison]').closest('label').style.display = type === 'traiteur' && liv.checked ? '' : 'none';
}

// Lecture d'un e-mail envoyé par le formulaire chezlina.fr/demande-de-devis (lignes « Clé : valeur »).
function parseDemande(txt) {
  const get = (label) => { const m = String(txt || '').match(new RegExp('^\\s*' + label + '\\s*:\\s*(.+)$', 'mi')); return m ? m[1].trim() : ''; };
  const out = {};
  const type = get('Type de demande').toLowerCase();
  if (type) out.type = /privatis/.test(type) ? 'privatisation' : /groupe/.test(type) ? 'groupe' : /traiteur/.test(type) ? 'traiteur' : /emporter/.test(type) ? 'emporter' : 'evenement';
  const occ = get('Occasion'); if (occ && !/non précis/i.test(occ)) out.occasion = occ;
  const date = get('Date souhaitée').match(/(\d{4}-\d{2}-\d{2})/); if (date) out.date = date[1];
  const cr = get('Créneau').toLowerCase(); if (cr) out.creneau = /journ/.test(cr) ? 'journee' : /midi/.test(cr) ? 'midi' : /soir/.test(cr) ? 'soir' : 'autre';
  const h = get('Heure d’arrivée ou de retrait') || get("Heure d'arrivée ou de retrait"); if (h && !/convenir/i.test(h)) out.heure = h.replace(':', 'h');
  const a = parseInt(get('Adultes'), 10); if (a > 0) out.adultes = a;
  const e = parseInt(get('Enfants'), 10); if (e >= 0 && get('Enfants')) out.enfants = e;
  const b = get('Budget'); if (b && !/non précis/i.test(b)) out.budget = b;
  const nom = get('Nom'); if (nom) out.clientName = nom;
  const soc = get('Société'); if (soc && soc !== '—') out.company = soc;
  const tel = get('Téléphone'); if (tel) out.phone = tel;
  const mail = get('E-mail'); if (mail) out.email = mail;
  const liv = get('Livraison'); if (liv) out.livraison = /^oui/i.test(liv);
  const adr = get('Adresse de livraison'); if (adr) out.adresseLivraison = adr;
  const besoins = get('Besoins'); if (besoins && besoins !== 'Aucun') out.message = besoins;
  if (Object.keys(out).length) out.source = 'Site chezlina.fr';
  return out;
}

function renderNew() {
  const d = { type: 'privatisation', creneau: 'soir', adultes: '', enfants: '' };
  app().innerHTML = '<div class="head"><div><h1>Nouvelle demande</h1><p>Saisir une demande reçue par téléphone, e-mail, Instagram ou sur place.</p></div></div>' +
    '<details class="card" id="pasteBox" style="margin-bottom:16px"><summary style="cursor:pointer;font-weight:600">Coller une demande reçue par e-mail (formulaire du site)</summary>' +
    '<p class="small muted">Copier tout le texte de l’e-mail « Demande de devis » reçu sur contact@chezlina.fr, le coller ici : les champs se remplissent.</p>' +
    '<textarea class="inp" id="pasteTxt" rows="6" placeholder="Type de demande : …"></textarea><div class="actions"><button class="btn dark" type="button" id="pasteBtn">Remplir le formulaire</button></div></details>' +
    '<form class="card" id="newForm" novalidate>' + demandeFields(d) +
    '<div class="actions"><button class="btn primary" type="submit">Enregistrer et préparer le devis</button><a class="btn ghost" href="#/">Annuler</a></div></form>';
  const form = document.getElementById('newForm');
  form.addEventListener('change', () => toggleDelivery(form));
  toggleDelivery(form);
  document.getElementById('pasteBtn').onclick = () => {
    const p = parseDemande(document.getElementById('pasteTxt').value);
    const n = Object.keys(p).length;
    if (!n) return toast('Aucun champ reconnu dans le texte collé.');
    Object.entries(p).forEach(([k, v]) => {
      if (k === 'type') { const r = form.querySelector('[name=type][value="' + v + '"]'); if (r) r.checked = true; return; }
      if (k === 'livraison') { form.livraison.checked = v; return; }
      const el = form.querySelector('[name="' + k + '"]');
      if (!el) return;
      if (el.tagName === 'SELECT' && ![...el.options].some((o) => o.value === v)) { if (k === 'occasion') { el.value = 'Autre'; } return; }
      el.value = v;
    });
    toggleDelivery(form);
    toast(n + ' champ(s) rempli(s) : vérifier puis enregistrer.');
    document.getElementById('pasteBox').open = false;
  };
  form.onsubmit = (e) => {
    e.preventDefault();
    const nd = readForm(form, { id: uid(), createdAt: new Date().toISOString(), status: 'nouvelle', notes: '', history: [] });
    if (!nd.clientName) { toast('Indiquer le nom du client.'); form.clientName.focus(); return; }
    nd.ref = newRef();
    nd.updatedAt = nd.createdAt;
    nd.devis = defaultDevis(nd);
    nd.history.push({ at: nd.createdAt, text: 'Demande enregistrée (' + (nd.source || 'source non précisée') + ')' });
    DB.demandes.push(nd);
    save(true);
    toast('Demande ' + nd.ref + ' enregistrée.');
    location.hash = '#/fiche/' + nd.id;
  };
}

// ---------- Fiche ----------
function log(d, text) { d.history = d.history || []; d.history.push({ at: new Date().toISOString(), text }); d.updatedAt = new Date().toISOString(); }
function setStatus(d, s, text) { d.status = s; log(d, text || 'Statut : ' + STATUS[s]); save(true); }

function renderFiche(id) {
  const d = byId(id);
  const alerts = alertsOf(d);
  app().innerHTML =
    '<div class="head"><div><p class="small"><a href="#/">← Demandes</a></p><h1>' + esc(d.clientName) + '</h1>' +
    '<p>' + esc(d.ref) + ' · ' + esc((TYPES[d.type] || {}).label) + (d.date ? ' · ' + esc(dateFR(d.date, true)) : '') + ' · <span class="badge s-' + d.status + '">' + STATUS[d.status] + '</span></p></div>' +
    '<div class="actions" style="margin:0"><a class="btn dark" href="#/devis/' + d.id + '">Voir et imprimer le devis</a><a class="btn dark" href="#/contrat/' + d.id + '">Contrat de réservation</a><button class="btn primary" id="mailBtn">E-mail au client</button></div></div>' +
    (alerts.length ? '<div class="alerts">' + alerts.map(([k, t]) => '<div class="alert ' + (k === 'bad' ? 'bad' : k === 'info' ? 'info' : '') + '">' + esc(t) + '</div>').join('') + '</div>' : '') +
    '<div class="fiche">' +
      '<div class="stack">' +
        '<section class="card"><h2>Suivi</h2>' +
          '<label class="f"><span>Statut</span><select id="status">' + Object.entries(STATUS).map(([k, v]) => '<option value="' + k + '"' + (k === d.status ? ' selected' : '') + '>' + v + '</option>').join('') + '</select></label>' +
          '<div class="quick" style="margin-top:10px">' +
            '<button class="btn small" data-q="sent">Devis envoyé ✓</button>' +
            '<button class="btn small" data-q="relance">Relancé</button>' +
            '<button class="btn small" data-q="signe">Signé</button>' +
            '<button class="btn small" data-q="acompte">Acompte reçu</button>' +
            '<button class="btn small" data-q="solde">Soldé</button>' +
            '<button class="btn small" data-q="archivee">Archiver</button>' +
          '</div>' +
          '<p class="small muted" style="margin:10px 0 0">' + (d.sentAt ? 'Devis envoyé le ' + dateShort(d.sentAt.slice(0, 10)) + (d.lastReminder ? ' · relancé le ' + dateShort(d.lastReminder.slice(0, 10)) : '') : 'Devis pas encore envoyé.') + '</p>' +
          '<label class="f" style="margin-top:12px"><span>Notes internes (non imprimées)</span><textarea id="notes" placeholder="Échanges, préférences, points à vérifier…">' + esc(d.notes) + '</textarea></label>' +
          '<h3>Historique</h3><ul class="hist">' + (d.history || []).slice().reverse().map((h) => '<li>' + dateShort(h.at.slice(0, 10)) + ' ' + h.at.slice(11, 16) + ' · ' + esc(h.text) + '</li>').join('') + '</ul>' +
        '</section>' +
        '<form class="card" id="ficheForm"><h2>Demande</h2>' + demandeFields(d) + '<p class="small muted" style="margin:10px 0 0">Enregistré automatiquement.</p></form>' +
        '<section class="card no-print"><h3 style="margin-top:0">Supprimer</h3><p class="small muted">Préférer « Archiver ». La suppression est définitive.</p><button class="btn small danger" id="delBtn">Supprimer cette demande</button></section>' +
      '</div>' +
      '<div class="stack"><section class="card" id="devisCard"></section><section class="card" id="mailCard" hidden></section></div>' +
    '</div>';

  const form = document.getElementById('ficheForm');
  toggleDelivery(form);
  form.addEventListener('input', () => { readForm(form, d); d.updatedAt = new Date().toISOString(); save(); });
  form.addEventListener('change', () => { readForm(form, d); toggleDelivery(form); save(true); refreshAlerts(d); });
  document.getElementById('notes').oninput = (e) => { d.notes = e.target.value; save(); };
  document.getElementById('status').onchange = (e) => { setStatus(d, e.target.value); renderFiche(id); };
  app().querySelectorAll('[data-q]').forEach((b) => b.onclick = () => {
    const q = b.dataset.q, now = new Date().toISOString();
    if (q === 'sent') { d.sentAt = now; if (!CONFIRMED.includes(d.status)) d.status = 'envoye'; log(d, 'Devis ' + d.ref + ' (v' + d.devis.version + ') envoyé au client'); save(true); }
    else if (q === 'relance') { d.lastReminder = now; log(d, 'Client relancé'); save(true); }
    else setStatus(d, q);
    renderFiche(id); toast('Fiche mise à jour.');
  });
  document.getElementById('delBtn').onclick = () => {
    if (!confirm('Supprimer définitivement la demande de ' + d.clientName + ' (' + d.ref + ') ? Cette action est irréversible.')) return;
    DB.demandes = DB.demandes.filter((x) => x.id !== d.id); save(true); location.hash = '#/';
  };
  document.getElementById('mailBtn').onclick = () => showMail(d);
  renderDevisEditor(d);
}
function refreshAlerts(d) {
  const box = app().querySelector('.alerts');
  const html = alertsOf(d).map(([k, t]) => '<div class="alert ' + (k === 'bad' ? 'bad' : k === 'info' ? 'info' : '') + '">' + esc(t) + '</div>').join('');
  if (box) box.innerHTML = html;
}

// ---------- Éditeur du devis ----------
function sectionsOf(lines) { const s = []; lines.forEach((l) => { if (!s.includes(l.section || '')) s.push(l.section || ''); }); return s; }
const SECTION_LIST = ['Privatisation', 'Menu', 'Boissons', 'Options'];

function renderDevisEditor(d) {
  const v = d.devis;
  const card = document.getElementById('devisCard');
  const carteOpts = (window.CARTE || []).map((s) => '<optgroup label="' + esc(s.title) + '">' + s.items.map((i) => '<option value="' + esc(i.name) + '">' + esc(i.name) + ' · ' + eur(i.price) + '</option>').join('') + '</optgroup>').join('');
  const pick = (title) => { const s = (window.CARTE || []).find((x) => x.title === title); return s ? s.items : []; };
  const sel = (id, label, items) => '<label class="f"><span>' + label + '</span><select id="' + id + '"><option value="">—</option>' + items.map((i) => '<option value="' + esc(i.name) + '">' + esc(i.name) + ' · ' + eur(i.price) + '</option>').join('') + '</select></label>';
  card.innerHTML =
    '<div class="head" style="margin-bottom:6px"><h2 style="margin:0">Devis ' + esc(d.ref) + ' <span class="muted small">v' + v.version + '</span></h2>' +
    '<button class="btn small" id="resetDevis" title="Repartir du devis de base calculé depuis la demande">Recalculer depuis la demande</button></div>' +
    '<div class="grid">' +
      '<label class="f full"><span>Prestation souhaitée (en tête du devis)</span><input class="inp" data-v="summary" value="' + esc(v.summary) + '"></label>' +
      '<label class="f full"><span>Options / remarques</span><input class="inp" data-v="remarks" value="' + esc(v.remarks) + '" placeholder="ex. gâteau apporté par le client, décoration de la salle par la famille"></label>' +
    '</div>' +
    '<table class="lines" style="margin-top:12px"><thead><tr><th>Désignation</th><th class="num">Qté</th><th class="price">Prix u. TTC</th><th class="tot">Total</th><th></th></tr></thead><tbody>' +
    sectionsOf(v.lines).map((sec) => '<tr class="sec"><td colspan="5">' + esc(sec || 'Divers') + '</td></tr>' + v.lines.filter((l) => (l.section || '') === sec).map((l) =>
      '<tr class="ln" data-id="' + l.id + '"><td class="lbl"><input class="inp" data-k="label" value="' + esc(l.label) + '" aria-label="Désignation"><textarea class="inp detail" data-k="detail" rows="1" placeholder="Détail (facultatif)" aria-label="Détail">' + esc(l.detail) + '</textarea>' +
      '<select class="inp" data-k="section" style="margin-top:4px;font-size:12px" aria-label="Rubrique">' + [...new Set([...SECTION_LIST, sec].filter(Boolean))].map((s) => '<option' + (s === sec ? ' selected' : '') + '>' + esc(s) + '</option>').join('') + '</select></td>' +
      '<td><input class="inp num" data-k="qty" inputmode="decimal" value="' + esc(l.qty) + '" aria-label="Quantité"><div class="small muted" style="text-align:right">' + esc(l.unit || '') + '</div></td>' +
      '<td><input class="inp price" data-k="price" inputmode="decimal" value="' + (l.price === null || l.price === undefined ? '' : esc(String(l.price).replace('.', ','))) + '" placeholder="à chiffrer" aria-label="Prix unitaire"></td>' +
      '<td class="tot" data-tot>' + eur(lineTotal(l)) + '</td>' +
      '<td><button class="btn small ghost" data-act="up" title="Monter" aria-label="Monter">↑</button><button class="btn small ghost danger" data-act="del" title="Retirer" aria-label="Retirer la ligne">×</button></td></tr>').join('')).join('') +
    (v.lines.length ? '' : '<tr><td colspan="5" class="muted" style="padding:14px 4px">Aucune ligne : composer le menu ou ajouter des articles ci-dessous.</td></tr>') +
    '</tbody></table>' +
    '<div class="totals" id="totals"></div>' +
    '<div class="composer"><h3>Composer un menu par personne</h3>' +
      '<div class="grid3">' + sel('mcEntree', 'Entrée', pick('Entrées')) + sel('mcPlat', 'Plat', [...pick('Viandes'), ...pick('Poissons')]) + sel('mcDessert', 'Dessert', pick('Desserts')) +
      sel('mcAcc', 'Accompagnement en plus', pick('Accompagnements')) + sel('mcBoisson', 'Boisson comprise', [...pick('Softs'), ...pick('Mocktails (sans alcool)'), ...pick('Cocktails'), ...pick('Bières')]) +
      '<label class="f"><span>Pour (pers.)</span><input class="inp" id="mcQty" inputmode="numeric" value="' + (Number(d.adultes) || '') + '"></label></div>' +
      '<p class="small muted" id="mcPrice" style="margin:8px 0">Prix par personne = somme des prix de la carte.</p>' +
      '<button class="btn dark" id="mcAdd">Ajouter ce menu au devis</button>' +
    '</div>' +
    '<div class="composer"><h3>Ajouter un article de la carte</h3><div class="inline">' +
      '<label class="f"><span>Article</span><select id="artSel"><option value="">—</option>' + carteOpts + '</select></label>' +
      '<label class="f" style="flex:0 1 110px"><span>Quantité</span><input class="inp" id="artQty" inputmode="decimal" value="1"></label>' +
      '<button class="btn dark" id="artAdd">Ajouter</button></div>' +
      '<div class="actions"><button class="btn small" id="freeAdd">+ Ligne libre</button>' +
      (d.type === 'privatisation' || v.lines.some((l) => /privatisation/i.test(l.label)) ? '' : '<button class="btn small" id="privAdd">+ Privatisation de la salle</button>') + '</div>' +
    '</div>' +
    '<div class="grid" style="margin-top:12px">' +
      '<label class="f"><span>Acompte à la signature (%)</span><input class="inp" data-v="depositPct" inputmode="numeric" value="' + esc(v.depositPct) + '"></label>' +
      '<label class="f"><span>Date d’émission</span><input class="inp" type="date" data-v="issuedOn" value="' + esc(v.issuedOn) + '"></label>' +
      '<label class="f full"><span>Mention ajoutée sous les conditions (facultatif)</span><textarea class="inp" data-v="note" rows="2">' + esc(v.note) + '</textarea></label>' +
    '</div>' +
    '<div class="actions"><a class="btn dark" href="#/devis/' + d.id + '">Voir et imprimer le devis</a><button class="btn" id="newVersion" title="Après un envoi, garder une trace de la nouvelle version">Nouvelle version (v' + (v.version + 1) + ')</button></div>';

  const touch = () => { d.updatedAt = new Date().toISOString(); if (d.status === 'nouvelle' && v.lines.length) d.status = 'devis_pret'; save(); };
  const paintTotals = () => {
    const t = totals(d);
    document.getElementById('totals').innerHTML =
      '<div class="big">Total TTC : ' + eur(t.total) + '</div>' +
      (t.missing ? '<div class="small" style="color:var(--warn)">' + t.missing + ' ligne(s) à chiffrer, non comptée(s)</div>' : '') +
      '<div class="small muted">Acompte ' + t.pct + ' % : ' + eur(t.deposit) + ' · Solde : ' + eur(t.balance) + ' ' + esc(DB.settings.balanceWhen) + '</div>';
  };
  paintTotals();

  card.querySelectorAll('[data-v]').forEach((el) => el.addEventListener('input', () => {
    const k = el.dataset.v;
    v[k] = k === 'depositPct' ? (num(el.value) ?? 0) : el.value;
    touch(); paintTotals();
  }));
  card.querySelectorAll('tr.ln').forEach((tr) => {
    const l = v.lines.find((x) => x.id === tr.dataset.id);
    tr.querySelectorAll('[data-k]').forEach((el) => {
      el.addEventListener('input', () => {
        const k = el.dataset.k;
        if (k === 'qty') l.qty = num(el.value) ?? 0;
        else if (k === 'price') l.price = num(el.value);
        else if (k !== 'section') l[k] = el.value;
        tr.querySelector('[data-tot]').textContent = eur(lineTotal(l));
        touch(); paintTotals();
        if (k === 'price') refreshAlerts(d);
      });
      if (el.dataset.k === 'section') el.addEventListener('change', () => { l.section = el.value; touch(); renderDevisEditor(d); });
    });
    tr.querySelector('[data-act=del]').onclick = () => { v.lines = v.lines.filter((x) => x !== l); touch(); renderDevisEditor(d); refreshAlerts(d); };
    tr.querySelector('[data-act=up]').onclick = () => { const i = v.lines.indexOf(l); if (i > 0) { [v.lines[i - 1], v.lines[i]] = [v.lines[i], v.lines[i - 1]]; touch(); renderDevisEditor(d); } };
  });

  // Menu composé
  const mcIds = ['mcEntree', 'mcPlat', 'mcDessert', 'mcAcc', 'mcBoisson'];
  const mcItems = () => mcIds.map((i) => carteFind(document.getElementById(i).value)).filter(Boolean);
  const mcPaint = () => { const it = mcItems(); const p = round2(it.reduce((s, i) => s + i.price, 0)); document.getElementById('mcPrice').textContent = it.length ? 'Prix par personne : ' + eur(p) + ' (somme des prix de la carte).' : 'Prix par personne = somme des prix de la carte.'; };
  mcIds.forEach((i) => document.getElementById(i).onchange = mcPaint);
  document.getElementById('mcAdd').onclick = () => {
    const it = mcItems();
    if (!it.length) return toast('Choisir au moins un plat.');
    const labels = { mcEntree: 'Entrée', mcPlat: 'Plat', mcDessert: 'Dessert', mcAcc: 'Accompagnement', mcBoisson: 'Boisson' };
    const parts = mcIds.filter((i) => document.getElementById(i).value).map((i) => labels[i]);
    const detail = mcIds.filter((i) => document.getElementById(i).value).map((i) => labels[i] + ' : ' + document.getElementById(i).value).join('\n');
    const qty = num(document.getElementById('mcQty').value) || Number(d.adultes) || 1;
    v.lines.push(line('Menu', 'Menu ' + parts.join(' + '), qty, 'pers.', round2(it.reduce((s, i) => s + i.price, 0)), detail));
    touch(); renderDevisEditor(d); refreshAlerts(d); toast('Menu ajouté.');
  };
  // Article de la carte
  document.getElementById('artAdd').onclick = () => {
    const it = carteFind(document.getElementById('artSel').value);
    if (!it) return toast('Choisir un article.');
    const sec = (window.CARTE || []).find((s) => s.items.includes(it)).title;
    const section = /Softs|Cocktails|Mocktails|Bières|Vins|Champagne|chaudes/i.test(sec) ? 'Boissons' : 'Menu';
    v.lines.push(line(section, it.name, num(document.getElementById('artQty').value) || 1, it.unit || 'unité', it.price, it.detail || ''));
    touch(); renderDevisEditor(d); refreshAlerts(d);
  };
  document.getElementById('freeAdd').onclick = () => { v.lines.push(line('Options', 'Nouvelle ligne', 1, 'forfait', null, '')); touch(); renderDevisEditor(d); refreshAlerts(d); };
  const pa = document.getElementById('privAdd');
  if (pa) pa.onclick = () => { const cr = CRENEAUX[d.creneau] || CRENEAUX.autre; v.lines.unshift(line('Privatisation', 'Privatisation de la salle', 1, 'forfait', null, cr.label + (cr.heures ? ' (' + cr.heures + ')' : ''))); touch(); renderDevisEditor(d); refreshAlerts(d); };
  document.getElementById('resetDevis').onclick = () => {
    if (v.lines.length && !confirm('Remplacer les lignes actuelles par le devis de base ? Les lignes ajoutées seront perdues.')) return;
    const nv = defaultDevis(d); nv.version = v.version; d.devis = nv; log(d, 'Devis recalculé depuis la demande'); save(true); renderDevisEditor(d); refreshAlerts(d);
  };
  document.getElementById('newVersion').onclick = () => { v.version += 1; v.issuedOn = todayISO(); log(d, 'Nouvelle version du devis : v' + v.version); save(true); renderFiche(d.id); };
}

// ---------- E-mail ----------
function mailOf(d) {
  const t = totals(d);
  const subject = 'Votre devis Chez Lina – ' + (d.occasion || (TYPES[d.type] || {}).short) + (d.date ? ' du ' + dateShort(d.date) : '') + ' | ' + d.clientName;
  const quoi = d.type === 'privatisation' ? 'la privatisation de notre salle' : d.type === 'traiteur' ? 'votre commande traiteur' : d.type === 'emporter' ? 'votre commande à emporter' : d.type === 'groupe' ? 'votre réservation de groupe' : 'votre événement';
  const body = [
    'Bonjour ' + firstName(d.clientName) + ',',
    '',
    'Merci pour votre demande concernant ' + quoi + (d.occasion ? ' (' + d.occasion.toLowerCase() + ')' : '') + (d.date ? ', le ' + dateFR(d.date, true) : '') + (guests(d) ? ', pour ' + guests(d) + ' invités' : '') + '.',
    '',
    'Vous trouverez ci-joint le devis n° ' + d.ref + (t.total ? ', d’un montant de ' + eur(t.total) + ' TTC' : '') + '.',
    '',
    '• Validité du devis : ' + DB.settings.validDays + ' jours.',
    t.total ? '• Confirmation : la réservation est confirmée à réception du devis signé et d’un acompte de ' + eur(t.deposit) + ' (' + t.pct + ' %). Le solde de ' + eur(t.balance) + ' est à régler ' + DB.settings.balanceWhen + '.' : '• Confirmation : le montant sera précisé une fois le menu validé ensemble.',
    '• Le menu reste modulable : il suffit de répondre à ce message pour l’ajuster.',
    '',
    'Pour toute question, l’équipe est joignable au ' + LINA.tel + ', du mardi au vendredi de 11h45 à 14h45 et de 18h45 à 23h45, et le samedi de 11h45 à 23h45 en service continu.',
    '',
    'Au plaisir de vous recevoir au ' + LINA.adresse + '.',
    '',
    'Bien cordialement,',
    DB.settings.mailSignature,
    LINA.nom + ' · ' + LINA.tel + ' · ' + LINA.site,
  ].join('\n');
  return { subject, body };
}
function showMail(d) {
  const m = mailOf(d);
  const card = document.getElementById('mailCard');
  card.hidden = false;
  card.innerHTML = '<h2>E-mail au client</h2>' +
    (d.email ? '' : '<div class="alert">Pas d’e-mail dans la fiche : copier le texte pour l’envoyer autrement (WhatsApp, SMS).</div>') +
    '<p class="small"><b>À :</b> ' + esc(d.email || '—') + '<br><b>Objet :</b> ' + esc(m.subject) + '</p>' +
    '<div class="mailbox">' + esc(m.body) + '</div>' +
    '<p class="small muted">Joindre le PDF du devis (bouton « Voir et imprimer le devis », puis « Enregistrer en PDF »).</p>' +
    '<div class="actions">' + (d.email ? '<a class="btn primary" href="mailto:' + encodeURIComponent(d.email) + '?subject=' + encodeURIComponent(m.subject) + '&body=' + encodeURIComponent(m.body) + '">Ouvrir dans la messagerie</a>' : '') +
    '<button class="btn" id="copyMail">Copier le texte</button><button class="btn" id="sentMail">Marquer le devis envoyé</button></div>';
  document.getElementById('copyMail').onclick = () => {
    const txt = 'Objet : ' + m.subject + '\n\n' + m.body;
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast('Texte copié.'), () => toast('Copie impossible : sélectionner le texte à la main.'));
  };
  document.getElementById('sentMail').onclick = () => { d.sentAt = new Date().toISOString(); if (!CONFIRMED.includes(d.status)) d.status = 'envoye'; log(d, 'Devis ' + d.ref + ' (v' + d.devis.version + ') envoyé au client'); save(true); renderFiche(d.id); toast('Devis marqué envoyé.'); };
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---------- Document devis (A4, imprimable en PDF) ----------
function fileName(d) {
  const nom = String(d.clientName || 'CLIENT').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '').toUpperCase();
  const type = ((TYPES[d.type] || {}).short || 'Devis').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z]+/g, '');
  return 'CL_' + (d.date ? d.date.replace(/-/g, '') : 'SANSDATE') + '_' + type + '_' + nom + '_Devis' + (d.devis.version > 1 ? '_v' + d.devis.version : '');
}
function renderDoc(id) {
  const d = byId(id), v = d.devis, t = totals(d), s = DB.settings;
  const cr = CRENEAUX[d.creneau] || CRENEAUX.autre;
  const lieu = d.type === 'emporter' ? 'Retrait chez ' + LINA.nom + ', ' + LINA.adresse
    : d.type === 'traiteur' ? (d.livraison ? 'Livraison : ' + (d.adresseLivraison || 'adresse à préciser') : 'Retrait chez ' + LINA.nom + ', ' + LINA.adresse)
    : LINA.nom + ', ' + LINA.adresse;
  const validUntil = addDays(v.issuedOn || todayISO(), Number(s.validDays) || 30);
  const conds = String(s.conditions || '').split('\n').map((x) => x.trim()).filter(Boolean);
  const payLines = t.total ? [
    'Réservation confirmée à réception du devis signé et d’un acompte de ' + t.pct + ' %, soit ' + eur(t.deposit) + '.',
    'Solde de ' + eur(t.balance) + ' à régler ' + s.balanceWhen + '.',
  ] : ['Montant précisé une fois le menu et les options validés.'];
  if (s.iban) payLines.push('Règlement par virement : IBAN ' + s.iban + ' (titulaire : ' + LINA.societe + ').');
  document.title = fileName(d);
  const secs = sectionsOf(v.lines);
  const showSecs = secs.length > 1 || (secs[0] && secs[0] !== '');
  app().innerHTML =
    '<div class="doc-bar no-print"><a class="btn" href="#/fiche/' + d.id + '">← Retour à la fiche</a><button class="btn primary" onclick="window.print()">Imprimer / enregistrer en PDF</button>' +
    '<span class="small muted" style="align-self:center">Nom du fichier proposé : ' + esc(fileName(d)) + '.pdf</span></div>' +
    (t.missing ? '<div class="alert no-print" style="max-width:210mm;margin:0 auto 12px">' + t.missing + ' ligne(s) « à chiffrer » : renseigner le prix avant d’envoyer le devis.</div>' : '') +
    '<article class="doc">' +
      '<header class="d-head"><img src="logo-chez-lina.png" alt="Chez Lina"><div class="d-co"><b>Chez Lina</b>Cuisine franco-africaine<br>' + esc(LINA.adresse) + '<br>' + esc(LINA.tel) + ' · ' + esc(LINA.email) + '<br>' + esc(LINA.site) + '</div>' +
      '<div class="d-title"><h1>DEVIS</h1><div>N° ' + esc(d.ref) + (v.version > 1 ? ' · version ' + v.version : '') + '<br>Émis le ' + esc(dateFR(v.issuedOn)) + '<br>Valable jusqu’au ' + esc(dateFR(validUntil)) + '</div></div></header>' +
      '<div class="d-blocks">' +
        '<div class="d-box"><h2>Devis pour</h2><p><b>' + esc(d.clientName) + '</b>' + (d.company ? '<br>' + esc(d.company) : '') + (d.adresse ? '<br>' + esc(d.adresse) : '') + (d.phone ? '<br>' + esc(d.phone) : '') + (d.email ? '<br>' + esc(d.email) : '') + '</p></div>' +
        '<div class="d-box"><h2>Votre événement</h2><p><b>' + esc((TYPES[d.type] || {}).label) + (d.occasion ? ' · ' + esc(d.occasion) : '') + '</b><br>' +
          esc(d.date ? dateFR(d.date, true).replace(/^./, (c) => c.toUpperCase()) : 'Date à préciser') + '<br>' +
          esc(cr.label + (cr.heures ? ' (' + cr.heures + ')' : '')) + (d.heure ? ' · arrivée ' + esc(d.heure) : '') + '<br>' +
          (guests(d) ? esc((Number(d.adultes) || 0) + ' adulte' + (Number(d.adultes) > 1 ? 's' : '') + (Number(d.enfants) ? ' + ' + d.enfants + ' enfant' + (Number(d.enfants) > 1 ? 's' : '') : '')) + '<br>' : '') +
          esc(lieu) + '</p></div>' +
      '</div>' +
      '<div class="d-intro">' + (v.summary ? '<p><b>Prestation souhaitée :</b> ' + esc(v.summary) + '</p>' : '') + (v.remarks ? '<p><b>Options / remarques :</b> ' + esc(v.remarks) + '</p>' : '') + '</div>' +
      '<table class="d-tab"><thead><tr><th>Désignation</th><th class="r">Quantité</th><th class="r">Prix unitaire TTC</th><th class="r">Total TTC</th></tr></thead><tbody>' +
      (v.lines.length ? secs.map((sec) => (showSecs ? '<tr class="dsec"><td colspan="4">' + esc(sec || 'Divers') + '</td></tr>' : '') + v.lines.filter((l) => (l.section || '') === sec).map((l) =>
        '<tr><td><b>' + esc(l.label) + '</b>' + (l.detail ? '<div class="dd">' + esc(l.detail) + '</div>' : '') + '</td><td class="r">' + esc(String(l.qty).replace('.', ',')) + ' ' + esc(unitTxt(l.qty, l.unit)) + '</td><td class="r">' + eur(l.price) + '</td><td class="r">' + eur(lineTotal(l)) + '</td></tr>').join('')).join('')
        : '<tr><td colspan="4">Prestations à définir ensemble.</td></tr>') +
      '</tbody></table>' +
      '<div class="d-total"><table>' +
        '<tr class="grand"><td>Total TTC</td><td class="r">' + eur(t.total) + '</td></tr>' +
        (t.total ? '<tr><td>Acompte à la signature (' + t.pct + ' %)</td><td class="r">' + eur(t.deposit) + '</td></tr><tr><td>Solde ' + esc(s.balanceWhen) + '</td><td class="r">' + eur(t.balance) + '</td></tr>' : '') +
      '</table></div>' +
      '<section class="d-cond"><h2>Conditions</h2><ul>' +
        '<li>Devis valable ' + esc(s.validDays) + ' jours, jusqu’au ' + esc(dateFR(validUntil)) + '. La date est garantie après signature et réception de l’acompte.</li>' +
        payLines.map((x) => '<li>' + esc(x) + '</li>').join('') +
        conds.map((x) => '<li>' + esc(x) + '</li>').join('') +
        (v.note ? '<li>' + esc(v.note) + '</li>' : '') +
      '</ul></section>' +
      '<div class="d-sign"><div><b>Pour Chez Lina</b>Le ' + esc(dateShort(v.issuedOn)) + '</div><div><b>Bon pour accord</b>Date, nom et signature du client, précédés de la mention « Bon pour accord »</div></div>' +
      '<footer class="d-foot"><b>' + esc(LINA.societe) + '</b> · Chez Lina · ' + esc(LINA.adresse) + ' · SIRET ' + esc(LINA.siret) + '<br>' + esc(LINA.tel) + ' · ' + esc(LINA.email) + ' · ' + esc(LINA.site) + '<br>' + esc(LINA.horaires) + '</footer>' +
    '</article>';
}

// ---------- Agenda des prestations confirmées ----------
function renderAgenda() {
  const today = todayISO();
  const up = DB.demandes.filter((d) => d.date && d.date >= today && CONFIRMED.includes(d.status)).sort((a, b) => a.date.localeCompare(b.date));
  const pending = DB.demandes.filter((d) => d.date && d.date >= today && !CONFIRMED.includes(d.status) && !CLOSED.includes(d.status)).sort((a, b) => a.date.localeCompare(b.date));
  const byMonth = (list) => { const g = {}; list.forEach((d) => { const k = d.date.slice(0, 7); (g[k] = g[k] || []).push(d); }); return Object.entries(g).map(([k, l]) => '<h2 class="month">' + MOIS[Number(k.slice(5)) - 1].replace(/^./, (c) => c.toUpperCase()) + ' ' + k.slice(0, 4) + '</h2><div class="list">' + l.map(rowHTML).join('') + '</div>').join(''); };
  app().innerHTML = '<div class="head"><div><h1>Agenda</h1><p>Prestations confirmées à venir, puis demandes en cours sur une date.</p></div></div>' +
    (up.length ? byMonth(up) : '<div class="empty">Aucune prestation confirmée à venir.</div>') +
    '<h2 class="month" style="margin-top:30px">Demandes en cours (date non confirmée)</h2>' +
    (pending.length ? byMonth(pending) : '<div class="empty">Aucune demande en cours avec une date.</div>');
}

// ---------- Réglages, sauvegarde ----------
function renderSettings() {
  const s = DB.settings;
  app().innerHTML = '<div class="head"><div><h1>Réglages</h1><p>Conditions imprimées sur les devis, sauvegarde des données.</p></div></div>' +
    '<div class="stack">' +
    '<form class="card" id="setForm"><h2>Conditions des devis</h2><div class="grid">' +
      field('depositPct', 'Acompte par défaut (%)', s.depositPct, { type: 'number', min: 0 }) +
      field('validDays', 'Validité du devis (jours)', s.validDays, { type: 'number', min: 1 }) +
      field('balanceWhen', 'Le solde est à régler…', s.balanceWhen, { placeholder: 'le jour de l’événement' }) +
      field('mailSignature', 'Signature des e-mails', s.mailSignature) +
      field('iban', 'IBAN (facultatif, imprimé sur le devis)', s.iban, { full: true, placeholder: 'FR76 …' }) +
      field('conditions', 'Autres conditions (une par ligne)', s.conditions, { textarea: true, full: true }) +
    '</div><p class="small muted">Prix de la privatisation : jamais de tarif public. Le montant se saisit devis par devis.</p>' +
    '<div class="actions"><button class="btn primary" type="submit">Enregistrer</button><button class="btn" type="button" id="setReset">Remettre les conditions par défaut</button></div></form>' +
    '<section class="card"><h2>Sauvegarde</h2><p class="small">' + DB.demandes.length + ' demande(s) enregistrée(s) dans ce navigateur. Les données restent sur cet appareil : télécharger une sauvegarde régulièrement (et avant de changer d’ordinateur).</p>' +
    '<div class="actions"><button class="btn dark" id="exp">Télécharger la sauvegarde (.json)</button><button class="btn" id="csv">Exporter le tableau (.csv, Excel)</button>' +
    '<label class="btn">Restaurer une sauvegarde<input type="file" id="imp" accept="application/json,.json" hidden></label></div></section>' +
    '<section class="card"><h2>Carte</h2><p class="small">' + (window.CARTE || []).reduce((n, x) => n + x.items.length, 0) + ' articles repris de la carte du site (menu.js), en lecture seule. Si la carte du site change : lancer <code>node sync-carte.mjs</code> dans le dossier du CRM.</p></section>' +
    '</div>';
  const form = document.getElementById('setForm');
  form.onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    s.depositPct = num(fd.get('depositPct')) ?? 30; s.validDays = num(fd.get('validDays')) || 30;
    ['balanceWhen', 'mailSignature', 'iban', 'conditions'].forEach((k) => s[k] = String(fd.get(k) || '').trim());
    save(true); toast('Réglages enregistrés.');
  };
  document.getElementById('setReset').onclick = () => { s.conditions = DEFAULT_SETTINGS.conditions; save(true); renderSettings(); };
  const download = (name, text, type) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
  document.getElementById('exp').onclick = () => download('crm-chez-lina-' + todayISO() + '.json', JSON.stringify(DB, null, 1), 'application/json');
  document.getElementById('csv').onclick = () => {
    const cols = ['N° devis', 'Statut', 'Type', 'Occasion', 'Client', 'Société', 'Téléphone', 'E-mail', 'Date', 'Créneau', 'Adultes', 'Enfants', 'Total TTC', 'Acompte', 'Envoyé le', 'Source', 'Reçue le'];
    const q = (x) => '"' + String(x ?? '').replace(/"/g, '""') + '"';
    const rows = DB.demandes.map((d) => { const t = totals(d); return [d.ref, STATUS[d.status], (TYPES[d.type] || {}).label, d.occasion, d.clientName, d.company, d.phone, d.email, dateShort(d.date), (CRENEAUX[d.creneau] || {}).label, d.adultes, d.enfants, String(t.total).replace('.', ','), String(t.deposit).replace('.', ','), d.sentAt ? dateShort(d.sentAt.slice(0, 10)) : '', d.source, dateShort(d.createdAt.slice(0, 10))].map(q).join(';'); });
    download('demandes-chez-lina-' + todayISO() + '.csv', '﻿' + [cols.map(q).join(';'), ...rows].join('\n'), 'text/csv');
  };
  document.getElementById('imp').onchange = (e) => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then((txt) => {
      const data = JSON.parse(txt);
      if (!data || !Array.isArray(data.demandes)) throw new Error('fichier non reconnu');
      if (!confirm('Remplacer les ' + DB.demandes.length + ' demande(s) actuelle(s) par les ' + data.demandes.length + ' de la sauvegarde ?')) return;
      if (ONLINE) { DB = normalize(data); Promise.resolve(save(true)).then(() => { toast('Sauvegarde restaurée.'); renderSettings(); }); return; }
      localStorage.setItem(KEY, JSON.stringify(data)); DB = load(); toast('Sauvegarde restaurée.'); renderSettings();
    }).catch((err) => toast('Restauration impossible : ' + err.message));
  };
}

if (ONLINE) { app().innerHTML = '<p class="small">Chargement des demandes…</p>'; pullOnline(); } else route();
