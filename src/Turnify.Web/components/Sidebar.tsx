'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { logout, getEmail, getRole } from '@/lib/auth';

const OWNER_EMAIL = 'samuconfa08@gmail.com';

/* ── SVG Icons ─────────────────────────────────────────────── */
function IcGrid() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IcUsers() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5.356-3.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a4 4 0 015.356-3.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function IcBuilding() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}
function IcCalendar() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function IcSun() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
function IcAlert() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
function IcLogout() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

/* ── Navigation config ──────────────────────────────────────── */
const NAV = [
  { href: '/dashboard',            label: 'Dashboard',  icon: <IcGrid />,     ownerOnly: false },
  { href: '/dashboard/employees',  label: 'Dipendenti', icon: <IcUsers />,    ownerOnly: false },
  { href: '/dashboard/businesses', label: 'Attività',   icon: <IcBuilding />, ownerOnly: false },
  { href: '/dashboard/shifts',     label: 'Turni',      icon: <IcCalendar />, ownerOnly: false },
  { href: '/dashboard/vacations',  label: 'Ferie',      icon: <IcSun />,      ownerOnly: false },
  { href: '/dashboard/error-logs', label: 'Log Errori', icon: <IcAlert />,    ownerOnly: true  },
];

/* ── Component ──────────────────────────────────────────────── */
export default function Sidebar() {
  const pathname        = usePathname();
  const [email, setEmail] = useState('');
  const [role, setRole]   = useState('');

  useEffect(() => {
    setEmail(getEmail());
    setRole(getRole());
  }, []);

  const isOwner = email.toLowerCase() === OWNER_EMAIL.toLowerCase();
  const initial = email ? email[0].toUpperCase() : '?';

  return (
    <aside className="w-64 h-screen bg-slate-900 flex flex-col fixed left-0 top-0 z-20 border-r border-slate-800">

      {/* Logo */}
      <div className="px-5 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-indigo-900/40 shrink-0">
            T
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-white tracking-tight">TurniUp</span>
            <span className="text-[10px] font-medium text-slate-500 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded">
              Web
            </span>
          </div>
        </div>
      </div>

      {/* Navigazione */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        <p className="px-3 mb-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
          Navigazione
        </p>
        {NAV.filter(item => !item.ownerOnly || isOwner).map(item => {
          const active =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-indigo-500/15 text-indigo-300 font-medium border border-indigo-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
              }`}
            >
              <span className={`transition-colors ${active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.ownerOnly && (
                <span className="text-[10px] font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded">
                  owner
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Utente + Logout */}
      <div className="px-3 py-3 border-t border-slate-800 space-y-0.5">
        {email && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              {role && (
                <p className={`text-xs font-semibold mb-0.5 ${isOwner ? 'text-orange-400' : 'text-indigo-400'}`}>
                  {isOwner ? 'Owner' : role}
                </p>
              )}
              <p className="text-xs text-slate-500 truncate">{email}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all"
        >
          <IcLogout />
          Esci
        </button>
      </div>
    </aside>
  );
}
