'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getEmail } from '@/lib/auth';
import { deleteCookie } from '@/lib/api';

const NAV = [
  {
    key: 'dashboard', label: 'Dashboard', href: '/employee',
    icon: '<path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z"/>',
  },
  {
    key: 'turni', label: 'I miei turni', href: '/employee/shifts',
    icon: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
  },
  {
    key: 'timbratura', label: 'Timbratura', href: '/employee/attendance',
    icon: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  },
  {
    key: 'ferie', label: 'Ferie & permessi', href: '/employee/vacations',
    icon: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  },
  {
    key: 'disponibilita', label: 'Disponibilità', href: '/employee/availability',
    icon: '<path d="M4 6h12M4 12h16M4 18h9"/><circle cx="18" cy="6" r="2.4"/><circle cx="9" cy="18" r="2.4"/>',
  },
  {
    key: 'notifiche', label: 'Notifiche', href: '/employee/notifications', dot: true,
    icon: '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  },
  {
    key: 'profilo', label: 'Profilo', href: '/employee/profile',
    icon: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  },
];

function NavIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: d }} />
  );
}

export default function EmployeeSidebar() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');

  useEffect(() => {
    setEmail(getEmail());
  }, []);

  function handleLogout() {
    deleteCookie('access_token');
    deleteCookie('refresh_token');
    try { localStorage.clear(); } catch { }
    window.location.href = '/login';
  }

  const initials = email
    ? (email[0] + (email.split('@')[0].split('.')[1]?.[0] ?? '')).toUpperCase()
    : '??';

  function isActive(href: string) {
    if (href === '/employee') return pathname === '/employee';
    return pathname.startsWith(href);
  }

  const NAV_MOBILE = NAV.filter(n => ['turni','timbratura','ferie','disponibilita','profilo'].includes(n.key));

  return (
    <>
      <aside className="sidebar">
        <div className="sb-head">
          <img className="sb-logo" src="/splash.png" alt="TurniUp" />
          <div className="sb-brand">
            <span className="sb-brand-name">TurniUp</span>
            <span className="sb-chip" data-role="employee">Dipendente</span>
          </div>
        </div>

        <nav className="sb-nav">
          <div className="sb-section-label">Area personale</div>
          {NAV.map(item => (
            <Link key={item.key} href={item.href} className={`sb-item${isActive(item.href) ? ' active' : ''}`}>
              <NavIcon d={item.icon} />
              <span>{item.label}</span>
              {item.dot && <span className="sb-dot" />}
            </Link>
          ))}
        </nav>

        <div className="sb-foot">
          <div className="sb-avatar">{initials}</div>
          <div className="sb-user">
            <div className="sb-user-name">{email || '—'}</div>
            <div className="sb-user-role">Dipendente</div>
          </div>
        </div>
      </aside>

      {/* ── Logout button (fixed top-right) ── */}
      <button className="topbar-logout" onClick={handleLogout} title="Esci">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
        </svg>
        <span>Esci</span>
      </button>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        {NAV_MOBILE.map(item => (
          <Link key={item.key} href={item.href} className={`mobile-nav-item${isActive(item.href) ? ' active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
              dangerouslySetInnerHTML={{ __html: item.icon }} />
            <span>{item.label === 'Ferie & permessi' ? 'Ferie' : item.label === 'Disponibilità' ? 'Disponib.' : item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
