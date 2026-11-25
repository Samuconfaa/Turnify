import Link from 'next/link';

export const metadata = {
  title: 'TurniUp',
  description: 'Informativa sull\'utilizzo dei cookie sul sito TurniUp.',
};

export default function CookiePage() {
  return (
    <div className="lp">
      {/* ── NAVBAR ── */}
      <header className="lp-nav">
        <div className="lp-wrap lp-nav-inner">
          <Link href="/" className="lp-brand">
            <span className="lp-bmark">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="17" rx="3"/><path d="M3 9h18M8 2v4M16 2v4"/><path d="M8 14h3"/>
              </svg>
            </span>
            TurniUp
          </Link>
          <div className="lp-actions">
            <Link href="/login" className="lp-btn-ghost">Accedi</Link>
            <Link href="/register" className="lp-btn-cta">Inizia gratis</Link>
          </div>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <div className="lp-wrap" style={{ padding: '60px 28px 100px' }}>
        <div className="lp-legal">
          <div className="lp-legal-eyebrow"><span/>Informativa Cookie</div>
          <h1>Cookie Policy</h1>
          <p className="lp-legal-date">Ultimo aggiornamento: 2 giugno 2026</p>

          <div className="lp-legal-body">

            <h2>1. Cosa sono i cookie</h2>
            <p>I cookie sono piccoli file di testo che i siti web salvano sul dispositivo dell&apos;utente durante la navigazione. Vengono utilizzati per far funzionare i siti in modo efficiente, migliorare l&apos;esperienza utente e fornire informazioni ai proprietari del sito.</p>

            <h2>2. Cookie utilizzati da TurniUp</h2>

            <h3>Cookie tecnici (necessari)</h3>
            <p>Questi cookie sono indispensabili per il funzionamento del sito e non richiedono il consenso dell&apos;utente ai sensi dell&apos;art. 122 D.Lgs. 196/2003.</p>
            <div className="lp-legal-table">
              <table>
                <thead>
                  <tr><th>Nome</th><th>Scopo</th><th>Durata</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>access_token</code></td>
                    <td>Token JWT per l&apos;autenticazione dell&apos;utente nella sessione corrente</td>
                    <td>15 minuti</td>
                  </tr>
                  <tr>
                    <td><code>refresh_token</code></td>
                    <td>Token di rinnovo della sessione autenticata</td>
                    <td>7 giorni</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>Cookie analitici (anonimi)</h3>
            <p>TurniUp attualmente <strong>non utilizza</strong> cookie analitici di terze parti (come Google Analytics). Le statistiche di utilizzo sono elaborate esclusivamente tramite log anonimi lato server.</p>

            <h3>Cookie di profilazione e marketing</h3>
            <p>TurniUp <strong>non utilizza</strong> cookie di profilazione o marketing.</p>

            <h2>3. Cookie di terze parti</h2>
            <p>Il sito può includere funzionalità fornite da terze parti (ad esempio, font Google). Questi servizi possono impostare propri cookie. Consulta le rispettive informative privacy per maggiori dettagli:</p>
            <ul>
              <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Fonts / Google Privacy Policy</a></li>
            </ul>

            <h2>4. Come gestire i cookie</h2>
            <p>I cookie tecnici non possono essere disabilitati senza compromettere il funzionamento del Servizio. Per i cookie analitici e di terze parti, è possibile gestire le preferenze tramite le impostazioni del browser:</p>
            <ul>
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/it/kb/Attivare%20e%20disattivare%20i%20cookie" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Apple Safari</a></li>
              <li><a href="https://support.microsoft.com/it-it/windows/eliminare-e-gestire-i-cookie-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
            </ul>

            <h2>5. Modifiche alla Cookie Policy</h2>
            <p>Ci riserviamo il diritto di aggiornare la presente Cookie Policy. Le modifiche saranno pubblicate su questa pagina con aggiornamento della data in calce.</p>

            <h2>6. Contatti</h2>
            <p>Per informazioni sui cookie: <strong>privacy@turniup.it</strong></p>
            <p>Per la gestione completa dei tuoi dati consulta la nostra <Link href="/privacy">Privacy Policy</Link>.</p>

          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="lp-foot">
        <div className="lp-wrap lp-foot-inner">
          <Link href="/" className="lp-brand">
            <span className="lp-bmark">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="17" rx="3"/><path d="M3 9h18M8 2v4M16 2v4"/><path d="M8 14h3"/>
              </svg>
            </span>
            TurniUp
          </Link>
          <span className="lp-foot-copy">© 2026 TurniUp. Tutti i diritti riservati.</span>
          <nav className="lp-foot-links">
            <Link href="/termini">Termini di servizio</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/cookie">Cookie Policy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
