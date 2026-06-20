import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import styles from './ProposeTimePage.module.css'

// ─── Mock data ────────────────────────────────────────────────────────────────

const COUNSELOR_NAME = 'Marco Bianchi'

const SLOT_GROUPS = [
  { day: 'Lunedì 29 Giu', times: ['09:00', '10:30', '14:00', '15:30'] },
  { day: 'Martedì 30 Giu', times: ['09:30', '11:00', '16:00'] },
  { day: 'Mercoledì 1 Lug', times: ['10:00', '14:30'] },
  { day: 'Giovedì 2 Lug', times: ['11:30', '14:00', '16:30'] },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProposeTimePage() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/app/appointments" className={styles.backBtn} aria-label="Torna agli appuntamenti">
          <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
        </Link>
        <div>
          <h1 className={styles.pageTitle}>Scegli un orario</h1>
          <p className={styles.pageSubtitle}>
            Seleziona la fascia oraria con <strong>{COUNSELOR_NAME}</strong>
          </p>
        </div>
      </div>

      <div className={styles.slotGroups}>
        {SLOT_GROUPS.map(group => (
          <div key={group.day} className={styles.dayGroup}>
            <h2 className={styles.dayLabel}>
              <span className="material-symbols-outlined" aria-hidden="true">calendar_today</span>
              {group.day}
            </h2>
            <div className={styles.timeGrid}>
              {group.times.map(t => {
                const id = `${group.day}-${t}`
                const isSelected = selected === id
                return (
                  <button
                    key={t}
                    type="button"
                    className={`${styles.timeSlot} ${isSelected ? styles.timeSlotSelected : ''}`}
                    onClick={() => setSelected(id)}
                    aria-pressed={isSelected}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">schedule</span>
                    {t}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className={styles.confirmBar}>
          <span className={styles.confirmText}>
            <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
            Orario selezionato
          </span>
          <button type="button" className={styles.confirmBtn}>
            Conferma appuntamento
          </button>
        </div>
      )}
    </div>
  )
}
