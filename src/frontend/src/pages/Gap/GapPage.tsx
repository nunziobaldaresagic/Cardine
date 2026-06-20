import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { getProximity } from '@/services/proximity'
import { getGap } from '@/services/gap'
import type { ProximityResult, GapAnalysis, GapObjective } from '@/services/types'
import styles from './GapPage.module.css'

const DEMO_EMPLOYEE_ID = '01_giulia_ferraro'

// ─── Score colour helper ────────────────────────────────────────────────────
function scoreClass(score: number): string {
  if (score >= 70) return styles.scoreHigh
  if (score >= 40) return styles.scoreMid
  return styles.scoreLow
}

// ─── Role Selection ─────────────────────────────────────────────────────────
interface RoleSelectionViewProps {
  list: ProximityResult[]
  onSelect: (targetLevel: string) => void
}

function RoleSelectionView({ list, onSelect }: RoleSelectionViewProps) {
  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Gap Analysis</h1>
        <p className={styles.pageSubtitle}>
          Seleziona un ruolo per vedere le competenze da sviluppare e il tuo punteggio di prossimità.
        </p>
      </header>

      <div className={styles.roleGrid}>
        {list.map(item => (
          <button
            key={item.targetLevel}
            className={styles.roleCard}
            onClick={() => onSelect(item.targetLevel)}
          >
            <div className={styles.roleCardTop}>
              <span className={styles.levelBadge}>{item.targetLevel}</span>
              <div className={`${styles.scoreCircle} ${scoreClass(item.score)}`}>
                <span className={styles.scoreValue}>{item.score}%</span>
              </div>
            </div>

            <h2 className={styles.roleLabel}>{item.targetLabel}</h2>
            <p className={styles.proximityLabel}>Punteggio di Prossimità</p>

            <div className={styles.progressBar} aria-hidden="true">
              <div
                className={`${styles.progressFill} ${scoreClass(item.score)}`}
                style={{ width: `${item.score}%` }}
              />
            </div>

            <p className={styles.coverageText}>
              <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
              {item.coveredCount} di {item.totalMandatory} obiettivi obbligatori coperti
            </p>

            <span className={styles.cardCta}>
              Vedi dettaglio
              <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Objective item ─────────────────────────────────────────────────────────
interface ObjectiveItemProps {
  obj: GapObjective
  variant: 'covered' | 'gap'
}

function ObjectiveItem({ obj, variant }: ObjectiveItemProps) {
  return (
    <li className={`${styles.objectiveItem} ${variant === 'covered' ? styles.objectiveCovered : styles.objectiveGap}`}>
      <span className={`material-symbols-outlined ${styles.objIcon}`} aria-hidden="true">
        {variant === 'covered' ? 'done' : 'close'}
      </span>
      <div className={styles.objContent}>
        <div className={styles.objTitleRow}>
          <span className={styles.objTitle}>{obj.title}</span>
          {obj.priority === 'mandatory' && variant === 'gap' && (
            <span className={styles.mandatoryBadge}>Obbligatorio</span>
          )}
          {obj.priority === 'recommended' && variant === 'gap' && (
            <span className={styles.recommendedBadge}>Consigliato</span>
          )}
        </div>
        <p className={styles.objDesc}>{obj.description}</p>
        <span className={styles.categoryTag}>{obj.category.replace(/_/g, ' ')}</span>
      </div>
    </li>
  )
}

// ─── Gap Detail ─────────────────────────────────────────────────────────────
interface GapDetailViewProps {
  data: GapAnalysis
  onBack: () => void
  onRoadmap: () => void
}

function GapDetailView({ data, onBack, onRoadmap }: GapDetailViewProps) {
  const covered = data.objectives.filter(o => o.covered)
  const gaps = data.objectives.filter(o => !o.covered)
  const mandatoryGaps = gaps.filter(o => o.priority === 'mandatory')
  const recommendedGaps = gaps.filter(o => o.priority === 'recommended')

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={onBack}>
        <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
        Torna ai ruoli
      </button>

      <header className={styles.detailHeader}>
        <div className={styles.detailTitleRow}>
          <span className={styles.levelBadge}>{data.targetLevel}</span>
          <h1 className={styles.detailTitle}>{data.targetLabel}</h1>
        </div>

        <div className={styles.scoreRow}>
          <div className={`${styles.scoreCircleLg} ${scoreClass(data.score)}`}>
            <span className={styles.scoreValueLg}>{data.score}%</span>
          </div>
          <div className={styles.scoreInfo}>
            <p className={styles.scoreLabelLg}>Punteggio di Prossimità</p>
            <p className={styles.coverageDetail}>
              <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
              {data.coveredCount} di {data.totalMandatory} obiettivi obbligatori coperti
            </p>
          </div>
        </div>
      </header>

      {/* ─── Covered ─────────────────────────────────────────────────────── */}
      {covered.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={`material-symbols-outlined ${styles.iconCovered}`} aria-hidden="true">
              check_circle
            </span>
            Competenze che già possiedi
          </h2>
          <ul className={styles.objectiveList}>
            {covered.map(obj => (
              <ObjectiveItem key={obj.id} obj={obj} variant="covered" />
            ))}
          </ul>
        </section>
      )}

      {/* ─── Gaps ────────────────────────────────────────────────────────── */}
      {gaps.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={`material-symbols-outlined ${styles.iconGap}`} aria-hidden="true">
              pending
            </span>
            Competenze da sviluppare
          </h2>

          {mandatoryGaps.length > 0 && (
            <ul className={styles.objectiveList}>
              {mandatoryGaps.map(obj => (
                <ObjectiveItem key={obj.id} obj={obj} variant="gap" />
              ))}
            </ul>
          )}

          {recommendedGaps.length > 0 && (
            <>
              <h3 className={styles.prioritySeparator}>Consigliate</h3>
              <ul className={styles.objectiveList}>
                {recommendedGaps.map(obj => (
                  <ObjectiveItem key={obj.id} obj={obj} variant="gap" />
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {gaps.length === 0 && (
        <p className={styles.allCoveredMsg}>
          <span className="material-symbols-outlined" aria-hidden="true">celebration</span>
          Hai già tutte le competenze per questo ruolo!
        </p>
      )}

      <div className={styles.ctaRow}>
        <button className={styles.roadmapBtn} onClick={onRoadmap}>
          <span className="material-symbols-outlined" aria-hidden="true">route</span>
          Genera la mia Roadmap per questo ruolo
        </button>
      </div>
    </div>
  )
}

// ─── Loading / Error states ─────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className={styles.page}>
      <div className={styles.centeredState}>
        <span className={`material-symbols-outlined ${styles.spinnerIcon}`} aria-hidden="true">
          progress_activity
        </span>
        <p>Caricamento in corso...</p>
      </div>
    </div>
  )
}

function ErrorState({ message, onBack }: { message: string; onBack?: () => void }) {
  return (
    <div className={styles.page}>
      {onBack && (
        <button className={styles.backBtn} onClick={onBack}>
          <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
          Torna ai ruoli
        </button>
      )}
      <div className={styles.errorBox}>
        <span className="material-symbols-outlined" aria-hidden="true">error</span>
        {message}
      </div>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function GapPage() {
  const navigate = useNavigate()

  // State 1 — role selection
  const [proximityList, setProximityList] = useState<ProximityResult[] | null>(null)
  const [loadingProximity, setLoadingProximity] = useState(true)
  const [proximityError, setProximityError] = useState<string | null>(null)

  // State 2 — gap detail
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [gapData, setGapData] = useState<GapAnalysis | null>(null)
  const [loadingGap, setLoadingGap] = useState(false)
  const [gapError, setGapError] = useState<string | null>(null)

  useEffect(() => {
    getProximity(DEMO_EMPLOYEE_ID)
      .then(data => setProximityList(data))
      .catch(() => setProximityError('Impossibile caricare i dati di prossimità. Riprova più tardi.'))
      .finally(() => setLoadingProximity(false))
  }, [])

  function handleSelectRole(targetLevel: string) {
    setSelectedLevel(targetLevel)
    setLoadingGap(true)
    setGapError(null)
    setGapData(null)
    getGap(DEMO_EMPLOYEE_ID, targetLevel)
      .then(data => setGapData(data))
      .catch(() => setGapError('Impossibile caricare il dettaglio per questo ruolo. Riprova più tardi.'))
      .finally(() => setLoadingGap(false))
  }

  function handleBack() {
    setSelectedLevel(null)
    setGapData(null)
    setGapError(null)
  }

  // ─── State 2 — gap detail ──────────────────────────────────────────────
  if (selectedLevel !== null) {
    if (loadingGap) return <LoadingState />
    if (gapError) return <ErrorState message={gapError} onBack={handleBack} />
    if (gapData) {
      return (
        <GapDetailView
          data={gapData}
          onBack={handleBack}
          onRoadmap={() => void navigate({ to: '/app/roadmap' })}
        />
      )
    }
    return null
  }

  // ─── State 1 — role selection ──────────────────────────────────────────
  if (loadingProximity) return <LoadingState />
  if (proximityError) return <ErrorState message={proximityError} />
  if (proximityList) return <RoleSelectionView list={proximityList} onSelect={handleSelectRole} />
  return null
}
