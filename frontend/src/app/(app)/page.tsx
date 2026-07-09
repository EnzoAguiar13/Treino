'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FiltersBar } from '@/components/ui/FiltersBar';
import { StatCard } from '@/components/ui/StatCard';
import { api } from '@/lib/api';
import { useFilters } from '@/lib/filters-store';
import { brl, num, pct } from '@/lib/format';
import type { DashboardOverview } from '@/lib/types';

export default function DashboardPage() {
  const { period, from, to, category, status } = useFilters();
  const qs = new URLSearchParams({
    period,
    category,
    status,
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  }).toString();

  const { data } = useQuery({
    queryKey: ['dashboard', qs],
    queryFn: () => api<DashboardOverview>(`/dashboard/overview?${qs}`),
    refetchInterval: 30_000,
  });

  const { data: series = [] } = useQuery({
    queryKey: ['dashboard-series', period, from, to],
    queryFn: () =>
      api<{ date: string; deposits: number; registrations: number; netPl: number }[]>(
        `/dashboard/series?period=${period}${from ? `&from=${from}` : ''}${to ? `&to=${to}` : ''}`,
      ),
  });

  const d = data;
  const cards: [string, string][] = d
    ? [
        ['Total Afiliados', num(d.totalAffiliates)],
        ['Creators', num(d.creators)],
        ['Cassino', num(d.casino)],
        ['Sportsbook', num(d.sportsbook)],
        ['Registros', num(d.registrations)],
        ['Depósitos', brl(d.deposits)],
        ['FTD', num(d.ftd)],
        ['Volume', brl(d.volume)],
        ['Net P&L', brl(d.netPl)],
        ['GGR', brl(d.ggr)],
        ['Margem GGR', pct(d.ggrMargin)],
        ['Investimento', brl(d.investment)],
        ['Comissão', brl(d.commission)],
        ['Lucro', brl(d.profit)],
        ['ROI', pct(d.roi)],
        ['CAC', brl(d.cac)],
        ['CPA', brl(d.cpa)],
        ['Despesas', brl(d.expenses)],
        ['Lucro Líquido', brl(d.netProfit)],
      ]
    : [];

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
      <FiltersBar />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {cards.map(([label, value], i) => (
          <StatCard key={label} label={label} value={value} index={i} />
        ))}
      </div>

      <div className="card mt-6 p-5">
        <h2 className="mb-4 text-sm font-semibold text-neutral-300">
          Evolução — Depósitos, Registros e Net P&L
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <defs>
                <linearGradient id="brand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E8540A" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#E8540A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#666" fontSize={11} />
              <YAxis stroke="#666" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: '#181818',
                  border: '1px solid #262626',
                  borderRadius: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="deposits"
                name="Depósitos"
                stroke="#E8540A"
                fill="url(#brand)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="netPl"
                name="Net P&L"
                stroke="#ffffff"
                fill="transparent"
                strokeWidth={1.5}
              />
              <Area
                type="monotone"
                dataKey="registrations"
                name="Registros"
                stroke="#888888"
                fill="transparent"
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
