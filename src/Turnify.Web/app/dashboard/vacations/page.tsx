'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

interface VacationRequest {
  id: number; employeeId: number; employeeName: string;
  type: string; startDate: string; endDate: string;
  totalDays: number; reason: string; status: string;
}

const TYPE_LABEL: Record<string, string> = {
  Holiday: 'Ferie', PaidLeave: 'Permesso retribuito',
  UnpaidLeave: 'Permesso non retribuito', SickLeave: 'Malattia',
};
const TYPE_BADGE: Record<string, string> = {
  Holiday: 'badge-primary', PaidLeave: 'badge-muted',
  UnpaidLeave: 'badge-muted', SickLeave: 'badge-amber',
};
const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  Pending:   { label: 'In attesa',  cls: 'badge-amber' },
  Approved:  { label: 'Approvata',  cls: 'badge-green' },
  Rejected:  { label: 'Rifiutata',  cls: 'badge-red' },
  Cancelled: { label: 'Annullata',  cls: 'badge-muted' },
};

const AVATAR_COLORS = [
  'oklch(0.6 0.13 25)', 'oklch(0.58 0.12 250)', 'oklch(0.6 0.13 320)',
  'oklch(0.55 0.11 150)', 'oklch(0.6 0.12 60)', 'oklch(0.52 0.12 180)',
];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function initials(name: string) {
  const p = name.split(' ');
  return (p[0]?.[0] ?? '') + (p[1]?.[0] ?? '');
}

type FilterMode = 'Pending' | 'Approved' | 'Rejected' | 'all';

export default function VacationsPage() {
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [filter, setFilter]     = useState<FilterMode>('Pending');
  const [acting, setActing]     = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<VacationRequest[] | { data: VacationRequest[] }>('/api/vacation-requests');
      setRequests(Array.isArray(res) ? res : Array.isArray((res as { data?: VacationRequest[] })?.data) ? (res as { data: VacationRequest[] }).data : []);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Errore'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function approve(id: number) {
    setActing(id);
    try { await api.put(`/api/vacation-requests/${id}/approve`, {}); await load(); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : 'Errore'); }
    finally { setActing(null); }
  }
  async function reject(id: number) {
    setActing(id);
    try { await api.put(`/api/vacation-requests/${id}/reject`, {}); await load(); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : 'Errore'); }
    finally { setActing(null); }
  }

  const visible    = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const pendingCnt = requests.filter(r => r.status === 'Pending').length;
  const approvedCnt = requests.filter(r => r.status === 'Approved').length;
  const rejectedCnt = requests.filter(r => r.status === 'Rejected').length;
  const fmt = (iso: string) => new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });

  const filters: Array<{ key: FilterMode; label: string; count: number }> = [
    { key: 'Pending',  label: 'In attesa',  count: pendingCnt },
    { key: 'Approved', label: 'Approvate',  count: approvedCnt },
    { key: 'Rejected', label: 'Rifiutate',  count: rejectedCnt },
    { key: 'all',      label: 'Tutte',      count: requests.length },
  ];

  return (
    <>
      <header className="topbar">
        <div>
          <h1 className="page-title">Ferie e permessi</h1>
          <p className="page-sub">
            {pendingCnt > 0
              ? `${pendingCnt} richieste in attesa di approvazione`
              : `${requests.length} richieste totali`}
          </p>
        </div>
        <ThemeToggle />
      </header>

      <main className="content">
        {/* Stat strip */}
        <section className="stat-strip rise" style={{ animationDelay: '.04s' }}>
          <div className="card stat"><div className="v">{pendingCnt}</div><div className="k"><span className="pip" style={{ background: 'var(--amber)' }} />In attesa</div></div>
          <div className="card stat"><div className="v">{approvedCnt}</div><div className="k"><span className="pip" style={{ background: 'var(--green)' }} />Approvate</div></div>
          <div className="card stat"><div className="v">{rejectedCnt}</div><div className="k"><span className="pip" style={{ background: 'var(--red)' }} />Rifiutate</div></div>
          <div className="card stat"><div className="v">{requests.length}</div><div className="k"><span className="pip" style={{ background: 'var(--text-faint)' }} />Totali</div></div>
        </section>

        {/* Filter bar */}
        <div className="filter-bar rise" style={{ animationDelay: '.12s' }}>
          <div className="segmented">
            {filters.map(f => (
              <button key={f.key} className={filter === f.key ? 'on' : ''} onClick={() => setFilter(f.key)}>
                {f.label} <span className="cnt">{f.count}</span>
              </button>
            ))}
          </div>
          <div className="tu-select">
            <select className="input" style={{ paddingRight: 34 }}>
              <option>Tutti i tipi</option>
              <option>Ferie</option>
              <option>Permesso</option>
              <option>Malattia</option>
            </select>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>

        {loading && <p style={{ color: 'var(--text-faint)', fontSize: 14, padding: '24px 0' }}>Caricamento…</p>}
        {error   && <p style={{ color: 'var(--red)', fontSize: 14 }}>{error}</p>}

        {!loading && !error && (
          <div className="card tbl-wrap rise" style={{ animationDelay: '.2s' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Dipendente</th><th>Tipo</th><th>Periodo</th>
                  <th>Durata</th><th>Motivo</th><th>Stato</th><th className="r">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-faint)', padding: '48px 0' }}>
                    {filter === 'Pending' ? 'Nessuna richiesta in attesa.' : 'Nessuna richiesta.'}
                  </td></tr>
                )}
                {visible.map(r => {
                  const st = STATUS_MAP[r.status];
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="cell-user">
                          <div className="avatar" style={{ background: avatarColor(r.employeeName) }}>{initials(r.employeeName)}</div>
                          <div><div className="nm">{r.employeeName}</div></div>
                        </div>
                      </td>
                      <td><span className={`badge ${TYPE_BADGE[r.type] ?? 'badge-muted'}`}>{TYPE_LABEL[r.type] ?? r.type}</span></td>
                      <td className="mono muted">{fmt(r.startDate)} – {fmt(r.endDate)}</td>
                      <td>{r.totalDays} {r.totalDays === 1 ? 'g.' : 'gg.'}</td>
                      <td className="muted" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }} title={r.reason}>{r.reason || '—'}</td>
                      <td>{st && <span className={`badge ${st.cls}`}><span className="bdot" />{st.label}</span>}</td>
                      <td className="r">
                        {r.status === 'Pending' && (
                          <div className="row-actions">
                            <button
                              className="btn-primary"
                              style={{ padding: '7px 12px', fontSize: 13 }}
                              disabled={acting === r.id}
                              onClick={() => approve(r.id)}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="m5 13 4 4L19 7"/></svg>
                              Approva
                            </button>
                            <button
                              className="btn-danger"
                              style={{ padding: '7px 12px', fontSize: 13 }}
                              disabled={acting === r.id}
                              onClick={() => reject(r.id)}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
                              Rifiuta
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
