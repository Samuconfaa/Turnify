'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface DashboardShift {
  id: number; employeeName: string; startTime: string; endTime: string; role: string; status: string;
}
interface DashboardVacation {
  id: number; employeeName: string; startDate: string; endDate: string; type: string;
}
interface Summary {
  totalEmployees: number;
  shiftsThisWeek: number;
  pendingVacations: number;
  totalHoursScheduled: number;
  shiftsToday: DashboardShift[];
  pendingRequests: DashboardVacation[];
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function fmt(iso: string, opts: Intl.DateTimeFormatOptions) {
  return new Date(iso).toLocaleString('it-IT', opts);
}

export default function DashboardPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Summary>('/api/dashboard/summary')
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Errore'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400 text-sm">Caricamento...</p>;
  if (error)   return <p className="text-red-500 text-sm">{error}</p>;
  if (!data)   return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Dipendenti attivi" value={data.totalEmployees} />
        <StatCard label="Turni questa settimana" value={data.shiftsThisWeek} />
        <StatCard label="Ferie in attesa" value={data.pendingVacations} />
        <StatCard label="Ore programmate" value={`${Number(data.totalHoursScheduled).toFixed(0)}h`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Turni di oggi</h2>
          {data.shiftsToday.length === 0
            ? <p className="text-sm text-gray-400">Nessun turno oggi.</p>
            : (
              <div className="space-y-2">
                {data.shiftsToday.map(s => (
                  <div key={s.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">{s.employeeName}</span>
                    <span className="text-sm text-gray-500">
                      {fmt(s.startTime, { hour: '2-digit', minute: '2-digit' })}–{fmt(s.endTime, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Ferie in attesa di approvazione</h2>
          {data.pendingRequests.length === 0
            ? <p className="text-sm text-gray-400">Nessuna richiesta in attesa.</p>
            : (
              <div className="space-y-2">
                {data.pendingRequests.map(r => (
                  <div key={r.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">{r.employeeName}</span>
                    <span className="text-sm text-gray-500">
                      {fmt(r.startDate, { day: '2-digit', month: '2-digit' })} → {fmt(r.endDate, { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
