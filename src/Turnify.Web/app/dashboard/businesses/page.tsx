'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface Business {
  id: number; name: string; businessType: string;
  address: string; phone: string; isActive: boolean;
}

const TYPES = ['Ristorante', 'Bar', 'Pizzeria', 'Negozio', 'Hotel', 'Parrucchiere', 'Altro'];
const empty = { name: '', businessType: 'Ristorante', address: '', phone: '', isActive: true };

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<null | 'create' | 'edit'>(null);
  const [editTarget, setEditTarget] = useState<Business | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setBusinesses(await api.get<Business[]>('/api/businesses') ?? []); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Errore'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() { setForm({ ...empty }); setFormError(''); setEditTarget(null); setModal('create'); }
  function openEdit(b: Business) {
    setForm({ name: b.name, businessType: b.businessType, address: b.address, phone: b.phone, isActive: b.isActive });
    setFormError(''); setEditTarget(b); setModal('edit');
  }

  async function handleSave() {
    setSaving(true); setFormError('');
    try {
      if (modal === 'create') await api.post('/api/businesses', form);
      else if (editTarget) await api.put(`/api/businesses/${editTarget.id}`, form);
      setModal(null); await load();
    } catch (e: unknown) { setFormError(e instanceof Error ? e.message : 'Errore'); }
    finally { setSaving(false); }
  }

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Attività</h1>
        <button onClick={openCreate} className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          + Nuova attività
        </button>
      </div>

      {loading && <p className="text-sm text-gray-400">Caricamento...</p>}
      {error   && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {businesses.length === 0 && <p className="text-gray-400 text-sm">Nessuna attività.</p>}
          {businesses.map(b => (
            <div key={b.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{b.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{b.businessType}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {b.isActive ? 'Attiva' : 'Inattiva'}
                </span>
              </div>
              {b.address && <p className="text-sm text-gray-600 mb-1">📍 {b.address}</p>}
              {b.phone   && <p className="text-sm text-gray-600 mb-3">📞 {b.phone}</p>}
              <button onClick={() => openEdit(b)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Modifica →</button>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">{modal === 'create' ? 'Nuova attività' : 'Modifica attività'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Nome', key: 'name' as const },
                { label: 'Indirizzo', key: 'address' as const },
                { label: 'Telefono', key: 'phone' as const },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{f.label}</label>
                  <input value={form[f.key] as string} onChange={e => set(f.key, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                <select value={form.businessType} onChange={e => set('businessType', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              {modal === 'edit' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="rounded" />
                  <span className="text-sm text-gray-700">Attività attiva</span>
                </label>
              )}
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
