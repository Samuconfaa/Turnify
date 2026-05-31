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
  Holiday:     'Ferie',
  PaidLeave:   'Permesso retribuito',
  UnpaidLeave: 'Permesso non retribuito',
  SickLeave:   'Malattia',
};

const SHIFT_STATUS: Record<string, { label: string; cls: string }> = {
  Scheduled:  { label: 'Pianificato', cls: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  InProgress: { label: 'In corso',    cls: 'bg-amber-50 text-amber-700 border-amber-100' },
  Completed:  { label: 'Completato',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  Cancelled:  { label: 'Annullato',   cls: 'bg-red-50 text-red-600 border-red-100' },
};

/* ── Stat Card ──────────────────────────────────────────────── */
function StatCard({ label, value, icon, iconBg, iconColor }: {
  label: string; value: string | number;
  icon: React.ReactNode; iconBg: string; iconColor: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${iconBg}`}>
        <span className={`w-5 h-5 ${iconColor}`}>{icon}</span>
      </div>
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

/* ── SVG Icons ──────────────────────────────────────────────── */
function IcUsers() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5.356-3.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a4 4 0 015.356-3.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function IcCalendar() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function IcSun() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
function IcClock() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/* ── Helpers ────────────────────────────────────────────────── */
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
}
function todayLabel() {
  return new Date().toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

/* ── Page ───────────────────────────────────────────────────── */
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

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-slate-400 text-sm py-12">
        <svg className="animate-spin w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Caricamento…
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3.5 text-sm text-red-700">{error}</div>
    );
  }
  if (!data) return null;

  return (
    <div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub capitalize">{todayLabel()}</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Dipendenti attivi"
          value={data.totalEmployees}
          icon={<IcUsers />}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard
          label="Turni questa settimana"
          value={data.shiftsThisWeek}
          icon={<IcCalendar />}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
        />
        <StatCard
          label="Ferie in attesa"
          value={data.pendingVacations}
          icon={<IcSun />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          label="Ore programmate"
          value={`${Number(data.totalHoursScheduled).toFixed(0)}h`}
          icon={<IcClock />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* Lists */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Turni di oggi */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs">
                <IcCalendar />
              </span>
              Turni di oggi
            </h2>
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
              {data.shiftsToday.length} turni
            </span>
          </div>
          {data.shiftsToday.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-slate-400">Nessun turno programmato per oggi.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.shiftsToday.map(s => {
                const st = SHIFT_STATUS[s.status];
                return (
                  <div key={s.id} className="flex items-center justify-between py-3 gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{s.employeeName}</p>
                      {s.role && <p className="text-xs text-slate-400 truncate">{s.role}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                        {fmtTime(s.startTime)}–{fmtTime(s.endTime)}
                      </span>
                      {st && (
                        <span className={`badge border ${st.cls}`}>{st.label}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Ferie in attesa */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 text-xs">
                <IcSun />
              </span>
              Ferie in attesa
            </h2>
            {data.pendingRequests.length > 0 && (
              <span className="badge bg-amber-100 text-amber-700 border border-amber-200">
                {data.pendingRequests.length} da approvare
              </span>
            )}
          </div>
          {data.pendingRequests.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-slate-400">Nessuna richiesta in attesa.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.pendingRequests.map(r => (
                <div key={r.id} className="flex items-center justify-between py-3 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{r.employeeName}</p>
                    <p className="text-xs text-slate-400">{VACATION_TYPE[r.type] ?? r.type}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      {fmtDate(r.startDate)} → {fmtDate(r.endDate)}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{r.totalDays} {r.totalDays === 1 ? 'giorno' : 'giorni'}</p>
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
