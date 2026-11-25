'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

/* ─────────────────────────── types ─────────────────────────── */
interface Shift {
  id: number; employeeId: number; employeeName: string;
  startTime: string; endTime: string; label: string; note: string; status: string;
}
interface Employee { id: number; firstName: string; lastName: string; }
interface Business { id: number; name: string; businessType: string; }
type EmpsResponse = Employee[] | { data: Employee[] };
type BizResponse  = Business[] | { data: Business[] };
interface ReportRow { empId: number; empName: string; count: number; totalMin: number; }

/* ─────────────────────────── constants ─────────────────────── */
const STATUS_OPTIONS = ['Scheduled', 'InProgress', 'Completed', 'Cancelled'];
const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  Scheduled:  { label: 'Programmato', cls: 'badge-primary' },
  InProgress: { label: 'In corso',    cls: 'badge-green'   },
  Completed:  { label: 'Completato',  cls: 'badge-muted'   },
  Cancelled:  { label: 'Annullato',   cls: 'badge-red'     },
};
const AVATAR_COLORS = [
  'oklch(0.6 0.13 25)', 'oklch(0.58 0.12 250)', 'oklch(0.6 0.13 320)',
  'oklch(0.55 0.11 150)', 'oklch(0.6 0.12 60)', 'oklch(0.52 0.12 180)',
];
const IT_DAYS      = ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'];
const IT_DAYS_FULL = ['Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'];
const emptyForm = { employeeId:'', businessId:'', startTime:'', endTime:'', label:'', note:'', status:'Scheduled' };

/* ─────────────────────────── pure helpers ───────────────────── */
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase();
}
function weekStart(d: Date) {
  const r = new Date(d);
  r.setDate(r.getDate() - ((r.getDay() + 6) % 7));
  r.setHours(0, 0, 0, 0);
  return r;
}
function toLocalDT(iso: string) {
  const d = new Date(iso), p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
function todayDT() {
  const d = new Date(), p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T08:00`;
}
function todayDate() {
  const d = new Date(), p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}
function firstOfMonth() {
  const d = new Date(), p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-01`;
}
function fmtDT(iso: string) {
  return new Date(iso).toLocaleString('it-IT', { weekday:'short', day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' });
}
function fmtHM(totalMin: number) {
  const h = Math.floor(totalMin / 60), m = totalMin % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/* ─────────────────── auto-status ───────────────────────────── */
function computeAutoStatus(s: Shift): string | null {
  if (s.status === 'Cancelled') return null;
  const now = new Date(), start = new Date(s.startTime), end = new Date(s.endTime);
  if (now >= start && now < end  && s.status !== 'InProgress') return 'InProgress';
  if (now >= end                 && s.status !== 'Completed')  return 'Completed';
  return null;
}
async function applyAutoStatus(
  currentShifts: Shift[],
  setter: (fn: (prev: Shift[]) => Shift[]) => void,
) {
  const toUpdate = currentShifts.filter(s => computeAutoStatus(s) !== null);
  if (!toUpdate.length) return;
  const updated: Shift[] = [];
  await Promise.all(toUpdate.map(async s => {
    const ns = computeAutoStatus(s)!;
    try {
      await api.put(`/api/shifts/${s.id}`, {
        employeeId: s.employeeId, startTime: s.startTime, endTime: s.endTime,
        label: s.label, note: s.note, status: ns, isRecurring: false,
      });
      updated.push({ ...s, status: ns });
    } catch { /* non-blocking */ }
  }));
  if (updated.length)
    setter(prev => prev.map(s => updated.find(u => u.id === s.id) ?? s));
}

/* ─────────────────── export helpers ────────────────────────── */
const PRINT_CSS = `
@page{size:A4 landscape;margin:14mm 12mm}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Hanken Grotesk',system-ui,sans-serif;font-size:12px;color:#2d1f10;
     -webkit-print-color-adjust:exact;print-color-adjust:exact}
h1,h2{font-family:'Bricolage Grotesque',system-ui,sans-serif;letter-spacing:-.02em}
@media print{.no-print{display:none!important}}
`;
const GOOGLE_FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">`;
const BRAND_MARK = `<div style="width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#3d7a5a,#295a40);display:flex;align-items:center;justify-content:center;flex-shrink:0">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="4" width="18" height="17" rx="3"/><path d="M3 9h18M8 2v4M16 2v4"/><path d="M8 14h3"/>
  </svg></div>`;
const PRINT_BTN = `<button class="no-print" onclick="window.print()" style="position:fixed;bottom:20px;right:20px;padding:10px 22px;background:#b35820;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 4px 14px rgba(180,90,30,.4)">Stampa / Salva PDF</button>`;

function scColor(status: string) {
  const m: Record<string, [string,string,string]> = {
    Scheduled:  ['#fdf2e8','#f0a868','#b35820'],
    InProgress: ['#e8f7ee','#5acc85','#1d7a42'],
    Completed:  ['#f3f3f3','#ccc',   '#666'  ],
    Cancelled:  ['#fef0ee','#e88a80','#cc3322'],
  };
  return m[status] ?? m['Scheduled'];
}

function exportDailyCalendar(day: Date, allShifts: Shift[]) {
  const dayShifts = allShifts
    .filter(s => sameDay(new Date(s.startTime), day))
    .sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime));

  const totalMin  = dayShifts.reduce((a, s) => a + Math.round((+new Date(s.endTime) - +new Date(s.startTime)) / 60000), 0);
  const uniqEmps  = new Set(dayShifts.map(s => s.employeeId)).size;
  const dayStr    = day.toLocaleDateString('it-IT', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });

  const cards = dayShifts.map(s => {
    const [bg, border, text] = scColor(s.status);
    const dMin = Math.round((+new Date(s.endTime) - +new Date(s.startTime)) / 60000);
    const dur  = dMin >= 60 ? `${Math.floor(dMin/60)}h${dMin%60 ? ` ${dMin%60}m` : ''}` : `${dMin}m`;
    return `
    <div style="display:grid;grid-template-columns:88px 1fr;border:1px solid ${border};border-radius:10px;overflow:hidden;background:#fff;margin-bottom:10px;box-shadow:0 1px 4px rgba(0,0,0,.07)">
      <div style="background:${bg};border-right:1px solid ${border};padding:14px 10px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:2px">
        <div style="font-size:17px;font-weight:800;color:${text}">${fmtTime(s.startTime)}</div>
        <div style="font-size:10px;color:${text};opacity:.6">▼</div>
        <div style="font-size:15px;font-weight:700;color:${text}">${fmtTime(s.endTime)}</div>
        <div style="font-size:10px;color:${text};opacity:.65;margin-top:3px">${dur}</div>
      </div>
      <div style="padding:13px 16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:7px">
          <div style="display:flex;align-items:center;gap:9px">
            <div style="width:28px;height:28px;border-radius:8px;background:#b35820;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;flex-shrink:0">${initials(s.employeeName)}</div>
            <span style="font-size:14px;font-weight:700;color:#1a1008">${s.employeeName}</span>
          </div>
          <span style="font-size:10px;font-weight:600;padding:3px 9px;border-radius:99px;background:${bg};color:${text};border:1px solid ${border}">${STATUS_MAP[s.status]?.label ?? s.status}</span>
        </div>
        ${s.label ? `<div style="font-size:12.5px;color:#555;margin-bottom:4px"><b style="color:#333">Etichetta:</b> ${s.label}</div>` : ''}
        ${s.note  ? `<div style="font-size:12px;color:#777;border-top:1px solid #f0ebe4;padding-top:6px;margin-top:6px;font-style:italic">${s.note}</div>` : ''}
      </div>
    </div>`;
  }).join('');

  const kpiItems: [string, string][] = [
    [`${dayShifts.length}`, 'Turni'],
    [`${uniqEmps}`,         'Dipendenti'],
    [fmtHM(totalMin),       'Ore totali'],
    ...(dayShifts.length ? [[`${fmtTime(dayShifts[0].startTime)} – ${fmtTime(dayShifts[dayShifts.length-1].endTime)}`, 'Copertura'] as [string,string]] : []),
  ];
  const statsBar = `
  <div style="display:flex;gap:20px;background:#fdf8f2;border:1px solid #e8dfd4;border-radius:10px;padding:10px 18px;margin-bottom:20px">
    ${kpiItems.map(([v,l]) => `<div style="display:flex;flex-direction:column;gap:2px"><div style="font-size:18px;font-weight:800;color:#b35820">${v}</div><div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.08em">${l}</div></div>`).join('')}
  </div>`;

  const html = `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><title>Calendario giornaliero · TurniUp</title>${GOOGLE_FONTS}
<style>${PRINT_CSS}
.header{display:flex;align-items:center;justify-content:space-between;padding-bottom:12px;border-bottom:2px solid #e8dfd4;margin-bottom:18px}
</style></head><body>
${PRINT_BTN}
<div class="header">
  <div style="display:flex;align-items:center;gap:9px">${BRAND_MARK}
    <div><div style="font-size:16px;font-weight:800;color:#1a1008">TurniUp</div><div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.1em">Calendario giornaliero</div></div>
  </div>
  <div style="text-align:right">
    <div style="font-size:15px;font-weight:700;color:#1a1008;text-transform:capitalize">${dayStr}</div>
    <div style="font-size:11px;color:#aaa;margin-top:2px">Generato il ${new Date().toLocaleString('it-IT')}</div>
  </div>
</div>
${statsBar}
${dayShifts.length === 0
  ? '<div style="text-align:center;padding:60px;color:#bbb;font-size:14px">Nessun turno programmato per questo giorno.</div>'
  : cards}
</body></html>`;

  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
}

function exportWeeklyCalendar(week: Date, shifts: Shift[]) {
  const weekEnd   = new Date(week.getTime() + 6 * 86400000);
  const weekLabel = `${week.toLocaleDateString('it-IT',{day:'2-digit',month:'long'})} – ${weekEnd.toLocaleDateString('it-IT',{day:'2-digit',month:'long',year:'numeric'})}`;
  const days      = Array.from({length:7}, (_, i) => new Date(week.getTime() + i * 86400000));
  const empNames  = Array.from(new Set(shifts.map(s => s.employeeName))).sort();
  const totalMin  = shifts.reduce((a, s) => a + Math.round((+new Date(s.endTime) - +new Date(s.startTime)) / 60000), 0);

  const TH = (content: string, extra = '') =>
    `<th style="padding:9px 8px;background:#fdf2e8;border:1px solid #e8dfd4;font-size:10.5px;font-weight:700;color:#b35820;letter-spacing:.04em;text-transform:uppercase;${extra}">${content}</th>`;

  const dayHeaders = days.map(d =>
    TH(`${IT_DAYS_FULL[d.getDay()]}<br><span style="font-size:14px;font-weight:800;color:#1a1008">${d.getDate()}</span>`, 'text-align:center;')
  ).join('');

  const rows = empNames.map(empName => {
    const cells = days.map(d => {
      const ds = shifts.filter(s => s.employeeName === empName && sameDay(new Date(s.startTime), d))
        .sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime));
      if (!ds.length) return `<td style="padding:8px;border:1px solid #e8dfd4;background:#fbfaf8;text-align:center;color:#ccc;font-size:11px">–</td>`;
      const items = ds.map(s => {
        const [bg, border, text] = scColor(s.status);
        return `<div style="background:${bg};border:1px solid ${border};border-radius:6px;padding:5px 7px;margin-bottom:4px">
          <div style="font-size:11px;font-weight:700;color:${text}">${fmtTime(s.startTime)} – ${fmtTime(s.endTime)}</div>
          ${s.label ? `<div style="font-size:10px;color:#666;margin-top:1px">${s.label}</div>` : ''}
        </div>`;
      }).join('');
      return `<td style="padding:8px;border:1px solid #e8dfd4;vertical-align:top;min-width:80px">${items}</td>`;
    }).join('');
    const empMin = shifts.filter(s => s.employeeName === empName)
      .reduce((a, s) => a + Math.round((+new Date(s.endTime) - +new Date(s.startTime)) / 60000), 0);
    return `<tr>
      <td style="padding:10px 12px;border:1px solid #e8dfd4;white-space:nowrap;font-weight:600;color:#1a1008;background:#fdfaf8">${empName}</td>
      ${cells}
      <td style="padding:10px 8px;border:1px solid #e8dfd4;text-align:center;background:#fdf8f2;font-weight:700;color:#b35820;white-space:nowrap">${fmtHM(empMin)}</td>
    </tr>`;
  }).join('');

  const dayTotals = days.map(d => {
    const ds    = shifts.filter(s => sameDay(new Date(s.startTime), d));
    const dMin  = ds.reduce((a, s) => a + Math.round((+new Date(s.endTime) - +new Date(s.startTime)) / 60000), 0);
    return `<td style="padding:10px 8px;border:1px solid #e8dfd4;text-align:center;background:#fdf2e8;font-size:11px"><b style="color:#1a1008">${ds.length}</b> turni<br><span style="color:#b35820;font-weight:600">${fmtHM(dMin)}</span></td>`;
  }).join('');

  const html = `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><title>Calendario settimanale · TurniUp</title>${GOOGLE_FONTS}
<style>${PRINT_CSS}
@page{size:A4 landscape;margin:12mm 10mm}
.header{display:flex;align-items:center;justify-content:space-between;padding-bottom:12px;border-bottom:2px solid #e8dfd4;margin-bottom:14px}
table{width:100%;border-collapse:collapse;font-size:11.5px}
</style></head><body>
${PRINT_BTN}
<div class="header">
  <div style="display:flex;align-items:center;gap:9px">${BRAND_MARK}
    <div><div style="font-size:16px;font-weight:800;color:#1a1008">TurniUp</div><div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.1em">Calendario settimanale</div></div>
  </div>
  <div style="text-align:right">
    <div style="font-size:15px;font-weight:700;color:#1a1008">${weekLabel}</div>
    <div style="font-size:11px;color:#aaa;margin-top:2px">${shifts.length} turni · ${fmtHM(totalMin)} · Generato il ${new Date().toLocaleString('it-IT')}</div>
  </div>
</div>
<table>
  <thead><tr>${TH('Dipendente','text-align:left;min-width:110px')}${dayHeaders}${TH('Totale','text-align:center;white-space:nowrap')}</tr></thead>
  <tbody>${rows || `<tr><td colspan="${days.length+2}" style="text-align:center;padding:40px;color:#aaa;border:1px solid #e8dfd4">Nessun turno questa settimana.</td></tr>`}</tbody>
  <tfoot><tr>
    <td style="padding:10px 12px;border:1px solid #e8dfd4;background:#fdf8f2;font-weight:700;color:#1a1008;font-size:11px">TOTALI</td>
    ${dayTotals}
    <td style="padding:10px 8px;border:1px solid #e8dfd4;text-align:center;background:#fdf2e8;font-weight:800;color:#b35820;white-space:nowrap">${fmtHM(totalMin)}</td>
  </tr></tfoot>
</table>
</body></html>`;

  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
}

function downloadReportCSV(rows: ReportRow[], from: string, to: string) {
  const header = 'Dipendente,Turni,Ore totali,Minuti totali,Media per turno\n';
  const body = rows.map(r => {
    const avgMin = r.count > 0 ? Math.round(r.totalMin / r.count) : 0;
    return `"${r.empName}",${r.count},${(r.totalMin/60).toFixed(2)},${r.totalMin},"${fmtHM(avgMin)}"`;
  }).join('\n');
  const blob = new Blob(['﻿' + header + body], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `turniup-ore-${from}-${to}.csv`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

/* ─────────────────────── component ─────────────────────────── */
export default function ShiftsPage() {
  const [shifts, setShifts]         = useState<Shift[]>([]);
  const [employees, setEmployees]   = useState<Employee[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [week, setWeek]             = useState<Date>(() => weekStart(new Date()));
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [modal, setModal]           = useState<null | 'create' | 'edit'>(null);
  const [editTarget, setEditTarget] = useState<Shift | null>(null);
  const [form, setForm]             = useState({ ...emptyForm });
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState('');
  const [showExport, setShowExport] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportFrom, setReportFrom] = useState(firstOfMonth);
  const [reportTo, setReportTo]     = useState(todayDate);
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError]     = useState('');

  /* auto-status: interval uses ref, plus explicit call after each load */
  const shiftsRef = useRef<Shift[]>([]);
  useEffect(() => { shiftsRef.current = shifts; }, [shifts]);
  useEffect(() => {
    const id = setInterval(() => applyAutoStatus(shiftsRef.current, setShifts), 60_000);
    return () => clearInterval(id);
  }, []);

  /* load shifts (+ employees + businesses once) */
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const from = week.toISOString();
      const to   = new Date(week.getTime() + 7 * 86400000).toISOString();
      const [result, emps, bizs] = await Promise.all([
        api.get<{ data: Shift[] }>(`/api/shifts?from=${from}&to=${to}&pageSize=200`),
        employees.length === 0 ? api.get<EmpsResponse>('/api/employees?pageSize=500') : Promise.resolve(null),
        businesses.length === 0 ? api.get<BizResponse>('/api/businesses?pageSize=200') : Promise.resolve(null),
      ]);
      const fresh = result?.data ?? [];
      setShifts(fresh);
      // apply auto-status immediately on fresh data
      applyAutoStatus(fresh, setShifts);
      if (emps !== null) {
        const list = Array.isArray(emps) ? emps : ((emps as { data?: Employee[] }).data ?? []);
        setEmployees(list);
      }
      if (bizs !== null) {
        const list = Array.isArray(bizs) ? bizs : ((bizs as { data?: Business[] }).data ?? []);
        setBusinesses(list);
      }
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Errore'); }
    finally { setLoading(false); }
  }, [week]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  /* close export dropdown on outside click */
  useEffect(() => {
    if (!showExport) return;
    const h = () => setShowExport(false);
    document.addEventListener('click', h, { once: true });
    return () => document.removeEventListener('click', h);
  }, [showExport]);

  /* report */
  async function loadReport() {
    if (!reportFrom || !reportTo) return;
    setReportLoading(true); setReportError('');
    try {
      const from = new Date(reportFrom).toISOString();
      const to   = new Date(reportTo + 'T23:59:59').toISOString();
      const res  = await api.get<{ data: Shift[] } | Shift[]>(`/api/shifts?from=${from}&to=${to}&pageSize=2000`);
      const raw  = Array.isArray(res) ? res : ((res as { data?: Shift[] }).data ?? []);
      const map  = new Map<number, ReportRow>();
      raw.forEach(s => {
        const min = Math.round((+new Date(s.endTime) - +new Date(s.startTime)) / 60000);
        if (!map.has(s.employeeId))
          map.set(s.employeeId, { empId: s.employeeId, empName: s.employeeName, count: 0, totalMin: 0 });
        const r = map.get(s.employeeId)!;
        r.count++;
        r.totalMin += Math.max(0, min);
      });
      setReportData(Array.from(map.values()).sort((a, b) => b.totalMin - a.totalMin));
    } catch (e: unknown) { setReportError(e instanceof Error ? e.message : 'Errore caricamento'); }
    finally { setReportLoading(false); }
  }

  /* shift form */
  function openCreate() {
    const s = todayDT();
    setForm({ ...emptyForm, startTime: s, endTime: s.slice(0, -5) + '16:00' });
    setFormError(''); setEditTarget(null); setModal('create');
  }
  function openEdit(s: Shift) {
    setForm({ employeeId: String(s.employeeId), businessId: String((s as Shift & { businessId?: number }).businessId ?? ''), startTime: toLocalDT(s.startTime), endTime: toLocalDT(s.endTime), label: s.label, note: s.note ?? '', status: s.status });
    setFormError(''); setEditTarget(s); setModal('edit');
  }
  async function handleSave() {
    setFormError('');
    // frontend validation
    if (!form.employeeId)  { setFormError('Seleziona un dipendente.');                          return; }
    if (!form.businessId)  { setFormError("Seleziona l'attività per questo turno.");             return; }
    if (!form.startTime)   { setFormError('Inserisci la data e l\'ora di inizio.');              return; }
    if (!form.endTime)     { setFormError('Inserisci la data e l\'ora di fine.');                return; }
    if (new Date(form.endTime) <= new Date(form.startTime))
                           { setFormError('La fine deve essere successiva all\'inizio.');        return; }
    setSaving(true);
    try {
      const body = {
        employeeId: Number(form.employeeId),
        businessId: Number(form.businessId),
        startTime:  new Date(form.startTime).toISOString(),
        endTime:    new Date(form.endTime).toISOString(),
        label: form.label, note: form.note, status: form.status, isRecurring: false,
      };
      if (modal === 'create') await api.post('/api/shifts', body);
      else if (editTarget)    await api.put(`/api/shifts/${editTarget.id}`, body);
      setModal(null); await load();
    } catch (e: unknown) { setFormError(e instanceof Error ? e.message : 'Errore durante il salvataggio.'); }
    finally { setSaving(false); }
  }
  async function handleDelete(id: number) {
    if (!confirm('Eliminare questo turno?')) return;
    // optimistic: remove immediately from UI
    setShifts(prev => prev.filter(s => s.id !== id));
    try { await api.delete(`/api/shifts/${id}`); }
    catch (e: unknown) {
      // rollback on error
      await load();
      alert(e instanceof Error ? e.message : 'Errore durante l\'eliminazione.');
    }
  }

  const set = <K extends keyof typeof form>(k: K, v: string) => setForm(f => ({ ...f, [k]: v }));
  const prevWeek = () => setWeek(d => new Date(d.getTime() - 7 * 86400000));
  const nextWeek = () => setWeek(d => new Date(d.getTime() + 7 * 86400000));
  const weekEnd        = new Date(week.getTime() + 6 * 86400000);
  const isCurrentWeek  = weekStart(new Date()).getTime() === week.getTime();
  const weekLabel      = `${week.toLocaleDateString('it-IT', { day:'2-digit', month:'short' })} – ${weekEnd.toLocaleDateString('it-IT', { day:'2-digit', month:'short', year:'numeric' })}`;
  const countByStatus  = STATUS_OPTIONS.reduce<Record<string, number>>((acc, s) => { acc[s] = shifts.filter(sh => sh.status === s).length; return acc; }, {});
  const weekDays       = Array.from({ length: 7 }, (_, i) => {
    const d        = new Date(week.getTime() + i * 86400000);
    const dayShifts = shifts.filter(s => sameDay(new Date(s.startTime), d));
    const isToday   = sameDay(d, new Date());
    return { d, dayShifts, isToday, pct: Math.min(100, dayShifts.length * 10) };
  });
  const reportTotal = reportData.reduce((acc, r) => ({ count: acc.count + r.count, min: acc.min + r.totalMin }), { count: 0, min: 0 });
  const todayEntry  = weekDays.find(d => d.isToday);

  /* ── render ── */
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

        {/* ── export dropdown ── */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-secondary"
            style={{ height: 40, gap: 7 }}
            onClick={e => { e.stopPropagation(); setShowExport(v => !v); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M12 3v13M8 13l4 4 4-4M4 20h16"/></svg>
            Esporta
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 13, height: 13 }}><path d="m6 9 6 6 6-6"/></svg>
          </button>

          {showExport && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 13, boxShadow: 'var(--shadow-lg)', zIndex: 60, minWidth: 220, overflow: 'hidden' }}>
              <div style={{ padding: '6px 6px' }}>
                {[
                  {
                    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>,
                    bg: 'var(--primary-soft)',
                    title: 'Calendario giornaliero',
                    sub: 'Vista dettagliata del giorno corrente',
                    onClick: () => { setShowExport(false); exportDailyCalendar(todayEntry?.d ?? week, shifts); },
                  },
                  {
                    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M8 13h8M8 17h5"/></svg>,
                    bg: 'var(--blue-soft)',
                    title: 'Calendario settimanale',
                    sub: 'Tutti i turni della settimana',
                    onClick: () => { setShowExport(false); exportWeeklyCalendar(week, shifts); },
                  },
                ].map(item => (
                  <button key={item.title} onClick={item.onClick}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 10px', borderRadius: 9, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <span style={{ width: 32, height: 32, borderRadius: 8, background: item.bg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{item.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{item.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--border)', padding: '6px 6px' }}>
                <button onClick={() => { setShowExport(false); setReportData([]); setReportError(''); setReportOpen(true); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 10px', borderRadius: 9, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--green-soft)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                  </span>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>Report ore dipendenti</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Riepilogo per intervallo di date + CSV</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        <button className="btn-primary" style={{ height: 40 }} onClick={openCreate}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Nuovo turno
        </button>
      </header>

      <main className="content">
        {/* week strip */}
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

        {/* summary */}
        <div className="filter-bar rise" style={{ animationDelay: '.2s' }}>
          <span className="badge badge-primary spacer">
            <span className="bdot" />
            {shifts.length} turni questa settimana
            {countByStatus['InProgress'] > 0 && ` · ${countByStatus['InProgress']} in corso`}
          </span>
        </div>

        {loading && <p style={{ color: 'var(--text-faint)', fontSize: 14, padding: '24px 0' }}>Caricamento…</p>}
        {error   && <p style={{ color: 'var(--red)',       fontSize: 14 }}>{error}</p>}

        {!loading && !error && (
          <div className="card tbl-wrap rise" style={{ animationDelay: '.26s' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Dipendente</th><th>Attività</th><th>Giorno</th><th>Orario</th>
                  <th>Etichetta</th><th>Stato</th><th className="r">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {shifts.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-faint)', padding: '48px 0' }}>Nessun turno questa settimana.</td></tr>
                )}
                {shifts.map(s => {
                  const st  = STATUS_MAP[s.status];
                  const biz = businesses.find(b => b.id === (s as Shift & { businessId?: number }).businessId);
                  return (
                    <tr key={s.id}>
                      <td>
                        <div className="cell-user">
                          <div className="avatar" style={{ background: avatarColor(s.employeeName) }}>{initials(s.employeeName)}</div>
                          <div><div className="nm">{s.employeeName}</div></div>
                        </div>
                      </td>
                      <td>
                        {biz
                          ? <span className="badge badge-muted"><span className="bdot" style={{ background: 'var(--primary)' }}/>{biz.name}</span>
                          : <span className="muted" style={{ fontSize: 13 }}>—</span>}
                      </td>
                      <td className="muted">{fmtDT(s.startTime)}</td>
                      <td className="mono">{fmtTime(s.startTime)}–{fmtTime(s.endTime)}</td>
                      <td>{s.label || '—'}</td>
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

      {/* ── modal: crea / modifica turno ── */}
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
                <div className="ff">
                  <label>Dipendente</label>
                  <div className="tu-select" style={{ width: '100%' }}>
                    <select className="input" value={form.employeeId} onChange={e => set('employeeId', e.target.value)} style={{ paddingRight: 34 }}>
                      <option value="">Seleziona…</option>
                      {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                    </select>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
                <div className="ff">
                  <label>Attività</label>
                  <div className="tu-select" style={{ width: '100%' }}>
                    <select className="input" value={form.businessId} onChange={e => set('businessId', e.target.value)} style={{ paddingRight: 34 }}>
                      <option value="">Seleziona…</option>
                      {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
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
              <button className="btn-primary" disabled={saving} onClick={handleSave}>
                {saving ? 'Salvataggio…' : modal === 'create' ? 'Crea turno' : 'Salva modifiche'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── modal: report ore ── */}
      {reportOpen && (
        <div className="modal-backdrop open" onClick={e => e.target === e.currentTarget && setReportOpen(false)}>
          <div className="modal" style={{ maxWidth: 660 }}>
            <div className="modal-head">
              <div className="mh-ico" style={{ background: 'var(--green-soft)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 20V10M12 20V4M6 20v-6"/>
                </svg>
              </div>
              <div>
                <div className="modal-title">Report ore dipendenti</div>
                <div className="modal-sub">Ore lavorate per dipendente in un intervallo di date</div>
              </div>
              <button className="modal-close" onClick={() => setReportOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
              </button>
            </div>
            <div className="modal-body">
              {/* date range + load */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'flex-end', marginBottom: 22 }}>
                <div className="ff" style={{ margin: 0 }}>
                  <label>Dal</label>
                  <input className="input" type="date" value={reportFrom} onChange={e => setReportFrom(e.target.value)} />
                </div>
                <div className="ff" style={{ margin: 0 }}>
                  <label>Al</label>
                  <input className="input" type="date" value={reportTo} onChange={e => setReportTo(e.target.value)} />
                </div>
                <button className="btn-primary" style={{ height: 40, whiteSpace: 'nowrap' }} onClick={loadReport} disabled={reportLoading}>
                  {reportLoading ? (
                    <>
                      <svg style={{ animation: 'spin 1s linear infinite', width: 15, height: 15 }} viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".25"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                      Caricamento…
                    </>
                  ) : 'Carica report'}
                </button>
              </div>

              {reportError && (
                <p style={{ color: 'var(--red)', background: 'var(--red-soft)', border: '1px solid var(--red)', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>{reportError}</p>
              )}

              {!reportLoading && reportData.length === 0 && !reportError && (
                <p style={{ textAlign: 'center', color: 'var(--text-faint)', fontSize: 14, padding: '28px 0' }}>
                  Seleziona un intervallo e clicca «Carica report».
                </p>
              )}

              {reportData.length > 0 && (
                <>
                  {/* kpi strip */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
                    {[
                      { v: reportData.length,           l: 'Dipendenti' },
                      { v: reportTotal.count,            l: 'Turni totali' },
                      { v: fmtHM(reportTotal.min),       l: 'Ore totali' },
                      { v: fmtHM(Math.round(reportTotal.min / Math.max(1, reportData.length))), l: 'Media/dipendente' },
                    ].map(({ v, l }) => (
                      <div key={l} style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '12px 16px' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--text)', lineHeight: 1 }}>{v}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{l}</div>
                      </div>
                    ))}
                  </div>

                  {/* table */}
                  <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th>Dipendente</th>
                          <th className="r">Turni</th>
                          <th className="r">Ore totali</th>
                          <th className="r">Media/turno</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.map(r => (
                          <tr key={r.empId}>
                            <td>
                              <div className="cell-user">
                                <div className="avatar" style={{ background: avatarColor(r.empName) }}>{initials(r.empName)}</div>
                                <div className="nm">{r.empName}</div>
                              </div>
                            </td>
                            <td className="r mono">{r.count}</td>
                            <td className="r mono" style={{ fontWeight: 600, color: 'var(--text)' }}>{fmtHM(r.totalMin)}</td>
                            <td className="r mono" style={{ color: 'var(--text-muted)' }}>{fmtHM(Math.round(r.totalMin / r.count))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
            <div className="modal-foot">
              <button className="btn-secondary" onClick={() => setReportOpen(false)}>Chiudi</button>
              {reportData.length > 0 && (
                <button className="btn-primary" onClick={() => downloadReportCSV(reportData, reportFrom, reportTo)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M12 3v13M8 13l4 4 4-4M4 20h16"/></svg>
                  Esporta CSV
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
