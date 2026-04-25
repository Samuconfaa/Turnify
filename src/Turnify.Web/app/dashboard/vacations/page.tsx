'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface VacationRequest {
  id: number; employeeId: number; employeeName: string;
  type: string; startDate: string; endDate: string;
  totalDays: number; reason: string; status: string;
}

const STATUS_STYLE: Record<string, string> = {
  Pending:   'bg-yellow-100 text-yellow-700',
  Approved:  'bg-green-100 text-green-700',
  Rejected:  'bg-red-100 text-red-700',
  Cancelled: 'bg-gray-100 text-gray-500',
};

export default function VacationsPage() {
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'Pending' | 'all'>('Pending');
  const [acting, setActing] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setRequests(await api.get<VacationRequest[]>('/api/vacation-requests') ?? []); }
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

  const visible = filter === 'Pending' ? requests.filter(r => r.status === 'Pending') : requests;
  const fmt = (iso: string) => new Date(iso).toLocaleDateString('it-IT');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ferie & Permessi</h1>
        <div className="flex gap-2">
          {(['Pending', 'all'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${filter === f ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
              {f === 'Pending' ? 'In attesa' : 'Tutte'}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-sm text-gray-400">Caricamento...</p>}
      {error   && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Dipendente', 'Tipo', 'Dal', 'Al', 'Giorni', 'Motivo', 'Stato', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Nessuna richiesta.</td></tr>
              )}
              {visible.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.employeeName}</td>
                  <td className="px-4 py-3 text-gray-600">{r.type}</td>
                  <td className="px-4 py-3 text-gray-600">{fmt(r.startDate)}</td>
                  <td className="px-4 py-3 text-gray-600">{fmt(r.endDate)}</td>
                  <td className="px-4 py-3 text-gray-600">{r.totalDays}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate" title={r.reason}>{r.reason || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[r.status] ?? 'bg-gray-100 text-gray-600'}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    {r.status === 'Pending' && (
                      <>
                        <button onClick={() => approve(r.id)} disabled={acting === r.id}
                          className="text-green-600 hover:text-green-800 text-xs font-medium disabled:opacity-50">✓ Approva</button>
                        <button onClick={() => reject(r.id)} disabled={acting === r.id}
                          className="text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-50">✕ Rifiuta</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
