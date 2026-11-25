import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TurniUp | Gestione Turni con AI | App Turni per Team Italiani',
  description:
    'TurniUp è il software italiano per la gestione turni del personale. Pianifica con l\'AI, gestisci ferie, presenze e notifiche in tempo reale. Gratuito per iniziare, app iOS e Android inclusa.',
  keywords: [
    'gestione turni', 'software turni', 'pianificazione turni personale',
    'app turni lavoro', 'turni dipendenti', 'gestione presenze',
    'ferie permessi', 'turni AI', 'scheduling automatico',
  ],
  alternates: { canonical: 'https://turniup.it/' },
  openGraph: {
    type: 'website',
    url: 'https://turniup.it/',
    title: 'TurniUp | Gestione Turni con AI per il Tuo Team',
    description: 'Pianifica i turni del personale con l\'AI. Meno Excel, meno chiamate. App per dipendenti su iOS e Android inclusa, gratis.',
    locale: 'it_IT',
    siteName: 'TurniUp',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TurniUp | Gestione Turni con AI',
    description: 'Software italiano per la pianificazione turni con AI integrata. Gratuito per iniziare.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'TurniUp',
      url: 'https://turniup.it',
      description: 'Software italiano per la gestione e pianificazione dei turni del personale, con intelligenza artificiale integrata.',
      foundingLocation: { '@type': 'Place', addressCountry: 'IT' },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'TurniUp',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'iOS, Android, Web',
      description: 'TurniUp è un software per la gestione dei turni del personale con pianificazione AI, ferie, presenze, timbrature e notifiche in tempo reale.',
      url: 'https://turniup.it',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      featureList: [
        'Generazione turni con intelligenza artificiale',
        'Pianificazione drag & drop',
        'App mobile iOS e Android',
        'Gestione ferie e permessi',
        'Presenze e timbrature GPS',
        'Notifiche push in tempo reale',
        'Multi-sede e multi-azienda',
        'Conformità GDPR',
      ],
      inLanguage: 'it',
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Cos\'è TurniUp?', acceptedAnswer: { '@type': 'Answer', text: 'TurniUp è un software italiano per la gestione dei turni del personale. Permette ai manager di pianificare i turni, gestire ferie e permessi, monitorare le presenze e comunicare con il team in tempo reale, tramite web e app mobile per iOS e Android.' } },
        { '@type': 'Question', name: 'Come funziona la pianificazione turni con l\'AI?', acceptedAnswer: { '@type': 'Answer', text: 'TurniUp usa l\'intelligenza artificiale per generare automaticamente la bozza dei turni settimanali, tenendo conto delle disponibilità, ferie approvate, ruoli richiesti e ore contrattuali. Il manager rivede la proposta e la approva o modifica prima della pubblicazione.' } },
        { '@type': 'Question', name: 'TurniUp è gratuito?', acceptedAnswer: { '@type': 'Answer', text: 'Sì, TurniUp offre un piano gratuito per iniziare senza carta di credito. Per team più grandi o con funzionalità avanzate come l\'AI scheduling sono disponibili piani a pagamento.' } },
        { '@type': 'Question', name: 'Per quali settori è adatto TurniUp?', acceptedAnswer: { '@type': 'Answer', text: 'TurniUp è pensato per ristoranti, bar, hotel, palestre, negozi al dettaglio, supermercati, cliniche, farmacie e qualsiasi team con orari a rotazione, part-time o H24.' } },
        { '@type': 'Question', name: 'I dipendenti devono installare un\'app?', acceptedAnswer: { '@type': 'Answer', text: 'Sì, TurniUp include un\'app mobile gratuita per i dipendenti, disponibile su iOS e Android. Dall\'app vedono i turni, richiedono cambi o ferie e ricevono notifiche push in tempo reale.' } },
        { '@type': 'Question', name: 'TurniUp è conforme al GDPR?', acceptedAnswer: { '@type': 'Answer', text: 'Sì, TurniUp è conforme al GDPR. I dati sono su server europei. I lavoratori esercitano i diritti di accesso, rettifica e cancellazione direttamente dall\'app.' } },
        { '@type': 'Question', name: 'Posso gestire più sedi o aziende?', acceptedAnswer: { '@type': 'Answer', text: 'Sì, TurniUp supporta multi-sede e multi-azienda da un\'unica dashboard, con team, orari e regole diverse per ogni punto vendita.' } },
        { '@type': 'Question', name: 'Come vengono gestite le timbrature?', acceptedAnswer: { '@type': 'Answer', text: 'I dipendenti timbrano entrata e uscita dall\'app mobile. Il sistema registra ora e posizione GPS, permettendo di confrontare ore pianificate ed effettive.' } },
      ],
    },
  ],
};

const features = [
  { icon: 'M3 4h18v17H3zM3 9h18M8 2v4M16 2v4M8 14h4M8 17h2', title: 'Pianificazione drag & drop', desc: 'Crea e sposta turni trascinandoli sul calendario. La copertura si aggiorna in tempo reale.' },
  { icon: 'M6 2h12a3 3 0 0 1 0 20H6a3 3 0 0 1 0-20zM11 18h2', title: 'App per i dipendenti', desc: 'Ogni collaboratore vede i propri turni, richiede cambi e riceve aggiornamenti dal telefono, su iOS e Android.' },
  { icon: 'M8 2v4M16 2v4M3 10h18M3 4h18v18H3zM9 16l2 2 4-4', title: 'Ferie e permessi', desc: 'Richieste, approvazioni e saldo giorni in un flusso unico, senza email né moduli cartacei.' },
  { icon: 'M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3zM12 7v5l3 2', title: 'Presenze e timbrature', desc: "Timbrate dall'app con verifica GPS. Confronta ore pianificate ed effettive in un attimo." },
  { icon: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M10.3 21a1.94 1.94 0 0 0 3.4 0', title: 'Notifiche in tempo reale', desc: "Pubblichi i turni e tutto il team viene avvisato all'istante via push." },
  { icon: 'M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M17 21V9h4v12M8 7h2M8 11h2M8 15h2', title: 'Multi-sede e multi-azienda', desc: 'Gestisci più punti vendita da un unica dashboard, ciascuno con il proprio team.' },
];

const sectors = [
  { icon: 'M3 11l19-9-9 19-2-8-8-2z', title: 'Ristorazione', desc: 'Turni di cucina e sala, coperture weekend e sostituzioni last-minute.' },
  { icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10', title: 'Hotel e hospitality', desc: 'Ricevimento, housekeeping e F&B su più turni e stagioni di punta.' },
  { icon: 'M18 20V10M12 20V4M6 20v-6', title: 'Palestre e sport', desc: 'Istruttori e reception con orari spezzati e classi variabili.' },
  { icon: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0', title: 'Negozi e retail', desc: 'Picchi del weekend, part-time e copertura minima garantita.' },
  { icon: 'M22 12h-4l-3 9L9 3l-3 9H2', title: 'Sanità e cliniche', desc: 'Turni H24 con notturni, festivi e reperibilità. GDPR incluso.' },
  { icon: 'M2 7h20v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7zM16 7V5a2 2 0 0 0-4 0v2M12 12v4M10 14h4', title: 'Farmacie', desc: 'Turni di apertura e reperibilità notturna gestiti con facilità.' },
  { icon: 'M3 3h18v18H3zM9 9h6M9 12h6M9 15h4', title: 'GDO e supermercati', desc: 'Reparti, casse, stagisti e contratti misti in un\'unica dashboard.' },
  { icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 8v4l3 3', title: 'Qualsiasi team a turni', desc: 'Se lavori su orari variabili, TurniUp si adatta. Senza configurazioni complesse.' },
];

const faqs = [
  { q: 'Cos\'è TurniUp?', a: 'TurniUp è un software italiano per la gestione dei turni del personale. Permette ai manager di pianificare i turni, gestire ferie e permessi, monitorare le presenze e comunicare con il team in tempo reale, tramite web e app mobile per iOS e Android.' },
  { q: 'Come funziona la pianificazione turni con l\'AI?', a: 'Scrivi una richiesta in linguaggio naturale (es. "genera la settimana dal 16 al 22 Giugno") e TurniUp genera automaticamente la bozza dei turni, tenendo conto delle disponibilità, ferie approvate, ruoli richiesti e ore contrattuali. Rivedi la proposta, modificala se serve e pubblicala con un clic. Il team viene notificato all\'istante.' },
  { q: 'TurniUp è gratuito?', a: 'Sì, TurniUp offre un piano gratuito per iniziare subito, senza carta di credito. Per team più grandi o con funzionalità avanzate, come l\'AI scheduling e l\'analytics, sono disponibili piani a pagamento.' },
  { q: 'Per quali settori è adatto TurniUp?', a: 'TurniUp è pensato per qualsiasi azienda con turni variabili: ristoranti, bar, hotel, palestre, negozi, supermercati, cliniche, farmacie e qualsiasi team con orari a rotazione, part-time o H24.' },
  { q: 'I dipendenti devono installare un\'app?', a: 'Sì, TurniUp include un\'app mobile gratuita per i dipendenti, disponibile su iOS e Android. Dall\'app vedono i turni, inseriscono disponibilità, richiedono cambi o ferie e ricevono notifiche push in tempo reale.' },
  { q: 'TurniUp è conforme al GDPR?', a: 'Sì, TurniUp è sviluppato in conformità al GDPR. I dati dei dipendenti sono conservati su server europei e i lavoratori possono esercitare i propri diritti di accesso, rettifica e cancellazione direttamente dall\'app.' },
  { q: 'Posso gestire più sedi o aziende?', a: 'Sì, TurniUp supporta la gestione multi-sede e multi-azienda da un\'unica dashboard. Puoi assegnare team, orari e regole diverse per ogni punto vendita e monitorare tutto in un colpo d\'occhio.' },
  { q: 'Come vengono gestite le timbrature?', a: 'I dipendenti timbrano entrata e uscita dall\'app mobile. Il sistema registra ora e posizione GPS, permettendo al manager di verificare le presenze e confrontare ore pianificate ed effettive.' },
];

export default function LandingPage() {
  return (
    <div className="lp">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── NAVBAR ── */}
      <header className="lp-nav">
        <div className="lp-wrap lp-nav-inner">
          <Link href="/" className="lp-brand">
            <span className="lp-bmark">
              <img src="/splash.png" alt="TurniUp" />
            </span>
            TurniUp
          </Link>
          <nav className="lp-links">
            <a href="#funzionalita">Funzionalità</a>
            <a href="#ai-turni">AI Scheduling</a>
            <a href="#come-funziona">Come funziona</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="lp-actions">
            <Link href="/login" className="lp-btn-ghost">Accedi</Link>
            <Link href="/register" className="lp-btn-cta">Inizia gratis</Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="lp-wrap lp-hero-inner">
          <div>
            <div className="lp-eyebrow"><span/>Nuovo · AI scheduling + App iOS e Android</div>
            <h1>I turni del tuo team,<br /><em>sotto controllo</em>.</h1>
            <p className="sub">
              Pianifica, comunica e gestisci i turni in pochi minuti. L&apos;AI genera la bozza, tu approvi. Meno Excel, meno chiamate.
            </p>
            <div className="lp-cta">
              <Link href="/register" className="lp-btn-cta lg">
                Inizia gratis
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6"/>
                </svg>
              </Link>
              <a href="#come-funziona" className="lp-btn-out">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="6 4 20 12 6 20 6 4"/>
                </svg>
                Come funziona
              </a>
            </div>
          </div>

          {/* Mockup dashboard */}
          <div className="lp-mock-wrap">
            <div className="lp-mock">
              <div className="lp-mock-chrome">
                <div className="lp-mock-dots"><span/><span/><span/></div>
                <span className="lp-mock-url">turniup.it/dashboard</span>
              </div>
              <div className="lp-mock-shell">
                <aside className="lp-mock-sb">
                  <div className="lp-mock-si on">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>
                    </svg>
                    Turni
                  </div>
                  <div className="lp-mock-si">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-8 0v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    Dipendenti
                  </div>
                  <div className="lp-mock-si">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="18" rx="2"/>
                    </svg>
                    Ferie
                  </div>
                  <div className="lp-mock-si">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
                    </svg>
                    Presenze
                  </div>
                </aside>
                <div className="lp-mock-main">
                  <div className="lp-mock-ht">Settimana · 12–18 Maggio</div>
                  <div className="lp-sched">
                    <div className="lp-ch e">Team</div>
                    <div className="lp-ch">Lun</div><div className="lp-ch">Mar</div>
                    <div className="lp-ch">Mer</div><div className="lp-ch">Gio</div>

                    <div className="lp-ec"><span className="lp-av" style={{background:'var(--primary)'}}>GM</span><span className="lp-nm">Giulia</span></div>
                    <div className="lp-sh p">Mattina<span className="t">08–14</span></div>
                    <div className="lp-sh p">Mattina<span className="t">08–14</span></div>
                    <div className="lp-sh o">Riposo</div>
                    <div className="lp-sh b">Pomerig.<span className="t">14–20</span></div>

                    <div className="lp-ec"><span className="lp-av" style={{background:'var(--blue)'}}>LB</span><span className="lp-nm">Luca</span></div>
                    <div className="lp-sh b">Pomerig.<span className="t">14–20</span></div>
                    <div className="lp-sh b">Pomerig.<span className="t">14–20</span></div>
                    <div className="lp-sh b">Pomerig.<span className="t">14–20</span></div>
                    <div className="lp-sh o">Riposo</div>

                    <div className="lp-ec"><span className="lp-av" style={{background:'var(--green)'}}>SR</span><span className="lp-nm">Sara</span></div>
                    <div className="lp-sh o">Riposo</div>
                    <div className="lp-sh g">Sera<span className="t">18–24</span></div>
                    <div className="lp-sh g">Sera<span className="t">18–24</span></div>
                    <div className="lp-sh g">Sera<span className="t">18–24</span></div>

                    <div className="lp-ec"><span className="lp-av" style={{background:'var(--amber)'}}>MD</span><span className="lp-nm">Marco</span></div>
                    <div className="lp-sh p">Mattina<span className="t">08–14</span></div>
                    <div className="lp-sh o">Riposo</div>
                    <div className="lp-sh p">Mattina<span className="t">08–14</span></div>
                    <div className="lp-sh p">Mattina<span className="t">08–14</span></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lp-badge-float">
              <span className="bi">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </span>
              <div>
                <div className="bt">Turni pubblicati</div>
                <div className="bs">Team notificato in tempo reale</div>
              </div>
            </div>
          </div>
        </div>

        {/* Social proof */}
        <div className="lp-proof">
          <div className="lp-wrap">
            <p>Già scelto da <b>team italiani</b> di ristoranti, hotel, palestre e negozi</p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="lp-block" id="funzionalita">
        <div className="lp-wrap">
          <div className="lp-sec">
            <div className="lp-eyebrow"><span/>Funzionalità</div>
            <h2>Tutto ciò che serve per gestire un team</h2>
            <p>Dalla pianificazione alle presenze, TurniUp riunisce gli strumenti che usi ogni giorno.</p>
          </div>
          <div className="lp-feats">
            {/* AI feature, evidenziata full-width */}
            <div className="lp-feat lp-feat-ai">
              <span className="lp-feat-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9"/><path d="M12 8v4l2.5 1.5"/><path d="M16 2.5c2 .8 3.5 2.3 4.3 4.3"/>
                </svg>
              </span>
              <div className="lp-feat-ai-body">
                <span className="lp-feat-ai-tag">Nuovo</span>
                <h3>Pianificazione turni con l&apos;intelligenza artificiale</h3>
                <p>Scrivi le esigenze della settimana in linguaggio naturale e TurniUp genera una proposta completa in pochi secondi, tenendo conto di disponibilità, ferie, ruoli richiesti e ore contrattuali. Tu rivedi, modifichi se serve, e pubblichi con un clic. Il controllo resta sempre a te.</p>
              </div>
            </div>

            {features.map(f => (
              <div key={f.title} className="lp-feat">
                <span className="lp-feat-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={f.icon}/></svg></span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI SCHEDULING ── */}
      <section className="lp-block lp-ai-section" id="ai-turni" style={{paddingTop: 0}}>
        <div className="lp-wrap">
          <div className="lp-ai-layout">
            <div className="lp-ai-copy">
              <div className="lp-eyebrow" style={{marginBottom: '16px'}}><span/>Intelligenza Artificiale</div>
              <h2>Turni generati dall&apos;AI, approvati da te</h2>
              <p>Niente più ore spese a incastrare disponibilità e sostituzioni. L&apos;AI analizza il tuo team, rispetta i vincoli contrattuali e produce una proposta pronta in secondi. Tu la rivedi e pubblichi.</p>
              <ul className="lp-ai-list">
                <li>
                  <span className="lp-ai-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
                  <div><strong>Considera vincoli reali</strong><span>Disponibilità, ferie approvate, ore massime settimanali, preferenze salvate.</span></div>
                </li>
                <li>
                  <span className="lp-ai-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
                  <div><strong>Zero conflitti</strong><span>Verifica sovrapposizioni, copertura minima e riposi obbligatori prima di mostrarti la proposta.</span></div>
                </li>
                <li>
                  <span className="lp-ai-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
                  <div><strong>Il controllo resta a te</strong><span>La proposta è sempre editabile turno per turno. Approva, modifica o rigenera con un prompt diverso.</span></div>
                </li>
              </ul>
            </div>
            <div className="lp-ai-terminal">
              <div className="lp-mock-chrome">
                <div className="lp-mock-dots"><span/><span/><span/></div>
                <span className="lp-mock-url">AI Scheduling · TurniUp</span>
              </div>
              <div className="lp-ai-body">
                <div className="lp-ai-bubble lp-ai-bubble-user">&ldquo;Genera i turni per la settimana 16–22 Giugno&rdquo;</div>
                <div className="lp-ai-bubble lp-ai-bubble-ai">
                  <div className="lp-ai-steps">
                    {['Analisi disponibilità 4 dipendenti', 'Ferie approvate verificate (Luca: Mer)', 'Copertura minima rispettata · 0 conflitti'].map(s => (
                      <div key={s} className="lp-ai-step">
                        <span className="lp-ai-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
                        {s}
                      </div>
                    ))}
                  </div>
                  <div className="lp-ai-result-label">Proposta generata</div>
                  <div className="lp-ai-mini-sched">
                    {[
                      { name: 'Giulia', shifts: ['ms', 'ms', 'of', 'af', 'ms'] },
                      { name: 'Luca',   shifts: ['af', 'af', 'of', 'af', 'af'] },
                      { name: 'Sara',   shifts: ['of', 'nt', 'nt', 'of', 'nt'] },
                      { name: 'Marco',  shifts: ['ms', 'ms', 'ms', 'ms', 'of'] },
                    ].map(row => (
                      <div key={row.name} className="lp-ai-row">
                        <span className="lp-ai-name">{row.name}</span>
                        {row.shifts.map((s, i) => (
                          <span key={i} className={`lp-ai-shift lp-ai-${s}`}>
                            {s === 'ms' ? 'Mat' : s === 'af' ? 'Pom' : s === 'nt' ? 'Sera' : '—'}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="lp-ai-actions">
                    <button className="lp-ai-approve">Approva e pubblica</button>
                    <button className="lp-ai-edit">Modifica</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="lp-stats-section">
        <div className="lp-wrap">
          <div className="lp-stats-row">
            {[
              { n: '3h', l: 'risparmiate a settimana\nsulla pianificazione' },
              { n: '0', l: 'conflitti di turno\ncon la copertura AI' },
              { n: '<10 min', l: "dall'iscrizione al\nprimo turno pubblicato" },
              { n: '100%', l: 'del team notificato\nin tempo reale' },
            ].map(s => (
              <div key={s.n} className="lp-stat">
                <span className="lp-stat-n">{s.n}</span>
                <span className="lp-stat-l">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-block" id="come-funziona">
        <div className="lp-wrap">
          <div className="lp-sec">
            <div className="lp-eyebrow"><span/>Come funziona</div>
            <h2>Operativo in tre passaggi</h2>
            <p>Dalla registrazione al primo turno pubblicato in meno di dieci minuti.</p>
          </div>
          <div className="lp-steps">
            {[
              { n: '01', title: "Crea l'azienda", desc: 'Imposta nome, sedi e orari di apertura. TurniUp si adatta al tuo settore e ai tuoi ritmi operativi.' },
              { n: '02', title: 'Aggiungi i dipendenti', desc: 'Invita il team via email o link. Ognuno accede alla propria app, vede i turni e inserisce le disponibilità.' },
              { n: '03', title: 'Pianifica o lascia fare all\'AI', desc: 'Trascina i turni manualmente oppure chiedi all\'AI di generare la settimana. Approva e le notifiche pensano al resto.' },
            ].map((s, i) => (
              <div key={s.n} className="lp-step">
                <div className="lp-step-n">{s.n}</div>
                {i < 2 && <span className="lp-step-line"/>}
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTORS ── */}
      <section className="lp-block" id="settori" style={{paddingTop: 0}}>
        <div className="lp-wrap">
          <div className="lp-sec">
            <div className="lp-eyebrow"><span/>Settori</div>
            <h2>Pensato per chi lavora su turni</h2>
            <p>Ristoranti, hotel, palestre, negozi, cliniche: qualsiasi team con orari variabili trova in TurniUp lo strumento giusto.</p>
          </div>
          <div className="lp-sectors">
            {sectors.map(s => (
              <div key={s.title} className="lp-sector">
                <span className="lp-sector-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon}/></svg>
                </span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="lp-block lp-faq-section" id="faq">
        <div className="lp-wrap">
          <div className="lp-sec">
            <div className="lp-eyebrow"><span/>Domande frequenti</div>
            <h2>Tutto quello che vuoi sapere</h2>
            <p>Non trovi la risposta? Scrivici e ti rispondiamo entro 24 ore.</p>
          </div>
          <div className="lp-faq-list">
            {faqs.map(f => (
              <details key={f.q} className="lp-faq-item">
                <summary className="lp-faq-q">
                  {f.q}
                  <svg className="lp-faq-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </summary>
                <div className="lp-faq-body"><p>{f.a}</p></div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINALE ── */}
      <section className="lp-cta-sec">
        <div className="lp-wrap">
          <div className="lp-cta-box">
            <h2>Pronto a semplificare la gestione dei turni?</h2>
            <p>Prova TurniUp gratis. Nessuna carta di credito richiesta.</p>
            <Link href="/register" className="lp-btn-white">Inizia gratis oggi</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-foot">
        <div className="lp-wrap lp-foot-inner">
          <Link href="/" className="lp-brand">
            <span className="lp-bmark">
              <img src="/splash.png" alt="TurniUp" />
            </span>
            TurniUp
          </Link>
          <span className="lp-foot-copy">© 2026 TurniUp. Tutti i diritti riservati.</span>
          <nav className="lp-foot-links">
            <a href="#faq">FAQ</a>
            <Link href="/termini">Termini di servizio</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/cookie">Cookie Policy</Link>
          </nav>
        </div>
      </footer>

    </div>
  );
}
