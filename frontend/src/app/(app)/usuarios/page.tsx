'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { IconPlus, IconTrash } from '@/components/Icons';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { dateTime } from '@/lib/format';

const ROLES = [
  ['ADMINISTRADOR', 'Administrador'],
  ['FINANCEIRO', 'Financeiro'],
  ['CS', 'CS'],
  ['GESTOR', 'Gestor'],
  ['MARKETING', 'Marketing'],
  ['TRAFEGO', 'Tráfego'],
  ['VISUALIZACAO', 'Visualização'],
] as const;

interface UserRow {
  id: string;
  name: string;
  email: string;
  active: boolean;
  createdAt: string;
  role: { name: string; label: string };
}

interface FormData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export default function UsersPage() {
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: { role: 'VISUALIZACAO' },
  });

  const { data: rows = [], error } = useQuery({
    queryKey: ['users'],
    queryFn: () => api<UserRow[]>('/users'),
  });

  const create = useMutation({
    mutationFn: (d: FormData) => api('/users', { method: 'POST', body: JSON.stringify(d) }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['users'] });
      reset();
      setOpen(false);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['users'] }),
  });

  const toggle = useMutation({
    mutationFn: (u: UserRow) =>
      api(`/users/${u.id}`, { method: 'PATCH', body: JSON.stringify({ active: !u.active }) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['users'] }),
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <button onClick={() => setOpen(true)} className="btn-brand">
          <IconPlus /> Novo usuário
        </button>
      </div>
      {error ? (
        <div className="card p-6 text-sm text-neutral-400">
          Acesso restrito: apenas administradores podem gerenciar usuários.
        </div>
      ) : (
        <DataTable
          columns={[
            { key: 'name', header: 'Nome', render: (r) => <span className="font-medium">{r.name}</span> },
            { key: 'email', header: 'E-mail', render: (r) => <span className="text-neutral-400">{r.email}</span> },
            {
              key: 'role',
              header: 'Perfil',
              render: (r) => (
                <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] text-brand">
                  {r.role.label}
                </span>
              ),
            },
            { key: 'created', header: 'Criado em', render: (r) => dateTime(r.createdAt) },
            {
              key: 'active',
              header: 'Status',
              render: (r) => (
                <button
                  onClick={() => toggle.mutate(r)}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    r.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                  }`}
                >
                  {r.active ? 'Ativo' : 'Inativo'}
                </button>
              ),
            },
            {
              key: 'actions',
              header: '',
              render: (r) => (
                <button
                  onClick={() => {
                    if (confirm(`Excluir ${r.name}?`)) remove.mutate(r.id);
                  }}
                  className="text-neutral-600 hover:text-red-400"
                >
                  <IconTrash width={16} height={16} />
                </button>
              ),
            },
          ]}
          rows={rows}
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Novo usuário">
        <form onSubmit={handleSubmit((d) => create.mutate(d))} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs text-neutral-400">Nome</span>
            <input {...register('name', { required: true })} className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-neutral-400">E-mail</span>
            <input type="email" {...register('email', { required: true })} className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-neutral-400">Senha (mín. 8 caracteres)</span>
            <input type="password" {...register('password', { required: true, minLength: 8 })} className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-neutral-400">Perfil</span>
            <select {...register('role')} className="input">
              {ROLES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          {create.isError && (
            <p className="text-xs text-red-400">{(create.error as Error).message}</p>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
              Cancelar
            </button>
            <button type="submit" disabled={create.isPending} className="btn-brand">
              {create.isPending ? 'Criando…' : 'Criar usuário'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
