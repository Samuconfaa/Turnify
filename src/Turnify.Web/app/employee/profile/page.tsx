'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

interface EmployeeProfile {
  id: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatarEmoji: string;
}

function getInitials(profile: EmployeeProfile | null) {
  if (!profile) return '??';
  return (profile.firstName[0] ?? '') + (profile.lastName[0] ?? '');
}

export default function EmployeeProfilePage() {
  const [profile, setProfile]   = useState<EmployeeProfile | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState('');

  const [curPwd, setCurPwd]     = useState('');
  const [newPwd, setNewPwd]     = useState('');
  const [confPwd, setConfPwd]   = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdOk, setPwdOk]       = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }

  useEffect(() => {
    api.get<EmployeeProfile>('/api/users/me')
      .then(p => { setProfile(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function validatePassword(n: string, c: string): { strong: boolean; match: boolean; msg: string; confMsg: string } {
    const strong = n.length >= 8 && /[A-Z]/.test(n) && /[0-9]/.test(n);
    const match  = c.length > 0 && c === n;
    return {
      strong,
      match,
      msg:     n.length === 0 ? '' : strong ? 'Sicurezza: buona' : 'Troppo debole: aggiungi maiuscola e numero',
      confMsg: c.length === 0 ? '' : match ? 'Le password coincidono' : 'Le password non coincidono',
    };
  }

  const pwdValidation = validatePassword(newPwd, confPwd);

  async function handleChangePwd(e: React.FormEvent) {
    e.preventDefault();
    if (!pwdValidation.strong || !pwdValidation.match) {
      setPwdError('Correggi i campi evidenziati');
      return;
    }
    setPwdError('');
    setSaving(true);
    try {
      await api.put('/api/users/me/password', { currentPassword: curPwd, newPassword: newPwd });
      showToast('Password aggiornata');
      setCurPwd(''); setNewPwd(''); setConfPwd('');
    } catch (err: unknown) {
      setPwdError(err instanceof Error ? err.message : 'Errore');
    } finally { setSaving(false); }
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-title">
          <span className="topbar-eyebrow">Account</span>
          <h1>Profilo</h1>
        </div>
        <div className="topbar-spacer" />
        <div className="topbar-actions">
          <ThemeToggle />
        </div>
      </header>

      <main className="content">
        {loading ? (
          <p style={{ color: 'var(--text-faint)', fontSize: 14, padding: '24px 0' }}>Caricamento…</p>
        ) : (
          <div className="grid grid-2" style={{ alignItems: 'start' }}>
            <div className="card card-pad">
              <div style={{
                width: 96, height: 96, borderRadius: '50%', background: 'var(--primary)', color: '#fff',
                display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 38, boxShadow: '0 8px 22px -8px var(--primary)', margin: '0 auto 14px',
              }}>
                {getInitials(profile)}
              </div>
              <h2 style={{ textAlign: 'center', fontSize: 22 }}>{profile?.firstName} {profile?.lastName}</h2>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 20 }}>
                {profile?.role || 'Dipendente'}
              </p>

              <div className="grid" style={{ gap: 14 }}>
                <div className="field">
                  <label htmlFor="p-email">Email</label>
                  <input className="input" id="p-email" type="email" value={profile?.email ?? ''} readOnly style={{ color: 'var(--text-muted)' }} />
                  <span className="field-msg">Contatta l&apos;amministratore per modificare l&apos;email</span>
                </div>
                <div className="field">
                  <label htmlFor="p-tel">Numero di telefono</label>
                  <input className="input" id="p-tel" type="tel" value={profile?.phone ?? '—'} readOnly style={{ color: 'var(--text-muted)' }} />
                  <span className="field-msg">Contatta l&apos;amministratore per modificare il telefono</span>
                </div>
                <div className="field">
                  <label>Ruolo</label>
                  <input className="input" value={profile?.role || 'Dipendente'} readOnly style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            </div>

            <div className="card card-pad">
              <h2 style={{ fontSize: 18, marginBottom: 5 }}>Cambio password</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13.5, marginBottom: 18 }}>
                Usa almeno 8 caratteri con una lettera maiuscola e un numero.
              </p>

              <form className="grid" style={{ gap: 15 }} onSubmit={handleChangePwd}>
                <div className="field">
                  <label htmlFor="pw-cur">Password attuale</label>
                  <input className="input" id="pw-cur" type="password" placeholder="••••••••" value={curPwd} onChange={e => setCurPwd(e.target.value)} required />
                </div>
                <div className={`field${newPwd.length > 0 ? (pwdValidation.strong ? ' ok' : ' error') : ''}`}>
                  <label htmlFor="pw-new">Nuova password</label>
                  <input className="input" id="pw-new" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required />
                  {newPwd.length > 0 && <span className="field-msg">{pwdValidation.msg}</span>}
                </div>
                <div className={`field${confPwd.length > 0 ? (pwdValidation.match ? ' ok' : ' error') : ''}`}>
                  <label htmlFor="pw-conf">Conferma nuova password</label>
                  <input className="input" id="pw-conf" type="password" value={confPwd} onChange={e => setConfPwd(e.target.value)} required />
                  {confPwd.length > 0 && <span className="field-msg">{pwdValidation.confMsg}</span>}
                </div>
                {pwdError && (
                  <div style={{ padding: '10px 14px', background: 'var(--red-soft)', border: '1px solid var(--red)', borderRadius: 10, fontSize: 13, color: 'var(--red)' }}>
                    {pwdError}
                  </div>
                )}
                <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
                  {saving ? 'Aggiornamento…' : 'Aggiorna password'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {toast && (
        <div className="toast-wrap">
          <div className="toast show">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
              <path d="M20 6 9 17l-5-5"/>
            </svg>
            <span>{toast}</span>
          </div>
        </div>
      )}
    </>
  );
}
