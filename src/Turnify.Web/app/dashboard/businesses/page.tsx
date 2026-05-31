'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

interface Business {
  id: number; name: string; businessType: string;
  address: string; phone: string; isActive: boolean;
}

const TYPES = ['Ristorante', 'Bar', 'Pizzeria', 'Bistrot', 'Caffetteria', 'Negozio', 'Hotel', 'Parrucchiere', 'Altro'];

const BIZ_COLORS: Record<string, string> = {
  Ristorante: 'var(--primary)', Bar: 'var(--green)', Pizzeria: 'var(--amber)',
  Bistrot: 'oklch(0.58 0.12 250)', Caffetteria: 'oklch(0.55 0.1 195)',
  Negozio: 'oklch(0.55 0.13 305)', Hotel: 'oklch(0.52 0.1 195)',
  Parrucchiere: 'oklch(0.6 0.12 320)', Altro: 'var(--text-faint)',
};

const BIZ_ICONS: Record<string, string> = {
  Ristorante: '<path d="M5 3v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3M7 12v9M16 3c-1.5 0-2.5 2-2.5 5s1 4 2.5 4m0 0v9"/>',
  Bar:        '<path d="M5 3h14l-6 8v7M5 3l7 8M19 21H7"/>',
  default:    '<path d="M3 9.5 5 4h14l2 5.5M4 9.5h16V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5ZM9 21v-5h6v5"/>',
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
    try {
      const res = await api.get<Business[]>('/api/businesses');
      setBusinesses(Array.isArray(res) ? res : []);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Errore'); }
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
    <>
      <header className="topbar">
        <div>
          <h1 className="page-title">Attività</h1>
          <p className="page-sub">{activeCount} attive · gestisci sedi e orari</p>
        </div>
        <ThemeToggle />
        <button className="btn-primary" style={{ height: 40 }} onClick={openCreate}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Nuova attività
        </button>
      </header>

      <main className="content">
        {loading && <p style={{ color: 'var(--text-faint)', fontSize: 14, padding: '24px 0' }}>Caricamento…</p>}
        {error   && <p style={{ color: 'var(--red)', fontSize: 14 }}>{error}</p>}

        {!loading && !error && (
          <div className="biz-grid">
            {businesses.length === 0 && (
              <p style={{ color: 'var(--text-faint)', fontSize: 14, gridColumn: '1/-1', padding: '48px 0', textAlign: 'center' }}>
                Nessuna attività. Aggiungine una per iniziare.
              </p>
            )}
            {businesses.map((b, idx) => {
              const cov = BIZ_COLORS[b.businessType] ?? 'var(--primary)';
              const ico = BIZ_ICONS[b.businessType] ?? BIZ_ICONS.default;
              return (
                <div key={b.id} className="card biz-card rise" style={{ animationDelay: `${.05 + idx * .07}s` }}>
                  <div className="biz-cover" style={{ ['--cov' as string]: cov }}>
                    <div className="biz-ico">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                        dangerouslySetInnerHTML={{ __html: ico }} />
                    </div>
                    <span className={`biz-st badge ${b.isActive ? 'badge-green' : 'badge-muted'}`}>
                      <span className="bdot" />{b.isActive ? 'Aperta' : 'Chiusa'}
                    </span>
                  </div>
                  <div className="biz-body">
                    <div className="biz-name">{b.name}</div>
                    <div className="biz-type">{b.businessType}</div>
                    {b.address && (
                      <div className="biz-addr">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>
                        </svg>
                        {b.address}
                      </div>
                    )}
                  </div>
                  <div className="biz-foot">
                    <button className="btn-secondary" style={{ flex: 1, padding: 8 }} onClick={() => openEdit(b)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4L18.5 9.5a2 2 0 0 0-2.8-2.8L5 17.2V20Z"/><path d="M14 7l3 3"/></svg>
                      Modifica
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {modal && (
        <div className="modal-backdrop open" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-head">
              <div className="mh-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9.5 5 4h14l2 5.5M4 9.5h16V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5ZM9 21v-5h6v5"/>
                </svg>
              </div>
              <div>
                <div className="modal-title">{modal === 'create' ? 'Nuova attività' : 'Modifica attività'}</div>
                <div className="modal-sub">Aggiungi o aggiorna una sede</div>
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="ff full"><label>Nome attività</label><input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Es. Ristorante Centro" /></div>
                <div className="ff">
                  <label>Tipo</label>
                  <div className="tu-select" style={{ width: '100%' }}>
                    <select className="input" value={form.businessType} onChange={e => set('businessType', e.target.value)} style={{ paddingRight: 34 }}>
                      {TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="ff"><label>Telefono</label><input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+39 02 1234567" /></div>
                <div className="ff full"><label>Indirizzo</label><input className="input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Via Roma 12, Milano" /></div>
                {modal === 'edit' && (
                  <div className="ff full">
                    <div className="switch-row">
                      <div className="sr-txt"><b>Attività attiva</b><span>Visibile ai dipendenti nell&apos;app</span></div>
                      <label className="switch">
                        <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
                        <span className="tr" />
                      </label>
                    </div>
                  </div>
                )}
              </div>
              {formError && <p style={{ marginTop: 14, color: 'var(--red)', background: 'var(--red-soft)', border: '1px solid var(--red)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>{formError}</p>}
            </div>
            <div className="modal-foot">
              <button className="btn-secondary" onClick={() => setModal(null)}>Annulla</button>
              <button className="btn-primary" disabled={saving} onClick={handleSave}>{saving ? 'Salvataggio…' : 'Crea attività'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
