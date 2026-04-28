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

const PLATFORM_STYLE: Record<string, string> = {
  Android: 'bg-green-100 text-green-700',
  iOS:     'bg-blue-100 text-blue-700',
  Windows: 'bg-indigo-100 text-indigo-700',
  macOS:   'bg-purple-100 text-purple-700',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function ErrorLogsPage() {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const today = new Date();
  const [from, setFrom] = useState(isoDate(new Date(today.getTime() - 7 * 86400000)));
  const [to, setTo]     = useState(isoDate(today));

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
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

  const platforms = [...new Set(logs.map(l => l.platform))];
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Log Errori App</h1>
          <p className="text-sm text-gray-500 mt-1">Errori segnalati dai dispositivi degli utenti</p>
        </div>
        <button
          onClick={load}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Aggiorna
        </button>
      </div>

      {/* Filtri */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Dal</label>
          <input type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Al</label>
          <input type="date" value={to} onChange={e => { setTo(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Piattaforma</label>
          <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tutte</option>
            {platforms.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tipo errore</label>
          <input value={filterType} onChange={e => setFilterType(e.target.value)} placeholder="es. NullReference"
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48" />
        </div>
        <div className="ml-auto text-sm text-gray-500">
          {total > 0 ? <><span className="font-semibold text-gray-800">{total}</span> errori totali</> : ''}
        </div>
      </div>

      {loading && <p className="text-sm text-gray-400 py-4">Caricamento...</p>}
      {error   && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">{error}</p>}

      {!loading && !error && (
        <>
          <div className="space-y-2">
            {filtered.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-10 text-center text-gray-400 text-sm">
                Nessun errore trovato nel periodo selezionato.
              </div>
            )}
            {filtered.map(log => (
              <div key={log.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PLATFORM_STYLE[log.platform] ?? 'bg-gray-100 text-gray-600'}`}>
                          {log.platform}
                        </span>
                        <span className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                          v{log.appVersion}
                        </span>
                        <span className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                          {log.errorType}
                        </span>
                        {log.screenName && (
                          <span className="text-xs text-gray-500">
                            su <span className="font-medium text-gray-700">{log.screenName}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900 font-medium truncate">{log.message}</p>
                      <div className="flex gap-4 mt-1 text-xs text-gray-400">
                        <span>Accaduto: {fmtDate(log.occurredAt)}</span>
                        <span>Ricevuto: {fmtDate(log.receivedAt)}</span>
                        {log.userId && <span>UserID: {log.userId}</span>}
                        <span className="font-mono truncate max-w-[120px]">Device: {log.deviceId}</span>
                      </div>
                    </div>
                    <span className="text-gray-400 text-xs mt-0.5 shrink-0">
                      {expanded === log.id ? '▲' : '▼'}
                    </span>
                  </div>
                </button>

                {expanded === log.id && log.stackTrace && (
                  <div className="border-t border-gray-100 bg-gray-950 px-5 py-4">
                    <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Stack Trace</p>
                    <pre className="text-xs text-green-400 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                      {log.stackTrace}
                    </pre>
                  </div>
                )}
                {expanded === log.id && !log.stackTrace && (
                  <div className="border-t border-gray-100 px-5 py-3">
                    <p className="text-xs text-gray-400 italic">Nessuno stack trace disponibile.</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">
                ← Prec.
              </button>
              <span className="text-sm text-gray-600">Pagina {page} di {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">
                Succ. →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
