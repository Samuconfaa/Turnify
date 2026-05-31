'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface Business {
  id: number; name: string; businessType: string;
  address: string; phone: string; isActive: boolean;
}

const TYPES = ['Ristorante', 'Bar', 'Pizzeria', 'Negozio', 'Hotel', 'Parrucchiere', 'Altro'];
const TYPE_ICON: Record<string, string> = {
  Ristorante: '🍽', Bar: '☕', Pizzeria: '🍕', Negozio: '🛍', Hotel: '🏨', Parrucchiere: '💈', Altro: '🏢',
};

const empty = { name: '', businessType: 'Ristorante', address: '', phone: '', isActive: true };

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [modal, setModal]           = useState<null | 'create' | 'edit'>(null);
  const [editTarget, setEditTarget] = useState<Business | null>(null);
  const [form, setForm]             = useState({ ...empty });
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await api.get<Business[] | { data: Business[] }>('/api/businesses'); setBusinesses(Array.isArray(res) ? res : Array.isArray((res as { data?: Business[] })?.data) ? (res as { data: Business[] }).data : []); }
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

  const activeCount = businesses.filter(b => b.isActive).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Attività</h1>
          <p className="page-sub">{activeCount} attive su {businesses.length} totali</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          + Nuova attività
        </button>
      </div>

      {loading && <p className="text-sm text-slate-400 py-4">Caricamento…</p>}
      {error   && <p className="text-sm text-red-500 py-2">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {businesses.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <p className="text-slate-400 text-sm">Nessuna attività. Aggiungine una per iniziare.</p>
            </div>
          )}
          {businesses.map(b => (
            <div
              key={b.id}
              className="card p-5 hover:shadow-card-hover transition-shadow cursor-default"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
                    {TYPE_ICON[b.businessType] ?? '🏢'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{b.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{b.businessType}</p>
                  </div>
                </div>
                <span className={`badge border ${b.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                  {b.isActive ? 'Attiva' : 'Inattiva'}
                </span>
              </div>
              <div className="space-y-1.5 mb-4">
                {b.address && (
                  <p className="text-sm text-slate-500 flex items-center gap-1.5">
                    <span className="text-slate-400">📍</span> {b.address}
                  </p>
                )}
                {b.phone && (
                  <p className="text-sm text-slate-500 flex items-center gap-1.5">
                    <span className="text-slate-400">📞</span> {b.phone}
                  </p>
                )}
              </div>
              <button
                onClick={() => openEdit(b)}
                className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold transition-colors"
              >
                Modifica →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">
                {modal === 'create' ? 'Nuova attività' : 'Modifica attività'}
              </h2>
              <button onClick={() => setModal(null)} className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              {([
                { label: 'Nome', key: 'name' as const },
                { label: 'Indirizzo', key: 'address' as const },
                { label: 'Telefono', key: 'phone' as const },
              ] as const).map(f => (
                <div key={f.key}>
                  <label className="label">{f.label}</label>
                  <input
                    value={form[f.key] as string}
                    onChange={e => set(f.key, e.target.value)}
                    className="input"
                  />
                </div>
              ))}
              <div>
                <label className="label">Tipo</label>
                <select value={form.businessType} onChange={e => set('businessType', e.target.value)} className="input">
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              {modal === 'edit' && (
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox" checked={form.isActive}
                    onChange={e => set('isActive', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900">Attività attiva</span>
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
