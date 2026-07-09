'use client';

import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/DataTable';
import { FiltersBar } from '@/components/ui/FiltersBar';
import { api } from '@/lib/api';
import { useFilters } from '@/lib/filters-store';
import { brl, dateTime } from '@/lib/format';

interface Row {
  id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  affiliate?: { name: string };
}

export default function CommissionsPage() {
  const { period, from, to } = useFilters();
  const qs = `period=${period}${from ? `&from=${from}` : ''}${to ? `&to=${to}` : ''}`;

  const { data: rows = [] } = useQuery({
    queryKey: ['commissions', qs],
    queryFn: () => api<Row[]>(`/finance/commissions?${qs}`),
  });

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Comissões</h1>
      <FiltersBar />
      <DataTable
        columns={[
          { key: 'affiliate', header: 'Afiliado', render: (r) => r.affiliate?.name ?? '—' },
          {
            key: 'type',
            header: 'Tipo',
            render: (r) => (
              <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] text-brand">
                {r.type}
              </span>
            ),
          },
          { key: 'amount', header: 'Valor', render: (r) => brl(r.amount) },
          { key: 'description', header: 'Descrição', render: (r) => r.description || '—' },
          { key: 'date', header: 'Data', render: (r) => dateTime(r.date) },
        ]}
        rows={rows}
      />
    </div>
  );
}
