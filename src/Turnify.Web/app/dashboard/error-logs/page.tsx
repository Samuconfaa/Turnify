'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface ErrorLog {
  id: number;
  userId: number | null;
  companyId: number | null;
  deviceId: string;
  platform: string;
  appVersion: string;
  errorType: string;
  message: string;
  stackTrace: string | null;
  screenName: string | null;
  occurredAt: string;
  receivedAt: string;
}
interface ApiResponse {
  data: ErrorLog[];
  total: number;
  page: number;
  pageSize: number;
}

const PLATFORM_BADGE: Record<string, string> = {
  Android: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  iOS:     'bg-indigo-50 text-indigo-700 border-indigo-100',
  Windows: 'bg-violet-50 text-violet-700 border-violet-100',
  macOS:   'bg-purple-50 text-purple-700 border-purple-100',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
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

  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [expanded, setExpanded]   = useState<number | null>(null);
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterType, setFilterType]         = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const fromISO = new Date(from + 'T00:00:00Z').toISOString();
      const toISO   = new Date(to   + 'T23:59:59Z').toISOString();
      const res = await api.get<ApiResponse>(
        `/api/errorlogs?from=${fromISO}&to=${toISO}&page=${page}&pageSize=${pageSize}`
      );
      setLogs(res?.data ?? []);
      setTotal(res?.total ?? 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Errore nel caricamento dei log.');
    } finally {
      setLoading(false);
    }
  }, [from, to, page]);

  useEffect(() => { load(); }, [load]);

  const filtered = logs.filter(l =>
    (!filterPlatform || l.platform === filterPlatform) &&
    (!filterType     || l.errorType.toLowerCase().includes(filterType.toLowerCase()))
  );

  const platforms  = Array.from(new Set(logs.map(l => l.platform)));
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Log Errori App</h1>
          <p className="page-sub">Errori segnalati dai dispositivi degli utenti</p>
        </div>
        <button onClick={load} className="btn-secondary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Aggiorna
        </button>
      </div>

      {/* Filtri */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3 items-end">
        <div>
          <label className="label">Dal</label>
          <input type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(1); }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
        </div>
        <div>
          <label className="label">Al</label>
          <input type="date" value={to} onChange={e => { setTo(e.target.value); setPage(1); }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
        </div>
        <div>
          <label className="label">Piattaforma</label>
          <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-700">
            <option value="">Tutte</option>
            {platforms.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Tipo errore</label>
          <input value={filterType} onChange={e => setFilterType(e.target.value)} placeholder="es. NullReference"
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white w-48" />
        </div>
        {total > 0 && (
          <div className="ml-auto self-end text-sm text-slate-500 pb-0.5">
            <span className="font-semibold text-slate-800">{total}</span> errori totali
          </div>
        )}
      </div>

      {loading && <p className="text-sm text-slate-400 py-4">Caricamento…</p>}
      {error   && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">{error}</p>
      )}

      {!loading && !error && (
        <>
          <div className="space-y-2">
            {filtered.length === 0 && (
              <div className="card px-4 py-12 text-center text-slate-400 text-sm">
                Nessun errore trovato nel periodo selezionato.
              </div>
            )}
            {filtered.map(log => (
              <div key={log.id} className="card overflow-hidden">
                <button
                  className="w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors"
                  onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className={`badge border ${PLATFORM_BADGE[log.platform] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {log.platform}
                        </span>
                        <span className="text-xs text-slate-500 font-mono bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                          v{log.appVersion}
                        </span>
                        <span className="badge border bg-red-50 text-red-700 border-red-100 font-semibold">
                          {log.errorType}
                        </span>
                        {log.screenName && (
                          <span className="text-xs text-slate-400">
                            su <span className="font-medium text-slate-600">{log.screenName}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-900 truncate mb-1">{log.message}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-400">
                        <span>Accaduto: {fmtDate(log.occurredAt)}</span>
                        <span>Ricevuto: {fmtDate(log.receivedAt)}</span>
                        {log.userId && <span>UserID: {log.userId}</span>}
                        <span className="font-mono truncate max-w-[140px]">Device: {log.deviceId}</span>
                      </div>
                    </div>
                    <svg
                      className={`w-4 h-4 text-slate-400 shrink-0 mt-0.5 transition-transform ${expanded === log.id ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {expanded === log.id && (
                  <div className="border-t border-slate-100 bg-slate-950 px-5 py-4">
                    {log.stackTrace ? (
                      <>
                        <p className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">Stack Trace</p>
                        <pre className="text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                          {log.stackTrace}
                        </pre>
                      </>
                    ) : (
                      <p className="text-xs text-slate-500 italic">Nessuno stack trace disponibile.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="btn-secondary disabled:opacity-40"
              >
                ← Precedente
              </button>
              <span className="text-sm text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-lg">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="btn-secondary disabled:opacity-40"
              >
                Successiva →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
