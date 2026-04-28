'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface DashboardShift {
  id: number; employeeName: string; startTime: string; endTime: string;
  role: string; label: string; status: string;
}
interface DashboardVacation {
  id: number; employeeName: string; startDate: string; endDate: string;
  type: string; totalDays: number;
}
interface Summary {
  totalEmployees: number;
  shiftsThisWeek: number;
  pendingVacations: number;
  totalHoursScheduled: number;
  shiftsToday: DashboardShift[];
  pendingRequests: DashboardVacation[];
}

const VACATION_TYPE: Record<string, string> = {
  Holiday:        'Ferie',
  PaidLeave:      'Permesso retribuito',
  UnpaidLeave:    'Permesso non retribuito',
  SickLeave:      'Malattia',
};

const SHIFT_STATUS_STYLE: Record<string, string> = {
  Scheduled:  'bg-blue-100 text-blue-700',
  InProgress: 'bg-yellow-100 text-yellow-700',
  Completed:  'bg-green-100 text-green-700',
  Cancelled:  'bg-red-100 text-red-700',
};
const SHIFT_STATUS_LABEL: Record<string, string> = {
  Scheduled:  'Pianificato',
  InProgress: 'In corso',
  Completed:  'Completato',
  Cancelled:  'Annullato',
};

function StatCard({
  label, value, icon, bg,
}: { label: string; value: string | number; icon: string; bg: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${bg}`}>
        {icon}
      </div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
}
function todayLabel() {
  return new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function DashboardPage() {
  const [data, setData]       = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get<Summary>('/api/dashboard/summary')
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Errore'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center gap-2 text-gray-400 text-sm">
      <span className="animate-spin">⟳</span> Caricamento…
    </div>
  );
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
  );
  if (!data) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1 capitalize">{todayLabel()}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Dipendenti attivi"      value={data.totalEmployees}                                    icon="👥" bg="bg-blue-50" />
        <StatCard label="Turni questa settimana" value={data.shiftsThisWeek}                                   icon="📅" bg="bg-indigo-50" />
        <StatCard label="Ferie in attesa"        value={data.pendingVacations}                                 icon="🌴" bg="bg-amber-50" />
        <StatCard label="Ore programmate"        value={`${Number(data.totalHoursScheduled).toFixed(0)}h`}    icon="⏱" bg="bg-green-50" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Turni di oggi */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>📋</span> Turni di oggi
            <span className="ml-auto text-xs font-normal text-gray-400">{data.shiftsToday.length} turni</span>
          </h2>
          {data.shiftsToday.length === 0
            ? <p className="text-sm text-gray-400 py-4 text-center">Nessun turno oggi.</p>
            : (
              <div className="divide-y divide-gray-100">
                {data.shiftsToday.map(s => (
                  <div key={s.id} className="flex items-center justify-between py-2.5 gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{s.employeeName}</p>
                      {s.role && <p className="text-xs text-gray-400 truncate">{s.role}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-500 font-mono">
                        {fmtTime(s.startTime)}–{fmtTime(s.endTime)}
                      </span>
                      {s.status && (
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${SHIFT_STATUS_STYLE[s.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {SHIFT_STATUS_LABEL[s.status] ?? s.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Ferie in attesa */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>⏳</span> Ferie in attesa di approvazione
            {data.pendingRequests.length > 0 && (
              <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {data.pendingRequests.length}
              </span>
            )}
          </h2>
          {data.pendingRequests.length === 0
            ? <p className="text-sm text-gray-400 py-4 text-center">Nessuna richiesta in attesa.</p>
            : (
              <div className="divide-y divide-gray-100">
                {data.pendingRequests.map(r => (
                  <div key={r.id} className="flex items-center justify-between py-2.5 gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{r.employeeName}</p>
                      <p className="text-xs text-gray-400">{VACATION_TYPE[r.type] ?? r.type}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-600 font-mono">
                        {fmtDate(r.startDate)} → {fmtDate(r.endDate)}
                      </p>
                      <p className="text-xs text-gray-400">{r.totalDays} {r.totalDays === 1 ? 'giorno' : 'giorni'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
