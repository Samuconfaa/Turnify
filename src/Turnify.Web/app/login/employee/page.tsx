'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { employeeLogin } from '@/lib/auth';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';

export default function EmployeeLoginPage() {
  const router = useRouter();

  const [slug, setSlug]         = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await employeeLogin(slug.trim(), username.trim(), password);
      router.push('/employee');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Credenziali non valide.');
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
            <div className="sb">Portale dipendenti</div>
          </div>
        </div>

        <div className="la-mid">
          <div className="la-quote">
            I tuoi turni,{' '}
            <b>sempre con te.</b>{' '}
            Visualizza le ore, richiedi ferie e segna le timbrature dal tuo portale personale.
          </div>
          <div className="la-sub">
            Accedi con le credenziali fornite dal tuo responsabile per consultare il tuo piano settimanale.
          </div>
          <div className="la-stats">
            <div className="s"><div className="n">100%</div><div className="l">Turni aggiornati</div></div>
            <div className="s"><div className="n">24/7</div><div className="l">Disponibile</div></div>
            <div className="s"><div className="n">Semplice</div><div className="l">da usare</div></div>
          </div>
        </div>
      </aside>

      <main className="login-main">
        <div className="login-top">
          <span className="hint">Accesso dipendenti</span>
          <ThemeToggle />
        </div>

        <div className="login-box">
          <div className="login-eyebrow">Area dipendenti</div>
          <h1 className="login-h">Accedi ai tuoi turni</h1>
          <p className="login-p">Inserisci il codice azienda, il tuo username e la password fornita dal responsabile.</p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="slug">Codice azienda</label>
              <input
                className="input"
                id="slug"
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="es. mio-bar"
                autoComplete="organization"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="username">Username</label>
              <input
                className="input"
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="il tuo username"
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
                  Accedi ai tuoi turni
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="divider">oppure</div>
          <div className="login-foot">
            Sei un datore di lavoro?{' '}
            <Link href="/login" className="link">Accedi al pannello gestione</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
