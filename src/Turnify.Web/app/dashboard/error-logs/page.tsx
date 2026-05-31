'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

interface ErrorLog {
  id: number; userId: number | null; companyId: number | null;
  deviceId: string; platform: string; appVersion: string;
  errorType: string; message: string; stackTrace: string | null;
  screenName: string | null; occurredAt: string; receivedAt: string;
}
interface ApiResponse { data: ErrorLog[]; total: number; page: number; pageSize: number; }

const PLATFORM_BADGE: Record<string, string> = {
  Android: 'badge-green', iOS: 'badge-primary',
  Windows: 'badge-muted', macOS: 'badge-muted',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function isoDate(d: Date) { return d.toISOString().slice(0, 10); }

export default function ErrorLogsPage() {
  const [logs, setLogs]     = useState<ErrorLog[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const pageSize = 50;
  const today = new Date();
  const [from, setFrom] = useState(isoDate(new Date(today.getTime() - 7 * 86400000)));
  const [to, setTo]     = useState(isoDate(today));
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterType, setFilterType]         = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const fromISO = new Date(from + 'T00:00:00Z').toISOString();
      const toISO   = new Date(to   + 'T23:59:59Z').toISOString();
      const res = await api.get<ApiResponse>(`/api/errorlogs?from=${fromISO}&to=${toISO}&page=${page}&pageSize=${pageSize}`);
      setLogs(res?.data ?? []); setTotal(res?.total ?? 0);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Errore'); }
    finally { setLoading(false); }
  }, [from, to, page]);

  useEffect(() => { load(); }, [load]);

  const filtered = logs.filter(l =>
    (!filterPlatform || l.platform === filterPlatform) &&
    (!filterType || l.errorType.toLowerCase().includes(filterType.toLowerCase()))
  );
  const platforms  = Array.from(new Set(logs.map(l => l.platform)));
  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <header className="topbar">
        <div>
          <h1 className="page-title">Log Errori App</h1>
          <p className="page-sub">Errori segnalati dai dispositivi degli utenti</p>
        </div>
        <ThemeToggle />
        <button className="btn-secondary" style={{ height: 40 }} onClick={load}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Aggiorna
        </button>
      </header>

      <main className="content">
        {/* Filtri */}
        <div className="card rise" style={{ marginBottom: 18, padding: '16px 20px', animationDelay: '.04s' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
            <div>
              <div className="label" style={{ marginBottom: 6 }}>Dal</div>
              <input type="date" className="input" style={{ width: 'auto' }} value={from} onChange={e => { setFrom(e.target.value); setPage(1); }} />
            </div>
            <div>
              <div className="label" style={{ marginBottom: 6 }}>Al</div>
              <input type="date" className="input" style={{ width: 'auto' }} value={to} onChange={e => { setTo(e.target.value); setPage(1); }} />
            </div>
            <div>
              <div className="label" style={{ marginBottom: 6 }}>Piattaforma</div>
              <div className="tu-select">
                <select className="input" value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} style={{ paddingRight: 34 }}>
                  <option value="">Tutte</option>
                  {platforms.map(p => <option key={p}>{p}</option>)}
                </select>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
            <div>
              <div className="label" style={{ marginBottom: 6 }}>Tipo errore</div>
              <input className="input" style={{ width: 192 }} value={filterType} onChange={e => setFilterType(e.target.value)} placeholder="es. NullReference" />
            </div>
            {total > 0 && (
              <div style={{ marginLeft: 'auto', alignSelf: 'flex-end', fontSize: 13, color: 'var(--text-muted)' }}>
                <b style={{ color: 'var(--text)' }}>{total}</b> errori totali
              </div>
            )}
          </div>
        </div>

        {loading && <p style={{ color: 'var(--text-faint)', fontSize: 14, padding: '24px 0' }}>Caricamento…</p>}
        {error && <p style={{ color: 'var(--red)', background: 'var(--red-soft)', border: '1px solid var(--red)', borderRadius: 13, padding: '14px 18px', fontSize: 14, marginBottom: 14 }}>{error}</p>}

        {!loading && !error && (
          <>
            <div className="card rise" style={{ overflow: 'hidden', animationDelay: '.12s' }}>
              {filtered.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-faint)', padding: '48px 0', fontSize: 14 }}>
                  Nessun errore nel periodo selezionato.
                </p>
              )}
              {filtered.map(log => (
                <div key={log.id} className={`log-row${expanded === log.id ? ' open' : ''}`}>
                  <div className="log-head" onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
                    <span className="log-time">{fmtDate(log.occurredAt)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span className={`badge ${PLATFORM_BADGE[log.platform] ?? 'badge-muted'}`}>{log.platform}</span>
                        <span className="mono" style={{ fontSize: 12, background: 'var(--surface-2)', padding: '2px 7px', borderRadius: 6, border: '1px solid var(--border)' }}>v{log.appVersion}</span>
                        <span className="badge badge-red" style={{ fontWeight: 600 }}>{log.errorType}</span>
                        {log.screenName && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>su <b style={{ color: 'var(--text)' }}>{log.screenName}</b></span>}
                      </div>
                      <div className="log-msg">{log.message}</div>
                    </div>
                    <svg className="log-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 6 6 6-6 6"/>
                    </svg>
                  </div>

                  <div className="log-detail">
                    <div className="log-detail-inner">
                      <div className="log-tags">
                        {log.userId && <span className="lt">UserID <b>{log.userId}</b></span>}
                        <span className="lt">Ricevuto <b>{fmtDate(log.receivedAt)}</b></span>
                        <span className="lt mono">Device <b>{log.deviceId.slice(0, 16)}…</b></span>
                      </div>
                      {log.stackTrace
                        ? <pre className="stack">{log.stackTrace}</pre>
                        : <p style={{ margin: '0 18px 18px', fontSize: 13, color: 'var(--text-faint)', fontStyle: 'italic' }}>Nessuno stack trace disponibile.</p>
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 20 }}>
                <button className="btn-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Precedente</button>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{page} / {totalPages}</span>
                <button className="btn-secondary" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Successiva →</button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
