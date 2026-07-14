'use client';

import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { Logo } from '../Logo';

const LoginBackground = dynamic(
  () => import('../three/LoginBackground').then((m) => m.LoginBackground),
  { ssr: false },
);

export function LoginScreen() {
  const setSession = useAuth((s) => s.setSession);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expanding, setExpanding] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError(false);
    try {
      const session = await api<{
        accessToken: string;
        refreshToken: string;
        user: any;
      }>('/auth/login', { method: 'POST', body: JSON.stringify({ password }) });
      // Animação de expansão antes de revelar o dashboard (sem recarregar a página)
      setExpanding(true);
      setTimeout(() => setSession(session), 750);
    } catch {
      setError(true);
      setTimeout(() => setError(false), 600);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <LoginBackground />

      <AnimatePresence>
        {expanding && (
          <motion.div
            initial={{ scale: 0, opacity: 0.9 }}
            animate={{ scale: 40, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeIn' }}
            className="absolute z-20 h-24 w-24 rounded-full bg-brand"
          />
        )}
      </AnimatePresence>

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: expanding ? 0 : 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`card relative z-10 flex w-[min(92vw,380px)] flex-col items-center gap-6 px-8 py-10 backdrop-blur ${
          error ? 'animate-shake' : ''
        }`}
      >
        <Logo size="lg" />

        <div className="w-full">
          <div
            className={`flex items-center gap-3 rounded-xl border bg-ink px-4 py-3 transition ${
              error ? 'border-red-500' : 'border-line focus-within:border-brand/70 focus-within:shadow-glow'
            }`}
          >
            {/* Cadeado laranja */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8540A" strokeWidth="2">
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha de acesso"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-neutral-600"
            />
          </div>
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 text-center text-xs text-red-400"
              >
                Senha incorreta
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Botão circular de entrar */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          disabled={loading}
          className="grid h-14 w-14 place-items-center rounded-full bg-brand text-white shadow-glow transition disabled:opacity-60"
          aria-label="Entrar"
        >
          {loading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          )}
        </motion.button>
      </motion.form>
    </div>
  );
}
