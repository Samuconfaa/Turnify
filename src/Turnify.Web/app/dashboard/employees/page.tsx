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
const CONTRACT_LABEL: Record<string, string> = {
  FullTime:       'Tempo pieno',
  PartTime:       'Part-time',
  Apprenticeship: 'Apprendistato',
  FixedTerm:      'Tempo determinato',
  OnCall:         'A chiamata',
};

const emptyForm = {
  firstName: '', lastName: '', email: '', phone: '', role: '',
  contractType: 'FullTime', weeklyHours: 40, businessId: '', password: '', isActive: true,
};

function Field({ label, value, onChange, type = 'text', placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        className="input"
      />
    </div>
  );
}

export default function EmployeesPage() {
  const [employees, setEmployees]   = useState<Employee[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [modal, setModal]           = useState<null | 'create' | 'edit'>(null);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [form, setForm]             = useState({ ...emptyForm });
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState('');
  const [search, setSearch]         = useState('');
  const [filterContract, setFilterContract] = useState('');
  const [filterStatus, setFilterStatus]     = useState<'all' | 'active' | 'inactive'>('active');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [emps, bizs] = await Promise.all([
        api.get<Employee[]>('/api/employees'),
        api.get<Business[]>('/api/businesses'),
      ]);
      setEmployees(Array.isArray(emps) ? emps : []);
      setBusinesses(Array.isArray(bizs) ? bizs : []);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Errore'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() { setForm({ ...emptyForm }); setFormError(''); setEditTarget(null); setModal('create'); }
  function openEdit(emp: Employee) {
    setForm({
      firstName: emp.firstName, lastName: emp.lastName, email: emp.email,
      phone: emp.phone, role: emp.role, contractType: emp.contractType,
      weeklyHours: emp.weeklyHours, businessId: String(emp.businessId ?? ''),
      password: '', isActive: emp.isActive,
    });
    setFormError(''); setEditTarget(emp); setModal('edit');
  }

  async function handleSave() {
    setSaving(true); setFormError('');
    try {
      if (modal === 'create') {
        await api.post('/api/employees', {
          ...form,
          weeklyHours: Number(form.weeklyHours),
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

  const visible = employees.filter(emp => {
    const q = search.toLowerCase();
    const matchSearch = !q || [emp.firstName, emp.lastName, emp.email, emp.role]
      .some(s => s.toLowerCase().includes(q));
    const matchContract = !filterContract || emp.contractType === filterContract;
    const matchStatus =
      filterStatus === 'all'    ? true :
      filterStatus === 'active' ? emp.isActive : !emp.isActive;
    return matchSearch && matchContract && matchStatus;
  });

  const activeCount   = employees.filter(e => e.isActive).length;
  const inactiveCount = employees.filter(e => !e.isActive).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Dipendenti</h1>
          <p className="page-sub">{activeCount} attivi · {inactiveCount} inattivi</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          + Nuovo dipendente
        </button>
      </div>

      {/* Filtri */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="search"
          placeholder="Cerca per nome, email, ruolo…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 bg-white"
        />
        <select
          value={filterContract}
          onChange={e => setFilterContract(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-700"
        >
          <option value="">Tutti i contratti</option>
          {CONTRACT_TYPES.map(c => <option key={c} value={c}>{CONTRACT_LABEL[c]}</option>)}
        </select>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm bg-white">
          {(['active', 'inactive', 'all'] as const).map((s, i) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 transition-colors ${i > 0 ? 'border-l border-slate-200' : ''} ${
                filterStatus === s ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s === 'active' ? 'Attivi' : s === 'inactive' ? 'Inattivi' : 'Tutti'}
            </button>
          ))}
        </div>
        {(search || filterContract || filterStatus !== 'active') && (
          <button
            onClick={() => { setSearch(''); setFilterContract(''); setFilterStatus('active'); }}
            className="text-sm text-slate-400 hover:text-slate-600 px-2 transition-colors"
          >
            Reimposta
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
                {['Nome', 'Email', 'Telefono', 'Ruolo', 'Contratto', 'Ore/sett.', 'Stato', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400 text-sm">
                    {employees.length === 0 ? 'Nessun dipendente.' : 'Nessun risultato per i filtri applicati.'}
                  </td>
                </tr>
              )}
              {visible.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>
                      {emp.firstName} {emp.lastName}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{emp.email}</td>
                  <td className="px-4 py-3 text-slate-500">{emp.phone || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{emp.role || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{CONTRACT_LABEL[emp.contractType] ?? emp.contractType}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">{emp.weeklyHours}h</td>
                  <td className="px-4 py-3">
                    <span className={`badge border ${emp.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {emp.isActive ? 'Attivo' : 'Inattivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button onClick={() => openEdit(emp)} className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold transition-colors">
                      Modifica
                    </button>
                    {emp.isActive && (
                      <button onClick={() => handleDelete(emp)} className="text-red-500 hover:text-red-700 text-xs font-semibold transition-colors">
                        Disattiva
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 text-base">
                {modal === 'create' ? 'Nuovo dipendente' : 'Modifica dipendente'}
              </h2>
              <button onClick={() => setModal(null)} className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nome"    value={form.firstName} onChange={v => set('firstName', v)} required />
                <Field label="Cognome" value={form.lastName}  onChange={v => set('lastName', v)}  required />
              </div>
              <Field label="Email" type="email" value={form.email} onChange={v => set('email', v)} required />
              <Field label="Telefono" value={form.phone} onChange={v => set('phone', v)} placeholder="es. +39 333 1234567" />
              <Field label="Ruolo lavorativo" value={form.role} onChange={v => set('role', v)} placeholder="es. Cameriere" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Tipo contratto</label>
                  <select
                    value={form.contractType}
                    onChange={e => set('contractType', e.target.value)}
                    className="input"
                  >
                    {CONTRACT_TYPES.map(c => <option key={c} value={c}>{CONTRACT_LABEL[c]}</option>)}
                  </select>
                </div>
                <Field label="Ore/settimana" type="number" value={String(form.weeklyHours)} onChange={v => set('weeklyHours', Number(v))} />
              </div>
              <div>
                <label className="label">Attività</label>
                <select
                  value={form.businessId}
                  onChange={e => set('businessId', e.target.value)}
                  className="input"
                >
                  <option value="">Nessuna</option>
                  {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              {modal === 'create' && (
                <Field label="Password" type="password" value={form.password} onChange={v => set('password', v)} required />
              )}
              {modal === 'edit' && (
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox" checked={form.isActive}
                    onChange={e => set('isActive', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900">Dipendente attivo</span>
                </label>
              )}
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
