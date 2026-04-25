'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface Employee {
  id: number; firstName: string; lastName: string; email: string;
  phone: string; role: string; contractType: string;
  weeklyHours: number; isActive: boolean; businessId?: number;
}
interface Business { id: number; name: string; }

const CONTRACT_TYPES = ['FullTime', 'PartTime', 'Apprenticeship', 'FixedTerm', 'OnCall'];
const empty = { firstName: '', lastName: '', email: '', phone: '', role: '',
  contractType: 'FullTime', weeklyHours: 40, businessId: '', password: '', isActive: true };

function Field({ label, value, onChange, type = 'text', placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  );
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<null | 'create' | 'edit'>(null);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [emps, bizs] = await Promise.all([
        api.get<Employee[]>('/api/employees'),
        api.get<Business[]>('/api/businesses'),
      ]);
      setEmployees(emps ?? []);
      setBusinesses(bizs ?? []);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Errore'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() { setForm({ ...empty }); setFormError(''); setEditTarget(null); setModal('create'); }
  function openEdit(emp: Employee) {
    setForm({ firstName: emp.firstName, lastName: emp.lastName, email: emp.email,
      phone: emp.phone, role: emp.role, contractType: emp.contractType,
      weeklyHours: emp.weeklyHours, businessId: String(emp.businessId ?? ''),
      password: '', isActive: emp.isActive });
    setFormError(''); setEditTarget(emp); setModal('edit');
  }

  async function handleSave() {
    setSaving(true); setFormError('');
    try {
      if (modal === 'create') {
        await api.post('/api/employees', {
          ...form, weeklyHours: Number(form.weeklyHours),
          businessId: form.businessId !== '' ? Number(form.businessId) : null,
        });
      } else if (editTarget) {
        await api.put(`/api/employees/${editTarget.id}`, {
          firstName: form.firstName, lastName: form.lastName, email: form.email,
          phone: form.phone, role: form.role, contractType: form.contractType,
          weeklyHours: Number(form.weeklyHours),
          businessId: form.businessId !== '' ? Number(form.businessId) : null,
          isActive: form.isActive,
        });
      }
      setModal(null); await load();
    } catch (e: unknown) { setFormError(e instanceof Error ? e.message : 'Errore'); }
    finally { setSaving(false); }
  }

  async function handleDelete(emp: Employee) {
    if (!confirm(`Disattivare ${emp.firstName} ${emp.lastName}?`)) return;
    try { await api.delete(`/api/employees/${emp.id}`); await load(); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : 'Errore'); }
  }

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dipendenti</h1>
        <button onClick={openCreate} className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          + Nuovo dipendente
        </button>
      </div>

      {loading && <p className="text-sm text-gray-400">Caricamento...</p>}
      {error   && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Nome', 'Email', 'Ruolo', 'Contratto', 'Ore/sett.', 'Stato', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Nessun dipendente.</td></tr>
              )}
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{emp.firstName} {emp.lastName}</td>
                  <td className="px-4 py-3 text-gray-600">{emp.email}</td>
                  <td className="px-4 py-3 text-gray-600">{emp.role || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{emp.contractType}</td>
                  <td className="px-4 py-3 text-gray-600">{emp.weeklyHours}h</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${emp.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {emp.isActive ? 'Attivo' : 'Inattivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button onClick={() => openEdit(emp)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Modifica</button>
                    {emp.isActive && <button onClick={() => handleDelete(emp)} className="text-red-500 hover:text-red-700 text-xs font-medium">Disattiva</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">{modal === 'create' ? 'Nuovo dipendente' : 'Modifica dipendente'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nome" value={form.firstName} onChange={v => set('firstName', v)} required />
                <Field label="Cognome" value={form.lastName} onChange={v => set('lastName', v)} required />
              </div>
              <Field label="Email" type="email" value={form.email} onChange={v => set('email', v)} required />
              <Field label="Telefono" value={form.phone} onChange={v => set('phone', v)} />
              <Field label="Ruolo" value={form.role} onChange={v => set('role', v)} placeholder="es. Cameriere" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tipo contratto</label>
                  <select value={form.contractType} onChange={e => set('contractType', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {CONTRACT_TYPES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <Field label="Ore/settimana" type="number" value={String(form.weeklyHours)} onChange={v => set('weeklyHours', Number(v) as unknown as string)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Attività</label>
                <select value={form.businessId} onChange={e => set('businessId', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Nessuna</option>
                  {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              {modal === 'create' && (
                <Field label="Password" type="password" value={form.password} onChange={v => set('password', v)} required />
              )}
              {modal === 'edit' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked as unknown as string)} className="rounded" />
                  <span className="text-sm text-gray-700">Dipendente attivo</span>
                </label>
              )}
              {formError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>}
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2">Annulla</button>
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
