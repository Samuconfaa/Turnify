'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface VacationRequest {
  id: number; employeeId: number; employeeName: string;
  type: string; startDate: string; endDate: string;
  totalDays: number; reason: string; status: string;
}

const TYPE_LABEL: Record<string, string> = {
  Holiday:     'Ferie',
  PaidLeave:   'Permesso retribuito',
  UnpaidLeave: 'Permesso non retribuito',
  SickLeave:   'Malattia',
};
const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  Pending:   { label: 'In attesa',  cls: 'bg-amber-50 text-amber-700 border-amber-100' },
  Approved:  { label: 'Approvata',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  Rejected:  { label: 'Rifiutata',  cls: 'bg-red-50 text-red-600 border-red-100' },
  Cancelled: { label: 'Annullata',  cls: 'bg-slate-100 text-slate-500 border-slate-200' },
};

type FilterMode = 'Pending' | 'all';

export default function VacationsPage() {
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [filter, setFilter]     = useState<FilterMode>('Pending');
  const [acting, setActing]     = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await api.get<VacationRequest[] | { data: VacationRequest[] }>('/api/vacation-requests'); setRequests(Array.isArray(res) ? res : Array.isArray((res as { data?: VacationRequest[] })?.data) ? (res as { data: VacationRequest[] }).data : []); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Errore'); }
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

  const visible    = filter === 'Pending' ? requests.filter(r => r.status === 'Pending') : requests;
  const pendingCnt = requests.filter(r => r.status === 'Pending').length;
  const fmt        = (iso: string) => new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Ferie &amp; Permessi</h1>
          <p className="page-sub">
            {requests.length} richieste totali
            {pendingCnt > 0 && (
              <span className="ml-2 text-amber-600 font-semibold">· {pendingCnt} in attesa</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {(['Pending', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-sm px-4 py-2 rounded-lg border transition-colors font-medium ${
                filter === f
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'
              }`}
            >
              {f === 'Pending' ? (
                <>In attesa {pendingCnt > 0 && <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${filter === f ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-700'}`}>{pendingCnt}</span>}</>
              ) : 'Tutte'}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-sm text-slate-400 py-4">Caricamento…</p>}
      {error   && <p className="text-sm text-red-500 py-2">{error}</p>}

      {!loading && !error && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Dipendente', 'Tipo', 'Dal', 'Al', 'Giorni', 'Motivo', 'Stato', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400 text-sm">
                    {filter === 'Pending' ? 'Nessuna richiesta in attesa di approvazione.' : 'Nessuna richiesta.'}
                  </td>
                </tr>
              )}
              {visible.map(r => {
                const st = STATUS_MAP[r.status];
                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{r.employeeName}</td>
                    <td className="px-4 py-3 text-slate-600">{TYPE_LABEL[r.type] ?? r.type}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{fmt(r.startDate)}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{fmt(r.endDate)}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                      {r.totalDays} {r.totalDays === 1 ? 'g.' : 'gg.'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 max-w-[160px] truncate text-xs" title={r.reason}>
                      {r.reason || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {st && <span className={`badge border ${st.cls}`}>{st.label}</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.status === 'Pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => approve(r.id)} disabled={acting === r.id}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 px-2.5 py-1 rounded-lg disabled:opacity-50 transition-colors"
                          >
                            ✓ Approva
                          </button>
                          <button
                            onClick={() => reject(r.id)} disabled={acting === r.id}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 px-2.5 py-1 rounded-lg disabled:opacity-50 transition-colors"
                          >
                            ✕ Rifiuta
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
    </div>
  );
}
