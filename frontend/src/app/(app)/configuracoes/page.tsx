'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';

interface RoleRow {
  id: string;
  name: string;
  label: string;
  permissions: { permission: { key: string; label: string } }[];
}

export default function SettingsPage() {
  const user = useAuth((s) => s.user);
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => api<RoleRow[]>('/users/roles').catch(() => []),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configurações</h1>

      <section className="card p-5">
        <h2 className="mb-3 text-sm font-semibold text-neutral-300">Sessão</h2>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <p><span className="text-neutral-500">Usuário:</span> {user?.name}</p>
          <p><span className="text-neutral-500">E-mail:</span> {user?.email}</p>
          <p><span className="text-neutral-500">Perfil:</span> <span className="text-brand">{user?.roleLabel}</span></p>
          <p><span className="text-neutral-500">Tema:</span> Dark (padrão do sistema)</p>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="mb-3 text-sm font-semibold text-neutral-300">Perfis e permissões</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((r) => (
            <div key={r.id} className="rounded-xl border border-line p-4">
              <p className="mb-2 font-medium text-brand">{r.label}</p>
              <ul className="space-y-1 text-xs text-neutral-400">
                {r.permissions.map((p) => (
                  <li key={p.permission.key}>· {p.permission.label}</li>
                ))}
                {r.permissions.length === 0 && <li>Sem permissões</li>}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="mb-3 text-sm font-semibold text-neutral-300">Segurança</h2>
        <ul className="space-y-1 text-sm text-neutral-400">
          <li>· Autenticação JWT com refresh token (sessão persistente)</li>
          <li>· Senhas com BCrypt · Rate limit ativo · Helmet + CORS restrito</li>
          <li>· Validação de payloads (proteção contra SQL Injection / XSS)</li>
          <li>· Logs de auditoria e histórico imutável de alterações</li>
        </ul>
      </section>
    </div>
  );
}
