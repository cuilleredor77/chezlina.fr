import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import { trackEvent } from '../lib/analytics'
import { menuSections } from '../data/menu'

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

// Services : 11h45-14h45 / 18h45-23h45 du mardi au vendredi, 11h45-23h45 en continu le samedi
const WEEKDAY_SERVICES = [[11 * 60 + 45, 14 * 60 + 45], [18 * 60 + 45, 23 * 60 + 45]]
const SATURDAY_SERVICES = [[11 * 60 + 45, 23 * 60 + 45]]
// Dernière réservation 45 min avant la fermeture, dernier retrait à emporter 15 min avant
const LAST_SLOT_BEFORE_CLOSING = { table: 45, takeaway: 15 }

function createServiceSlots(services, minutesBeforeClosing) {
  return services.flatMap(([open, close]) => {
    const count = Math.floor((close - minutesBeforeClosing - open) / STEP_MINUTES) + 1
    return createTimeSlots(Math.floor(open / 60), open % 60, count)
  })
}

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

function addDays(dateStr, days) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function isSunday(date) {
  if (!date) return false
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day).getDay() === 0
}

const OPENING_HOURS_NOTE = 'Mar–ven : 11 h 45–14 h 45 et 18 h 45–23 h 45 · Sam : 11 h 45–23 h 45 en continu · Fermé dim. (privatisation possible) et lun.'

function isSaturday(date) {
  if (!date) return false
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day).getDay() === 6
}

function getDaySlots(date, service) {
  const [year, month, day] = date.split('-').map(Number)
  const dayOfWeek = new Date(year, month - 1, day).getDay() // 0 = dimanche, 1 = lundi
  if (dayOfWeek === 0 || dayOfWeek === 1) return [] // fermé le dimanche (privatisation possible) et le lundi
  const services = dayOfWeek === 6 ? SATURDAY_SERVICES : WEEKDAY_SERVICES // samedi : service continu
  return createServiceSlots(services, LAST_SLOT_BEFORE_CLOSING[service])
}

function getAvailableTimeSlots(date, leadMinutes, service) {
  const daySlots = getDaySlots(date, service)
  const now = getParisNow()
  if (date !== now.date) return daySlots
  const firstPossibleMinute = Math.ceil((now.minutes + leadMinutes) / STEP_MINUTES) * STEP_MINUTES
  return daySlots.filter((slot) => {
    const [hours, minutes] = slot.split(':').map(Number)
    return hours * 60 + minutes >= firstPossibleMinute
  })
}

function getTableTimeSlots(date) {
  return getAvailableTimeSlots(date, 1, 'table')
}

function getTakeawayTimeSlots(date) {
  return getAvailableTimeSlots(date, 30, 'takeaway')
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

function formatPeriod(period) {
  if (period === 'soir') return 'Soir'
  if (period === 'journee') return 'Toute la journée'
  return 'Midi'
}

// Commande à emporter : plats de la carte à cocher, regroupés comme sur la page menu
const ORDER_GROUPS = [
  { title: 'Entrées', sections: ['Les entrées'] },
  { title: 'Plats', sections: ['Les viandes', 'Les poissons'] },
  { title: 'Accompagnements en supplément', sections: ['Les accompagnements'] },
  { title: 'Desserts', sections: ['Les desserts'] },
]

// Plat du jour : pas de prix fixe sur la carte, confirmé par le restaurant
const DAILY_DISH = { id: 'Plat du jour', price: null }

const orderGroups = ORDER_GROUPS.map((group) => ({
  title: group.title,
  items: [...(group.title === 'Plats' ? [DAILY_DISH] : []), ...menuSections
    .filter((section) => group.sections.includes(section.title))
    .flatMap((section) => section.items)
    .flatMap((item) => (item.priceOptions
      ? item.priceOptions.map((option) => ({ id: `${item.name} (${option.label})`, price: option.price }))
      : [{ id: item.name, price: item.price }]))],
}))

const orderItems = orderGroups.flatMap((group) => group.items)

function parseEuro(price) {
  return Number(price.replace(/[^\d,]/g, '').replace(',', '.'))
}

function formatEuro(amount) {
  return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: Number.isInteger(amount) ? 0 : 2, maximumFractionDigits: 2 })} €`
}

function formatLineTotal(line) {
  return line.total === null ? 'prix confirmé par Chez Lina' : formatEuro(line.total)
}

function getOrderLines(order) {
  return orderItems
    .filter((item) => order[item.id] > 0)
    .map((item) => ({ ...item, qty: order[item.id], total: item.price ? order[item.id] * parseEuro(item.price) : null }))
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
  order: {},
  marketingOptIn: false,
}

export default function Reservation() {
  // Date du jour calculée dans le navigateur (et non figée au moment du pré-rendu)
  const [minimumDate, setMinimumDate] = useState('')
  const minimumPrivatisationDate = minimumDate ? addDays(minimumDate, 3) : ''
  const [data, setData] = useState(initial)
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [prepared, setPrepared] = useState(false)

  useEffect(() => {
    const today = getParisDate()
    setMinimumDate(today)
    const type = new URLSearchParams(window.location.search).get('type')
    if (type === 'emporter') {
      setData((old) => ({ ...old, service: 'takeaway', date: today }))
    } else if (type === 'privatisation') {
      setData((old) => ({ ...old, service: 'privatisation', date: addDays(today, 3) }))
    } else {
      setData((old) => ({ ...old, date: today }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  useEffect(() => {
    if (minimumPrivatisationDate && data.service === 'privatisation' && data.date < minimumPrivatisationDate) {
      setData((old) => ({ ...old, date: minimumPrivatisationDate }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.service])

  const update = (key, value) => {
    setPrepared(false)
    setData((old) => ({ ...old, [key]: value }))
  }

  const isPrivatisation = data.service === 'privatisation'
  const quantityLabel = isPrivatisation ? 'Nombre d’invités' : 'Nombre de personnes'
  const requestLabel = data.service === 'table' ? 'réserver une table' : data.service === 'takeaway' ? 'passer une commande à emporter' : 'privatiser la salle'
  const notesLabel = data.service === 'table' ? 'Précisions' : data.service === 'takeaway' ? 'Commentaire' : 'Précisions sur l’événement'
  const orderLines = getOrderLines(data.order)
  const orderTotal = orderLines.reduce((sum, line) => sum + (line.total || 0), 0)
  const orderCount = orderLines.reduce((sum, line) => sum + line.qty, 0)
  const hasUnpricedLine = orderLines.some((line) => line.total === null)
  const totalLabel = hasUnpricedLine ? 'Total estimé (hors plat du jour)' : 'Total estimé'
  const orderDetails = data.service === 'takeaway'
    ? `\n\nCommande :\n${orderLines.map((line) => `- ${line.qty} × ${line.id} — ${formatLineTotal(line)}`).join('\n')}\n${totalLabel} : ${formatEuro(orderTotal)}`
    : ''

  const setQty = (id, qty) => {
    setPrepared(false)
    setData((old) => {
      const order = { ...old.order }
      if (qty > 0) order[id] = qty
      else delete order[id]
      return { ...old, order }
    })
  }
  const visitDetails = data.service === 'table' || isPrivatisation ? `\n${quantityLabel} : ${data.guests}` : ''
  const privatisationDetails = isPrivatisation ? `\nType d’événement : ${data.eventType}` : ''

  const message = useMemo(() => {
    const emailLine = data.email.trim() ? `\nE-mail : ${data.email}` : ''
    const dateLabel = data.service === 'table' ? 'Date souhaitée' : data.service === 'takeaway' ? 'Date de retrait souhaitée' : 'Date souhaitée'
    const timeLabel = isPrivatisation ? 'Créneau souhaité' : data.service === 'table' ? 'Heure souhaitée' : 'Heure de retrait souhaitée'
    const timeValue = isPrivatisation ? formatPeriod(data.period) : formatBookingTime(data.time)
    const privatisationNote = isPrivatisation ? '\n\nLocation de salle à partir de 450 €, repas en supplément selon le menu choisi. Devis personnalisé sous 48 h.' : ''
    return `Bonjour Chez Lina,\n\nJe souhaite ${requestLabel}.\n\n${dateLabel} : ${formatBookingDate(data.date)}\n${timeLabel} : ${timeValue}${visitDetails}${privatisationDetails}${orderDetails}\n\nNom : ${data.firstName}\nTéléphone : ${data.phone}${emailLine}\n\n${notesLabel} : ${data.notes || (data.service === 'takeaway' ? 'Aucun' : 'Aucune')}${data.marketingOptIn ? '\n\nJe souhaite recevoir par WhatsApp les actualités et offres de Chez Lina.' : ''}${privatisationNote}\n\nMerci de me confirmer ma demande.\n\n${data.firstName}`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, notesLabel, requestLabel, visitDetails, privatisationDetails, orderDetails, isPrivatisation])

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  const mailtoUrl = `mailto:contact@chezlina.fr?subject=${encodeURIComponent('Demande de privatisation - Chez Lina')}&body=${encodeURIComponent(message)}`
  const submitUrl = isPrivatisation ? mailtoUrl : whatsappUrl

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
      if (data.date < minimumPrivatisationDate) {
        setError('Les demandes de privatisation doivent être faites au moins 72 h à l’avance. Pour un besoin urgent, merci de nous appeler directement au 06 51 19 77 51.')
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
    if (data.service === 'takeaway' && orderLines.length === 0) {
      setError('Cochez au moins un plat pour préparer votre commande.')
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
    setError('')
    setPrepared(true)
    trackEvent('reservation_submit', { type: data.service })
    window.location.href = submitUrl
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
            <p style={{ color: 'var(--brown-muted)' }}>
              Deux étapes rapides pour préparer votre demande {isPrivatisation ? 'par e-mail' : 'dans WhatsApp'}.
            </p>

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
                          <div className="service-sub">Sur place</div>
                        </span>
                      </label>
                      <label className={`service-option ${data.service === 'takeaway' ? 'selected' : ''}`}>
                        <input type="radio" name="service" value="takeaway" checked={data.service === 'takeaway'} onChange={() => update('service', 'takeaway')} style={{ display: 'none' }} />
                        <span className="service-icon" aria-hidden="true">🛍️</span>
                        <span>
                          <strong>Commander à emporter</strong>
                          <div className="service-sub">Retrait chez Lina</div>
                        </span>
                      </label>
                      <label className={`service-option ${isPrivatisation ? 'selected' : ''}`}>
                        <input type="radio" name="service" value="privatisation" checked={isPrivatisation} onChange={() => update('service', 'privatisation')} style={{ display: 'none' }} />
                        <span className="service-icon" aria-hidden="true">🎉</span>
                        <span>
                          <strong>Privatiser la salle</strong>
                          <div className="service-sub">Événements</div>
                        </span>
                      </label>
                    </div>
                  </div>

                  {isPrivatisation && (
                    <div className="form-note" style={{ marginBottom: 20 }}>
                      Location de salle à partir de 450 €, repas en supplément selon le menu choisi. Devis personnalisé sous 48 h.
                      <br />La salle peut aussi être privatisée le dimanche, jour de fermeture du restaurant.
                      <br />Demande à faire au moins 72 h à l&rsquo;avance. Besoin urgent ? Appelez-nous directement au <a href="tel:+33651197751">06 51 19 77 51</a>.
                    </div>
                  )}

                  {isPrivatisation ? (
                    <>
                      <div className="form-row">
                        <div className="field">
                          <label htmlFor="date">Date souhaitée <span className="req">*</span></label>
                          <input id="date" type="date" required min={minimumPrivatisationDate} value={data.date} onChange={(e) => update('date', e.target.value)} />
                        </div>
                        <div className="field">
                          <label htmlFor="period">Créneau <span className="req">*</span></label>
                          <select id="period" required value={data.period} onChange={(e) => update('period', e.target.value)}>
                            <option value="midi">Midi</option>
                            <option value="soir">Soir</option>
                            <option value="journee">Toute la journée</option>
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
                      <div className={`form-row form-row-dt ${data.service === 'table' ? 'form-row-3' : ''}`} style={{ marginBottom: 8 }}>
                        <div className="field">
                          <label htmlFor="date">{data.service === 'table' ? 'Date' : 'Date de retrait'} <span className="req">*</span></label>
                          <input id="date" type="date" required min={minimumDate} value={data.date} onChange={(e) => update('date', e.target.value)} />
                        </div>
                        <div className="field">
                          <label htmlFor="time">{data.service === 'table' ? 'Heure' : 'Heure de retrait souhaitée'} <span className="req">*</span></label>
                          <select id="time" required value={data.time} disabled={availableTimeSlots.length === 0} onChange={(e) => update('time', e.target.value)}>
                            {availableTimeSlots.length === 0 ? (
                              <option value="">
                                {getDaySlots(data.date, data.service).length === 0 ? 'Fermé ce jour-là' : (data.service === 'table' ? 'Plus de créneau disponible ce jour' : 'Plus de retrait disponible ce jour')}
                              </option>
                            ) : (
                              isSaturday(data.date) ? (
                                <optgroup label="Service continu">
                                  {availableTimeSlots.map((slot) => (
                                    <option key={slot} value={slot}>{formatBookingTime(slot)}</option>
                                  ))}
                                </optgroup>
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
                              )
                            )}
                          </select>
                        </div>
                        {data.service === 'table' && (
                          <div className="field">
                            <label htmlFor="guests">Personnes <span className="req">*</span></label>
                            <input id="guests" type="number" inputMode="numeric" min="1" max="30" required value={data.guests} onChange={(e) => update('guests', e.target.value)} />
                          </div>
                        )}
                      </div>
                      <p className="hours-hint">
                        {OPENING_HOURS_NOTE}{' '}
                        {data.service === 'table'
                          ? 'Dernière réservation 45 min avant la fermeture.'
                          : 'Retrait dès 30 min après la commande, jusqu’à 15 min avant la fermeture.'}
                      </p>

                      {isSunday(data.date) && (
                        <div className="form-note" style={{ marginBottom: 20 }}>
                          Le restaurant est fermé le dimanche, mais il est possible de le privatiser ce jour-là : choisissez « Privatiser la salle » ou appelez-nous au <a href="tel:+33651197751">06 51 19 77 51</a>.
                        </div>
                      )}

                      {data.service === 'takeaway' && (
                        <fieldset className="order-picker">
                          <legend>
                            Votre commande <span className="req">*</span>
                            <Link to="/la-carte" target="_blank" rel="noreferrer" className="order-picker-link">Voir la carte ↗</Link>
                          </legend>
                          {orderGroups.map((group) => (
                            <div key={group.title} className="order-group">
                              <h3>{group.title}</h3>
                              {group.items.map((item) => {
                                const qty = data.order[item.id] || 0
                                return (
                                  <div key={item.id} className={`order-item ${qty ? 'selected' : ''}`}>
                                    <label>
                                      <input type="checkbox" checked={qty > 0} onChange={(e) => setQty(item.id, e.target.checked ? 1 : 0)} />
                                      <span className="order-item-name">{item.id}</span>
                                      <span className="order-item-price">{item.price || 'Prix du jour'}</span>
                                    </label>
                                    {qty > 0 && (
                                      <div className="order-qty">
                                        <button type="button" aria-label={`Retirer un ${item.id}`} onClick={() => setQty(item.id, qty - 1)}>−</button>
                                        <span aria-live="polite">{qty}</span>
                                        <button type="button" aria-label={`Ajouter un ${item.id}`} onClick={() => setQty(item.id, qty + 1)}>+</button>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          ))}
                          <div className="order-total">
                            <span>{orderCount === 0 ? 'Aucun plat sélectionné' : `${orderCount} article${orderCount > 1 ? 's' : ''}`}</span>
                            <strong>{totalLabel} : {formatEuro(orderTotal)}</strong>
                          </div>
                        </fieldset>
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
                      <strong style={{ display: 'block' }}>{formatBookingDate(data.date)} · {isPrivatisation ? formatPeriod(data.period) : formatBookingTime(data.time)}</strong>
                      {(data.service === 'table' || isPrivatisation) && <small style={{ color: 'var(--brown-muted)' }}>{quantityLabel} : {data.guests}</small>}
                      {data.service === 'takeaway' && <small style={{ color: 'var(--brown-muted)' }}>{orderCount} article{orderCount > 1 ? 's' : ''} · {totalLabel} : {formatEuro(orderTotal)}</small>}
                    </div>
                    <button type="button" className="button button-ghost" style={{ minHeight: 'auto', padding: '8px 16px' }} onClick={() => { setError(''); setStep(1) }}>Modifier</button>
                  </div>

                  {data.service === 'takeaway' && orderLines.length > 0 && (
                    <div className="order-recap">
                      <strong>Récapitulatif de votre commande</strong>
                      <ul>
                        {orderLines.map((line) => (
                          <li key={line.id}>
                            <span>{line.qty} × {line.id}</span>
                            <span>{formatLineTotal(line)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="order-recap-total">
                        <span>{totalLabel}</span>
                        <strong>{formatEuro(orderTotal)}</strong>
                      </div>
                    </div>
                  )}

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
                      <span>{notesLabel}{data.service === 'takeaway' && <span style={{ color: 'var(--brown-muted)', fontWeight: 400 }}> (facultatif)</span>}</span>
                    </label>
                    <textarea
                      id="notes"
                      placeholder={data.service === 'table' ? 'Allergies ou demande particulière…' : isPrivatisation ? 'Menu envisagé, horaires, disposition de la salle…' : 'Boissons, cuisson, allergies, sauce à part…'}
                      value={data.notes}
                      onChange={(e) => update('notes', e.target.value)}
                    />
                  </div>

                  {!isPrivatisation && (
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
                  )}

                  <div className="form-note">
                    Rien n&rsquo;est transmis avant que vous {isPrivatisation ? 'envoyiez l’e-mail' : 'ouvriez WhatsApp'}. <Link to="/politique-confidentialite" style={{ textDecoration: 'underline' }}>Données personnelles</Link>.
                  </div>

                  <div className="form-actions">
                    <button type="button" className="button button-ghost" onClick={() => { setError(''); setStep(1) }}>Retour</button>
                    <button type="submit" className="button button-primary" style={{ flex: 1 }}>
                      {isPrivatisation ? (
                        <>✉️ Envoyer ma demande <span style={{ fontWeight: 400, opacity: 0.85 }}>par e-mail</span></>
                      ) : (
                        <>💬 Confirmer ma demande <span style={{ fontWeight: 400, opacity: 0.85 }}>via WhatsApp</span></>
                      )}
                    </button>
                  </div>
                  <p style={{ marginTop: 16, fontSize: '0.82rem', color: 'var(--brown-muted)', textAlign: 'center' }}>
                    Votre demande sera confirmée personnellement par Chez Lina après l&rsquo;envoi du message.
                  </p>
                  {prepared && (
                    <div className="reservation-prepared" role="status">
                      <strong>Votre message est prêt.</strong>
                      {isPrivatisation ? (
                        <>
                          <span>Dans votre messagerie, vérifiez votre demande puis appuyez sur « Envoyer ». Si elle ne s&rsquo;est pas ouverte, utilisez le lien ci-dessous.</span>
                          <a href={mailtoUrl}>Ouvrir ma messagerie</a>
                        </>
                      ) : (
                        <>
                          <span>Dans WhatsApp, vérifiez votre demande puis appuyez sur « Envoyer ». Si l&rsquo;application ne s&rsquo;est pas ouverte, utilisez le lien ci-dessous.</span>
                          <a href={whatsappUrl}>Ouvrir WhatsApp</a>
                        </>
                      )}
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
