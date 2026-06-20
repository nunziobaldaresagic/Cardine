import { useEffect, useState } from 'react'
import { useIsAuthenticated, useMsal } from '@azure/msal-react'
import { InteractionStatus } from '@azure/msal-browser'
import { loginRequest, LOGIN_SCOPES } from '@/lib/msalConfig'
import styles from './LoginPage.module.css'

const CARDINE_LOGO =
  'https://lh3.googleusercontent.com/aida/AP1WRLvE88KAXXzYHoNOU9vf8YGwQQnL9FZ6HlG3rhy00aYzQ_RdfCBwZro_lsaUgBfmN0UpI5r4duizX2v-DDxFug7PYgK3G9gzMLZ5p8s4xCNeDOuYF2Ks3cf6ya0JcJEyK72jfzaIiVPMdc8VXDSmeNXFJ1MtnqdYurKKWd6NUilZWsf0Dun-4MHWNjLzCw_nvyhanJcDuNmGbVWa0I7nrMtxwQB4r4Tms1pcVzlHXKrjnmscrzuXI0Jns3Y'

const MS_ICON = (
  <svg width="20" height="20" viewBox="0 0 21 21" aria-hidden="true">
    <path d="M10 0H0V10H10V0Z" fill="#F25022" />
    <path d="M21 0H11V10H21V0Z" fill="#7FBA00" />
    <path d="M10 11H0V21H10V11Z" fill="#00A4EF" />
    <path d="M21 11H11V21H21V11Z" fill="#FFB900" />
  </svg>
)

const YEAR = new Date().getFullYear()

export default function LoginPage() {
  const { instance, inProgress } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dopo il redirect MSAL: acquisisci token, salva in localStorage e vai alla dashboard
  useEffect(() => {
    if (isAuthenticated && inProgress === InteractionStatus.None) {
      const account = instance.getAllAccounts()[0]
      if (!account) return
      instance
        .acquireTokenSilent({ scopes: LOGIN_SCOPES, account })
        .then((result) => {
          localStorage.setItem('access_token', result.idToken)
          localStorage.setItem(
            'auth_user',
            JSON.stringify({
              id: account.homeAccountId,
              name: account.name ?? account.username,
              role: 'employee',
            }),
          )
          window.location.href = '/app/dashboard'
        })
        .catch(() => {
          void instance.loginRedirect(loginRequest)
        })
    }
  }, [isAuthenticated, inProgress, instance])

  async function handleLogin() {
    setLoading(true)
    setError(null)
    try {
      await instance.loginRedirect(loginRequest)
    } catch {
      setError('Accesso non riuscito. Riprova.')
      setLoading(false)
    }
  }

  return (
    <>
      {/* ━━━ MOBILE (<1024px) ━━━ */}
      <div className={styles.mobile}>
        <div className={styles.bgGrid} aria-hidden="true">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="m-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1A6B72" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#m-grid)" />
          </svg>
        </div>
        <div className={`${styles.blob} ${styles.blobTR}`} aria-hidden="true" />
        <div className={`${styles.blob} ${styles.blobBL}`} aria-hidden="true" />

        <div className={styles.mobileWrap}>
          <div className={styles.glassCard}>
            <img src={CARDINE_LOGO} alt="Cardine" className={styles.mobileLogoImg} />
            <h1 className={styles.mobileHeadline}>Benvenuto in Cardine</h1>
            <p className={styles.mobileSubtitle}>
              Accedi per esplorare le tue opportunità di crescita professionale.
            </p>

            {/* Security — PRIMA del bottone su mobile */}
            <div className={styles.mobileSecurityBox}>
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1", color: 'var(--color-primary-container)', marginTop: '2px', fontSize: '20px' }}
                aria-hidden="true"
              >shield_lock</span>
              <div>
                <h3 className={styles.securityTitle}>Accesso Sicuro Aziendale</h3>
                <p className={styles.securityText}>
                  Utilizziamo il Single Sign-On (SSO) tramite il tuo account aziendale
                  per garantire la massima sicurezza dei tuoi dati.
                </p>
              </div>
            </div>

            <button type="button" className={styles.ctaBtn} onClick={handleLogin} disabled={loading}>
              {MS_ICON}
              {loading ? 'Accesso in corso…' : 'Entra con Microsoft Entra ID'}
            </button>
            {error !== null && (
              <p className={styles.errorMsg}>{error}</p>
            )}
          </div>

          <div className={styles.mobileFooter}>
            <div className={styles.mobileFooterLinks}>
              <a href="#">Supporto</a>
              <span className={styles.footerDot} aria-hidden="true">•</span>
              <a href="#">Informativa sulla privacy</a>
            </div>
            <p className={styles.copyright}>© {YEAR} Cardine. Tutti i diritti riservati.</p>
          </div>
        </div>
      </div>

      {/* ━━━ DESKTOP (≥1024px) ━━━ */}
      <div className={styles.desktop}>
        <main className={styles.desktopMain}>
          <div className={styles.desktopCard}>

            {/* Sinistra: login */}
            <div className={styles.loginPanel}>
              <div className={styles.desktopLogoGroup}>
                <img src={CARDINE_LOGO} alt="Cardine" className={styles.desktopLogoImg} />
                <h1 className={styles.desktopHeadline}>Benvenuto in Cardine</h1>
                <p className={styles.desktopSubtitle}>
                  Accedi alla piattaforma per gestire la tua crescita professionale
                  e scoprire nuove opportunità interne.
                </p>
              </div>

              <div className={styles.desktopActions}>
                {/* CTA — PRIMA della security su desktop */}
                <button type="button" className={`${styles.ctaBtn} ${styles.ctaBtnDesktop}`} onClick={handleLogin} disabled={loading}>
                  {MS_ICON}
                  {loading ? 'Accesso in corso…' : 'Entra con Microsoft Entra ID'}
                  <span className={styles.ctaArrow} aria-hidden="true">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                  </span>
                </button>
                {error !== null && (
                  <p className={styles.errorMsg}>{error}</p>
                )}

                <div className={styles.divider} aria-hidden="true">
                  <span className={styles.dividerLine} />
                  <span className={styles.dividerLabel}>oppure</span>
                  <span className={styles.dividerLine} />
                </div>

                {/* Security — DOPO il bottone su desktop */}
                <div className={styles.desktopSecurityBox}>
                  <div className={styles.securityBoxHeader}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1", color: 'var(--color-secondary-container)', fontSize: '20px', flexShrink: 0 }}
                      aria-hidden="true"
                    >shield_locked</span>
                    <h3 className={styles.securityTitle}>Accesso Sicuro Aziendale</h3>
                  </div>
                  <p className={`${styles.securityText} ${styles.securityTextIndent}`}>
                    Cardine utilizza l'infrastruttura Microsoft Entra ID della tua azienda.
                    I tuoi dati personali, le credenziali e le informazioni sulla carriera
                    sono crittografati e gestiti in conformità con le policy di sicurezza
                    aziendali. Nessuna password aggiuntiva è richiesta o memorizzata da Cardine.
                  </p>
                </div>
              </div>
            </div>

            {/* Destra: branding */}
            <div className={styles.brandPanel} aria-hidden="true">
              <div className={styles.brandBlob1} />
              <div className={styles.brandBlob2} />
              <div className={styles.brandContent}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 0", fontSize: '64px', color: 'var(--color-primary-container)', display: 'block', marginBottom: 'var(--space-md)' }}
                >psychology</span>
                <h2 className={styles.brandHeadline}>Pivotal Growth</h2>
                <p className={styles.brandText}>
                  Mappa le tue competenze, esplora percorsi di carriera interni e
                  trova il tuo prossimo ruolo ideale all'interno dell'organizzazione.
                </p>
                <ul className={styles.featurePills}>
                  <li>Skill Mapping</li>
                  <li>Internal Mobility</li>
                  <li>Career Paths</li>
                </ul>
              </div>
            </div>

          </div>
        </main>

        <footer className={styles.desktopFooter}>
          <span>© {YEAR} Cardine. All rights reserved.</span>
          <nav className={styles.desktopFooterNav}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Support</a>
          </nav>
        </footer>
      </div>
    </>
  )
}
