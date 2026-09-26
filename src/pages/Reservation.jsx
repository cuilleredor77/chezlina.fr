import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import { trackEvent } from '../lib/analytics'

const WHATSAPP_NUMBER = '33651197751'
const STEP_MINUTES = 15

function createTimeSlots(startHour, startMinute, count) {
  return Array.from({ length: count }, (_, index) => {
    const total = startHour * 60 + startMinute + index * STEP_MINUTES
    const hours = Math.floor(total / 60)
    const minutes = total % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  })
}

// Dernier créneau env. 30 min avant la fermeture effective (11h45-15h / 18h30-23h45 en semaine, 11h45-15h30 le dimanche)
const weekdayTimeSlots = [...createTimeSlots(11, 45, 12), ...createTimeSlots(18, 30, 20)]
const sundayTimeSlots = createTimeSlots(11, 45, 14)

function getParisNow() {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date())
  const value = Object.fromEntries(parts.map(({ type, value: v }) => [type, v]))
  return { date: `${value.year}-${value.month}-${value.day}`, minutes: Number(value.hour) * 60 + Number(value.minute) }
}

function getParisDate() {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const value = Object.fromEntries(parts.map(({ type, value: v }) => [type, v]))
  return `${value.year}-${value.month}-${value.day}`
}

function getDaySlots(date) {
  const [year, month, day] = date.split('-').map(Number)
  const dayOfWeek = new Date(year, month - 1, day).getDay() // 0 = dimanche, 1 = lundi
  if (dayOfWeek === 1) return [] // fermé le lundi
  if (dayOfWeek === 0) return sundayTimeSlots // dimanche : midi uniquement, jusqu'à 15h30
  return weekdayTimeSlots
}

function getAvailableTimeSlots(date, leadMinutes) {
  const daySlots = getDaySlots(date)
  const now = getParisNow()
  if (date !== now.date) return daySlots
  const firstPossibleMinute = Math.ceil((now.minutes + leadMinutes) / STEP_MINUTES) * STEP_MINUTES
  return daySlots.filter((slot) => {
    const [hours, minutes] = slot.split(':').map(Number)
    return hours * 60 + minutes >= firstPossibleMinute
  })
}

function getTableTimeSlots(date) {
  return getAvailableTimeSlots(date, 1)
}

function getTakeawayTimeSlots(date) {
  return getAvailableTimeSlots(date, 30)
}

function formatBookingDate(date) {
  if (!date) return ''
  const [year, month, day] = date.split('-').map(Number)
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(year, month - 1, day))
}

function formatBookingTime(time) {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  return minutes === '00' ? `${Number(hours)} h` : `${Number(hours)} h ${minutes}`
}

const initial = {
  service: 'table',
  date: '',
  time: '',
  period: 'midi',
  guests: '',
  eventType: '',
  firstName: '',
  phone: '',
  email: '',
  notes: '',
  marketingOptIn: false,
}

function presetServiceFromUrl() {
  const type = new URLSearchParams(window.location.search).get('type')
  if (type === 'emporter') return 'takeaway'
  if (type === 'privatisation') return 'privatisation'
  return 'table'
}

export default function Reservation() {
  const minimumDate = getParisDate()
  const [data, setData] = useState({ ...initial, date: minimumDate, service: presetServiceFromUrl() })
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [prepared, setPrepared] = useState(false)

  const availableTimeSlots = useMemo(
    () => (data.service === 'takeaway' ? getTakeawayTimeSlots(data.date) : getTableTimeSlots(data.date)),
    [data.date, data.service],
  )

  useEffect(() => {
    if (!availableTimeSlots.includes(data.time)) {
      setData((old) => ({ ...old, time: availableTimeSlots[0] || '' }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableTimeSlots])

  const update = (key, value) => {
    setPrepared(false)
    setData((old) => ({ ...old, [key]: value }))
  }

  const isPrivatisation = data.service === 'privatisation'
  const quantityLabel = isPrivatisation ? 'Nombre d’invités' : 'Nombre de personnes'
  const requestLabel = data.service === 'table' ? 'réserver une table' : data.service === 'takeaway' ? 'passer une commande à emporter' : 'privatiser la salle'
  const notesLabel = data.service === 'table' ? 'Précisions' : data.service === 'takeaway' ? 'Commande souhaitée' : 'Précisions sur l’événement'
  const visitDetails = data.service === 'table' || isPrivatisation ? `\n${quantityLabel} : ${data.guests}` : ''
  const privatisationDetails = isPrivatisation ? `\nType d’événement : ${data.eventType}` : ''

  const message = useMemo(() => {
    const emailLine = data.email.trim() ? `\nE-mail : ${data.email}` : ''
    const dateLabel = data.service === 'table' ? 'Date souhaitée' : data.service === 'takeaway' ? 'Date de retrait souhaitée' : 'Date souhaitée'
    const timeLabel = isPrivatisation ? 'Créneau souhaité' : data.service === 'table' ? 'Heure souhaitée' : 'Heure de retrait souhaitée'
    const timeValue = isPrivatisation ? (data.period === 'midi' ? 'Midi' : 'Soir') : formatBookingTime(data.time)
    const privatisationNote = isPrivatisation ? '\n\nLocation de salle à partir de 450 €, repas en supplément selon le menu choisi. Devis personnalisé sous 48 h.' : ''
    return `Bonjour Chez Lina,\n\nJe souhaite ${requestLabel}.\n\n${dateLabel} : ${formatBookingDate(data.date)}\n${timeLabel} : ${timeValue}${visitDetails}${privatisationDetails}\n\nNom : ${data.firstName}\nTéléphone : ${data.phone}${emailLine}\n\n${notesLabel} : ${data.notes || 'Aucune'}${data.marketingOptIn ? '\n\nJe souhaite recevoir par WhatsApp les actualités et offres de Chez Lina.' : ''}${privatisationNote}\n\nMerci de me confirmer ma demande.\n\n${data.firstName}`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, notesLabel, requestLabel, visitDetails, privatisationDetails, isPrivatisation])

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

  const validateVisit = () => {
    if (isPrivatisation) {
      if (!data.date || !data.guests || !data.eventType.trim()) {
        setError('Choisissez une date, indiquez le nombre d’invités et le type d’événement.')
        return false
      }
      if (Number(data.guests) < 1) {
        setError('Merci d’indiquer un nombre d’invités valide.')
        return false
      }
      if (data.date < minimumDate) {
        setError('Merci de choisir une date à partir du jour même.')
        return false
      }
      return true
    }
    if (!data.date || !data.time || (data.service === 'table' && !data.guests)) {
      setError(data.service === 'table' ? 'Choisissez une date, une heure et indiquez le nombre de personnes.' : 'Choisissez une date et un horaire de retrait.')
      return false
    }
    if (data.service === 'table' && (Number(data.guests) < 1 || Number(data.guests) > 30)) {
      setError('Merci d’indiquer une quantité comprise entre 1 et 30.')
      return false
    }
    if (data.date < minimumDate) {
      setError('Merci de choisir une date à partir du jour même.')
      return false
    }
    if (!availableTimeSlots.includes(data.time)) {
      setError(
        data.service === 'takeaway'
          ? 'Le premier retrait possible est proposé au moins 30 minutes après votre demande. Choisissez un créneau disponible ou une autre date.'
          : 'Choisissez l’un des créneaux proposés pour le déjeuner ou le dîner.',
      )
      return false
    }
    return true
  }

  const submit = (e) => {
    e.preventDefault()
    if (step === 1) {
      if (!validateVisit()) return
      setError('')
      setStep(2)
      return
    }
    if (!data.firstName.trim() || !data.phone.trim()) {
      setError('Indiquez votre nom et votre numéro de téléphone.')
      return
    }
    if (data.service === 'takeaway' && !data.notes.trim()) {
      setError('Indiquez les plats et les quantités souhaités pour préparer votre commande.')
      return
    }
    setError('')
    setPrepared(true)
    trackEvent('reservation_submit', { type: data.service })
    window.location.href = whatsappUrl
  }

  return (
    <>
      <PageHero
        crumb="Réserver ou commander"
        eyebrow="Sur place, à emporter ou en privatisation"
        title="Réserver ou commander"
        lede="Réservez une table, commandez à emporter ou privatisez la salle."
      />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <div className="reservation-card">
            <p style={{ color: 'var(--brown-muted)' }}>Deux étapes rapides pour préparer votre demande dans WhatsApp.</p>

            <div className="steps">
              <div className={`step ${step === 1 ? 'active' : ''}`}>
                <span className="step-num">1</span> Votre demande
              </div>
              <div className={`step ${step === 2 ? 'active' : ''}`}>
                <span className="step-num">2</span> Vos coordonnées
              </div>
            </div>

            {error && <div className="form-error" role="alert">{error}</div>}

            <form noValidate onSubmit={submit}>
              {step === 1 ? (
                <>
                  <div className="field" style={{ marginBottom: 20 }}>
                    <label>Que souhaitez-vous faire ?</label>
                    <div className="service-choice">
                      <label className={`service-option ${data.service === 'table' ? 'selected' : ''}`}>
                        <input type="radio" name="service" value="table" checked={data.service === 'table'} onChange={() => update('service', 'table')} style={{ display: 'none' }} />
                        <span className="service-icon" aria-hidden="true">🍴</span>
                        <span>
                          <strong>Réserver une table</strong>
                          <div style={{ fontSize: '0.85rem', color: 'var(--brown-muted)' }}>Déjeuner ou dîner sur place</div>
                        </span>
                      </label>
                      <label className={`service-option ${data.service === 'takeaway' ? 'selected' : ''}`}>
                        <input type="radio" name="service" value="takeaway" checked={data.service === 'takeaway'} onChange={() => update('service', 'takeaway')} style={{ display: 'none' }} />
                        <span className="service-icon" aria-hidden="true">🛍️</span>
                        <span>
                          <strong>Commander à emporter</strong>
                          <div style={{ fontSize: '0.85rem', color: 'var(--brown-muted)' }}>Retirer votre commande chez Lina</div>
                        </span>
                      </label>
                      <label className={`service-option ${isPrivatisation ? 'selected' : ''}`}>
                        <input type="radio" name="service" value="privatisation" checked={isPrivatisation} onChange={() => update('service', 'privatisation')} style={{ display: 'none' }} />
                        <span className="service-icon" aria-hidden="true">🎉</span>
                        <span>
                          <strong>Privatiser la salle</strong>
                          <div style={{ fontSize: '0.85rem', color: 'var(--brown-muted)' }}>Anniversaire, baptême, repas d’entreprise…</div>
                        </span>
                      </label>
                    </div>
                  </div>

                  {isPrivatisation && (
                    <div className="form-note" style={{ marginBottom: 20 }}>
                      Location de salle à partir de 450 €, repas en supplément selon le menu choisi. Devis personnalisé sous 48 h.
                    </div>
                  )}

                  {isPrivatisation ? (
                    <>
                      <div className="form-row">
                        <div className="field">
                          <label htmlFor="date">Date souhaitée <span className="req">*</span></label>
                          <input id="date" type="date" required min={minimumDate} value={data.date} onChange={(e) => update('date', e.target.value)} />
                        </div>
                        <div className="field">
                          <label htmlFor="period">Créneau <span className="req">*</span></label>
                          <select id="period" required value={data.period} onChange={(e) => update('period', e.target.value)}>
                            <option value="midi">Midi</option>
                            <option value="soir">Soir</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="field">
                          <label htmlFor="guests">{quantityLabel} <span className="req">*</span></label>
                          <input id="guests" type="number" inputMode="numeric" min="1" required value={data.guests} onChange={(e) => update('guests', e.target.value)} />
                        </div>
                        <div className="field">
                          <label htmlFor="eventType">Type d’événement <span className="req">*</span></label>
                          <input id="eventType" type="text" required placeholder="Anniversaire, baptême, repas d’entreprise…" value={data.eventType} onChange={(e) => update('eventType', e.target.value)} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="form-row">
                        <div className="field">
                          <label htmlFor="date">{data.service === 'table' ? 'Date' : 'Date de retrait'} <span className="req">*</span></label>
                          <input id="date" type="date" required min={minimumDate} value={data.date} onChange={(e) => update('date', e.target.value)} />
                        </div>
                        <div className="field">
                          <label htmlFor="time">{data.service === 'table' ? 'Heure' : 'Heure de retrait'} <span className="req">*</span></label>
                          <select id="time" required value={data.time} disabled={availableTimeSlots.length === 0} onChange={(e) => update('time', e.target.value)}>
                            {availableTimeSlots.length === 0 ? (
                              <option value="">
                                {getDaySlots(data.date).length === 0 ? 'Fermé ce jour-là' : (data.service === 'table' ? 'Plus de créneau disponible ce jour' : 'Plus de retrait disponible ce jour')}
                              </option>
                            ) : (
                              <>
                                {availableTimeSlots.some((slot) => Number(slot.split(':')[0]) < 17) && (
                                  <optgroup label="Service du midi">
                                    {availableTimeSlots.filter((slot) => Number(slot.split(':')[0]) < 17).map((slot) => (
                                      <option key={slot} value={slot}>{formatBookingTime(slot)}</option>
                                    ))}
                                  </optgroup>
                                )}
                                {availableTimeSlots.some((slot) => Number(slot.split(':')[0]) >= 17) && (
                                  <optgroup label="Service du soir">
                                    {availableTimeSlots.filter((slot) => Number(slot.split(':')[0]) >= 17).map((slot) => (
                                      <option key={slot} value={slot}>{formatBookingTime(slot)}</option>
                                    ))}
                                  </optgroup>
                                )}
                              </>
                            )}
                          </select>
                          <span style={{ fontSize: '0.78rem', color: 'var(--brown-muted)' }}>
                            {data.service === 'table'
                              ? 'Créneaux proposés toutes les 15 minutes.'
                              : 'Premier retrait au minimum 30 minutes après la demande, puis toutes les 15 minutes. Horaire soumis à confirmation.'}
                          </span>
                        </div>
                      </div>

                      {data.service === 'table' && (
                        <div className="field" style={{ marginBottom: 24 }}>
                          <label htmlFor="guests">{quantityLabel} <span className="req">*</span></label>
                          <input id="guests" type="number" inputMode="numeric" min="1" max="30" required value={data.guests} onChange={(e) => update('guests', e.target.value)} />
                        </div>
                      )}
                    </>
                  )}

                  <button type="submit" className="button button-primary button-block">Continuer</button>
                </>
              ) : (
                <>
                  <div className="reservation-summary">
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--brown-muted)' }}>{data.service === 'table' ? 'Table' : data.service === 'takeaway' ? 'Retrait à emporter' : 'Privatisation de la salle'}</span>
                      <strong style={{ display: 'block' }}>{formatBookingDate(data.date)} · {isPrivatisation ? (data.period === 'midi' ? 'Midi' : 'Soir') : formatBookingTime(data.time)}</strong>
                      {(data.service === 'table' || isPrivatisation) && <small style={{ color: 'var(--brown-muted)' }}>{quantityLabel} : {data.guests}</small>}
                    </div>
                    <button type="button" className="button button-ghost" style={{ minHeight: 'auto', padding: '8px 16px' }} onClick={() => { setError(''); setStep(1) }}>Modifier</button>
                  </div>

                  <div className="field" style={{ marginBottom: 20 }}>
                    <label htmlFor="name">Nom <span className="req">*</span></label>
                    <input id="name" type="text" required autoComplete="name" placeholder="Votre nom" value={data.firstName} onChange={(e) => update('firstName', e.target.value)} />
                  </div>

                  <div className="form-row">
                    <div className="field">
                      <label htmlFor="phone">Numéro de téléphone <span className="req">*</span></label>
                      <input id="phone" type="tel" required autoComplete="tel" placeholder="Votre numéro" value={data.phone} onChange={(e) => update('phone', e.target.value)} />
                    </div>
                    <div className="field">
                      <label htmlFor="email">Adresse e-mail <span style={{ color: 'var(--brown-muted)', fontWeight: 400 }}>(facultatif)</span></label>
                      <input id="email" type="email" autoComplete="email" placeholder="Votre adresse e-mail" value={data.email} onChange={(e) => update('email', e.target.value)} />
                    </div>
                  </div>

                  <div className="field" style={{ marginBottom: 20 }}>
                    <label htmlFor="notes" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                      <span>{notesLabel}{data.service === 'takeaway' && <span className="req"> *</span>}</span>
                      {data.service === 'takeaway' && (
                        <Link to="/la-carte" target="_blank" rel="noreferrer" style={{ fontSize: '0.82rem', fontWeight: 400, textDecoration: 'underline' }}>
                          Voir la carte ↗
                        </Link>
                      )}
                    </label>
                    <textarea
                      id="notes"
                      required={data.service === 'takeaway'}
                      placeholder={data.service === 'table' ? 'Allergies ou demande particulière…' : isPrivatisation ? 'Menu envisagé, horaires, disposition de la salle…' : 'Ex. 2 suprêmes de volaille, 1 panga, 2 bissaps…'}
                      value={data.notes}
                      onChange={(e) => update('notes', e.target.value)}
                    />
                  </div>

                  <label className="checkbox-row" htmlFor="marketingOptIn">
                    <input
                      id="marketingOptIn"
                      type="checkbox"
                      checked={data.marketingOptIn}
                      onChange={(e) => update('marketingOptIn', e.target.checked)}
                      aria-label="Recevoir les actualités de Chez Lina sur WhatsApp (facultatif)"
                    />
                    <span aria-hidden="true">
                      Recevoir les actualités de Chez Lina sur WhatsApp.
                      <br /><span style={{ color: 'var(--brown-muted)', fontSize: '0.85rem' }}>Facultatif.</span>
                    </span>
                  </label>

                  <div className="form-note">
                    Rien n&rsquo;est transmis avant que vous ouvriez WhatsApp. <Link to="/politique-confidentialite" style={{ textDecoration: 'underline' }}>Données personnelles</Link>.
                  </div>

                  <div className="form-actions">
                    <button type="button" className="button button-ghost" onClick={() => { setError(''); setStep(1) }}>Retour</button>
                    <button type="submit" className="button button-primary" style={{ flex: 1 }}>
                      💬 Confirmer ma demande <span style={{ fontWeight: 400, opacity: 0.85 }}>via WhatsApp</span>
                    </button>
                  </div>
                  <p style={{ marginTop: 16, fontSize: '0.82rem', color: 'var(--brown-muted)', textAlign: 'center' }}>
                    Votre demande sera confirmée personnellement par Chez Lina après l&rsquo;envoi du message.
                  </p>
                  {prepared && (
                    <div className="reservation-prepared" role="status">
                      <strong>Votre message est prêt.</strong>
                      <span>Dans WhatsApp, vérifiez votre demande puis appuyez sur « Envoyer ». Si l&rsquo;application ne s&rsquo;est pas ouverte, utilisez le lien ci-dessous.</span>
                      <a href={whatsappUrl}>Ouvrir WhatsApp</a>
                    </div>
                  )}
                </>
              )}
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
