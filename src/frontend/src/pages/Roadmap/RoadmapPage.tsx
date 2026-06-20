import { useEffect, useRef, useState } from 'react'
import { generateRoadmapStream, confirmRoadmap } from '@/services/roadmap'
import type { Roadmap, RoadmapAction, RoadmapItem } from '@/services/types'
import styles from './RoadmapPage.module.css'

const DEMO_EMPLOYEE_ID = '01_giulia_ferraro'

type Phase = 'streaming' | 'done' | 'confirming' | 'error'

const ACTION_ICON: Record<string, string> = {
  corso: 'school',
  certificazione: 'verified',
  milestone: 'flag',
}

function ActionChip({ action }: { action: RoadmapAction }) {
  return (
    <span className={styles.actionChip}>
      <span className='material-symbols-outlined' aria-hidden='true'>
        {ACTION_ICON[action.type] ?? 'task_alt'}
      </span>
      <span>{action.description}</span>
      <span className={styles.actionHours}>{action.estimatedHours}h</span>
    </span>
  )
}

function StepCard({ item, index }: { item: RoadmapItem; index: number }) {
  const isCompleted = item.status === 'completed'
  const isInProgress = item.status === 'in_progress'

  return (
    <div
      className={`${styles.stepCard} ${isCompleted ? styles.stepCompleted : ''} ${isInProgress ? styles.stepInProgress : ''}`}
    >
      <div className={styles.stepHeader}>
        <div className={styles.stepBadge}>
          {isCompleted ? (
            <span
              className={`material-symbols-outlined ${styles.stepCheckIcon}`}
              aria-label='Completato'
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          ) : (
            <span className={styles.stepNumber} aria-label={`Step ${index + 1}`}>
              {index + 1}
            </span>
          )}
        </div>
        <div className={styles.stepMeta}>
          <span className={styles.stepLabel}>{item.competenza}</span>
          <h3 className={styles.stepTitle}>{item.title}</h3>
        </div>
        <div className={styles.stepRight}>
          <span className={styles.monthRange}>
            <span className='material-symbols-outlined' aria-hidden='true'>
              calendar_month
            </span>
            {item.monthRange}
          </span>
          {isInProgress && (
            <span className={styles.inProgressBadge}>
              <span className='material-symbols-outlined' aria-hidden='true'>
                pending
              </span>
              In corso
            </span>
          )}
        </div>
      </div>
      {item.actions.length > 0 && (
        <div className={styles.stepActions}>
          {item.actions.map((action, i) => (
            <ActionChip key={i} action={action} />
          ))}
        </div>
      )}
    </div>
  )
}

function StepSkeleton({ index }: { index: number }) {
  return (
    <div className={`${styles.stepCard} ${styles.stepSkeleton}`} aria-hidden='true'>
      <div className={styles.stepHeader}>
        <div className={styles.stepBadge}>
          <span className={styles.stepNumber}>{index + 1}</span>
        </div>
        <div className={styles.stepMeta}>
          <div className={styles.skeletonBar} style={{ width: '60px', height: '12px' }} />
          <div className={styles.skeletonBar} style={{ width: '180px', height: '20px', marginTop: '4px' }} />
        </div>
      </div>
    </div>
  )
}

export default function RoadmapPage() {
  const [phase, setPhase] = useState<Phase>('streaming')
  const [streamText, setStreamText] = useState('')
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const abortRef = useRef<(() => void) | null>(null)
  const streamEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const abort = generateRoadmapStream(
      DEMO_EMPLOYEE_ID,
      undefined,
      (chunk) => setStreamText((prev) => prev + chunk),
      (meta) => setRoadmap(meta),
      () => setPhase('done'),
      (err) => {
        setErrorMsg(err.message)
        setPhase('error')
      },
    )
    abortRef.current = abort
    return abort
  }, [])

  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [streamText])

  async function handleConfirm() {
    if (!roadmap || phase === 'confirming') return
    setPhase('confirming')
    try {
      await confirmRoadmap(DEMO_EMPLOYEE_ID, roadmap)
      window.location.href = '/app/roadmap/confirmed'
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Errore nella conferma')
      setPhase('error')
    }
  }

  function handleAbort() {
    abortRef.current?.()
    setPhase('done')
  }

  const isStreaming = phase === 'streaming'

  return (
    <main className={styles.page}>
      {/* ─── Page header ─────────────────────────────────────────────── */}
      <header className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.modeBadge}>
            <span className='material-symbols-outlined' aria-hidden='true'>
              auto_awesome
            </span>
            Modalità Generazione
          </div>
          <h1 className={styles.pageTitle}>
            {isStreaming ? (
              <>
                Generazione Roadmap in corso
                <span className={styles.dots} aria-hidden='true'>...</span>
              </>
            ) : roadmap ? (
              `Roadmap verso ${roadmap.targetLabel}`
            ) : (
              'Generazione Roadmap'
            )}
          </h1>
          {roadmap ? (
            <p className={styles.pageSubtitle}>
              Percorso personalizzato verso{' '}
              <strong>{roadmap.targetLabel}</strong> · {roadmap.estimatedMonths} mesi stimati
            </p>
          ) : isStreaming ? (
            <p className={styles.pageSubtitle}>
              Analisi delle competenze in corso — attendere il completamento...
            </p>
          ) : null}
        </div>
        {roadmap && (
          <div className={styles.headerRight}>
            <div className={styles.scoreChip}>
              <span className='material-symbols-outlined' aria-hidden='true'>
                analytics
              </span>
              Score iniziale: <strong>{roadmap.initialScore}%</strong>
            </div>
          </div>
        )}
      </header>

      {/* ─── Streaming text panel ────────────────────────────────────── */}
      {streamText.length > 0 && (
        <section className={styles.streamPanel} aria-label="Analisi AI in streaming">
          <div className={styles.streamContent}>
            <pre className={styles.streamText}>{streamText}</pre>
            {isStreaming && (
              <span className={styles.cursor} aria-hidden='true'>▌</span>
            )}
            <div ref={streamEndRef} />
          </div>
        </section>
      )}

      {/* ─── Progress bar (solo quando roadmap disponibile) ──────────── */}
      {roadmap && (
        <div className={styles.progressContainer} aria-label='Progresso roadmap'>
          <div className={styles.progressInfo}>
            <span>
              {roadmap.items.filter((i) => i.status === 'completed').length} /{' '}
              {roadmap.items.length} step completati
            </span>
            <span>{roadmap.estimatedMonths} mesi totali</span>
          </div>
          <div
            className={styles.progressBar}
            role='progressbar'
            aria-valuenow={Math.round(
              (roadmap.items.filter((i) => i.status === 'completed').length /
                Math.max(roadmap.items.length, 1)) *
                100,
            )}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={styles.progressFill}
              style={{
                width: `${Math.round(
                  (roadmap.items.filter((i) => i.status === 'completed').length /
                    Math.max(roadmap.items.length, 1)) *
                    100,
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* ─── Steps ───────────────────────────────────────────────────── */}
      <section className={styles.stepsSection} aria-label='Step della roadmap'>
        {roadmap
          ? roadmap.items.map((item, i) => (
              <StepCard key={item.step} item={item} index={i} />
            ))
          : isStreaming
            ? [0, 1, 2].map((i) => <StepSkeleton key={i} index={i} />)
            : null}
      </section>

      {/* ─── Error banner ────────────────────────────────────────────── */}
      {phase === 'error' && (
        <div className={styles.errorBanner} role='alert'>
          <span className='material-symbols-outlined' aria-hidden='true'>
            error
          </span>
          {errorMsg || 'Si è verificato un errore durante la generazione.'}
        </div>
      )}

      {/* ─── Bottom actions bar ──────────────────────────────────────── */}
      <footer className={styles.actionsBar}>
        {isStreaming ? (
          <button
            type='button'
            className={styles.btnAbort}
            onClick={handleAbort}
            aria-label='Interrompi generazione'
          >
            <span className='material-symbols-outlined' aria-hidden='true'>
              stop_circle
            </span>
            Interrompi
          </button>
        ) : (
          <button
            type='button'
            className={styles.btnConfirm}
            onClick={() => void handleConfirm()}
            disabled={!roadmap || phase === 'confirming'}
            aria-busy={phase === 'confirming'}
          >
            {phase === 'confirming' ? (
              <>
                <span
                  className={`material-symbols-outlined ${styles.spinIcon}`}
                  aria-hidden='true'
                >
                  progress_activity
                </span>
                Conferma in corso...
              </>
            ) : (
              <>
                <span className='material-symbols-outlined' aria-hidden='true'>
                  check_circle
                </span>
                Conferma questa Roadmap
              </>
            )}
          </button>
        )}
      </footer>
    </main>
  )
}
