import { useEffect, useState } from 'react'
import { getRoadmap } from '@/services/roadmap'
import type { Roadmap, RoadmapItem, RoadmapAction, RoadmapActionType, RoadmapItemStatus } from '@/services/types'
import styles from './ConfirmedRoadmapPage.module.css'

const DEMO_EMPLOYEE_ID = '01_giulia_ferraro'

const ACTION_ICON: Record<RoadmapActionType, string> = {
  corso: 'school',
  certificazione: 'workspace_premium',
  milestone: 'flag',
}

const ACTION_LABEL: Record<RoadmapActionType, string> = {
  corso: 'Corso',
  certificazione: 'Certificazione',
  milestone: 'Milestone',
}

function statusIcon(s: RoadmapItemStatus): string {
  if (s === 'completed') return 'check_circle'
  if (s === 'in_progress') return 'pending'
  return 'radio_button_unchecked'
}

function statusLabel(s: RoadmapItemStatus): string {
  if (s === 'completed') return 'Completato'
  if (s === 'in_progress') return 'In corso'
  return 'Da iniziare'
}

function formatDate(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function ActionItem({ action }: { action: RoadmapAction }) {
  return (
    <div className={styles.actionItem}>
      <span className={`material-symbols-outlined ${styles.actionIcon}`} aria-hidden="true">
        {ACTION_ICON[action.type]}
      </span>
      <div className={styles.actionBody}>
        <span className={styles.actionType}>{ACTION_LABEL[action.type]}</span>
        <span className={styles.actionDesc}>{action.description}</span>
        <span className={styles.actionHours}>{action.estimatedHours} ore stimate</span>
      </div>
    </div>
  )
}

function StepCard({ item }: { item: RoadmapItem }) {
  return (
    <article className={`${styles.stepCard} ${styles[`status_${item.status}`]}`}>
      <div className={styles.stepMeta}>
        <span className={styles.stepBadge} aria-label={`Step ${item.step}`}>
          {item.step}
        </span>
        <span className={styles.stepRange}>
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '1rem' }}>
            calendar_today
          </span>
          {item.monthRange}
        </span>
      </div>

      <div className={styles.stepContent}>
        <div className={styles.stepHeader}>
          <div>
            <p className={styles.stepCompetenza}>{item.competenza}</p>
            <h3 className={styles.stepTitle}>{item.title}</h3>
          </div>
          <div className={`${styles.statusBadge} ${styles[`statusBadge_${item.status}`]}`}>
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
              style={{ fontSize: '1.125rem', fontVariationSettings: item.status === 'completed' ? "'FILL' 1" : "'FILL' 0" }}
            >
              {statusIcon(item.status)}
            </span>
            <span>{statusLabel(item.status)}</span>
          </div>
        </div>

        {item.actions.length > 0 && (
          <ul className={styles.actionList} aria-label="Azioni">
            {item.actions.map((action, idx) => (
              <li key={idx}>
                <ActionItem action={action} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}

function RoadmapView({ roadmap }: { roadmap: Roadmap }) {
  const completed = roadmap.items.filter((i) => i.status === 'completed').length
  const total = roadmap.items.length
  const pct = Math.round((completed / Math.max(total, 1)) * 100)

  return (
    <div className={styles.roadmapView}>
      {/* ─── HERO ─── */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              La mia Roadmap —{' '}
              <span className={styles.heroTarget}>{roadmap.targetLabel}</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Il tuo percorso strutturato verso la leadership tecnica. Completa gli step per
              raggiungere il tuo obiettivo professionale.
            </p>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={`material-symbols-outlined ${styles.statIcon}`} aria-hidden="true">
                leaderboard
              </span>
              <div className={styles.statBody}>
                <span className={styles.statValue}>{roadmap.initialScore}%</span>
                <span className={styles.statLabel}>Score iniziale</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <span className={`material-symbols-outlined ${styles.statIcon}`} aria-hidden="true">
                schedule
              </span>
              <div className={styles.statBody}>
                <span className={styles.statValue}>{roadmap.estimatedMonths} mesi</span>
                <span className={styles.statLabel}>Durata stimata</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <span className={`material-symbols-outlined ${styles.statIcon}`} aria-hidden="true">
                event_available
              </span>
              <div className={styles.statBody}>
                <span className={styles.statValue}>{formatDate(roadmap.confirmedAt)}</span>
                <span className={styles.statLabel}>Confermata il</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className={styles.progressBar} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Progresso: ${pct}%`}>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${pct}%` }} />
            </div>
            <p className={styles.progressLabel}>
              <span className={styles.progressPct}>{pct}% completato</span>
              <span className={styles.progressCount}>
                {completed} di {total} step completati
              </span>
            </p>
          </div>
        </div>
      </header>

      {/* ─── STEP LIST ─── */}
      <section className={styles.stepSection} aria-label="Step della roadmap">
        <ol className={styles.stepList}>
          {roadmap.items.map((item) => (
            <li key={item.step}>
              <StepCard item={item} />
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

export default function ConfirmedRoadmapPage() {
  const [loading, setLoading] = useState(true)
  const [confirmed, setConfirmed] = useState(false)
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getRoadmap(DEMO_EMPLOYEE_ID)
      .then(({ confirmed: c, roadmap: r }) => {
        setConfirmed(c)
        setRoadmap(r)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Errore nel caricamento della roadmap.')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className={styles.stateWrapper} role="status" aria-label="Caricamento in corso">
        <span className={`material-symbols-outlined ${styles.spinnerIcon}`} aria-hidden="true">
          progress_activity
        </span>
        <p className={styles.stateText}>Caricamento roadmap…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.stateWrapper} role="alert">
        <span className={`material-symbols-outlined ${styles.errorIcon}`} aria-hidden="true">
          error
        </span>
        <p className={styles.stateText}>{error}</p>
      </div>
    )
  }

  if (!confirmed || !roadmap) {
    return (
      <div className={styles.stateWrapper} role="main">
        <span className={`material-symbols-outlined ${styles.emptyIcon}`} aria-hidden="true">
          map
        </span>
        <h2 className={styles.emptyTitle}>Nessuna roadmap confermata</h2>
        <p className={styles.stateText}>
          Non hai ancora una roadmap attiva. Generane una per iniziare il tuo percorso di crescita.
        </p>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() => { window.location.href = '/app/roadmap' }}
        >
          <span className="material-symbols-outlined" aria-hidden="true">route</span>
          Genera Roadmap
        </button>
      </div>
    )
  }

  return <RoadmapView roadmap={roadmap} />
}

