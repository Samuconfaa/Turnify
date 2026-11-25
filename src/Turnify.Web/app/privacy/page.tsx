import Link from 'next/link';

export const metadata = {
  title: 'TurniUp',
  description: 'Informativa sul trattamento dei dati personali ai sensi del GDPR.',
};

export default function PrivacyPage() {
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
          <div className="lp-legal-eyebrow"><span/>GDPR — Reg. UE 2016/679</div>
          <h1>Privacy Policy</h1>
          <p className="lp-legal-date">Ultimo aggiornamento: 2 giugno 2026</p>

          <div className="lp-legal-body">

            <h2>1. Titolare del trattamento</h2>
            <p>Il Titolare del trattamento dei dati personali degli utenti che si registrano e utilizzano il Servizio TurniUp è:</p>
            <p><strong>TurniUp</strong><br />
            Email: <strong>privacy@turniup.it</strong></p>

            <h2>2. Tipologie di dati trattati</h2>
            <p>TurniUp tratta le seguenti categorie di dati personali:</p>
            <ul>
              <li><strong>Dati di registrazione:</strong> nome, cognome, indirizzo email, nome dell&apos;azienda, password (in forma cifrata)</li>
              <li><strong>Dati di utilizzo:</strong> log di accesso, indirizzo IP, tipo di browser, pagine visitate, azioni eseguite nella piattaforma</li>
              <li><strong>Dati dei dipendenti (inseriti dai clienti):</strong> nome, cognome, ruolo, orari di lavoro, presenze, ferie e permessi</li>
              <li><strong>Dati di comunicazione:</strong> email inviate tramite il servizio, notifiche push</li>
            </ul>

            <h2>3. Finalità e base giuridica del trattamento</h2>
            <p>I dati personali vengono trattati per le seguenti finalità:</p>
            <ul>
              <li><strong>Esecuzione del contratto (art. 6.1.b GDPR):</strong> erogazione del Servizio, gestione dell&apos;account, supporto tecnico</li>
              <li><strong>Obbligo legale (art. 6.1.c GDPR):</strong> adempimenti fiscali, contabili e normativi</li>
              <li><strong>Legittimo interesse (art. 6.1.f GDPR):</strong> sicurezza della piattaforma, prevenzione di frodi, miglioramento del Servizio mediante analisi aggregate e anonime</li>
              <li><strong>Consenso (art. 6.1.a GDPR):</strong> invio di comunicazioni commerciali e newsletter (solo se espressamente richiesto)</li>
            </ul>

            <h2>4. Modalità di trattamento e conservazione</h2>
            <p>I dati sono trattati con strumenti elettronici in modo da garantirne la sicurezza e la riservatezza. Adottiamo misure tecniche e organizzative adeguate ai sensi dell&apos;art. 32 GDPR (cifratura dei dati in transito con TLS, cifratura delle password, accessi limitati al personale autorizzato).</p>
            <p>I dati sono conservati per il tempo strettamente necessario:</p>
            <ul>
              <li>Dati di account attivo: per tutta la durata del contratto</li>
              <li>Dati dopo cancellazione account: massimo 30 giorni (salvo obblighi di legge)</li>
              <li>Log di sicurezza: 12 mesi</li>
            </ul>

            <h2>5. Comunicazione e diffusione dei dati</h2>
            <p>I dati non vengono venduti né ceduti a terzi per finalità commerciali. Possono essere comunicati a:</p>
            <ul>
              <li>Fornitori di servizi tecnici (hosting, email transazionali) che agiscono come Responsabili del trattamento ex art. 28 GDPR</li>
              <li>Autorità competenti su richiesta di legge</li>
            </ul>

            <h2>6. Trasferimento dati extra-UE</h2>
            <p>I dati sono conservati su server localizzati nell&apos;Unione Europea. Qualora si renda necessario un trasferimento extra-UE, questo avviene nel rispetto delle garanzie previste dal GDPR (Decisioni di adeguatezza, Clausole contrattuali standard).</p>

            <h2>7. Diritti dell&apos;interessato</h2>
            <p>Ai sensi degli artt. 15–22 GDPR, l&apos;interessato ha il diritto di:</p>
            <ul>
              <li><strong>Accesso (art. 15):</strong> ottenere conferma che sia in corso un trattamento di dati personali e accedere a tali dati</li>
              <li><strong>Rettifica (art. 16):</strong> rettificare dati inesatti o incompleti</li>
              <li><strong>Cancellazione (art. 17):</strong> ottenere la cancellazione dei propri dati ("diritto all&apos;oblio")</li>
              <li><strong>Limitazione (art. 18):</strong> ottenere la limitazione del trattamento</li>
              <li><strong>Portabilità (art. 20):</strong> ricevere i propri dati in formato strutturato e leggibile da macchina</li>
              <li><strong>Opposizione (art. 21):</strong> opporsi al trattamento basato su legittimo interesse</li>
              <li><strong>Revoca del consenso:</strong> revocare in qualsiasi momento il consenso prestato, senza pregiudicarne la legittimità del trattamento anteriore</li>
            </ul>
            <p>Le richieste possono essere inviate a: <strong>privacy@turniup.it</strong><br/>
            Risponderemo entro 30 giorni dalla ricezione.</p>

            <h2>8. Diritto di reclamo</h2>
            <p>L&apos;interessato ha il diritto di proporre reclamo al Garante per la Protezione dei Dati Personali (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">www.garanteprivacy.it</a>) qualora ritenga che il trattamento dei propri dati violi il GDPR.</p>

            <h2>9. Cookie</h2>
            <p>Per informazioni sui cookie utilizzati da TurniUp, consultare la nostra <Link href="/cookie">Cookie Policy</Link>.</p>

            <h2>10. Modifiche alla Privacy Policy</h2>
            <p>Ci riserviamo il diritto di modificare la presente informativa. Le modifiche significative verranno comunicate via email. La versione aggiornata sarà sempre disponibile su questa pagina.</p>

            <h2>11. Contatti DPO</h2>
            <p>Per qualsiasi questione relativa alla protezione dei dati personali: <strong>privacy@turniup.it</strong></p>

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
