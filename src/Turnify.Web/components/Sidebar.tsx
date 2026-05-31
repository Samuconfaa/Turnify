'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { logout, getEmail, getRole } from '@/lib/auth';

const OWNER_EMAIL = 'samuconfa08@gmail.com';

const NAV_GENERAL = [
  {
    key: 'dashboard', label: 'Dashboard', href: '/dashboard',
    icon: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  },
  {
    key: 'employees', label: 'Dipendenti', href: '/dashboard/employees',
    icon: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.2a3 3 0 0 1 0 5.6M18 19a5 5 0 0 0-3-4.6"/>',
  },
  {
    key: 'businesses', label: 'Attività', href: '/dashboard/businesses',
    icon: '<path d="M3 9.5 5 4h14l2 5.5M4 9.5h16V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5ZM9 21v-5h6v5"/>',
  },
  {
    key: 'shifts', label: 'Turni', href: '/dashboard/shifts',
    icon: '<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4M7.5 13h3M7.5 16.5h6"/>',
  },
  {
    key: 'vacations', label: 'Ferie e permessi', href: '/dashboard/vacations',
    icon: '<path d="M3 18s2-7 9-7 9 7 9 7M12 11V3M12 3l3 2.5M12 3 9 5.5"/>',
  },
];

const NAV_SYSTEM = [
  {
    key: 'errors', label: 'Log errori', href: '/dashboard/error-logs',
    icon: '<path d="M10.5 3h3l.6 2.5 2.2 1.3 2.4-.8 1.5 2.6-1.8 1.7v2.4l1.8 1.7-1.5 2.6-2.4-.8-2.2 1.3L13.5 21h-3l-.6-2.5-2.2-1.3-2.4.8L1.8 15.4l1.8-1.7v-2.4L1.8 9.6l1.5-2.6 2.4.8 2.2-1.3L10.5 3Z"/><circle cx="12" cy="12" r="2.6"/>',
    ownerOnly: true,
  },
];

function NavIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: d }} />
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    setEmail(getEmail());
    setRole(getRole());
  }, []);

  const isOwner = email.toLowerCase() === OWNER_EMAIL.toLowerCase();
  const initial = email ? (email[0] + (email.split('.')[1]?.[0] ?? '')).toUpperCase() : '??';

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="brand">
        <div className="brand-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v3M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10ZM12 12l2.5 1.5"/>
          </svg>
        </div>
        <div>
          <div className="brand-name">TurniUp</div>
          <div className="brand-sub">Gestione turni</div>
        </div>
      </div>

      {/* Nav generale */}
      <div className="nav-label">Generale</div>
      <nav className="nav">
        {NAV_GENERAL.map(item => (
          <Link
            key={item.key}
            href={item.href}
            className={`nav-item${isActive(item.href) ? ' active' : ''}`}
          >
            <NavIcon d={item.icon} />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Nav sistema (owner only) */}
      {isOwner && (
        <>
          <div className="nav-sep" />
          <div className="nav-label">Sistema</div>
          <nav className="nav">
            {NAV_SYSTEM.map(item => (
              <Link
                key={item.key}
                href={item.href}
                className={`nav-item${isActive(item.href) ? ' active' : ''}`}
              >
                <NavIcon d={item.icon} />
                {item.label}
              </Link>
            ))}
          </nav>
        </>
      )}

      {/* Footer utente */}
      <div className="side-foot">
        <div className="user-chip">
          <div
            className="avatar"
            style={{ background: 'linear-gradient(135deg,var(--primary),oklch(0.72 0.15 65))' }}
          >
            {initial}
          </div>
          <div>
            <div className="nm">{email || '—'}</div>
            <div className="rl">{isOwner ? 'Owner' : role || 'Datore di lavoro'}</div>
          </div>
          <button
            onClick={logout}
            title="Esci"
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--side-muted)', display: 'grid', placeItems: 'center' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, strokeWidth: 2 }}>
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
