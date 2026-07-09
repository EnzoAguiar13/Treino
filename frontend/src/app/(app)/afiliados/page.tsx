'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IconPlus } from '@/components/Icons';
import { NewAffiliateModal } from '@/components/affiliates/NewAffiliateModal';
import { Column, DataTable } from '@/components/ui/DataTable';
import { FiltersBar } from '@/components/ui/FiltersBar';
import { api } from '@/lib/api';
import { useFilters } from '@/lib/filters-store';
import { brl, num, pct } from '@/lib/format';
import type { Affiliate } from '@/lib/types';

export default function AffiliatesPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { search, category, status, period, from, to } = useFilters();

  const qs = new URLSearchParams({
    ...(search ? { search } : {}),
    category,
    status,
    period,
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  }).toString();

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['affiliates', qs],
    queryFn: () => api<Affiliate[]>(`/affiliates?${qs}`),
  });

  const columns: Column<Affiliate>[] = [
    { key: 'externalId', header: 'ID', render: (r) => <span className="text-neutral-400">{r.externalId}</span> },
    { key: 'name', header: 'Nome', render: (r) => <span className="font-medium">{r.name}</span> },
    {
      key: 'categories',
      header: 'Categorias',
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.categories.map((c) => (
            <span key={c.id} className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] text-brand">
              {c.category}
            </span>
          ))}
        </div>
      ),
    },
    { key: 'registrations', header: 'Registros', render: (r) => num(r.registrations) },
    { key: 'ftd', header: 'FTD', render: (r) => num(r.ftd) },
    { key: 'deposits', header: 'Depósitos', render: (r) => brl(r.deposits) },
    { key: 'netPl', header: 'Net P&L', render: (r) => brl(r.netPl) },
    { key: 'commission', header: 'Comissão', render: (r) => brl(r.commission) },
    { key: 'roi', header: 'ROI', render: (r) => <span className="text-brand">{pct(r.roi)}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
            r.status === 'ATIVO' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
          }`}
        >
          {r.status}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Afiliados</h1>
        <button onClick={() => setOpen(true)} className="btn-brand">
          <IconPlus /> Novo Afiliado
        </button>
      </div>
      <FiltersBar />
      {isLoading ? (
        <div className="card grid h-40 place-items-center text-sm text-neutral-500">Carregando…</div>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          onRowClick={(r) => router.push(`/afiliados/${r.id}`)}
        />
      )}
      <NewAffiliateModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
