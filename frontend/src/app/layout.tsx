import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Providers } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'EsportivaBet — Gestão de Afiliados',
  description: 'CRM interno de afiliados da EsportivaBet',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-ink font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
