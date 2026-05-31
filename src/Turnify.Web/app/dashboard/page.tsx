'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

interface DashboardShift {
  id: number; employeeName: string; startTime: string; endTime: string;
  role: string; label: string; status: string;
}
interface DashboardVacation {
  id: number; employeeName: string; startDate: string; endDate: string;
  type: string; totalDays: number;
}
interface Summary {
  totalEmployees: number; shiftsThisWeek: number;
  pendingVacations: number; totalHoursScheduled: number;
  shiftsToday: DashboardShift[]; pendingRequests: DashboardVacation[];
}

const VACATION_TYPE: Record<string, string> = {
  Holiday: 'Ferie', PaidLeave: 'Permesso retribuito',
  UnpaidLeave: 'Permesso non retribuito', SickLeave: 'Malattia',
};

const SHIFT_STATUS: Record<string, { label: string; cls: string }> = {
  Scheduled:  { label: 'Programmato', cls: 'badge-primary' },
  InProgress: { label: 'In corso',    cls: 'badge-green' },
  Completed:  { label: 'Completato',  cls: 'badge-muted' },
  Cancelled:  { label: 'Annullato',   cls: 'badge-red' },
};

const AVATAR_COLORS = [
  'oklch(0.6 0.13 25)', 'oklch(0.58 0.12 250)', 'oklch(0.6 0.13 320)',
  'oklch(0.55 0.11 150)', 'oklch(0.6 0.12 60)', 'oklch(0.52 0.12 180)',
];

function initials(name: string) {
  const p = name.split(' ');
  return (p[0]?.[0] ?? '') + (p[1]?.[0] ?? '');
}

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
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

function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [v, setV] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current || !target) return;
    started.current = true;
    const dur = 1100;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return <>{v.toLocaleString('it-IT')}{suffix}</>;
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

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Buongiorno' : greetingHour < 18 ? 'Buon pomeriggio' : 'Buonasera';

  return (
    <>
      <header className="topbar">
        <div>
          <h1 className="page-title">{greeting}</h1>
          <p className="page-sub" style={{ textTransform: 'capitalize' }}>{todayLabel()}</p>
        </div>
        <ThemeToggle />
        <button className="btn-primary" style={{ height: 40 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Nuovo turno
        </button>
      </header>

      <main className="content">
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', padding: '48px 0' }}>
            <svg style={{ animation: 'spin 1s linear infinite', width: 18, height: 18 }} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".2"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            Caricamento…
          </div>
        )}
        {error && (
          <div style={{ background: 'var(--red-soft)', border: '1px solid var(--red)', borderRadius: 13, padding: '14px 18px', color: 'var(--red)', fontSize: 14 }}>
            {error}
          </div>
        )}

        {data && (
          <>
            {/* KPI */}
            <section className="kpi-grid">
              <div className="card kpi rise" style={{ animationDelay: '.04s' }}>
                <div className="kpi-top">
                  <div className="kpi-ico ico-primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.2a3 3 0 0 1 0 5.6M18 19a5 5 0 0 0-3-4.6"/>
                    </svg>
                  </div>
                </div>
                <div className="kpi-val"><CountUp target={data.totalEmployees} /></div>
                <div className="kpi-name">Dipendenti attivi</div>
                <svg className="spark" viewBox="0 0 108 46" preserveAspectRatio="none">
                  <path style={{ stroke: 'var(--primary)' }} d="M2 38 L17 34 L32 36 L47 28 L62 30 L77 20 L92 22 L106 12"/>
                </svg>
              </div>

              <div className="card kpi rise" style={{ animationDelay: '.1s' }}>
                <div className="kpi-top">
                  <div className="kpi-ico ico-green">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/>
                    </svg>
                  </div>
                </div>
                <div className="kpi-val"><CountUp target={data.shiftsThisWeek} /></div>
                <div className="kpi-name">Turni questa settimana</div>
                <svg className="spark" viewBox="0 0 108 46" preserveAspectRatio="none">
                  <path style={{ stroke: 'var(--green)' }} d="M2 30 L17 32 L32 24 L47 26 L62 18 L77 22 L92 14 L106 16"/>
                </svg>
              </div>

              <div className="card kpi rise" style={{ animationDelay: '.16s' }}>
                <div className="kpi-top">
                  <div className="kpi-ico ico-amber">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3 2.5 19.5h19L12 3ZM12 9.5v4M12 16.6v.1"/>
                    </svg>
                  </div>
                </div>
                <div className="kpi-val"><CountUp target={data.pendingVacations} /></div>
                <div className="kpi-name">Ferie in attesa</div>
                {data.pendingVacations > 0 && (
                  <div className="kpi-delta delta-warn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
                    </svg>
                    Richiede attenzione
                  </div>
                )}
                <svg className="spark" viewBox="0 0 108 46" preserveAspectRatio="none">
                  <path style={{ stroke: 'var(--amber)' }} d="M2 24 L17 26 L32 22 L47 30 L62 24 L77 28 L92 18 L106 22"/>
                </svg>
              </div>

              <div className="card kpi rise" style={{ animationDelay: '.22s' }}>
                <div className="kpi-top">
                  <div className="kpi-ico ico-blue">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>
                    </svg>
                  </div>
                </div>
                <div className="kpi-val">
                  <CountUp target={Math.round(data.totalHoursScheduled)} />
                  <span className="unit">h</span>
                </div>
                <div className="kpi-name">Ore programmate</div>
                <svg className="spark" viewBox="0 0 108 46" preserveAspectRatio="none">
                  <path style={{ stroke: 'var(--text-faint)' }} d="M2 28 L17 24 L32 26 L47 22 L62 24 L77 20 L92 24 L106 20"/>
                </svg>
              </div>
            </section>

            {/* Lists */}
            <section className="cols">
              {/* Turni di oggi */}
              <div className="card rise" style={{ animationDelay: '.3s' }}>
                <div className="sec-head">
                  <div>
                    <div className="sec-title">Turni di oggi</div>
                    <div className="sec-sub">{data.shiftsToday.length} turni programmati</div>
                  </div>
                  <Link href="/dashboard/shifts" className="btn-ghost">Vedi tutti</Link>
                </div>
                <div className="list">
                  {data.shiftsToday.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-faint)', padding: '24px 0', fontSize: 13 }}>
                      Nessun turno oggi.
                    </p>
                  ) : (
                    data.shiftsToday.map(s => {
                      const st = SHIFT_STATUS[s.status];
                      return (
                        <div key={s.id} className="shift">
                          <div className="avatar" style={{ background: avatarColor(s.employeeName) }}>
                            {initials(s.employeeName)}
                          </div>
                          <div className="shift-info" style={{ flex: 1 }}>
                            <div className="shift-name">{s.employeeName}</div>
                            {s.role && <div className="shift-role">{s.role}</div>}
                          </div>
                          <div className="shift-time">
                            {fmtTime(s.startTime)}–{fmtTime(s.endTime)}
                          </div>
                          {st && <span className={`badge ${st.cls}`}><span className="bdot" />{st.label}</span>}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Ferie in attesa */}
              <div className="card rise" style={{ animationDelay: '.36s' }}>
                <div className="sec-head">
                  <div>
                    <div className="sec-title">Ferie in attesa</div>
                    <div className="sec-sub">{data.pendingRequests.length} richieste da approvare</div>
                  </div>
                  {data.pendingRequests.length > 0 && (
                    <span className="badge badge-amber">
                      <span className="bdot" />{data.pendingRequests.length}
                    </span>
                  )}
                </div>
                <div style={{ paddingTop: 6 }}>
                  {data.pendingRequests.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-faint)', padding: '24px 0', fontSize: 13 }}>
                      Nessuna richiesta in attesa.
                    </p>
                  ) : (
                    data.pendingRequests.map(r => (
                      <div key={r.id} className="vac">
                        <div className="vac-top">
                          <div className="avatar" style={{ background: avatarColor(r.employeeName) }}>
                            {initials(r.employeeName)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="vac-name">{r.employeeName}</div>
                            <div className="vac-meta">{VACATION_TYPE[r.type] ?? r.type} · {r.totalDays} {r.totalDays === 1 ? 'giorno' : 'giorni'}</div>
                          </div>
                        </div>
                        <div className="vac-dates">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/>
                          </svg>
                          {fmtDate(r.startDate)} – {fmtDate(r.endDate)}
                        </div>
                        <div className="vac-actions">
                          <Link href="/dashboard/vacations" className="btn-primary" style={{ flex: 1, padding: '7px 12px', fontSize: 13 }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m5 13 4 4L19 7"/>
                            </svg>
                            Approva
                          </Link>
                          <Link href="/dashboard/vacations" className="btn-secondary" style={{ flex: 1, padding: '7px 12px', fontSize: 13 }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M6 6l12 12M18 6 6 18"/>
                            </svg>
                            Rifiuta
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
