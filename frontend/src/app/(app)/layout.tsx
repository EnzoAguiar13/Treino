import { ReactNode } from 'react';
import { AuthGate } from '@/components/auth/AuthGate';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <Sidebar />
      <Header />
      <main className="min-h-screen px-4 pb-12 pt-24 lg:pl-64 lg:pr-8">{children}</main>
    </AuthGate>
  );
}
