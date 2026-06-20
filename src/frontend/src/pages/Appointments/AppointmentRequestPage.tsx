import { Link } from '@tanstack/react-router'
import styles from './AppointmentRequestPage.module.css'

// ─── Mock data ────────────────────────────────────────────────────────────────

const COUNSELORS = [
  { id: 'mb', name: 'Marco Bianchi', speciality: 'Sviluppo tecnico & leadership' },
  { id: 'sc', name: 'Sara Conti', speciality: 'Career transition & soft skills' },
  { id: 'lr', name: 'Lucia Ricci', speciality: 'Gap analysis & formazione' },
]

const TOPICS = [
  'Analisi percorso di carriera',
  'Revisione roadmap',
  'Gap analysis competenze',
  'Preparazione colloquio',
  'Sviluppo soft skills',
  'Altro',
]

function counselorInitials(name: string): string {
  return name.split(' ').map(p => p[0]).join('').toUpperCase()
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AppointmentRequestPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/app/appointments" className={styles.backBtn} aria-label="Torna agli appuntamenti">
          <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
        </Link>
        <div>
          <h1 className={styles.pageTitle}>Nuovo appuntamento</h1>
          <p className={styles.pageSubtitle}>Richiedi una sessione di career counseling</p>
        </div>
      </div>

      <form className={styles.form} onSubmit={e => e.preventDefault()}>
        {/* ─── Counselor ──────────────────────────────────────────── */}
        <fieldset className={styles.fieldGroup}>
          <legend className={styles.label}>Scegli il counselor</legend>
          <div className={styles.counselorGrid}>
            {COUNSELORS.map((c, i) => (
              <label key={c.id} className={`${styles.counselorOption} ${i === 0 ? styles.counselorOptionSelected : ''}`}>
                <input type="radio" name="counselor" value={c.id} defaultChecked={i === 0} className={styles.hiddenRadio} />
                <div className={styles.counselorAvatar} aria-hidden="true">
                  {counselorInitials(c.name)}
                </div>
                <div className={styles.counselorDetails}>
                  <span className={styles.counselorName}>{c.name}</span>
                  <span className={styles.counselorSpec}>{c.speciality}</span>
                </div>
                <span className={`material-symbols-outlined ${styles.checkIcon}`} aria-hidden="true">
                  check_circle
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* ─── Topic ──────────────────────────────────────────────── */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="topic">Argomento</label>
          <select id="topic" className={styles.select} defaultValue="">
            <option value="" disabled>Seleziona un argomento…</option>
            {TOPICS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* ─── Preferred date ─────────────────────────────────────── */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="preferred-date">Data preferita</label>
          <input type="date" id="preferred-date" className={styles.input} />
        </div>

        {/* ─── Notes ──────────────────────────────────────────────── */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="notes">Note <span className={styles.optional}>(opzionale)</span></label>
          <textarea
            id="notes"
            className={styles.textarea}
            rows={4}
            placeholder="Descrivi brevemente cosa vorresti affrontare nella sessione…"
          />
        </div>

        <button type="submit" className={styles.submitBtn}>
          <span className="material-symbols-outlined" aria-hidden="true">send</span>
          Invia richiesta
        </button>
      </form>
    </div>
  )
}
