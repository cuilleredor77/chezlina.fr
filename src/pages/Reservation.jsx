import { useState } from 'react'
import PageHero from '../components/PageHero'

const lunchSlots = ['11 h 45', '12 h', '12 h 15', '12 h 30', '12 h 45', '13 h', '13 h 15', '13 h 30', '13 h 45', '14 h', '14 h 15', '14 h 30', '14 h 45']
const dinnerSlots = ['18 h 30', '18 h 45', '19 h', '19 h 15', '19 h 30', '19 h 45', '20 h', '20 h 15', '20 h 30', '20 h 45', '21 h', '21 h 15', '21 h 30', '21 h 45', '22 h', '22 h 15', '22 h 30', '22 h 45', '23 h', '23 h 15', '23 h 30', '23 h 45']
const timeSlots = [...lunchSlots, ...dinnerSlots]

const WHATSAPP_NUMBER = '33651197751'

export default function Reservation() {
  const [step, setStep] = useState(1)
  const [service, setService] = useState('table')
  const [date, setDate] = useState('')
  const [time, setTime] = useState(timeSlots[13])
  const [people, setPeople] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [newsletter, setNewsletter] = useState(false)

  const canContinue = date && time && people

  const buildMessage = () => {
    const lines = [
      `Bonjour Chez Lina,`,
      ``,
      service === 'table' ? `Je souhaite réserver une table.` : `Je souhaite commander à emporter.`,
      `Date : ${date}`,
      `Heure : ${time}`,
      `${service === 'table' ? 'Nombre de personnes' : 'Nombre de portions'} : ${people}`,
      `Prénom : ${name}`,
      `Téléphone : ${phone}`,
      email ? `E-mail : ${email}` : null,
      notes ? `Précisions : ${notes}` : null,
      newsletter ? `Je souhaite recevoir les actualités de Chez Lina sur WhatsApp.` : null,
    ].filter(Boolean)
    return lines.join('\n')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage())}`
    window.open(url, '_blank', 'noopener')
  }

  return (
    <>
      <PageHero
        crumb="Réserver ou commander"
        eyebrow="Sur place ou à emporter"
        title="Réserver ou commander"
        lede="Réservez une table ou commandez à emporter."
      />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <div className="reservation-card">
            <h2>Réserver ou commander</h2>
            <p style={{ color: 'var(--brown-muted)' }}>Deux étapes rapides pour préparer votre demande dans WhatsApp.</p>

            <div className="steps">
              <div className={`step ${step === 1 ? 'active' : ''}`}>
                <span className="step-num">1</span> Votre demande
              </div>
              <div className={`step ${step === 2 ? 'active' : ''}`}>
                <span className="step-num">2</span> Vos coordonnées
              </div>
            </div>

            {step === 1 && (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (canContinue) setStep(2)
                }}
              >
                <div className="field" style={{ marginBottom: 20 }}>
                  <label>Que souhaitez-vous faire ?</label>
                  <div className="service-choice">
                    <label className={`service-option ${service === 'table' ? 'selected' : ''}`}>
                      <input type="radio" name="service" value="table" checked={service === 'table'} onChange={() => setService('table')} style={{ display: 'none' }} />
                      <span className="service-icon" aria-hidden="true">🍴</span>
                      <span>
                        <strong>Réserver une table</strong>
                        <div style={{ fontSize: '0.85rem', color: 'var(--brown-muted)' }}>Déjeuner ou dîner sur place</div>
                      </span>
                    </label>
                    <label className={`service-option ${service === 'emporter' ? 'selected' : ''}`}>
                      <input type="radio" name="service" value="emporter" checked={service === 'emporter'} onChange={() => setService('emporter')} style={{ display: 'none' }} />
                      <span className="service-icon" aria-hidden="true">🛍️</span>
                      <span>
                        <strong>Commander à emporter</strong>
                        <div style={{ fontSize: '0.85rem', color: 'var(--brown-muted)' }}>Retirer votre commande chez Lina</div>
                      </span>
                    </label>
                  </div>
                </div>

                <div className="form-row">
                  <div className="field">
                    <label htmlFor="date">Date <span className="req">*</span></label>
                    <input id="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="time">Heure <span className="req">*</span></label>
                    <select id="time" required value={time} onChange={(e) => setTime(e.target.value)}>
                      {timeSlots.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <span style={{ fontSize: '0.78rem', color: 'var(--brown-muted)' }}>Créneaux proposés toutes les 15 minutes.</span>
                  </div>
                </div>

                <div className="field" style={{ marginBottom: 24 }}>
                  <label htmlFor="people">{service === 'table' ? 'Nombre de personnes' : 'Nombre de portions'} <span className="req">*</span></label>
                  <input id="people" type="number" min="1" required value={people} onChange={(e) => setPeople(e.target.value)} />
                </div>

                <button type="submit" className="button button-primary button-block" disabled={!canContinue}>Continuer</button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit}>
                <div className="field" style={{ marginBottom: 20 }}>
                  <label htmlFor="name">Nom <span className="req">*</span></label>
                  <input id="name" type="text" required placeholder="Votre nom" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="form-row">
                  <div className="field">
                    <label htmlFor="phone">Numéro de téléphone <span className="req">*</span></label>
                    <input id="phone" type="tel" required placeholder="Votre numéro" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="email">Adresse e-mail <span className="req">*</span></label>
                    <input id="email" type="email" required placeholder="Votre adresse e-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>

                <div className="field" style={{ marginBottom: 20 }}>
                  <label htmlFor="notes">Précisions</label>
                  <textarea id="notes" placeholder="Allergies ou demande particulière…" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>

                <label className="checkbox-row">
                  <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} />
                  <span>
                    Recevoir les actualités de Chez Lina sur WhatsApp.
                    <br /><span style={{ color: 'var(--brown-muted)', fontSize: '0.85rem' }}>Facultatif.</span>
                  </span>
                </label>

                <div className="form-note">
                  Rien n&rsquo;est transmis avant que vous ouvriez WhatsApp. <a href="/politique-confidentialite" style={{ textDecoration: 'underline' }}>Données personnelles</a>
                </div>

                <div className="form-actions">
                  <button type="button" className="button button-ghost" onClick={() => setStep(1)}>Retour</button>
                  <button type="submit" className="button button-primary" style={{ flex: 1 }}>
                    💬 Confirmer ma demande <span style={{ fontWeight: 400, opacity: 0.85 }}>via WhatsApp</span>
                  </button>
                </div>
                <p style={{ marginTop: 16, fontSize: '0.82rem', color: 'var(--brown-muted)', textAlign: 'center' }}>
                  Votre demande sera confirmée personnellement par Chez Lina après l&rsquo;envoi du message.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
