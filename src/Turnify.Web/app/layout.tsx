import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TurniUp — Pannello Web',
  description: 'Gestione turni, dipendenti e attività per il tuo team',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Restore theme before paint to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          try{var t=localStorage.getItem('turniup-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
