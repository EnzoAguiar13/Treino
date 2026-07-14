'use client';

import { motion } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-store';
import { LoginScreen } from './LoginScreen';

/**
 * Revela o dashboard interno sem recarregar a página:
 * enquanto não autenticado, mostra a tela de login 3D;
 * após o login, o conteúdo entra com animação de expansão.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const authenticated = useAuth((s) => !!s.accessToken);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  if (!hydrated) return <div className="min-h-screen bg-ink" />;
  if (!authenticated) return <LoginScreen />;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
