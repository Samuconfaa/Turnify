'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

interface DayAvailability {
  day: number;
  available: boolean;
  timeNote: string;
}

const DAY_NAMES = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

function isWeekend(dayIndex: number) { return dayIndex >= 5; }
function isSunday(dayIndex: number)  { return dayIndex === 6; }

export default function EmployeeAvailabilityPage() {
  const [days, setDays]       = useState<DayAvailability[]>(
    DAY_NAMES.map((_, i) => ({ day: i, available: i < 5, timeNote: i < 5 ? 'Tutto il giorno' : '' }))
  );
  const [notes, setNotes]     = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }

  useEffect(() => {
    api.get<{ days: DayAvailability[]; notes: string }>('/api/employees/me/availability')
      .then(res => {
        if (res?.days?.length) setDays(res.days);
        if (res?.notes) setNotes(res.notes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function toggleDay(index: number) {
    setDays(prev => prev.map((d, i) => {
      if (i !== index) return d;
      const newAvailable = !d.available;
      return { ...d, available: newAvailable, timeNote: newAvailable ? 'Tutto il giorno' : '' };
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.put('/api/employees/me/availability', { days, notes });
      showToast('Disponibilità aggiornata');
    } catch { showToast('Errore nel salvataggio'); }
    finally { setSaving(false); }
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-title">
          <span className="topbar-eyebrow">Preferenze</span>
          <h1>Disponibilità</h1>
        </div>
        <div className="topbar-spacer" />
        <div className="topbar-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <path d="M17 21v-8H7v8M7 3v5h8"/>
            </svg>
            {saving ? 'Salvataggio…' : 'Salva'}
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="content" style={{ maxWidth: 760 }}>
        {loading ? (
          <p style={{ color: 'var(--text-faint)', fontSize: 14, padding: '24px 0' }}>Caricamento…</p>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', marginBottom: 18, maxWidth: '60ch' }}>
              Indica i giorni in cui sei generalmente disponibile a lavorare. Il responsabile terrà conto delle tue preferenze nella pianificazione dei turni.
            </p>

            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-head"><h2>Giorni della settimana</h2></div>
              <div className="list">
                {days.map((d, i) => (
                  <div key={i} className="list-row" style={{ gap: 14 }}>
                    <span style={{
                      width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                      background: d.available ? 'var(--green)' : 'var(--border)',
                    }} />
                    <span style={{
                      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15.5, flex: 1,
                      color: isWeekend(i) ? (isSunday(i) ? 'var(--red)' : 'var(--amber)') : d.available ? 'var(--text)' : 'var(--text-muted)',
                    }}>
                      {DAY_NAMES[i]}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)', minWidth: 110, textAlign: 'right' }}>
                      {d.timeNote || '—'}
                    </span>
                    <span style={{
                      fontSize: 13, fontWeight: 600, color: d.available ? 'var(--green)' : 'var(--text-muted)',
                      minWidth: 96, textAlign: 'right',
                    }}>
                      {d.available ? 'Disponibile' : 'Non disponibile'}
                    </span>
                    <label className="switch">
                      <input type="checkbox" checked={d.available} onChange={() => toggleDay(i)} />
                      <span className="track" />
                      <span className="thumb" />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="card card-pad">
              <div className="field">
                <label htmlFor="dispo-note">Note sulla disponibilità</label>
                <textarea
                  className="textarea"
                  id="dispo-note"
                  placeholder="Es. Disponibile per turni serali in via straordinaria con preavviso di 48h…"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>
          </>
        )}
      </main>

      {toast && (
        <div className="toast-wrap">
          <div className="toast show">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
              <path d="M20 6 9 17l-5-5"/>
            </svg>
            <span>{toast}</span>
          </div>
        </div>
      )}
    </>
  );
}
