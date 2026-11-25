'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

interface MonthSummary {
  totalMinutes: number;
  daysPresent: number;
  missingMinutes: number;
}

interface AttendanceEntry {
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  durationMinutes: number | null;
  status: string;
  weekNumber?: number;
  weekLabel?: string;
}

interface MonthData {
  summary: MonthSummary;
  entries: AttendanceEntry[];
}

const IT_DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const IT_MONTHS_LONG = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

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

function getWeekNumber(date: Date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  complete:    { label: 'Completo',        cls: 'badge-green' },
  missing_out: { label: 'Mancante uscita', cls: 'badge-amber' },
  absent:      { label: 'Assenza',         cls: 'badge-gray' },
  rest:        { label: 'Riposo',          cls: 'badge-gray' },
};

export default function EmployeeAttendancePage() {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [data, setData]   = useState<MonthData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<MonthData>(`/api/employee/attendance?year=${year}&month=${month + 1}`);
      setData(res);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const grouped = (data?.entries ?? []).reduce<{ week: number; label: string; entries: AttendanceEntry[] }[]>((acc, e) => {
    const d = new Date(e.date);
    const wn = e.weekNumber ?? getWeekNumber(d);
    const existing = acc.find(g => g.week === wn);
    if (existing) {
      existing.entries.push(e);
    } else {
      acc.push({ week: wn, label: e.weekLabel ?? `Settimana ${wn}`, entries: [e] });
    }
    return acc;
  }, []);

  return (
    <>
      <header className="topbar">
        <div className="topbar-title">
          <span className="topbar-eyebrow">Storico presenze</span>
          <h1>Timbratura</h1>
        </div>
        <div className="topbar-spacer" />
        <div className="topbar-actions">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <button className="icon-btn" onClick={prevMonth} aria-label="Mese precedente">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, minWidth: 132, textAlign: 'center' }}>
              {IT_MONTHS_LONG[month]} {year}
            </span>
            <button className="icon-btn" onClick={nextMonth} aria-label="Mese successivo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="content">
        {loading ? (
          <p style={{ color: 'var(--text-faint)', fontSize: 14, padding: '24px 0' }}>Caricamento…</p>
        ) : (
          <>
            <div className="grid grid-3" style={{ marginBottom: 24 }}>
              <div className="card kpi">
                <div className="kpi-head">
                  <div className="kpi-icon tint-primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
                    </svg>
                  </div>
                  <span className="kpi-label">Ore totali</span>
                </div>
                <div className="kpi-value mono">
                  {Math.floor((data?.summary.totalMinutes ?? 0) / 60)}
                  <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>h {(data?.summary.totalMinutes ?? 0) % 60}m</span>
                </div>
              </div>

              <div className="card kpi">
                <div className="kpi-head">
                  <div className="kpi-icon tint-green">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 11l3 3L22 4"/>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                  </div>
                  <span className="kpi-label">Giorni presenti</span>
                </div>
                <div className="kpi-value mono">
                  {data?.summary.daysPresent ?? 0}
                  <span style={{ fontSize: 18, color: 'var(--text-muted)' }}> giorni</span>
                </div>
              </div>

              <div className="card kpi">
                <div className="kpi-head">
                  <div className="kpi-icon tint-amber">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 9v4M12 17h.01"/>
                      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>
                    </svg>
                  </div>
                  <span className="kpi-label">Ore mancanti</span>
                </div>
                <div className="kpi-value mono" style={{ color: 'var(--amber)' }}>
                  {Math.floor((data?.summary.missingMinutes ?? 0) / 60)}
                  <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>h {(data?.summary.missingMinutes ?? 0) % 60}m</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h2>Dettaglio giornate</h2></div>
              {grouped.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-faint)', padding: '24px 0', fontSize: 13 }}>
                  Nessun dato per questo mese.
                </p>
              ) : (
                grouped.map(g => (
                  <div key={g.week}>
                    <div style={{
                      fontSize: 12, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase',
                      color: 'var(--text-muted)', padding: '16px 20px 7px',
                      background: 'var(--surface-2)', borderTop: '1px solid var(--border)',
                    }}>
                      {g.label}
                    </div>
                    <div className="list">
                      {g.entries.map((e, i) => {
                        const d = new Date(e.date);
                        const st = STATUS_MAP[e.status] ?? { label: e.status, cls: 'badge-gray' };
                        return (
                          <div key={i} className="list-row">
                            <div style={{ width: 58, display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>{IT_DAYS_SHORT[d.getDay()]}</span>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-muted)' }}>
                                {String(d.getDate()).padStart(2, '0')} {['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'][d.getMonth()]}
                              </span>
                            </div>
                            <div style={{ minWidth: 78 }}>
                              <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.03em' }}>Entrata</div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 15, color: e.checkIn ? 'var(--green)' : 'var(--text-muted)' }}>
                                {fmtTime(e.checkIn)}
                              </div>
                            </div>
                            <div style={{ minWidth: 78 }}>
                              <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.03em' }}>Uscita</div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 15, color: e.checkOut ? 'var(--amber)' : 'var(--text-muted)' }}>
                                {fmtTime(e.checkOut)}
                              </div>
                            </div>
                            <div style={{ flex: 1 }} />
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: e.durationMinutes ? 'var(--text)' : 'var(--text-muted)' }}>
                              {fmtDuration(e.durationMinutes)}
                            </span>
                            <span className={`badge ${st.cls}`}>{st.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}
