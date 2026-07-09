'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { FiltersBar } from '@/components/ui/FiltersBar';
import { StatCard } from '@/components/ui/StatCard';
import { api } from '@/lib/api';
import { useFilters } from '@/lib/filters-store';
import { brl, dateTime, num } from '@/lib/format';

const TABS = [
  ['deposits', 'Depósitos'],
  ['expenses', 'Despesas'],
  ['registrations', 'Registros'],
  ['netpl', 'Net P&L'],
] as const;

interface Row {
  id: string;
  date: string;
  amount?: number;
  count?: number;
  description?: string;
  source?: string;
  affiliate?: { name: string };
}

export default function FinancePage() {
  const { period, from, to } = useFilters();
  const [tab, setTab] = useState<(typeof TABS)[number][0]>('deposits');
  const qs = `period=${period}${from ? `&from=${from}` : ''}${to ? `&to=${to}` : ''}`;

  const { data: summary } = useQuery({
    queryKey: ['finance-summary', qs],
    queryFn: () => api<Record<string, number>>(`/finance/summary?${qs}`),
  });

  const { data: rows = [] } = useQuery({
    queryKey: ['finance', tab, qs],
    queryFn: () => api<Row[]>(`/finance/${tab}?${qs}`),
  });

  const cards = [
    ['netPl', 'Net P&L', brl],
    ['commissions', 'Comissões', brl],
    ['deposits', 'Depósitos', brl],
    ['registrations', 'Registros', num],
    ['expenses', 'Despesas', brl],
    ['netProfit', 'Lucro Líquido', brl],
  ] as const;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Financeiro</h1>
      <FiltersBar />
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map(([key, label, format], i) => (
          <StatCard key={key} label={label} value={format(Number(summary?.[key] ?? 0))} index={i} />
        ))}
      </div>
      <div className="mb-4 flex gap-1.5">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`chip ${tab === key ? 'chip-active' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>
      <DataTable
        columns={[
          { key: 'affiliate', header: 'Afiliado', render: (r) => r.affiliate?.name ?? '—' },
          { key: 'date', header: 'Data', render: (r) => dateTime(r.date) },
          {
            key: 'value',
            header: tab === 'registrations' ? 'Quantidade' : 'Valor',
            render: (r) =>
              tab === 'registrations' ? num(r.count ?? 0) : brl(Number(r.amount ?? 0)),
          },
          {
            key: 'extra',
            header: 'Detalhe',
            render: (r) => r.description ?? r.source ?? '—',
          },
        ]}
        rows={rows}
      />
    </div>
  );
}
