'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

interface AttendanceEntry {
  id: number;
  checkInTime: string | null;
  checkOutTime: string | null;
  hoursWorked: number | null;
}

interface EmployeeDashboard {
  nextShift: { id: number; startTime: string; endTime: string; label: string; note: string } | null;
  vacationDaysUsedThisYear: number;
  vacationDaysAllowed: number;
  pendingVacationRequests: number;
  isCheckedInToday: boolean;
  todayCheckIn: string | null;
  todayCheckOut: string | null;
  hoursWorkedThisMonth: number;
  hoursScheduledThisWeek: number;
}

function fmtTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

function fmtDuration(minutes: number | null) {
  if (!minutes) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  const months = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
  return { dow: days[d.getDay()], day: String(d.getDate()).padStart(2, '0'), mon: months[d.getMonth()] };
}

function greetingLabel() {
  const h = new Date().getHours();
  return h < 12 ? 'Buongiorno' : h < 18 ? 'Buon pomeriggio' : 'Buonasera';
}

function todayLabel() {
  return new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

const STAMP_STATUS: Record<string, { label: string; cls: string }> = {
  complete:       { label: 'Completo',        cls: 'badge-green' },
  missing_out:    { label: 'Mancante uscita', cls: 'badge-amber' },
  absent:         { label: 'Assenza',         cls: 'badge-gray' },
  rest:           { label: 'Riposo',          cls: 'badge-gray' },
};

export default function EmployeeDashboardPage() {
  const [data, setData]           = useState<EmployeeDashboard | null>(null);
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    Promise.all([
      api.get<EmployeeDashboard>('/api/dashboard/employee-summary'),
      api.get<{ data: AttendanceEntry[] }>('/api/attendance/history?pageSize=5'),
    ])
      .then(([d, att]) => {
        setData(d);
        setAttendance(att?.data ?? []);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Errore'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <header className="topbar">
        <div className="topbar-title">
          <h1>{greetingLabel()} 👋</h1>
          <span className="topbar-eyebrow" style={{ textTransform: 'capitalize' }}>{todayLabel()}</span>
        </div>
        <div className="topbar-spacer" />
        <div className="topbar-actions">
          <Link href="/employee/notifications" className="icon-btn" aria-label="Notifiche" style={{ position: 'relative' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/>
            </svg>
            <span className="notif-dot" />
          </Link>
          <ThemeToggle />
        </div>
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

        {!loading && !error && (
          <>
            <div className="grid grid-2" style={{ marginBottom: 24 }}>
              <div className="card kpi">
                <div className="kpi-head">
                  <div className="kpi-icon tint-primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>
                    </svg>
                  </div>
                  <span className="kpi-label">Prossimo turno</span>
                  <div className="topbar-spacer" />
                  {data?.nextShift && new Date(data.nextShift.startTime).toDateString() === new Date().toDateString() && (
                    <span className="badge badge-primary" style={{ fontSize: 11 }}>Oggi</span>
                  )}
                </div>
                {data?.nextShift ? (
                  <>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', lineHeight: 1 }}>
                      {fmtTime(data.nextShift.startTime)} – {fmtTime(data.nextShift.endTime)}
                    </div>
                    <div className="kpi-sub">{data.nextShift.label || 'Turno programmato'}</div>
                  </>
                ) : (
                  <div className="kpi-sub" style={{ marginTop: 8 }}>Nessun turno in programma</div>
                )}
              </div>

              <div className="card kpi">
                <div className="kpi-head">
                  <div className="kpi-icon tint-green">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
                    </svg>
                  </div>
                  <span className="kpi-label">Timbratura oggi</span>
                </div>
                <div style={{ display: 'flex', gap: 26 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 3 }}>Entrata</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 22, color: data?.todayCheckIn ? 'var(--green)' : 'var(--text-muted)' }}>
                      {fmtTime(data?.todayCheckIn ?? null)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 3 }}>Uscita</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 22, color: data?.todayCheckOut ? 'var(--amber)' : 'var(--text-muted)' }}>
                      {fmtTime(data?.todayCheckOut ?? null)}
                    </div>
                  </div>
                </div>
                {data?.isCheckedInToday && !data?.todayCheckOut && (
                  <div className="kpi-sub">Attualmente in turno</div>
                )}
              </div>

              <div className="card kpi">
                <div className="kpi-head">
                  <div className="kpi-icon tint-blue">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/>
                    </svg>
                  </div>
                  <span className="kpi-label">Ore settimana</span>
                </div>
                <div className="kpi-value mono">
                  {data?.hoursWorkedThisMonth ?? 0}
                  <span style={{ fontSize: 18, color: 'var(--text-muted)' }}> h questo mese</span>
                </div>
                <div className="kpi-sub">{data?.hoursScheduledThisWeek ?? 0}h pianificate questa settimana</div>
              </div>

              <div className="card kpi">
                <div className="kpi-head">
                  <div className="kpi-icon tint-amber">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M2 12h2M20 12h2M17.7 6.3l1.4-1.4"/>
                    </svg>
                  </div>
                  <span className="kpi-label">Ferie rimanenti</span>
                </div>
                <div className="kpi-value mono">
                  {Math.max(0, (data?.vacationDaysAllowed ?? 0) - (data?.vacationDaysUsedThisYear ?? 0))}
                  <span style={{ fontSize: 18, color: 'var(--text-muted)' }}> su {data?.vacationDaysAllowed ?? 0}</span>
                </div>
                <div className="kpi-sub">giorni · anno {new Date().getFullYear()}</div>
              </div>
            </div>

            <div className="section-title">Azioni rapide</div>
            <div className="grid grid-3" style={{ marginBottom: 26 }}>
              <Link className="qa-tile" href="/employee/vacations">
                <div className="qa-icon tint-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </div>
                <div className="qa-text">
                  <div className="qa-title">Richiedi ferie</div>
                  <div className="qa-sub">Nuova richiesta</div>
                </div>
              </Link>
              <Link className="qa-tile" href="/employee/attendance">
                <div className="qa-icon tint-green">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
                  </svg>
                </div>
                <div className="qa-text">
                  <div className="qa-title">Timbra entrata</div>
                  <div className="qa-sub">Registra l&apos;orario</div>
                </div>
              </Link>
              <Link className="qa-tile" href="/employee/availability">
                <div className="qa-icon tint-blue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 6h12M4 12h16M4 18h9"/><circle cx="18" cy="6" r="2.4"/><circle cx="9" cy="18" r="2.4"/>
                  </svg>
                </div>
                <div className="qa-text">
                  <div className="qa-title">Aggiorna disponibilità</div>
                  <div className="qa-sub">Giorni preferiti</div>
                </div>
              </Link>
            </div>

            <div className="card">
              <div className="card-head">
                <h2>Storico presenze</h2>
                <div className="topbar-spacer" />
                <Link className="btn-ghost" href="/employee/attendance" style={{ fontSize: 13, padding: '6px 12px' }}>Vedi tutto</Link>
              </div>
              <div className="list">
                {attendance.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-faint)', padding: '24px 0', fontSize: 13 }}>
                    Nessun dato di presenza.
                  </p>
                ) : (
                  attendance.map((entry) => {
                    const d = new Date(entry.checkInTime ?? '');
                    const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
                    const months = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
                    const dow = days[d.getDay()];
                    const day = String(d.getDate()).padStart(2, '0');
                    const mon = months[d.getMonth()];
                    return (
                      <div key={entry.id} className="list-row">
                        <div style={{ width: 54 }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>{dow}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>{day} {mon}</div>
                        </div>
                        <div className="row" style={{ gap: 20, flex: 1 }}>
                          <div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Entrata</div>
                            <span style={{ fontFamily: 'var(--font-mono)', color: entry.checkInTime ? 'var(--green)' : 'var(--text-muted)', fontWeight: 600 }}>
                              {fmtTime(entry.checkInTime)}
                            </span>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Uscita</div>
                            <span style={{ fontFamily: 'var(--font-mono)', color: entry.checkOutTime ? 'var(--amber)' : 'var(--text-muted)', fontWeight: 600 }}>
                              {fmtTime(entry.checkOutTime)}
                            </span>
                          </div>
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: entry.hoursWorked ? 'var(--text)' : 'var(--text-muted)' }}>
                          {entry.hoursWorked ? `${entry.hoursWorked}h` : '—'}
                        </span>
                        <span className={`badge ${entry.checkOutTime ? 'badge-green' : entry.checkInTime ? 'badge-amber' : 'badge-gray'}`}>
                          {entry.checkOutTime ? 'Completo' : entry.checkInTime ? 'In corso' : 'Assenza'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
