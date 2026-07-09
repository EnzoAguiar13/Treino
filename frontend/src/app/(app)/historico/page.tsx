'use client';

import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/DataTable';
import { api } from '@/lib/api';
import { dateTime } from '@/lib/format';

interface HistoryRow {
  id: string;
  userName: string;
  entity: string;
  entityId: string;
  field: string;
  oldValue: string;
  newValue: string;
  ip: string;
  device: string;
  createdAt: string;
}

export default function HistoryPage() {
  const { data: rows = [] } = useQuery({
    queryKey: ['history'],
    queryFn: () => api<HistoryRow[]>('/history?take=200'),
  });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Histórico</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Registro imutável de todas as alterações — o histórico nunca é apagado.
      </p>
      <DataTable
        columns={[
          { key: 'user', header: 'Quem alterou', render: (r) => r.userName || 'Sistema' },
          { key: 'when', header: 'Data · Hora', render: (r) => dateTime(r.createdAt) },
          {
            key: 'entity',
            header: 'Entidade',
            render: (r) => (
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-neutral-300">
                {r.entity}
              </span>
            ),
          },
          { key: 'field', header: 'Campo', render: (r) => <span className="text-brand">{r.field}</span> },
          {
            key: 'old',
            header: 'Valor antigo',
            render: (r) => (
              <span className="line-clamp-1 max-w-40 text-neutral-500">{r.oldValue || '—'}</span>
            ),
          },
          {
            key: 'new',
            header: 'Valor novo',
            render: (r) => <span className="line-clamp-1 max-w-40">{r.newValue || '—'}</span>,
          },
          { key: 'ip', header: 'IP', render: (r) => <span className="text-neutral-500">{r.ip || '—'}</span> },
          {
            key: 'device',
            header: 'Dispositivo',
            render: (r) => (
              <span className="line-clamp-1 max-w-48 text-neutral-600">{r.device || '—'}</span>
            ),
          },
        ]}
        rows={rows}
      />
    </div>
  );
}
