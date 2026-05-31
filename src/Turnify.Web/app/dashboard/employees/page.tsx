'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

interface Employee {
  id: number; firstName: string; lastName: string; email: string;
  phone: string; role: string; contractType: string;
  weeklyHours: number; isActive: boolean; businessId?: number;
}
interface Business { id: number; name: string; }

const CONTRACT_TYPES = ['FullTime', 'PartTime', 'Apprenticeship', 'FixedTerm', 'OnCall'];
const CONTRACT_LABEL: Record<string, string> = {
  FullTime: 'Tempo pieno', PartTime: 'Part-time',
  Apprenticeship: 'Apprendistato', FixedTerm: 'Tempo determinato', OnCall: 'A chiamata',
};

const AVATAR_COLORS = [
  'oklch(0.6 0.13 25)', 'oklch(0.58 0.12 250)', 'oklch(0.6 0.13 320)',
  'oklch(0.55 0.11 150)', 'oklch(0.6 0.12 60)', 'oklch(0.52 0.12 180)',
  'oklch(0.55 0.13 290)', 'oklch(0.6 0.12 100)',
];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function initials(f: string, l: string) { return (f[0] ?? '') + (l[0] ?? ''); }

const emptyForm = {
  firstName: '', lastName: '', email: '', phone: '', role: '',
  contractType: 'FullTime', weeklyHours: 40, businessId: '', password: '', isActive: true,
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [modal, setModal]         = useState<null | 'create' | 'edit'>(null);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [form, setForm]           = useState({ ...emptyForm });
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState('');
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('active');

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

  const visible = employees.filter(emp => {
    const q = search.toLowerCase();
    const matchSearch = !q || [emp.firstName, emp.lastName, emp.email, emp.role]
      .some(s => s?.toLowerCase().includes(q));
    const matchStatus =
      filterStatus === 'all' ? true :
      filterStatus === 'active' ? emp.isActive : !emp.isActive;
    return matchSearch && matchStatus;
  });

  const total   = employees.length;
  const active  = employees.filter(e => e.isActive).length;
  const inactive = employees.filter(e => !e.isActive).length;

  const statuses: Array<{ key: 'all' | 'active' | 'inactive'; label: string; count: number }> = [
    { key: 'all', label: 'Tutti', count: total },
    { key: 'active', label: 'Attivi', count: active },
    { key: 'inactive', label: 'Inattivi', count: inactive },
  ];

  return (
    <>
      <header className="topbar">
        <div>
          <h1 className="page-title">Dipendenti</h1>
          <p className="page-sub">{active} attivi · {inactive} inattivi · {businesses.length} attività</p>
        </div>
        <label className="search grow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>
          </svg>
          <input
            placeholder="Cerca per nome, email, ruolo…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </label>
        <ThemeToggle />
        <button className="btn-primary" style={{ height: 40 }} onClick={openCreate}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Nuovo dipendente
        </button>
      </header>

      <main className="content">
        {/* Stat strip */}
        <section className="stat-strip rise" style={{ animationDelay: '.04s' }}>
          {[
            { label: 'Totale dipendenti', count: total, color: 'var(--text-faint)' },
            { label: 'Attivi', count: active, color: 'var(--green)' },
            { label: 'Inattivi', count: inactive, color: 'var(--red)' },
          ].map(s => (
            <div key={s.label} className="card stat">
              <div className="v">{s.count}</div>
              <div className="k"><span className="pip" style={{ background: s.color }} />{s.label}</div>
            </div>
          ))}
          <div className="card stat">
            <div className="v">{businesses.length}</div>
            <div className="k"><span className="pip" style={{ background: 'var(--primary)' }} />Attività</div>
          </div>
        </section>

        {/* Filter bar */}
        <div className="filter-bar rise" style={{ animationDelay: '.12s' }}>
          <div className="segmented">
            {statuses.map(s => (
              <button
                key={s.key}
                className={filterStatus === s.key ? 'on' : ''}
                onClick={() => setFilterStatus(s.key)}
              >
                {s.label} <span className="cnt">{s.count}</span>
              </button>
            ))}
          </div>
          {(search || filterStatus !== 'active') && (
            <button className="btn-ghost" onClick={() => { setSearch(''); setFilterStatus('active'); }}>
              Reimposta
            </button>
          )}
        </div>

        {loading && <p style={{ color: 'var(--text-faint)', fontSize: 14, padding: '24px 0' }}>Caricamento…</p>}
        {error   && <p style={{ color: 'var(--red)', fontSize: 14 }}>{error}</p>}

        {!loading && !error && (
          <div className="card tbl-wrap rise" style={{ animationDelay: '.2s' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Dipendente</th>
                  <th>Ruolo</th>
                  <th>Contratto</th>
                  <th>Attività</th>
                  <th>Stato</th>
                  <th className="r">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-faint)', padding: '48px 0' }}>
                      {employees.length === 0 ? 'Nessun dipendente.' : 'Nessun risultato.'}
                    </td>
                  </tr>
                )}
                {visible.map(emp => {
                  const biz = businesses.find(b => b.id === emp.businessId);
                  return (
                    <tr key={emp.id}>
                      <td>
                        <div className="cell-user">
                          <div className="avatar" style={{ background: avatarColor(`${emp.firstName} ${emp.lastName}`) }}>
                            {initials(emp.firstName, emp.lastName)}
                          </div>
                          <div>
                            <div className="nm">{emp.firstName} {emp.lastName}</div>
                            <div className="em">{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{emp.role || '—'}</td>
                      <td><span className="badge badge-muted">{CONTRACT_LABEL[emp.contractType] ?? emp.contractType}</span></td>
                      <td>
                        {biz ? (
                          <span className="dot-pip">
                            <span className="pip" style={{ background: 'var(--primary)' }} />
                            {biz.name}
                          </span>
                        ) : '—'}
                      </td>
                      <td>
                        <span className={`badge ${emp.isActive ? 'badge-green' : 'badge-muted'}`}>
                          <span className="bdot" />
                          {emp.isActive ? 'Attivo' : 'Inattivo'}
                        </span>
                      </td>
                      <td className="r">
                        <div className="row-actions">
                          <button className="icon-btn sm" title="Modifica" onClick={() => openEdit(emp)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 20h4L18.5 9.5a2 2 0 0 0-2.8-2.8L5 17.2V20Z"/><path d="M14 7l3 3"/>
                            </svg>
                          </button>
                          {emp.isActive && (
                            <button className="icon-btn sm" title="Disattiva" onClick={() => handleDelete(emp)}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {visible.length > 0 && (
              <div className="pager">
                <span>1–{visible.length} di {visible.length} dipendenti</span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal */}
      {modal && (
        <div className={`modal-backdrop open`} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-head">
              <div className="mh-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M19 8v6M22 11h-6"/>
                </svg>
              </div>
              <div>
                <div className="modal-title">{modal === 'create' ? 'Nuovo dipendente' : 'Modifica dipendente'}</div>
                <div className="modal-sub">Compila i dati del membro del team</div>
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 6l12 12M18 6 6 18"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                {[
                  { label: 'Nome', k: 'firstName' as const, placeholder: 'Es. Giulia' },
                  { label: 'Cognome', k: 'lastName' as const, placeholder: 'Es. Ferrari' },
                ].map(f => (
                  <div key={f.k} className="ff">
                    <label>{f.label}</label>
                    <input className="input" value={form[f.k] as string} onChange={e => set(f.k, e.target.value)} placeholder={f.placeholder} />
                  </div>
                ))}
                <div className="ff full">
                  <label>Email</label>
                  <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="nome@turniup.it" />
                </div>
                <div className="ff">
                  <label>Telefono</label>
                  <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+39 333 1234567" />
                </div>
                <div className="ff">
                  <label>Ruolo</label>
                  <input className="input" value={form.role} onChange={e => set('role', e.target.value)} placeholder="Es. Cameriere" />
                </div>
                <div className="ff">
                  <label>Contratto</label>
                  <div className="tu-select" style={{ width: '100%' }}>
                    <select className="input" value={form.contractType} onChange={e => set('contractType', e.target.value)} style={{ paddingRight: 34 }}>
                      {CONTRACT_TYPES.map(c => <option key={c} value={c}>{CONTRACT_LABEL[c]}</option>)}
                    </select>
                  </div>
                </div>
                <div className="ff">
                  <label>Ore/settimana</label>
                  <input className="input" type="number" value={form.weeklyHours} onChange={e => set('weeklyHours', Number(e.target.value))} min={0} max={60} />
                </div>
                <div className="ff">
                  <label>Attività</label>
                  <div className="tu-select" style={{ width: '100%' }}>
                    <select className="input" value={form.businessId} onChange={e => set('businessId', e.target.value)} style={{ paddingRight: 34 }}>
                      <option value="">Nessuna</option>
                      {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>
                {modal === 'create' && (
                  <div className="ff">
                    <label>Password</label>
                    <input className="input" type="password" value={form.password} onChange={e => set('password', e.target.value)} />
                  </div>
                )}
                {modal === 'edit' && (
                  <div className="ff full">
                    <div className="switch-row">
                      <div className="sr-txt">
                        <b>Dipendente attivo</b>
                        <span>Il dipendente può accedere all&apos;app</span>
                      </div>
                      <label className="switch">
                        <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
                        <span className="tr" />
                      </label>
                    </div>
                  </div>
                )}
              </div>
              {formError && (
                <p style={{ marginTop: 14, color: 'var(--red)', background: 'var(--red-soft)', border: '1px solid var(--red)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>{formError}</p>
              )}
            </div>

            <div className="modal-foot">
              <button className="btn-secondary" onClick={() => setModal(null)}>Annulla</button>
              <button className="btn-primary" disabled={saving} onClick={handleSave}>
                {saving ? 'Salvataggio…' : modal === 'create' ? 'Salva dipendente' : 'Salva modifiche'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
