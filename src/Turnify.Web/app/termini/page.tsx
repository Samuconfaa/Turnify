import Link from 'next/link';

export const metadata = {
  title: 'TurniUp',
  description: 'Termini e condizioni di utilizzo della piattaforma TurniUp.',
};

export default function TerminiPage() {
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
          <div className="lp-legal-eyebrow"><span/>Documento legale</div>
          <h1>Termini di Servizio</h1>
          <p className="lp-legal-date">Ultimo aggiornamento: 2 giugno 2026</p>

          <div className="lp-legal-body">

            <h2>1. Oggetto e accettazione</h2>
            <p>I presenti Termini di Servizio (&quot;Termini&quot;) regolano l&apos;accesso e l&apos;utilizzo della piattaforma TurniUp (&quot;Servizio&quot;), accessibile all&apos;indirizzo <strong>turniup.it</strong>, sviluppata e gestita da TurniUp (&quot;noi&quot; o &quot;il Fornitore&quot;).</p>
            <p>Accedendo o utilizzando il Servizio, l&apos;utente (&quot;Utente&quot; o &quot;Cliente&quot;) dichiara di aver letto, compreso e accettato integralmente i presenti Termini. In caso di disaccordo è necessario interrompere immediatamente l&apos;utilizzo.</p>

            <h2>2. Descrizione del Servizio</h2>
            <p>TurniUp è una piattaforma SaaS (Software as a Service) destinata alle aziende per la gestione di turni di lavoro, presenze, ferie e permessi dei dipendenti. Il Servizio comprende:</p>
            <ul>
              <li>Pannello web di amministrazione per datori di lavoro</li>
              <li>Applicazione mobile per i dipendenti (iOS e Android)</li>
              <li>API di integrazione</li>
              <li>Notifiche automatiche</li>
            </ul>

            <h2>3. Registrazione e account</h2>
            <p>Per utilizzare il Servizio è necessario creare un account fornendo informazioni veritiere, accurate e aggiornate. L&apos;Utente è responsabile della riservatezza delle proprie credenziali di accesso e di tutte le attività svolte tramite il proprio account.</p>
            <p>TurniUp si riserva il diritto di sospendere o cancellare account che violino i presenti Termini.</p>

            <h2>4. Utilizzo corretto del Servizio</h2>
            <p>L&apos;Utente si impegna a:</p>
            <ul>
              <li>Non utilizzare il Servizio per finalità illecite o in violazione di leggi applicabili</li>
              <li>Non tentare di accedere a dati di altri utenti senza autorizzazione</li>
              <li>Non effettuare attività di scraping, reverse engineering o sovraccarico dei sistemi</li>
              <li>Rispettare la normativa vigente in materia di lavoro e privacy</li>
            </ul>

            <h2>5. Dati dei dipendenti e responsabilità</h2>
            <p>Il Cliente che utilizza TurniUp per gestire i propri dipendenti agisce in qualità di <strong>Titolare del trattamento</strong> dei dati personali dei propri dipendenti. TurniUp agisce come <strong>Responsabile del trattamento</strong> ai sensi dell&apos;art. 28 GDPR. Le condizioni del trattamento sono disciplinate dalla nostra <Link href="/privacy">Privacy Policy</Link>.</p>

            <h2>6. Proprietà intellettuale</h2>
            <p>Tutti i diritti di proprietà intellettuale relativi alla piattaforma TurniUp (codice sorgente, design, marchi, loghi, documentazione) appartengono esclusivamente al Fornitore. È vietata qualsiasi riproduzione, distribuzione o utilizzo non autorizzato.</p>

            <h2>7. Disponibilità del Servizio</h2>
            <p>TurniUp si impegna a garantire la massima disponibilità del Servizio, ma non può garantire un uptime del 100%. Ci riserviamo il diritto di effettuare manutenzioni programmate, preferibilmente nelle ore notturne, con preavviso quando possibile.</p>

            <h2>8. Limitazione di responsabilità</h2>
            <p>Nei limiti consentiti dalla legge applicabile, TurniUp non sarà responsabile per danni indiretti, incidentali, speciali o consequenziali derivanti dall&apos;utilizzo o dall&apos;impossibilità di utilizzo del Servizio.</p>

            <h2>9. Modifiche ai Termini</h2>
            <p>TurniUp si riserva il diritto di modificare i presenti Termini in qualsiasi momento. Le modifiche verranno comunicate via email o tramite avviso nella piattaforma con almeno 15 giorni di preavviso. Il proseguimento dell&apos;utilizzo del Servizio dopo tale periodo costituisce accettazione delle modifiche.</p>

            <h2>10. Risoluzione e cancellazione account</h2>
            <p>L&apos;Utente può cancellare il proprio account in qualsiasi momento contattandoci all&apos;indirizzo <strong>privacy@turniup.it</strong>. A seguito della cancellazione, i dati saranno eliminati secondo quanto previsto dalla nostra Privacy Policy.</p>

            <h2>11. Legge applicabile e foro competente</h2>
            <p>I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia è competente il Tribunale di [Città], salvo quanto diversamente previsto dalla normativa a tutela dei consumatori.</p>

            <h2>12. Contatti</h2>
            <p>Per qualsiasi informazione sui presenti Termini: <strong>info@turniup.it</strong></p>

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
