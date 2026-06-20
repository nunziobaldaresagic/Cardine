import { useState, useEffect, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import type { EmployeeSummary } from '@/services/types'
import { listEmployees } from '@/services/employees'
import styles from './CounselorDashboardPage.module.css'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitial(name: string): string {
  return (name.trim().charAt(0) || '?').toUpperCase()
}

function yearsLabel(years: number): string {
  if (years === 1) return '1 anno'
  return `${years} anni`
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <li className={styles.skeletonCard} aria-hidden="true">
      <span className={`${styles.skeleton} ${styles.skeletonAvatar}`} />
      <span className={styles.skeletonBody}>
        <span className={`${styles.skeleton} ${styles.skeletonLine} ${styles.skeletonLineLg}`} />
        <span className={`${styles.skeleton} ${styles.skeletonLine} ${styles.skeletonLineSm}`} />
      </span>
      <span className={`${styles.skeleton} ${styles.skeletonBadge}`} />
    </li>
  )
}

// ─── Employee Card ────────────────────────────────────────────────────────────

interface EmployeeCardProps {
  employee: EmployeeSummary
}

function EmployeeCard({ employee }: EmployeeCardProps) {
  const initial = getInitial(employee.name)

  return (
    <li className={styles.card}>
      {/* Avatar */}
      <div className={styles.avatar} aria-hidden="true">
        {initial}
      </div>

      {/* Info */}
      <div className={styles.cardInfo}>
        <span className={styles.cardName}>{employee.name}</span>
        <span className={styles.cardRole}>
          {employee.currentRole}
          {employee.company && (
            <span className={styles.cardCompany}> · {employee.company}</span>
          )}
        </span>
        <div className={styles.cardMeta}>
          <span className={styles.hrBadge}>{employee.hrLevel.code}</span>
          <span className={styles.expTag}>
            <span className="material-symbols-outlined" aria-hidden="true">
              work_history
            </span>
            {yearsLabel(employee.totalYearsExperience)}
          </span>
        </div>
      </div>

      {/* Action */}
      <Link to="/app/dashboard" className={styles.detailLink}>
        <span className="material-symbols-outlined" aria-hidden="true">
          chevron_right
        </span>
      </Link>
    </li>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CounselorDashboardPage() {
  const [employees, setEmployees] = useState<EmployeeSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  function load() {
    setLoading(true)
    setError(null)
    listEmployees()
      .then(setEmployees)
      .catch(() => setError('Errore nel caricamento dei dipendenti.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo<EmployeeSummary[]>(() => {
    const q = query.toLowerCase()
    if (!q) return employees
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.currentRole.toLowerCase().includes(q),
    )
  }, [employees, query])

  return (
    <div className={styles.page}>
      {/* ── Page header ── */}
      <header className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Il mio Gruppo</h1>
          {!loading && !error && (
            <span className={styles.countBadge}>{employees.length} persone</span>
          )}
        </div>
        <div className={styles.roleTag}>
          <span className="material-symbols-outlined" aria-hidden="true">
            verified_user
          </span>
          Career Counselor
        </div>
        <p className={styles.subtitle}>
          Panoramica dello stato di crescita dei membri del team.
        </p>
      </header>

      {/* ── Search bar ── */}
      <div className={styles.searchRow}>
        <div className={styles.searchField}>
          <span className={`material-symbols-outlined ${styles.searchIcon}`} aria-hidden="true">
            search
          </span>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Cerca dipendente o ruolo…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Cerca dipendente"
          />
        </div>
        <button
          className={styles.filterBtn}
          aria-label="Filtra"
          onClick={() => setQuery('')}
          type="button"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            filter_list
          </span>
        </button>
      </div>

      {/* ── Content ── */}
      {loading && (
        <ul className={styles.list} aria-label="Caricamento dipendenti">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </ul>
      )}

      {!loading && error && (
        <div className={styles.errorState}>
          <span className={`material-symbols-outlined ${styles.errorIcon}`} aria-hidden="true">
            error_outline
          </span>
          <p className={styles.errorMsg}>{error}</p>
          <button className={styles.retryBtn} onClick={load} type="button">
            Riprova
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className={styles.emptyState}>
          <span className={`material-symbols-outlined ${styles.emptyIcon}`} aria-hidden="true">
            person_search
          </span>
          <p>Nessun dipendente trovato.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <ul className={styles.list} aria-label="Lista dipendenti">
          {filtered.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} />
          ))}
        </ul>
      )}
    </div>
  )
}

