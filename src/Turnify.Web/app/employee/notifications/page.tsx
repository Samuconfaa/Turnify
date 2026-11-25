'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

const NOTIF_ICON: Record<string, string> = {
  shift:    '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
  approval: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  rejected: '<path d="M18 6 6 18M6 6l12 12"/>',
  change:   '<path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-7 3.3M3 4v4h4"/>',
  default:  '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/>',
};
const NOTIF_TINT: Record<string, string> = {
  shift: 'tint-primary', approval: 'tint-green', rejected: 'tint-red', change: 'tint-amber', default: 'tint-primary',
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  const weeks = Math.floor(diff / 604800000);
  if (mins < 60)   return `${mins} min fa`;
  if (hours < 24)  return `${hours} ore fa`;
  if (days < 7)    return days === 1 ? 'Ieri' : `${days} giorni fa`;
  return weeks === 1 ? '1 settimana fa' : `${weeks} settimane fa`;
}

export default function EmployeeNotificationsPage() {
  const [notifs, setNotifs]   = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<'all' | 'unread'>('all');
  const [toast, setToast]     = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }

  useEffect(() => {
    api.get<{ data: Notification[] }>('/api/notifications')
      .then(r => setNotifs(r?.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function markAllRead() {
    try {
      await api.put('/api/notifications/read-all');
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
      showToast('Tutte segnate come lette');
    } catch { showToast('Errore'); }
  }

  const unreadCount = notifs.filter(n => !n.isRead).length;
  const filtered = filter === 'unread' ? notifs.filter(n => !n.isRead) : notifs;

  return (
    <>
      <header className="topbar">
        <div className="topbar-title">
          <span className="topbar-eyebrow">Aggiornamenti</span>
          <h1>Notifiche</h1>
        </div>
        <div className="topbar-spacer" />
        <div className="topbar-actions">
          <button className="btn btn-secondary btn-sm" onClick={markAllRead} disabled={unreadCount === 0}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 9.5 14.5 6 11"/><path d="M22 6l-8.5 8.5"/>
            </svg>
            Segna tutte come lette
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="content" style={{ maxWidth: 820 }}>
        <div className="chips" style={{ marginBottom: 16 }}>
          <button className={`chip${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>Tutte</button>
          <button className={`chip${filter === 'unread' ? ' active' : ''}`} onClick={() => setFilter('unread')}>
            Non lette <span style={{ fontFamily: 'var(--font-mono)', opacity: .7 }}>{unreadCount}</span>
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-faint)', fontSize: 14, padding: '24px 0' }}>Caricamento…</p>
        ) : (
          <div className="card">
            <div className="list">
              {filtered.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-faint)', padding: '24px 0', fontSize: 13 }}>
                  Nessuna notifica.
                </p>
              )}
              {filtered.map(n => {
                const icon = NOTIF_ICON[n.type] ?? NOTIF_ICON.default;
                const tint = NOTIF_TINT[n.type] ?? NOTIF_TINT.default;
                return (
                  <div key={n.id} className="list-row" style={{
                    alignItems: 'flex-start',
                    background: !n.isRead ? 'color-mix(in oklch, var(--blue-soft) 45%, var(--surface))' : undefined,
                    gap: 14, padding: '16px 20px',
                  }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: !n.isRead ? 'var(--blue)' : 'transparent',
                      flexShrink: 0, marginTop: 7,
                    }} />
                    <div className={`kpi-icon ${tint}`} style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
                        style={{ width: 19, height: 19 }}
                        dangerouslySetInnerHTML={{ __html: icon }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, lineHeight: 1.4 }}>
                      <div style={{ fontWeight: 600 }}>{n.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{n.body}</div>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {toast && (
        <div className="toast-wrap">
          <div className="toast show">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
              <path d="M20 6 9 17l-5-5"/>
            </svg>
            <span>{toast}</span>
          </div>
        </div>
      )}
    </>
  );
}
