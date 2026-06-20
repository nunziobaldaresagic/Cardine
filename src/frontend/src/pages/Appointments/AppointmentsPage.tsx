import { Link } from '@tanstack/react-router'
import styles from './AppointmentsPage.module.css'

// ─── Types & mock data ────────────────────────────────────────────────────────

type AppointmentStatus = 'confermato' | 'in_attesa' | 'completato' | 'annullato'

interface Appointment {
  id: string
  date: string
  time: string
  counselorName: string
  topic: string
  status: AppointmentStatus
}

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  confermato: 'Confermato',
  in_attesa: 'In attesa',
  completato: 'Completato',
  annullato: 'Annullato',
}

const STATUS_ICON: Record<AppointmentStatus, string> = {
  confermato: 'check_circle',
  in_attesa: 'hourglass_empty',
  completato: 'task_alt',
  annullato: 'cancel',
}

const STATUS_STYLE: Record<AppointmentStatus, string> = {
  confermato: styles.statusConfermato,
  in_attesa: styles.statusInAttesa,
  completato: styles.statusCompletato,
  annullato: styles.statusAnnullato,
}

const CARD_BORDER: Record<AppointmentStatus, string> = {
  confermato: styles.cardBorderConfermato,
  in_attesa: styles.cardBorderInAttesa,
  completato: styles.cardBorderCompletato,
  annullato: styles.cardBorderAnnullato,
}

const UPCOMING: Appointment[] = [
  {
    id: '1',
    date: '2026-06-25',
    time: '10:00',
    counselorName: 'Marco Bianchi',
    topic: 'Analisi percorso di carriera',
    status: 'confermato',
  },
  {
    id: '2',
    date: '2026-07-03',
    time: '14:30',
    counselorName: 'Sara Conti',
    topic: 'Revisione roadmap e obiettivi Q3',
    status: 'in_attesa',
  },
]

const PAST: Appointment[] = [
  {
    id: '3',
    date: '2026-06-10',
    time: '11:00',
    counselorName: 'Marco Bianchi',
    topic: 'Colloquio orientativo iniziale',
    status: 'completato',
  },
  {
    id: '4',
    date: '2026-05-20',
    time: '09:30',
    counselorName: 'Lucia Ricci',
    topic: 'Gap analysis competenze tecniche',
    status: 'completato',
  },
  {
    id: '5',
    date: '2026-05-05',
    time: '15:00',
    counselorName: 'Marco Bianchi',
    topic: 'Aggiornamento piano formativo',
    status: 'annullato',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function counselorInitials(name: string): string {
  return name.split(' ').map(p => p[0]).join('').toUpperCase()
}

// ─── AppointmentCard ──────────────────────────────────────────────────────────

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const { date, time, counselorName, topic, status } = appointment
  const d = new Date(date)

  return (
    <div className={`${styles.card} ${CARD_BORDER[status]}`}>
      <div className={styles.cardDate}>
        <span className={styles.dateDay}>{d.getDate()}</span>
        <span className={styles.dateMonth}>
          {d.toLocaleDateString('it-IT', { month: 'short' })}
        </span>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardTop}>
          <div className={styles.counselorAvatar} aria-hidden="true">
            {counselorInitials(counselorName)}
          </div>
          <div className={styles.counselorInfo}>
            <span className={styles.counselorName}>{counselorName}</span>
            <span className={styles.cardTime}>
              <span className="material-symbols-outlined" aria-hidden="true">schedule</span>
              {time}
            </span>
          </div>
        </div>
        <p className={styles.cardTopic}>{topic}</p>
      </div>

      <div className={styles.cardSide}>
        <span className={`${styles.statusBadge} ${STATUS_STYLE[status]}`}>
          <span className="material-symbols-outlined" aria-hidden="true">{STATUS_ICON[status]}</span>
          {STATUS_LABEL[status]}
        </span>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const completedCount = PAST.filter(a => a.status === 'completato').length
  const pendingCount = UPCOMING.filter(a => a.status === 'in_attesa').length

  return (
    <div className={styles.page}>
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Appuntamenti</h1>
          <p className={styles.pageSubtitle}>Gestisci le tue sessioni di career counseling</p>
        </div>
        <Link to="/app/appointments/new" className={styles.newBtn}>
          <span className="material-symbols-outlined" aria-hidden="true">add</span>
          Nuovo appuntamento
        </Link>
      </div>

      {/* ─── Stats ──────────────────────────────────────────────── */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className="material-symbols-outlined" aria-hidden="true">upcoming</span>
          <div>
            <span className={styles.statValue}>{UPCOMING.length}</span>
            <span className={styles.statLabel}>Prossimi</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className="material-symbols-outlined" aria-hidden="true">task_alt</span>
          <div>
            <span className={styles.statValue}>{completedCount}</span>
            <span className={styles.statLabel}>Completati</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className="material-symbols-outlined" aria-hidden="true">hourglass_empty</span>
          <div>
            <span className={styles.statValue}>{pendingCount}</span>
            <span className={styles.statLabel}>In attesa</span>
          </div>
        </div>
      </div>

      {/* ─── Upcoming ───────────────────────────────────────────── */}
      <section aria-labelledby="upcoming-heading">
        <h2 id="upcoming-heading" className={styles.sectionTitle}>Prossimi appuntamenti</h2>
        <div className={styles.list}>
          {UPCOMING.map(a => <AppointmentCard key={a.id} appointment={a} />)}
        </div>
      </section>

      {/* ─── Past ───────────────────────────────────────────────── */}
      <section aria-labelledby="past-heading">
        <h2 id="past-heading" className={styles.sectionTitle}>Passati</h2>
        <div className={styles.list}>
          {PAST.map(a => <AppointmentCard key={a.id} appointment={a} />)}
        </div>
      </section>
    </div>
  )
}
