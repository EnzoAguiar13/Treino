'use client';

import { useQuery } from '@tanstack/react-query';
import { FiltersBar } from '@/components/ui/FiltersBar';
import { StatCard } from '@/components/ui/StatCard';
import { Column, DataTable } from '@/components/ui/DataTable';
import { api } from '@/lib/api';
import { useFilters } from '@/lib/filters-store';

interface PanelRow {
  id: string;
  date: string;
  affiliate?: { id: string; name: string };
  [key: string]: unknown;
}

/**
 * Página genérica de painel (Creators / Cassino / Sportsbook):
 * cards de resumo agregado + tabela de lançamentos, com filtros de período.
 */
export function PanelPage({
  title,
  panel,
  summaryCards,
  columns,
}: {
  title: string;
  panel: 'creator' | 'casino' | 'sportsbook';
  summaryCards: { key: string; label: string; format: (v: number) => string }[];
  columns: Column<PanelRow>[];
}) {
  const { period, from, to } = useFilters();
  const qs = `period=${period}${from ? `&from=${from}` : ''}${to ? `&to=${to}` : ''}`;

  const { data: summary } = useQuery({
    queryKey: [panel, 'summary', qs],
    queryFn: () => api<Record<string, number>>(`/metrics/${panel}/summary?${qs}`),
  });

  const { data: rows = [] } = useQuery({
    queryKey: [panel, 'rows', qs],
    queryFn: () => api<PanelRow[]>(`/metrics/${panel}?${qs}`),
  });

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{title}</h1>
      <FiltersBar />
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {summaryCards.map((c, i) => (
          <StatCard
            key={c.key}
            label={c.label}
            value={c.format(Number(summary?.[c.key] ?? 0))}
            index={i}
          />
        ))}
      </div>
      <DataTable columns={columns} rows={rows} />
    </div>
  );
}
