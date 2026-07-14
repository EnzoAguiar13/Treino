'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { useFilters } from '@/lib/filters-store';
import { dateTime } from '@/lib/format';
import { IconBell, IconLogout, IconSearch } from '../Icons';
import { Logo } from '../Logo';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export function Header() {
  const router = useRouter();
  const { user, clear } = useAuth();
  const { search, set } = useFilters();
  const [open, setOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api<Notification[]>('/notifications'),
  });
  const unread = notifications.filter((n) => !n.read).length;

  async function logout() {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      /* sessão local é limpa mesmo se a API falhar */
    }
    clear();
  }

  return (
    <header className="fixed inset-x-0 top-0 z-20 flex h-16 items-center gap-4 border-b border-line bg-ink/80 px-4 backdrop-blur lg:left-60">
      <div className="lg:hidden">
        <Logo />
      </div>

      {/* Pesquisa global */}
      <div className="relative ml-auto w-full max-w-md lg:ml-0">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
        <input
          value={search}
          onChange={(e) => {
            set({ search: e.target.value });
            if (e.target.value && window.location.pathname !== '/afiliados') {
              router.push('/afiliados');
            }
          }}
          placeholder="Pesquisar por ID, nome, Instagram, Telegram, WhatsApp, categoria…"
          className="input pl-10"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notificações */}
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-line text-neutral-300 transition hover:border-brand/60 hover:text-white"
          >
            <IconBell className="text-brand" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold">
                {unread}
              </span>
            )}
          </button>
          {open && (
            <div className="card absolute right-0 mt-2 max-h-96 w-80 overflow-y-auto p-2">
              {notifications.length === 0 && (
                <p className="p-4 text-center text-xs text-neutral-500">Sem notificações</p>
              )}
              {notifications.map((n) => (
                <div key={n.id} className="rounded-xl p-3 hover:bg-white/5">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-neutral-400">{n.message}</p>
                  <p className="mt-1 text-[10px] text-neutral-600">{dateTime(n.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Perfil */}
        <div className="hidden items-center gap-3 rounded-xl border border-line px-3 py-1.5 sm:flex">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-xs font-bold">
            {user?.name?.[0] ?? 'A'}
          </span>
          <div className="leading-tight">
            <p className="text-xs font-medium">{user?.name ?? 'Admin'}</p>
            <p className="text-[10px] text-neutral-500">{user?.roleLabel ?? ''}</p>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sair"
          className="grid h-10 w-10 place-items-center rounded-xl border border-line text-neutral-400 transition hover:border-red-500/60 hover:text-red-400"
        >
          <IconLogout />
        </button>
      </div>
    </header>
  );
}
