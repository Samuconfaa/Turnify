'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

interface VacationBalance {
  holiday:    { total: number; used: number; remaining: number };
  paidLeave:  { total: number; used: number; remaining: number };
  sickLeave:  { used: number };
  unpaidLeave:{ used: number };
}

interface VacationRequest {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  notes: string;
  totalDays: number;
  status: string;
}

const TYPE_LABEL: Record<string, string> = {
  Holiday: 'Ferie', PaidLeave: 'Permesso', UnpaidLeave: 'Permesso non retribuito', SickLeave: 'Malattia',
};
const TYPE_ICON: Record<string, string> = {
  Holiday:    '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M2 12h2M20 12h2M17.7 6.3l1.4-1.4"/>',
  PaidLeave:  '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  SickLeave:  '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1.1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>',
  UnpaidLeave:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
};
const TYPE_TINT: Record<string, string> = {
  Holiday: 'tint-primary', PaidLeave: 'tint-blue', SickLeave: 'tint-red', UnpaidLeave: 'tint-amber',
};
const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  Pending:  { label: 'In attesa',  cls: 'badge-amber' },
  Approved: { label: 'Approvata',  cls: 'badge-green' },
  Rejected: { label: 'Rifiutata', cls: 'badge-red'  },
};

const FILTER_OPTIONS = [
  { value: 'all', label: 'Tutte' },
  { value: 'Pending', label: 'In attesa' },
  { value: 'Approved', label: 'Approvate' },
  { value: 'Rejected', label: 'Rifiutate' },
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function EmployeeVacationsPage() {
  const [balance, setBalance]   = useState<VacationBalance | null>(null);
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState({ type: 'Holiday', startDate: '', endDate: '', notes: '' });
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }

  useEffect(() => {
    Promise.all([
      api.get<VacationBalance>('/api/vacation-balance/me'),
      api.get<{ data: VacationRequest[] }>('/api/vacation-requests'),
    ])
      .then(([b, r]) => { setBalance(b); setRequests(r?.data ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/vacation-requests', {
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
        notes: form.notes,
      });
      const r = await api.get<{ data: VacationRequest[] }>('/api/vacation-requests');
      setRequests(r?.data ?? []);
      setModal(false);
      showToast('Richiesta inviata');
    } catch { showToast('Errore nell\'invio'); }
    finally { setSaving(false); }
  }

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  return (
    <>
      <header className="topbar">
        <div className="topbar-title">
          <span className="topbar-eyebrow">Assenze</span>
          <h1>Ferie &amp; permessi</h1>
        </div>
        <div className="topbar-spacer" />
        <div className="topbar-actions">
          <button className="btn btn-primary" onClick={() => setModal(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Nuova richiesta
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="content">
        {loading ? (
          <p style={{ color: 'var(--text-faint)', fontSize: 14, padding: '24px 0' }}>Caricamento…</p>
        ) : (
          <>
            <div className="card" style={{ marginBottom: 22, display: 'flex', alignItems: 'center', gap: 0, padding: '22px 26px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', paddingRight: 34, borderRight: '1px solid var(--border)', marginRight: 34 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 54, lineHeight: 1, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                  {balance?.holiday.remaining ?? 0}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>ferie rimanenti</span>
              </div>
              <div style={{ display: 'flex', gap: 38, flex: 1 }}>
                <div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>Usati</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 26 }}>{balance?.holiday.used ?? 0}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>Totali annui</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 26 }}>{balance?.holiday.total ?? 0}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>Permessi</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 26, color: 'var(--blue)' }}>{balance?.paidLeave.remaining ?? 0}</div>
                </div>
              </div>
              <span className="badge badge-gray" style={{ alignSelf: 'flex-start', fontSize: 11 }}>Anno {new Date().getFullYear()}</span>
            </div>

            <div className="chips" style={{ marginBottom: 16 }}>
              {FILTER_OPTIONS.map(f => (
                <button key={f.value} className={`chip${filter === f.value ? ' active' : ''}`} onClick={() => setFilter(f.value)}>
                  {f.label}
                </button>
              ))}
            </div>

            <div className="card">
              <div className="list">
                {filtered.length === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--text-faint)', padding: '24px 0', fontSize: 13 }}>Nessuna richiesta.</p>
                )}
                {filtered.map(req => {
                  const icon  = TYPE_ICON[req.type]  ?? TYPE_ICON.Holiday;
                  const tint  = TYPE_TINT[req.type]  ?? 'tint-primary';
                  const badge = STATUS_BADGE[req.status] ?? { label: req.status, cls: 'badge-gray' };
                  return (
                    <div key={req.id} className="list-row">
                      <div className={`kpi-icon ${tint}`} style={{ width: 42, height: 42, borderRadius: 11, flex: 'none' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
                          style={{ width: 20, height: 20 }}
                          dangerouslySetInnerHTML={{ __html: icon }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
                        <div style={{ fontWeight: 600 }}>{TYPE_LABEL[req.type] ?? req.type}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                          {fmtDate(req.startDate)} → {fmtDate(req.endDate)}
                          {req.notes && ` · ${req.notes}`}
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 15, textAlign: 'center', minWidth: 60 }}>
                        {req.totalDays}
                        <small style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                          {req.totalDays === 1 ? 'giorno' : 'giorni'}
                        </small>
                      </div>
                      <span className={`badge ${badge.cls}`}>{badge.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>

      {modal && (
        <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-head">
              <h2>Nuova richiesta</h2>
              <div className="topbar-spacer" />
              <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={() => setModal(false)} aria-label="Chiudi">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="field">
                  <label htmlFor="r-tipo">Tipo</label>
                  <select className="select" id="r-tipo" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="Holiday">Ferie</option>
                    <option value="PaidLeave">Permesso</option>
                    <option value="SickLeave">Malattia</option>
                    <option value="UnpaidLeave">Permesso non retribuito</option>
                  </select>
                </div>
                <div className="grid grid-2" style={{ gap: 14 }}>
                  <div className="field">
                    <label htmlFor="r-da">Data inizio</label>
                    <input className="input" id="r-da" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
                  </div>
                  <div className="field">
                    <label htmlFor="r-a">Data fine</label>
                    <input className="input" id="r-a" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="r-note">Note</label>
                  <textarea className="textarea" id="r-note" placeholder="Aggiungi una nota per il responsabile…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annulla</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Invio…' : 'Invia richiesta'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
