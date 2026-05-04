'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { logout, getEmail, getRole } from '@/lib/auth';

const OWNER_EMAIL = 'samuconfa08@gmail.com';

const ROLE_LABEL: Record<string, string> = {
  Admin: 'Admin',
  Manager: 'Manager',
};

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊', ownerOnly: false },
  { href: '/dashboard/employees', label: 'Dipendenti', icon: '👥', ownerOnly: false },
  { href: '/dashboard/businesses', label: 'Attività', icon: '🏢', ownerOnly: false },
  { href: '/dashboard/shifts', label: 'Turni', icon: '📅', ownerOnly: false },
  { href: '/dashboard/vacations', label: 'Ferie', icon: '🌴', ownerOnly: false },
  { href: '/dashboard/error-logs', label: 'Log Errori', icon: '🔴', ownerOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    setEmail(getEmail());
    setRole(getRole());
  }, []);

  const isOwner = email.toLowerCase() === OWNER_EMAIL.toLowerCase();

  return (
    <aside className="w-60 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-10">
      <div className="p-5 border-b border-gray-100 flex items-center gap-2.5">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">T</div>
        <span className="font-semibold text-gray-900">Turnify</span>
        <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Web</span>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.filter(item => !item.ownerOnly || isOwner).map(item => {
          const active =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
              {item.ownerOnly && (
                <span className="ml-auto text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-medium">owner</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100 space-y-0.5">
        {email && (
          <div className="px-3 py-2 rounded-lg bg-gray-50">
            <div className="flex items-center gap-1.5 mb-0.5">
              {role && ROLE_LABEL[role] && (
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                    isOwner ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {ROLE_LABEL[role]}
                </span>
              )}
              {isOwner && (
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-600">owner</span>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">{email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <span>🚪</span>
          Esci
        </button>
      </div>
    </aside>
  );
}
