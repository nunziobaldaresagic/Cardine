import { Link } from '@tanstack/react-router'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <div className={styles.container}>
      <span className={`material-symbols-outlined ${styles.icon}`} aria-hidden="true">
        search_off
      </span>
      <h1 className={styles.title}>Pagina non trovata</h1>
      <p className={styles.message}>
        La pagina che stai cercando non esiste o è stata spostata.
      </p>
      <Link to="/login" className={styles.link}>
        Torna al login
      </Link>
    </div>
  )
}
