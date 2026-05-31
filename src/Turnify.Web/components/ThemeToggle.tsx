'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = (localStorage.getItem('turniup-theme') as 'light' | 'dark') || 'light';
    setTheme(saved);
  }, []);

  function apply(t: 'light' | 'dark') {
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('turniup-theme', t);
  }

  return (
    <div className="theme-toggle">
      <button onClick={() => apply('light')} className={theme === 'light' ? 'on' : ''} title="Tema chiaro" data-set="light">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4.2"/>
          <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"/>
        </svg>
      </button>
      <button onClick={() => apply('dark')} className={theme === 'dark' ? 'on' : ''} title="Tema scuro" data-set="dark">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 13.5A8 8 0 0 1 10.5 4a7 7 0 1 0 9.5 9.5Z"/>
        </svg>
      </button>
    </div>
  );
}
