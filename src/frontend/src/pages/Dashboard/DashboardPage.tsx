import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import type { Employee, ProximityResult } from '@/services/types'
import { getEmployee } from '@/services/employees'
import { getProximity } from '@/services/proximity'
import styles from './DashboardPage.module.css'

const DEMO_EMPLOYEE_ID = '01_giulia_ferraro'

function scoreColor(score: number): string {
  if (score >= 70) return 'var(--color-tertiary)'
  if (score >= 40) return 'var(--color-secondary)'
  return 'var(--color-error)'
}

function gapsText(count: number): string {
  if (count === 0) return 'Tutte le competenze coperte'
  if (count === 1) return '1 competenza mancante'
  return `${count} competenze mancanti`
}

function extractSkillNames(raw: Record<string, unknown>): string[] {
  const names: string[] = []
  for (const cat of Object.values(raw)) {
    if (Array.isArray(cat)) {
      for (const item of cat) {
        if (
          typeof item === 'object' &&
          item !== null &&
          'name' in item &&
          typeof (item as Record<string, unknown>).name === 'string'
        ) {
          names.push((item as Record<string, unknown>).name as string)
        }
      }
    }
  }
  return names
}

interface CircularScoreProps {
  score: number
}

function CircularScore({ score }: CircularScoreProps) {
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = scoreColor(score)

  return (
    <svg className={styles.progressRing} viewBox="0 0 88 88" aria-hidden="true">
      <circle
        cx="44"
        cy="44"
        r={radius}
        strokeWidth="8"
        fill="none"
        stroke="var(--color-outline-variant)"
      />
      <circle
        cx="44"
        cy="44"
        r={radius}
        strokeWidth="8"
        fill="none"
        stroke={color}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 44 44)"
      />
      <text
        x="44"
        y="44"
        textAnchor="middle"
        dominantBaseline="central"
        className={styles.progressText}
        style={{ fill: color }}
      >
        {score}%
      </text>
    </svg>
  )
}

export default function DashboardPage() {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [proximity, setProximity] = useState<ProximityResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    setError(null)
    Promise.all([
      getEmployee(DEMO_EMPLOYEE_ID),
      getProximity(DEMO_EMPLOYEE_ID),
    ])
      .then(([emp, prox]) => {
        setEmployee(emp)
        setProximity(prox)
      })
      .catch(() => {
        setError('Impossibile caricare i dati. Verifica la connessione e riprova.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  /* ─── Loading state ──────────────────────────────────────────── */
  if (loading) {
    return (
      <div className={styles.stateContainer} aria-busy="true" aria-label="Caricamento in corso">
        <div className={styles.skeleton} style={{ height: '140px' }} />
        <div className={styles.skeleton} style={{ height: '96px' }} />
        <div className={styles.skeleton} style={{ height: '96px' }} />
        <div className={styles.skeleton} style={{ height: '160px' }} />
      </div>
    )
  }

  /* ─── Error state ────────────────────────────────────────────── */
  if (error) {
    return (
      <div className={styles.stateContainer}>
        <span className={`material-symbols-outlined ${styles.errorIcon}`} aria-hidden="true">
          error
        </span>
        <p className={styles.errorText}>{error}</p>
        <button type="button" className={styles.retryBtn} onClick={load}>
          Riprova
        </button>
      </div>
    )
  }

  if (!employee) return null

  const { personal, current_role, career_path, total_years_experience, technical_skills, soft_skills } = employee
  const allSkills = [...extractSkillNames(technical_skills), ...soft_skills]
  const displayedSkills = allSkills.slice(0, 6)

  return (
    <div className={styles.page}>
      {/* ─── Profile card ───────────────────────────────────────── */}
      <section className={styles.profileCard} aria-label="Il tuo profilo">
        <h2 className={styles.sectionTitle}>Il tuo profilo</h2>

        <div className={styles.profileTop}>
          <div className={styles.profileAvatar} aria-label={`Avatar di ${personal.name}`}>
            {personal.name.charAt(0).toUpperCase()}
          </div>
          <div className={styles.profileInfo}>
            <p className={styles.profileName}>{personal.name}</p>
            <p className={styles.profileRole}>
              {current_role.title}
              <span className={styles.profileSep} aria-hidden="true">•</span>
              {current_role.company}
            </p>
            <span className={styles.hrBadge}>{career_path.current_level.label}</span>
          </div>
        </div>

        <div className={styles.profileMeta}>
          <div className={styles.metaItem}>
            <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
            <span>{personal.location}</span>
          </div>
          <div className={styles.metaItem}>
            <span className="material-symbols-outlined" aria-hidden="true">work_history</span>
            <span>{total_years_experience} anni di esperienza</span>
          </div>
          <div className={styles.metaItem}>
            <span className="material-symbols-outlined" aria-hidden="true">trending_up</span>
            <span>Prossimo livello: {career_path.suggested_next_level.label}</span>
          </div>
        </div>

        {displayedSkills.length > 0 && (
          <div className={styles.skillsRow} aria-label="Competenze principali">
            {displayedSkills.map(skill => (
              <span key={skill} className={styles.skillChip}>{skill}</span>
            ))}
          </div>
        )}
      </section>

      {/* ─── Proximity section ──────────────────────────────────── */}
      <section className={styles.section} aria-labelledby="proximity-heading">
        <h2 id="proximity-heading" className={styles.sectionTitle}>Ruoli più vicini a te</h2>

        {proximity.length === 0 ? (
          <p className={styles.emptyHint}>Nessun ruolo di prossimità disponibile.</p>
        ) : (
          <div className={styles.proximityGrid}>
            {proximity.map(p => {
              const missingCount = p.totalMandatory - p.coveredCount
              return (
                <div
                  key={p.targetLevel}
                  className={styles.proximityCard}
                  style={{ borderLeftColor: scoreColor(p.score) }}
                >
                  <CircularScore score={p.score} />

                  <div className={styles.proximityInfo}>
                    <span
                      className={styles.matchBadge}
                      style={{ color: scoreColor(p.score) }}
                    >
                      {p.score}% Match
                    </span>
                    <h3 className={styles.proximityRole}>{p.targetLabel}</h3>
                    <p className={styles.proximitySub}>{gapsText(missingCount)}</p>
                  </div>

                  <Link
                    to="/app/gap"
                    className={styles.proximityArrow}
                    aria-label={`Analisi gap per ${p.targetLabel}`}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ─── Roadmap section ────────────────────────────────────── */}
      <section className={styles.section} aria-labelledby="roadmap-heading">
        <h2 id="roadmap-heading" className={styles.sectionTitle}>La tua Roadmap attiva</h2>
        <div className={styles.roadmapEmpty}>
          <span className={`material-symbols-outlined ${styles.roadmapIcon}`} aria-hidden="true">
            route
          </span>
          <h3 className={styles.roadmapEmptyTitle}>Nessuna Roadmap Attiva</h3>
          <p className={styles.roadmapEmptyText}>
            Inizia a pianificare il tuo prossimo passo di carriera. Esplora i ruoli
            disponibili e crea un percorso personalizzato per raggiungere i tuoi obiettivi.
          </p>
          <Link to="/app/roadmap" className={styles.roadmapBtn}>
            <span className="material-symbols-outlined" aria-hidden="true">add_road</span>
            Genera la tua prima Roadmap
          </Link>
        </div>
      </section>
    </div>
  )
}
