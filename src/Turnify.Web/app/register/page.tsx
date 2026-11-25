'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/lib/auth';
import ThemeToggle from '@/components/ThemeToggle';

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName]       = useState('');
  const [lastName, setLastName]         = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [confirmPwd, setConfirmPwd]     = useState('');
  const [showPwd, setShowPwd]           = useState(false);
  const [acceptTerms, setAcceptTerms]   = useState(false);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirmPwd) {
      setError('Le password non coincidono.');
      return;
    }
    if (!acceptTerms) {
      setError('Devi accettare i Termini di servizio e la Privacy Policy per continuare.');
      return;
    }
    setLoading(true);
    try {
      await register(firstName, lastName, businessName, email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Errore durante la registrazione.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <aside className="login-aside">
        <div className="la-brand">
          <div className="brand-mark">
            <img src="/splash.png" alt="TurniUp" />
          </div>
          <div>
            <div className="nm">TurniUp</div>
            <div className="sb">Gestione turni</div>
          </div>
        </div>

        <div className="la-mid">
          <div className="la-quote">
            Inizia gratis.{' '}
            <b>Nessuna carta di credito.</b>{' '}
            Operativo in meno di dieci minuti.
          </div>
          <div className="la-sub">
            Crea la tua azienda, aggiungi i dipendenti e pubblica i turni — tutto da un unico pannello professionale.
          </div>
          <div className="la-checks">
            {[
              'Pianificazione turni con drag & drop',
              'App mobile per i dipendenti inclusa',
              'Gestione ferie, permessi e presenze',
              'Notifiche automatiche al team',
            ].map(t => (
              <div key={t} className="la-check">
                <span className="la-ck">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
                    <path d="m5 13 4 4L19 7"/>
                  </svg>
                </span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="login-main">
        <div className="login-top">
          <Link href="/" className="hint" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Torna alla home
          </Link>
          <ThemeToggle />
        </div>

        <div className="login-box">
          <div className="login-eyebrow">Benvenuto</div>
          <h1 className="login-h">Crea il tuo account</h1>
          <p className="login-p">Inserisci i dati della tua azienda per iniziare a gestire i turni.</p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label htmlFor="firstName">Nome</label>
                <input
                  className="input"
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Mario"
                  autoComplete="given-name"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="lastName">Cognome</label>
                <input
                  className="input"
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Rossi"
                  autoComplete="family-name"
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="businessName">Nome azienda</label>
              <input
                className="input"
                id="businessName"
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="Ristorante Da Mario"
                autoComplete="organization"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email aziendale</label>
              <input
                className="input"
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="mario@tuaazienda.it"
                autoComplete="username"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="pw">Password</label>
              <div className="pwrap">
                <input
                  className="input"
                  id="pw"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Almeno 8 caratteri"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="eye"
                  onClick={() => setShowPwd(v => !v)}
                  title="Mostra password"
                >
                  {showPwd ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3l18 18M10.6 10.7a3 3 0 0 0 4 4M9.4 5.3A9.7 9.7 0 0 1 12 5c6 0 9.5 7 9.5 7a16 16 0 0 1-3 3.8M6.1 6.2A16 16 0 0 0 2.5 12S6 19 12 19a9.4 9.4 0 0 0 3.4-.6"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="field">
              <label htmlFor="confirmPwd">Conferma password</label>
              <input
                className="input"
                id="confirmPwd"
                type={showPwd ? 'text' : 'password'}
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                placeholder="••••••••••"
                autoComplete="new-password"
                required
              />
            </div>

            <label className="check" style={{ alignItems: 'flex-start', gap: 10, marginTop: 4 }}>
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={e => setAcceptTerms(e.target.checked)}
                style={{ marginTop: 2 }}
              />
              <span className="bx" style={{ marginTop: 2 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 13 4 4L19 7"/>
                </svg>
              </span>
              <span style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Ho letto e accetto i{' '}
                <Link href="/termini" target="_blank" className="link">Termini di servizio</Link>
                {' '}e la{' '}
                <Link href="/privacy" target="_blank" className="link">Privacy Policy</Link>
              </span>
            </label>

            {error && (
              <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--red-soft)', border: '1px solid var(--red)', borderRadius: 10, fontSize: 13.5, color: 'var(--red)', lineHeight: 1.5 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary login-btn">
              {loading ? (
                <>
                  <svg style={{ animation: 'spin 1s linear infinite', width: 16, height: 16 }} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Creazione account…
                </>
              ) : (
                <>
                  Crea il mio account
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="divider">oppure</div>
          <div className="login-foot">
            Hai già un account?{' '}
            <Link href="/login" className="link">Accedi al pannello</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
