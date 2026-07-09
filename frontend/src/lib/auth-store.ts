'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SessionUser } from './types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: SessionUser | null;
  setSession: (s: { accessToken: string; refreshToken: string; user: SessionUser }) => void;
  setAccessToken: (t: string) => void;
  clear: () => void;
}

/** Sessão persistida — mantém o login salvo entre visitas. */
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: (s) =>
        set({ accessToken: s.accessToken, refreshToken: s.refreshToken, user: s.user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clear: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    { name: 'esportivabet-session' },
  ),
);
