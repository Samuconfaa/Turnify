'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface Shift {
  id: number; employeeId: number; employeeName: string;
  startTime: string; endTime: string; label: string; note: string; status: string;
}
interface Employee { id: number; firstName: string; lastName: string; }

const STATUS_OPTIONS = ['Scheduled', 'InProgress', 'Completed', 'Cancelled'];

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  Scheduled:  { label: 'Pianificato', cls: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  InProgress: { label: 'In corso',    cls: 'bg-amber-50 text-amber-700 border-amber-100' },
  Completed:  { label: 'Completato',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  Cancelled:  { label: 'Annullato',   cls: 'bg-red-50 text-red-600 border-red-100' },
};

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
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T08:00`;
}
function fmtDT(iso: string) {
  return new Date(iso).toLocaleString('it-IT', {
    weekday: 'short', day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

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
      if (emps) setEmployees(emps ?? []);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Errore'); }
    finally { setLoading(false); }
  }, [week]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    const s = todayDT();
    const e = s.slice(0, -5) + '16:00';
    setForm({ ...emptyForm, startTime: s, endTime: e });
    setFormError(''); setEditTarget(null); setModal('create');
  }
  function openEdit(s: Shift) {
    setForm({
      employeeId: String(s.employeeId), startTime: toLocalDT(s.startTime),
      endTime: toLocalDT(s.endTime), label: s.label, note: s.note ?? '', status: s.status,
    });
    setFormError(''); setEditTarget(s); setModal('edit');
  }

  async function handleSave() {
    setSaving(true); setFormError('');
    try {
      const body = {
        employeeId: Number(form.employeeId),
        startTime:  new Date(form.startTime).toISOString(),
        endTime:    new Date(form.endTime).toISOString(),
        label: form.label, note: form.note, status: form.status, isRecurring: false,
      };
      if (modal === 'create') await api.post('/api/shifts', body);
      else if (editTarget)    await api.put(`/api/shifts/${editTarget.id}`, body);
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
    acc[s] = shifts.filter(sh => sh.status === s).length;
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Turni</h1>
          {!loading && !error && (
            <p className="page-sub">
              {shifts.length} turni ·{' '}
              {STATUS_OPTIONS.filter(s => countByStatus[s] > 0).map(s =>
                `${countByStatus[s]} ${STATUS_MAP[s]?.label.toLowerCase() ?? s}`
              ).join(' · ')}
            </p>
          )}
        </div>
        <button onClick={openCreate} className="btn-primary">
          + Nuovo turno
        </button>
      </div>

      {/* Week navigator */}
      <div className="flex items-center gap-2 mb-5">
        <button onClick={prevWeek} className="btn-secondary px-3 py-2">← Prec.</button>
        <span className="text-sm font-semibold text-slate-700 min-w-[220px] text-center bg-white border border-slate-200 rounded-lg px-4 py-2">
          {weekLabel}
        </span>
        <button onClick={nextWeek} className="btn-secondary px-3 py-2">Succ. →</button>
        {!isCurrentWeek && (
          <button onClick={() => setWeek(weekStart(new Date()))} className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold ml-1 transition-colors">
            Oggi
          </button>
        )}
      </div>

      {loading && <p className="text-sm text-slate-400 py-4">Caricamento…</p>}
      {error   && <p className="text-sm text-red-500 py-2">{error}</p>}

      {!loading && !error && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Dipendente', 'Inizio', 'Fine', 'Etichetta', 'Note', 'Stato', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shifts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">
                    Nessun turno questa settimana.
                  </td>
                </tr>
              )}
              {shifts.map(s => {
                const st = STATUS_MAP[s.status];
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{s.employeeName}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{fmtDT(s.startTime)}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{fmtTime(s.endTime)}</td>
                    <td className="px-4 py-3 text-slate-600">{s.label || '—'}</td>
                    <td className="px-4 py-3 text-slate-400 max-w-[140px] truncate text-xs" title={s.note}>
                      {s.note || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {st && <span className={`badge border ${st.cls}`}>{st.label}</span>}
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <button onClick={() => openEdit(s)} className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold transition-colors">Modifica</button>
                      <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold transition-colors">Elimina</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">
                {modal === 'create' ? 'Nuovo turno' : 'Modifica turno'}
              </h2>
              <button onClick={() => setModal(null)} className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Dipendente</label>
                <select value={form.employeeId} onChange={e => set('employeeId', e.target.value)} className="input">
                  <option value="">Seleziona…</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {(['startTime', 'endTime'] as const).map((k, i) => (
                  <div key={k}>
                    <label className="label">{i === 0 ? 'Inizio' : 'Fine'}</label>
                    <input
                      type="datetime-local" value={form[k]} onChange={e => set(k, e.target.value)}
                      className="input"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="label">Etichetta</label>
                <input value={form.label} onChange={e => set('label', e.target.value)} placeholder="es. Apertura" className="input" />
              </div>
              <div>
                <label className="label">Note</label>
                <textarea
                  value={form.note} onChange={e => set('note', e.target.value)}
                  rows={2} placeholder="Note opzionali…"
                  className="input resize-none"
                />
              </div>
              <div>
                <label className="label">Stato</label>
                <select value={form.status} onChange={e => set('status', e.target.value)} className="input">
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_MAP[s]?.label ?? s}</option>)}
                </select>
              </div>
              {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">{formError}</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="btn-secondary">Annulla</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? 'Salvataggio…' : 'Salva'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
