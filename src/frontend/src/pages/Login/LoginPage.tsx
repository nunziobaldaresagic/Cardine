import styles from './LoginPage.module.css'

const MICROSOFT_ICON = (
  <svg width="20" height="20" viewBox="0 0 21 21" aria-hidden="true">
    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
  </svg>
)

export default function LoginPage() {
  function handleLogin() {
    // TODO: sostituire con redirect MSAL fornito dal backend
    window.location.href = '/api/auth/entra/login'
  }

  return (
    <div className={styles.root}>
      {/* ── Pannello branding (solo desktop) ── */}
      <aside className={styles.branding} aria-hidden="true">
        <div className={styles.brandingInner}>
          <div className={styles.logo}>
            <span className={styles.logoMark} />
            <span className={styles.logoText}>Cardine</span>
          </div>

          <div className={styles.brandingCopy}>
            <p className={styles.brandingEyebrow}>Pivotal Growth</p>
            <h1 className={styles.brandingHeadline}>
              Mappa le tue competenze.<br />
              Scopri dove puoi arrivare.
            </h1>
            <p className={styles.brandingSubtitle}>
              Esplora percorsi di carriera interni e trova il tuo
              prossimo ruolo ideale all'interno dell'organizzazione.
            </p>
          </div>

          <ul className={styles.featurePills} aria-label="Funzionalità">
            <li>Skill Mapping</li>
            <li>Internal Mobility</li>
            <li>Career Paths</li>
          </ul>
        </div>
      </aside>

      {/* ── Card login ── */}
      <main className={styles.card}>
        <div className={styles.cardInner}>
          {/* Logo mobile */}
          <div className={styles.logoMobile} aria-label="Cardine">
            <span className={styles.logoMark} />
            <span className={styles.logoText}>Cardine</span>
          </div>

          <h2 className={styles.headline}>Benvenuto in Cardine</h2>
          <p className={styles.subtitle}>
            Accedi per esplorare le tue opportunità di crescita professionale.
          </p>

          <button
            type="button"
            className={styles.cta}
            onClick={handleLogin}
          >
            {MICROSOFT_ICON}
            Entra con Microsoft Entra ID
          </button>

          <div className={styles.securityNote}>
            <svg
              className={styles.shieldIcon}
              viewBox="0 0 24 24"
              width="16"
              height="16"
              aria-hidden="true"
              fill="currentColor"
            >
              <path d="M12 1L3 5v6c0 5.25 3.75 10.15 9 11.35C17.25 21.15 21 16.25 21 11V5l-9-4zm0 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 13c-2 0-4-.9-5.4-2.5.3-1.8 2.7-2.5 5.4-2.5s5.1.7 5.4 2.5C16 17.1 14 18 12 18z" />
            </svg>
            <div>
              <strong>Accesso Sicuro Aziendale</strong>
              <p>
                Utilizziamo SSO tramite il tuo account aziendale. Nessuna
                password aggiuntiva è richiesta o memorizzata da Cardine.
              </p>
            </div>
          </div>
        </div>

        <footer className={styles.footer}>
          <a href="#">Supporto</a>
          <span aria-hidden="true">·</span>
          <a href="#">Informativa sulla privacy</a>
          <p>© {new Date().getFullYear()} Cardine. Tutti i diritti riservati.</p>
        </footer>
      </main>
    </div>
  )
}
