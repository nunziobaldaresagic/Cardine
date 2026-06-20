import { useEffect } from 'react'
import { useIsAuthenticated, useMsal } from '@azure/msal-react'
import { InteractionStatus } from '@azure/msal-browser'
import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { logout } from '@/services/auth'
import styles from './AuthLayout.module.css'

// Paths are literals matching registered routes — typed union avoids `any`
type EmployeeNavPath = '/app/dashboard' | '/app/gap' | '/app/roadmap' | '/app/appointments'
type CounselorNavPath = '/counselor/dashboard' | '/counselor/appointments'
type NavPath = EmployeeNavPath | CounselorNavPath

interface NavItem {
  readonly label: string
  readonly path: NavPath
  readonly icon: string
}

const EMPLOYEE_NAV: NavItem[] = [
  { label: 'Dashboard',    path: '/app/dashboard',    icon: 'dashboard'      },
  { label: 'Gap Analysis', path: '/app/gap',           icon: 'analytics'      },
  { label: 'Roadmap',      path: '/app/roadmap',       icon: 'route'          },
  { label: 'Appuntamenti', path: '/app/appointments',  icon: 'calendar_month' },
]

const COUNSELOR_NAV: NavItem[] = [
  { label: 'Dashboard',    path: '/counselor/dashboard',    icon: 'dashboard'      },
  { label: 'Appuntamenti', path: '/counselor/appointments', icon: 'calendar_month' },
]

interface AuthUser {
  id?: string
  role?: string
  name?: string
}

export default function AuthLayout() {
  const navigate = useNavigate()
  const { location } = useRouterState()
  const pathname = location.pathname
  const isAuthenticated = useIsAuthenticated()
  const { inProgress, instance } = useMsal()

  // Guard MSAL: redirect a /login se non autenticato
  useEffect(() => {
    if (!isAuthenticated && inProgress === InteractionStatus.None) {
      void navigate({ to: '/login' })
    }
  }, [isAuthenticated, inProgress, navigate])

  const msalAccount = instance.getAllAccounts()[0]
  const storedUser: AuthUser = JSON.parse(localStorage.getItem('auth_user') ?? '{}')
  const name = msalAccount?.name ?? storedUser.name ?? ''
  const role = storedUser.role ?? 'employee'
  const initial = (name.charAt(0) || 'U').toUpperCase()

  const navItems = role === 'counselor' ? COUNSELOR_NAV : EMPLOYEE_NAV

  function handleLogout() {
    logout()
  }

  // Blocca il render finché il guard non ha effettuato il redirect
  if (!isAuthenticated && inProgress === InteractionStatus.None) {
    return null
  }

  return (
    <div className={styles.layout}>

      {/* ━━━ SIDEBAR DESKTOP (≥1024px) ━━━ */}
      <aside className={styles.sidebar} aria-label="Barra laterale">
        <div className={styles.sidebarLogo}>
          <span className={`material-symbols-outlined ${styles.logoIcon}`} aria-hidden="true">hub</span>
          <span className={styles.logoText}>Cardine</span>
        </div>

        <nav className={styles.sidebarNav} aria-label="Navigazione principale">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar} aria-label={`Avatar di ${name}`}>
              {initial}
            </div>
            <div className={styles.userMeta}>
              <span className={styles.userName}>{name || 'Utente'}</span>
              <span className={styles.userRole}>{role}</span>
            </div>
          </div>
          <button
            type="button"
            className={styles.logoutBtn}
            onClick={handleLogout}
            aria-label="Esci dall'applicazione"
          >
            <span className="material-symbols-outlined" aria-hidden="true">logout</span>
            <span className={styles.navLabel}>Esci</span>
          </button>
        </div>
      </aside>

      {/* ━━━ AREA CONTENUTO ━━━ */}
      <div className={styles.contentWrapper}>

        {/* Top header: logo (mobile) + azioni */}
        <header className={styles.topHeader}>
          <div className={styles.mobileLogoArea}>
            <span className={`material-symbols-outlined ${styles.logoIcon}`} aria-hidden="true">hub</span>
            <span className={styles.logoText}>Cardine</span>
          </div>

          <div className={styles.headerActions}>
            <button type="button" className={styles.iconBtn} aria-label="Notifiche">
              <span className="material-symbols-outlined" aria-hidden="true">notifications</span>
            </button>
            <div className={styles.avatar} aria-label={`Avatar di ${name}`}>
              {initial}
            </div>
          </div>
        </header>

        <main className={styles.main}>
          <Outlet />
        </main>
      </div>

      {/* ━━━ BOTTOM NAV MOBILE (<1024px) ━━━ */}
      <nav className={styles.bottomNav} aria-label="Navigazione principale">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.bottomNavItem} ${isActive ? styles.bottomNavItemActive : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                aria-hidden="true"
              >
                {item.icon}
              </span>
              <span className={styles.bottomNavLabel}>{item.label}</span>
            </Link>
          )
        })}
      </nav>

    </div>
  )
}
