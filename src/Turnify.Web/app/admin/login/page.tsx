'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '@/lib/auth';
import ThemeToggle from '@/components/ThemeToggle';

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const bloccato     = searchParams.get('bloccato') === '1';

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'employee') {
        setError("Questo portale è riservato ai datori di lavoro. Per i tuoi turni usa l'app mobile TurniUp.");
      } else {
        setError(err instanceof Error ? err.message : 'Errore di accesso');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      {/* Brand panel */}
      <aside className="login-aside">
        <div className="la-brand">
          <div className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v3M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10ZM12 12l2.5 1.5"/>
            </svg>
          </div>
          <div>
            <div className="nm">TurniUp</div>
            <div className="sb">Gestione turni</div>
          </div>
        </div>

        <div className="la-mid">
          <div className="la-quote">
            I turni del tuo team,{' '}
            <b>sotto controllo.</b>{' '}
            Pianifica, approva, monitora — da un unico pannello.
          </div>
          <div className="la-sub">
            La piattaforma pensata per ristoranti, bar e attività che vogliono gestire personale e orari senza fogli di calcolo.
          </div>
          <div className="la-stats">
            <div className="s"><div className="n">3.200+</div><div className="l">Attività attive</div></div>
            <div className="s"><div className="n">98%</div><div className="l">Turni coperti</div></div>
            <div className="s"><div className="n">4.9★</div><div className="l">Valutazione</div></div>
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <main className="login-main">
        <div className="login-top">
          <span className="hint">Accesso riservato ai datori di lavoro</span>
          <ThemeToggle />
        </div>

        <div className="login-box">
          <div className="login-eyebrow">Bentornato</div>
          <h1 className="login-h">Accedi al pannello</h1>
          <p className="login-p">Inserisci le tue credenziali per gestire turni e dipendenti.</p>

          {bloccato && !error && (
            <div style={{ marginTop: 20, padding: '14px 16px', background: 'var(--amber-soft)', border: '1px solid var(--amber)', borderRadius: 12 }}>
              <p style={{ fontWeight: 600, fontSize: 13, color: 'oklch(0.5 0.12 60)', marginBottom: 4 }}>Accesso non consentito</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Questo portale è riservato ai datori di lavoro. Per i tuoi turni usa l&apos;app mobile TurniUp.</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email aziendale</label>
              <input
                className="input"
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nome@tuaazienda.it"
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
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  required
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

            <div className="login-row">
              <label className="check">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                <span className="bx">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 13 4 4L19 7"/>
                  </svg>
                </span>
                Ricordami
              </label>
              <span className="link">Password dimenticata?</span>
            </div>

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
                  Accesso in corso…
                </>
              ) : (
                <>
                  Accedi al pannello
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="divider">oppure</div>
          <div className="login-foot">
            Non hai un account aziendale? <span className="link">Richiedi una demo</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
