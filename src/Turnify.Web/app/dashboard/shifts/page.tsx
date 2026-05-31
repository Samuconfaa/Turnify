'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

interface Shift {
  id: number; employeeId: number; employeeName: string;
  startTime: string; endTime: string; label: string; note: string; status: string;
}
interface Employee { id: number; firstName: string; lastName: string; }

const STATUS_OPTIONS = ['Scheduled', 'InProgress', 'Completed', 'Cancelled'];
const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  Scheduled:  { label: 'Programmato', cls: 'badge-primary' },
  InProgress: { label: 'In corso',    cls: 'badge-green' },
  Completed:  { label: 'Completato',  cls: 'badge-muted' },
  Cancelled:  { label: 'Annullato',   cls: 'badge-red' },
};

const AVATAR_COLORS = [
  'oklch(0.6 0.13 25)', 'oklch(0.58 0.12 250)', 'oklch(0.6 0.13 320)',
  'oklch(0.55 0.11 150)', 'oklch(0.6 0.12 60)', 'oklch(0.52 0.12 180)',
];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function initials(name: string) {
  const p = name.split(' ');
  return (p[0]?.[0] ?? '') + (p[1]?.[0] ?? '');
}

function weekStart(d: Date) {
  const r = new Date(d);
  r.setDate(r.getDate() - ((r.getDay() + 6) % 7));
  r.setHours(0, 0, 0, 0);
  return r;
}
function toLocalDT(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
function todayDT() {
  const d = new Date(), p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T08:00`;
}
function fmtDT(iso: string) {
  return new Date(iso).toLocaleString('it-IT', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

const IT_DAYS = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const emptyForm = { employeeId: '', startTime: '', endTime: '', label: '', note: '', status: 'Scheduled' };

export default function ShiftsPage() {
  const [shifts, setShifts]         = useState<Shift[]>([]);
  const [employees, setEmployees]   = useState<Employee[]>([]);
  const [week, setWeek]             = useState<Date>(() => weekStart(new Date()));
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [modal, setModal]           = useState<null | 'create' | 'edit'>(null);
  const [editTarget, setEditTarget] = useState<Shift | null>(null);
  const [form, setForm]             = useState({ ...emptyForm });
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const from = week.toISOString();
      const to   = new Date(week.getTime() + 7 * 86400000).toISOString();
      const [result, emps] = await Promise.all([
        api.get<{ data: Shift[] }>(`/api/shifts?from=${from}&to=${to}&pageSize=200`),
        employees.length === 0 ? api.get<Employee[]>('/api/employees') : Promise.resolve(null),
      ]);
      setShifts(result?.data ?? []);
      if (emps) setEmployees(Array.isArray(emps) ? emps : []);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Errore'); }
    finally { setLoading(false); }
  }, [week]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    const s = todayDT();
    setForm({ ...emptyForm, startTime: s, endTime: s.slice(0, -5) + '16:00' });
    setFormError(''); setEditTarget(null); setModal('create');
  }
  function openEdit(s: Shift) {
    setForm({ employeeId: String(s.employeeId), startTime: toLocalDT(s.startTime), endTime: toLocalDT(s.endTime), label: s.label, note: s.note ?? '', status: s.status });
    setFormError(''); setEditTarget(s); setModal('edit');
  }

  async function handleSave() {
    setSaving(true); setFormError('');
    try {
      const body = { employeeId: Number(form.employeeId), startTime: new Date(form.startTime).toISOString(), endTime: new Date(form.endTime).toISOString(), label: form.label, note: form.note, status: form.status, isRecurring: false };
      if (modal === 'create') await api.post('/api/shifts', body);
      else if (editTarget) await api.put(`/api/shifts/${editTarget.id}`, body);
      setModal(null); await load();
    } catch (e: unknown) { setFormError(e instanceof Error ? e.message : 'Errore'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm('Eliminare questo turno?')) return;
    try { await api.delete(`/api/shifts/${id}`); await load(); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : 'Errore'); }
  }

  const set = <K extends keyof typeof form>(k: K, v: string) => setForm(f => ({ ...f, [k]: v }));
  const prevWeek = () => setWeek(d => new Date(d.getTime() - 7 * 86400000));
  const nextWeek = () => setWeek(d => new Date(d.getTime() + 7 * 86400000));
  const weekEnd  = new Date(week.getTime() + 6 * 86400000);
  const isCurrentWeek = weekStart(new Date()).getTime() === week.getTime();
  const weekLabel = `${week.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })} – ${weekEnd.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}`;

  const countByStatus = STATUS_OPTIONS.reduce<Record<string, number>>((acc, s) => {
    acc[s] = shifts.filter(sh => sh.status === s).length; return acc;
  }, {});

  // Build week day cards
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(week.getTime() + i * 86400000);
    const dayShifts = shifts.filter(s => {
      const sd = new Date(s.startTime);
      return sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth() && sd.getDate() === d.getDate();
    });
    const today = new Date();
    const isToday = d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
    return { d, dayShifts, isToday, pct: Math.min(100, dayShifts.length * 10) };
  });

  return (
    <>
      <header className="topbar">
        <div>
          <h1 className="page-title">Turni</h1>
          <p className="page-sub">Pianificazione settimanale</p>
        </div>
        <div className="weeknav grow" style={{ justifyContent: 'flex-end' }}>
          <button className="icon-btn sm" title="Settimana precedente" onClick={prevWeek}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="m14 6-6 6 6 6"/></svg>
          </button>
          <span className="wk">{weekLabel}</span>
          <button className="icon-btn sm" title="Settimana successiva" onClick={nextWeek}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="m10 6 6 6-6 6"/></svg>
          </button>
          {!isCurrentWeek && (
            <button className="btn-secondary" style={{ height: 34, padding: '0 14px', marginLeft: 4 }} onClick={() => setWeek(weekStart(new Date()))}>Oggi</button>
          )}
        </div>
        <ThemeToggle />
        <button className="btn-primary" style={{ height: 40 }} onClick={openCreate}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Nuovo turno
        </button>
      </header>

      <main className="content">
        {/* Week strip */}
        <div className="week-strip rise" style={{ animationDelay: '.04s' }}>
          {weekDays.map(({ d, dayShifts, isToday, pct }, i) => (
            <div key={i} className={`day-card${isToday ? ' today' : ''}`} style={{ animationDelay: `${.05 + i * .04}s` }}>
              <div className="dn">{IT_DAYS[d.getDay()]}</div>
              <div className="dd">{d.getDate()}</div>
              <div className="db"><i style={{ width: pct + '%' }} /></div>
              <div className="dc"><b>{dayShifts.length}</b> turni</div>
            </div>
          ))}
        </div>

        {/* Filter / summary */}
        <div className="filter-bar rise" style={{ animationDelay: '.2s' }}>
          <span className="badge badge-primary spacer">
            <span className="bdot" />
            {shifts.length} turni questa settimana
            {countByStatus['InProgress'] > 0 && ` · ${countByStatus['InProgress']} in corso`}
          </span>
        </div>

        {loading && <p style={{ color: 'var(--text-faint)', fontSize: 14, padding: '24px 0' }}>Caricamento…</p>}
        {error   && <p style={{ color: 'var(--red)', fontSize: 14 }}>{error}</p>}

        {!loading && !error && (
          <div className="card tbl-wrap rise" style={{ animationDelay: '.26s' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Dipendente</th><th>Giorno</th><th>Orario</th>
                  <th>Etichetta</th><th>Note</th><th>Stato</th><th className="r">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {shifts.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-faint)', padding: '48px 0' }}>Nessun turno questa settimana.</td></tr>
                )}
                {shifts.map(s => {
                  const st = STATUS_MAP[s.status];
                  return (
                    <tr key={s.id}>
                      <td>
                        <div className="cell-user">
                          <div className="avatar" style={{ background: avatarColor(s.employeeName) }}>{initials(s.employeeName)}</div>
                          <div><div className="nm">{s.employeeName}</div></div>
                        </div>
                      </td>
                      <td className="muted">{fmtDT(s.startTime)}</td>
                      <td className="mono">{fmtTime(s.startTime)}–{fmtTime(s.endTime)}</td>
                      <td>{s.label || '—'}</td>
                      <td className="muted" style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }} title={s.note}>{s.note || '—'}</td>
                      <td>{st && <span className={`badge ${st.cls}`}><span className="bdot" />{st.label}</span>}</td>
                      <td className="r">
                        <div className="row-actions">
                          <button className="icon-btn sm" title="Modifica" onClick={() => openEdit(s)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4L18.5 9.5a2 2 0 0 0-2.8-2.8L5 17.2V20Z"/><path d="M14 7l3 3"/></svg>
                          </button>
                          <button className="icon-btn sm" title="Elimina" onClick={() => handleDelete(s.id)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {shifts.length > 0 && (
              <div className="pager"><span>{shifts.length} turni · {weekLabel}</span></div>
            )}
          </div>
        )}
      </main>

      {/* Modal */}
      {modal && (
        <div className="modal-backdrop open" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-head">
              <div className="mh-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4M12 12v4M10 14h4"/>
                </svg>
              </div>
              <div>
                <div className="modal-title">{modal === 'create' ? 'Nuovo turno' : 'Modifica turno'}</div>
                <div className="modal-sub">Assegna un turno a un dipendente</div>
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="ff full">
                  <label>Dipendente</label>
                  <div className="tu-select" style={{ width: '100%' }}>
                    <select className="input" value={form.employeeId} onChange={e => set('employeeId', e.target.value)} style={{ paddingRight: 34 }}>
                      <option value="">Seleziona…</option>
                      {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                    </select>
                  </div>
                </div>
                <div className="ff">
                  <label>Inizio</label>
                  <input className="input" type="datetime-local" value={form.startTime} onChange={e => set('startTime', e.target.value)} />
                </div>
                <div className="ff">
                  <label>Fine</label>
                  <input className="input" type="datetime-local" value={form.endTime} onChange={e => set('endTime', e.target.value)} />
                </div>
                <div className="ff">
                  <label>Etichetta</label>
                  <input className="input" value={form.label} onChange={e => set('label', e.target.value)} placeholder="Es. Apertura" />
                </div>
                <div className="ff">
                  <label>Stato</label>
                  <div className="tu-select" style={{ width: '100%' }}>
                    <select className="input" value={form.status} onChange={e => set('status', e.target.value)} style={{ paddingRight: 34 }}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_MAP[s]?.label ?? s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="ff full">
                  <label>Note</label>
                  <textarea className="ta" value={form.note} onChange={e => set('note', e.target.value)} placeholder="Note opzionali…" rows={2} />
                </div>
              </div>
              {formError && <p style={{ marginTop: 14, color: 'var(--red)', background: 'var(--red-soft)', border: '1px solid var(--red)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>{formError}</p>}
            </div>
            <div className="modal-foot">
              <button className="btn-secondary" onClick={() => setModal(null)}>Annulla</button>
              <button className="btn-primary" disabled={saving} onClick={handleSave}>{saving ? 'Salvataggio…' : 'Crea turno'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
