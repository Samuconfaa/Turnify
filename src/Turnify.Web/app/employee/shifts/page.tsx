'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

interface MyShift {
  id: number;
  startTime: string;
  endTime: string;
  label: string;
  status: string;
  checkIn: string | null;
  checkOut: string | null;
}

const IT_DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const IT_DAYS_LONG  = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
const IT_MONTHS     = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

function weekStart(d: Date) {
  const r = new Date(d);
  r.setDate(r.getDate() - ((r.getDay() + 6) % 7));
  r.setHours(0, 0, 0, 0);
  return r;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

function diffHours(start: string, end: string) {
  const diff = (new Date(end).getTime() - new Date(start).getTime()) / 3600000;
  return diff % 1 === 0 ? `${diff}h` : `${diff.toFixed(1)}h`;
}

function isSameDay(d: Date, iso: string) {
  const s = new Date(iso);
  return d.getFullYear() === s.getFullYear() && d.getMonth() === s.getMonth() && d.getDate() === s.getDate();
}

function weekLabel(week: Date) {
  const end = new Date(week.getTime() + 6 * 86400000);
  return `${week.getDate()} – ${end.getDate()} ${IT_MONTHS[end.getMonth()]}`;
}

export default function EmployeeShiftsPage() {
  const [shifts, setShifts]   = useState<MyShift[]>([]);
  const [week, setWeek]       = useState<Date>(() => weekStart(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const from = week.toISOString();
      const to   = new Date(week.getTime() + 7 * 86400000).toISOString();
      const res  = await api.get<{ data: MyShift[] }>(`/api/shifts?from=${from}&to=${to}`);
      setShifts(res?.data ?? []);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Errore'); }
    finally { setLoading(false); }
  }, [week]);

  useEffect(() => { load(); }, [load]);

  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => new Date(week.getTime() + i * 86400000));
  const isCurrentWeek = weekStart(today).getTime() === week.getTime();

  return (
    <>
      <header className="topbar">
        <div className="topbar-title">
          <span className="topbar-eyebrow">I miei turni</span>
          <h1>Settimana {weekLabel(week)}</h1>
        </div>
        <div className="topbar-spacer" />
        <div className="topbar-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => setWeek(d => new Date(d.getTime() - 7 * 86400000))} aria-label="Settimana precedente">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          {!isCurrentWeek && (
            <button className="btn btn-secondary btn-sm" onClick={() => setWeek(weekStart(new Date()))}>Oggi</button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={() => setWeek(d => new Date(d.getTime() + 7 * 86400000))} aria-label="Settimana successiva">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="content">
        {loading && <p style={{ color: 'var(--text-faint)', fontSize: 14, padding: '24px 0' }}>Caricamento…</p>}
        {error   && <p style={{ color: 'var(--red)', fontSize: 14 }}>{error}</p>}

        {!loading && !error && (
          <>
            <div className="card" style={{ marginBottom: 24, overflowX: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, padding: 16, minWidth: 700 }}>
                {weekDays.map((d, i) => {
                  const isToday = isSameDay(d, today.toISOString());
                  const isSat = d.getDay() === 6;
                  const isSun = d.getDay() === 0;
                  const dayShift = shifts.find(s => isSameDay(d, s.startTime));
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{
                        textAlign: 'center', padding: '9px 4px', borderRadius: 'var(--r-sm)',
                        background: isToday ? 'var(--primary-soft)' : isSat ? 'var(--amber-soft)' : isSun ? 'var(--red-soft)' : 'transparent',
                      }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: isToday ? 'var(--primary-strong)' : isSat ? 'oklch(0.5 0.12 68)' : isSun ? 'var(--red)' : 'var(--text)' }}>
                          {IT_DAYS_SHORT[d.getDay()]}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: isToday ? 'var(--primary-strong)' : 'var(--text-muted)' }}>
                          {d.getDate()}
                        </div>
                      </div>
                      {dayShift ? (
                        <div style={{
                          background: 'var(--surface)', border: `1px solid ${isToday ? 'var(--primary)' : 'var(--border)'}`,
                          borderRadius: 'var(--r-sm)', padding: 10,
                          boxShadow: isToday ? '0 0 0 2px var(--primary-soft)' : 'var(--shadow-sm)',
                          display: 'flex', flexDirection: 'column', gap: 5, minHeight: 84,
                        }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13.5 }}>
                            {fmtTime(dayShift.startTime)}–{fmtTime(dayShift.endTime)}
                          </div>
                          {dayShift.label && (
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.2 }}>{dayShift.label}</div>
                          )}
                          <div style={{ marginTop: 'auto', fontSize: 11, fontWeight: 600, color: 'var(--primary-strong)' }}>
                            {diffHours(dayShift.startTime, dayShift.endTime)}
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          background: 'var(--surface-2)', border: '1px dashed var(--border)',
                          borderRadius: 'var(--r-sm)', padding: 10, minHeight: 84,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--text-muted)', fontSize: 12,
                        }}>
                          Riposo
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="section-title">Turni della settimana</div>
            <div className="grid" style={{ gap: 12 }}>
              {shifts.length === 0 && (
                <p style={{ color: 'var(--text-faint)', fontSize: 14, padding: '12px 0' }}>Nessun turno questa settimana.</p>
              )}
              {shifts.map(s => {
                const d = new Date(s.startTime);
                const isToday = isSameDay(d, today.toISOString());
                const hasCheckIn = !!s.checkIn;
                const hasCheckOut = !!s.checkOut;
                return (
                  <div key={s.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '16px 20px', flexWrap: 'wrap' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, letterSpacing: '-0.01em', minWidth: 160 }}>
                      {fmtTime(s.startTime)} – {fmtTime(s.endTime)}
                    </div>
                    <div style={{ flex: 1, lineHeight: 1.3 }}>
                      <div style={{ fontWeight: 600 }}>
                        {IT_DAYS_LONG[d.getDay()].charAt(0).toUpperCase() + IT_DAYS_LONG[d.getDay()].slice(1)}{' '}
                        {d.getDate()} {IT_MONTHS[d.getMonth()]} · <span style={{ fontFamily: 'var(--font-mono)' }}>{diffHours(s.startTime, s.endTime)}</span>
                      </div>
                      {s.label && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</div>}
                    </div>
                    {hasCheckIn && !hasCheckOut && isToday ? (
                      <span className="badge badge-green">Entrata {fmtTime(s.checkIn!)}</span>
                    ) : hasCheckOut ? (
                      <span className="badge badge-gray" style={{ fontSize: 11 }}>Uscita {fmtTime(s.checkOut!)}</span>
                    ) : (
                      <span className="badge badge-gray">In programma</span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </>
  );
}
