'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import type { Category } from '@/lib/types';
import { Modal } from '../ui/Modal';

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'CREATOR', label: 'Creator' },
  { value: 'CASSINO', label: 'Cassino' },
  { value: 'SPORTSBOOK', label: 'Sportsbook' },
  { value: 'INFLUENCER', label: 'Influencer' },
  { value: 'STREAMER', label: 'Streamer' },
  { value: 'TIPSTER', label: 'Tipster' },
  { value: 'TRADER', label: 'Trader' },
];

interface FormData {
  name: string;
  externalId: string;
  categories: Category[];
}

export function NewAffiliateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const client = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: { categories: [] } });

  const selected = watch('categories');

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      api('/affiliates', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['affiliates'] });
      reset();
      onClose();
    },
  });

  function toggle(cat: Category) {
    const current = selected ?? [];
    setValue(
      'categories',
      current.includes(cat) ? current.filter((c) => c !== cat) : [...current, cat],
      { shouldValidate: true },
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Novo Afiliado">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-400">Nome</span>
          <input
            {...register('name', { required: 'Informe o nome' })}
            className="input"
            placeholder="Nome do afiliado"
          />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-400">ID</span>
          <input
            {...register('externalId', { required: 'Informe o ID' })}
            className="input"
            placeholder="ID interno EsportivaBet"
          />
          {errors.externalId && (
            <p className="mt-1 text-xs text-red-400">{errors.externalId.message}</p>
          )}
        </label>

        <div>
          <span className="mb-2 block text-xs font-medium text-neutral-400">
            Categorias (múltipla escolha)
          </span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.value}
                onClick={() => toggle(c.value)}
                className={`chip ${selected?.includes(c.value) ? 'chip-active' : ''}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {mutation.isError && (
          <p className="text-xs text-red-400">{(mutation.error as Error).message}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancelar
          </button>
          <button type="submit" disabled={mutation.isPending} className="btn-brand">
            {mutation.isPending ? 'Criando…' : 'Criar afiliado'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
