'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface Shift {
  id: number; employeeId: number; employeeName: string;
  startTime: string; endTime: string; label: string; note: string; status: string;
}
interface Employee { id: number; firstName: string; lastName: string; }

const STATUS = ['Scheduled', 'InProgress', 'Completed', 'Cancelled'];
const STATUS_STYLE: Record<string, string> = {
  Scheduled:  'bg-blue-100 text-blue-700',
  InProgress: 'bg-yellow-100 text-yellow-700',
  Completed:  'bg-green-100 text-green-700',
  Cancelled:  'bg-red-100 text-red-700',
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

const emptyForm = { employeeId: '', startTime: '', endTime: '', label: '', note: '', status: 'Scheduled' };

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [week, setWeek] = useState<Date>(() => weekStart(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<null | 'create' | 'edit'>(null);
  const [editTarget, setEditTarget] = useState<Shift | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const from = week.toISOString();
      const to = new Date(week.getTime() + 7 * 86400000).toISOString();
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
    setForm({ employeeId: String(s.employeeId), startTime: toLocalDT(s.startTime),
      endTime: toLocalDT(s.endTime), label: s.label, note: s.note, status: s.status });
    setFormError(''); setEditTarget(s); setModal('edit');
  }

  async function handleSave() {
    setSaving(true); setFormError('');
    try {
      const body = { employeeId: Number(form.employeeId),
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        label: form.label, note: form.note, status: form.status, isRecurring: false };
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
  const weekLabel = `${week.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })} – ${weekEnd.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Turni</h1>
        <button onClick={openCreate} className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          + Nuovo turno
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button onClick={prevWeek} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">← Prec.</button>
        <span className="text-sm font-medium text-gray-700 min-w-[180px] text-center">{weekLabel}</span>
        <button onClick={nextWeek} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">Succ. →</button>
        <button onClick={() => setWeek(weekStart(new Date()))} className="ml-1 text-sm text-blue-600 hover:text-blue-800">Oggi</button>
      </div>

      {loading && <p className="text-sm text-gray-400">Caricamento...</p>}
      {error   && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Dipendente', 'Inizio', 'Fine', 'Etichetta', 'Stato', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shifts.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Nessun turno questa settimana.</td></tr>
              )}
              {shifts.map(s => {
                const fmtDT = (iso: string) => new Date(iso).toLocaleString('it-IT', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{s.employeeName}</td>
                    <td className="px-4 py-3 text-gray-600">{fmtDT(s.startTime)}</td>
                    <td className="px-4 py-3 text-gray-600">{fmtDT(s.endTime)}</td>
                    <td className="px-4 py-3 text-gray-600">{s.label || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[s.status] ?? 'bg-gray-100 text-gray-600'}`}>{s.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <button onClick={() => openEdit(s)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Modifica</button>
                      <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Elimina</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">{modal === 'create' ? 'Nuovo turno' : 'Modifica turno'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Dipendente</label>
                <select value={form.employeeId} onChange={e => set('employeeId', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Seleziona...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {(['startTime', 'endTime'] as const).map((k, i) => (
                  <div key={k}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{i === 0 ? 'Inizio' : 'Fine'}</label>
                    <input type="datetime-local" value={form[k]} onChange={e => set(k, e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Etichetta</label>
                <input value={form.label} onChange={e => set('label', e.target.value)} placeholder="es. Apertura"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Stato</label>
                <select value={form.status} onChange={e => set('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {STATUS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              {formError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>}
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="text-sm text-gray-600 px-4 py-2">Annulla</button>
              <button onClick={handleSave} disabled={saving}
                className="bg-blue-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving ? 'Salvataggio...' : 'Salva'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
