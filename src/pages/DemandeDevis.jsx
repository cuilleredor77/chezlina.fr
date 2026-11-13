import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import { trackEvent } from '../lib/analytics'

// Formulaire de demande de devis : privatisation de la salle, groupe, événement, traiteur, grande commande à emporter.
// La demande part par e-mail à contact@chezlina.fr, dans un format que le CRM Chez Lina sait importer
// (« Nouvelle demande » → « Coller une demande reçue par e-mail »). Les libellés « Clé : valeur » du message
// sont lus par le CRM : ne pas les renommer sans mettre à jour l'import (CRM-CHEZ-LINA/app.js, parseDemande).

const TYPES = [
  { value: 'privatisation', label: 'Privatiser la salle', sub: 'La salle rien que pour vous', icon: '🎉' },
  { value: 'groupe', label: 'Venir en groupe', sub: 'Tables réservées, salle ouverte', icon: '🍽️' },
  { value: 'traiteur', label: 'Traiteur', sub: 'Plats livrés ou à retirer pour votre événement', icon: '🥘' },
  { value: 'emporter', label: 'Grande commande à emporter', sub: 'Plats à retirer chez Lina', icon: '🛍️' },
]
const TYPE_LABEL = {
  privatisation: 'Privatisation de la salle',
  groupe: 'Réservation de groupe',
  traiteur: 'Traiteur',
  emporter: 'Commande à emporter',
}
const OCCASIONS = ['Anniversaire', 'Baptême', 'Repas d’entreprise', 'Pot de départ', 'Mariage', 'Fiançailles', 'Communion', 'Autre']
const PERIODS = {
  midi: 'Midi (11h45 – 14h45)',
  soir: 'Soir (18h45 – 23h45)',
  journee: 'Toute la journée (11h45 – 23h45)',
}

const pad = (n) => String(n).padStart(2, '0')
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
function longDate(value) {
  if (!value) return ''
  return new Date(`${value}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default function DemandeDevis() {
  const minDate = useMemo(() => { const d = new Date(); d.setDate(d.getDate() + 3); return iso(d) }, [])
  const [data, setData] = useState(() => {
    const type = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('type') : ''
    return {
      type: TYPE_LABEL[type] ? type : 'privatisation',
      occasion: '', date: '', period: 'soir', time: '', adults: '', children: '', budget: '',
      needs: '', name: '', company: '', phone: '', email: '', delivery: false, address: '',
    }
  })
  const [error, setError] = useState('')
  const [prepared, setPrepared] = useState(false)
  const [copied, setCopied] = useState(false)
  // Anti-robots, comme sur Cuillère d'Or : champ piège invisible (rempli seulement par les robots) et délai minimal de saisie.
  const [trap, setTrap] = useState('')
  const [openedAt] = useState(() => Date.now())
  const [blocked, setBlocked] = useState(false)
  const update = (k, v) => { setData((old) => ({ ...old, [k]: v })); setError('') }

  const day = data.date ? new Date(`${data.date}T12:00:00`).getDay() : null
  const onSite = data.type === 'privatisation' || data.type === 'groupe'

  const body = useMemo(() => [
    'Bonjour Chez Lina,',
    '',
    'Je souhaite recevoir un devis.',
    '',
    `Type de demande : ${TYPE_LABEL[data.type]}`,
    `Occasion : ${data.occasion || 'Non précisée'}`,
    `Date souhaitée : ${longDate(data.date)} (${data.date})`,
    `Créneau : ${PERIODS[data.period]}`,
    `Heure d’arrivée ou de retrait : ${data.time || 'À convenir'}`,
    `Adultes : ${data.adults || 0}`,
    `Enfants : ${data.children || 0}`,
    `Budget : ${data.budget || 'Non précisé'}`,
    ...(data.type === 'traiteur' ? [`Livraison : ${data.delivery ? 'Oui' : 'Non, retrait sur place'}`, ...(data.delivery ? [`Adresse de livraison : ${data.address}`] : [])] : []),
    '',
    `Nom : ${data.name}`,
    `Société : ${data.company || '—'}`,
    `Téléphone : ${data.phone}`,
    `E-mail : ${data.email}`,
    '',
    `Besoins : ${(data.needs || 'Aucun').replace(/\n+/g, ' ')}`,
    '',
    'Merci de me faire parvenir un devis.',
    data.name,
    '',
    '— Demande envoyée depuis le formulaire chezlina.fr/demande-de-devis',
  ].join('\n'), [data])

  const subject = `Demande de devis - ${TYPE_LABEL[data.type]}${data.date ? ` - ${data.date.split('-').reverse().join('/')}` : ''}`
  const mailtoUrl = `mailto:contact@chezlina.fr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  function validate() {
    if (!data.date) return 'Indiquez la date souhaitée.'
    if (data.date < minDate) return 'Les demandes de devis se font au moins 72 h à l’avance. Pour un besoin urgent, appelez le 06 51 19 77 51.'
    if (day === 1) return 'Le restaurant est fermé le lundi : choisissez une autre date.'
    if (day === 0 && data.type !== 'privatisation' && data.type !== 'traiteur') return 'Le dimanche, le restaurant est fermé au public : seule la privatisation de la salle est possible ce jour-là.'
    if (!(Number(data.adults) > 0)) return 'Indiquez le nombre d’adultes.'
    if (data.type === 'traiteur' && data.delivery && !data.address.trim()) return 'Indiquez l’adresse de livraison.'
    if (!data.name.trim()) return 'Indiquez votre nom.'
    if (!/^[\d\s+().-]{9,}$/.test(data.phone.trim())) return 'Indiquez un numéro de téléphone valide.'
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) return 'Vérifiez votre adresse e-mail.'
    return ''
  }

  function submit(e) {
    e.preventDefault()
    // Robot probable (champ piège rempli ou formulaire envoyé en moins de 4 s) : rien n'est envoyé, sans le signaler.
    if (trap || Date.now() - openedAt < 4000) { setBlocked(true); return }
    const err = validate()
    if (err) { setError(err); return }
    trackEvent('submit_demande_devis', { type: data.type })
    setPrepared(true)
    window.location.href = mailtoUrl
  }

  function copy() {
    navigator.clipboard?.writeText(`À : contact@chezlina.fr\nObjet : ${subject}\n\n${body}`).then(() => setCopied(true), () => setCopied(false))
  }

  return (
    <>
      <PageHero
        crumb="Demande de devis"
        eyebrow="Privatisation · groupes · traiteur"
        title="Demander un devis"
        titleNote="Anniversaire, baptême, repas d’entreprise"
        lede="Quelques informations sur votre événement, et l’équipe de Chez Lina vous répond avec un devis personnalisé."
        photo={{ src: '/images/table-partage.webp', tint: '#2d1e1a', position: '50% 50%' }}
      />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <div className="reservation-card">
            <div className="form-note" style={{ marginBottom: 20 }}>
              Le restaurant vous accueille du mardi au vendredi de 11h45 à 14h45 et de 18h45 à 23h45, et le samedi de 11h45 à 23h45 en service continu.
              Fermé le dimanche, la salle reste privatisable ce jour-là ; fermé le lundi.
              <br />Demande à faire au moins 72 h à l&rsquo;avance. Besoin urgent ? Appelez le <a href="tel:+33651197751">06 51 19 77 51</a>.
            </div>

            {error && <div className="form-error" role="alert">{error}</div>}

            <form noValidate onSubmit={submit}>
              <fieldset className="field" style={{ marginBottom: 20, border: 0, padding: 0 }}>
                <legend style={{ fontWeight: 600, marginBottom: 8 }}>Votre projet <span className="req">*</span></legend>
                <div className="service-choice">
                  {TYPES.map((t) => (
                    <label key={t.value} className={`service-option ${data.type === t.value ? 'selected' : ''}`}>
                      <input type="radio" name="type" value={t.value} checked={data.type === t.value} onChange={() => update('type', t.value)} style={{ display: 'none' }} />
                      <span className="service-icon" aria-hidden="true">{t.icon}</span>
                      <span><strong>{t.label}</strong><div className="service-sub">{t.sub}</div></span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="dd-occasion">Occasion</label>
                  <select id="dd-occasion" value={data.occasion} onChange={(e) => update('occasion', e.target.value)}>
                    <option value="">Choisir…</option>
                    {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="dd-date">Date souhaitée <span className="req">*</span></label>
                  <input id="dd-date" type="date" required min={minDate} value={data.date} onChange={(e) => update('date', e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="dd-period">Créneau <span className="req">*</span></label>
                  <select id="dd-period" value={data.period} onChange={(e) => update('period', e.target.value)}>
                    {Object.entries(PERIODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="dd-time">{onSite ? 'Heure d’arrivée' : 'Heure de retrait ou de livraison'}</label>
                  <input id="dd-time" type="time" min="11:45" max="23:45" value={data.time} onChange={(e) => update('time', e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="dd-adults">Adultes <span className="req">*</span></label>
                  <input id="dd-adults" type="number" inputMode="numeric" min="1" required value={data.adults} onChange={(e) => update('adults', e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="dd-children">Enfants (jusqu’à 12 ans)</label>
                  <input id="dd-children" type="number" inputMode="numeric" min="0" value={data.children} onChange={(e) => update('children', e.target.value)} />
                </div>
              </div>

              {data.type === 'traiteur' && (
                <div className="field" style={{ marginBottom: 16 }}>
                  <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 400 }}>
                    <input type="checkbox" checked={data.delivery} onChange={(e) => update('delivery', e.target.checked)} />
                    Je souhaite une livraison
                  </label>
                  {data.delivery && (
                    <input aria-label="Adresse de livraison" placeholder="Adresse de livraison" style={{ marginTop: 8 }} value={data.address} onChange={(e) => update('address', e.target.value)} />
                  )}
                </div>
              )}

              <div className="field" style={{ marginBottom: 16 }}>
                <label htmlFor="dd-needs">Vos envies et besoins</label>
                <textarea id="dd-needs" rows={4} placeholder="Plats souhaités, allergies, gâteau apporté, décoration, musique, budget…" value={data.needs} onChange={(e) => update('needs', e.target.value)} />
              </div>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="dd-budget">Budget indicatif</label>
                  <input id="dd-budget" type="text" placeholder="Facultatif" value={data.budget} onChange={(e) => update('budget', e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="dd-company">Société ou association</label>
                  <input id="dd-company" type="text" autoComplete="organization" placeholder="Facultatif" value={data.company} onChange={(e) => update('company', e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="dd-name">Prénom et nom <span className="req">*</span></label>
                  <input id="dd-name" type="text" autoComplete="name" required value={data.name} onChange={(e) => update('name', e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="dd-phone">Téléphone <span className="req">*</span></label>
                  <input id="dd-phone" type="tel" autoComplete="tel" inputMode="tel" required value={data.phone} onChange={(e) => update('phone', e.target.value)} />
                </div>
              </div>

              <div className="field" style={{ marginBottom: 16 }}>
                <label htmlFor="dd-email">E-mail</label>
                <input id="dd-email" type="email" autoComplete="email" placeholder="Pour recevoir le devis" value={data.email} onChange={(e) => update('email', e.target.value)} />
              </div>

              {/* Champ piège : invisible pour les personnes, rempli par les robots. */}
              <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
                <label htmlFor="dd-website">Site web</label>
                <input id="dd-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
              </div>

              <div className="form-note">
                Rien n&rsquo;est transmis avant que vous envoyiez l&rsquo;e-mail. Vos coordonnées servent uniquement à vous répondre. <Link to="/politique-confidentialite" style={{ textDecoration: 'underline' }}>Données personnelles</Link>.
              </div>

              <div className="form-actions">
                <button type="submit" className="button button-primary" style={{ flex: 1 }}>
                  ✉️ Envoyer ma demande <span style={{ fontWeight: 400, opacity: 0.85 }}>par e-mail</span>
                </button>
              </div>

              {blocked && <div className="reservation-prepared" role="status"><strong>Merci.</strong></div>}

              {prepared && !blocked && (
                <div className="reservation-prepared" role="status">
                  <strong>Votre demande est prête.</strong>
                  <span>Dans votre messagerie, vérifiez le message puis appuyez sur « Envoyer ». Si elle ne s&rsquo;est pas ouverte, utilisez un des liens ci-dessous ou appelez le 06 51 19 77 51.</span>
                  <a href={mailtoUrl}>Ouvrir ma messagerie</a>
                  <button type="button" className="button button-ghost" onClick={copy}>{copied ? 'Demande copiée : collez-la dans un e-mail à contact@chezlina.fr' : 'Copier ma demande'}</button>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
