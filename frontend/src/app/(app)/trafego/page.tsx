'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { IconPlus } from '@/components/Icons';
import { DataTable } from '@/components/ui/DataTable';
import { FiltersBar } from '@/components/ui/FiltersBar';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { api } from '@/lib/api';
import { useFilters } from '@/lib/filters-store';
import { brl, dateTime, num, pct } from '@/lib/format';

const PLATFORMS = [
  ['TODOS', 'Todos'],
  ['FACEBOOK_ADS', 'Facebook Ads'],
  ['GOOGLE_ADS', 'Google Ads'],
  ['TIKTOK_ADS', 'TikTok Ads'],
  ['META_ADS', 'Meta Ads'],
  ['KWAI_ADS', 'Kwai Ads'],
] as const;

interface TrafficRow {
  id: string;
  platform: string;
  date: string;
  investment: number;
  clicks: number;
  leads: number;
  registrations: number;
  ftd: number;
  cpa: number;
  cac: number;
  roi: number;
  profit: number;
}

interface FormData {
  platform: string;
  investment: number;
  clicks: number;
  leads: number;
  registrations: number;
  ftd: number;
  revenue: number;
}

export default function TrafficPage() {
  const client = useQueryClient();
  const { period, from, to } = useFilters();
  const [platform, setPlatform] = useState('TODOS');
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: { platform: 'FACEBOOK_ADS' },
  });

  const qs = `platform=${platform}&period=${period}${from ? `&from=${from}` : ''}${to ? `&to=${to}` : ''}`;

  const { data: rows = [] } = useQuery({
    queryKey: ['traffic', qs],
    queryFn: () => api<TrafficRow[]>(`/traffic?${qs}`),
  });
  const { data: summary } = useQuery({
    queryKey: ['traffic-summary', period, from, to],
    queryFn: () =>
      api<Record<string, number>>(
        `/traffic/summary?period=${period}${from ? `&from=${from}` : ''}${to ? `&to=${to}` : ''}`,
      ),
  });

  const create = useMutation({
    mutationFn: (d: FormData) =>
      api('/traffic', {
        method: 'POST',
        body: JSON.stringify({
          ...d,
          investment: Number(d.investment || 0),
          clicks: Number(d.clicks || 0),
          leads: Number(d.leads || 0),
          registrations: Number(d.registrations || 0),
          ftd: Number(d.ftd || 0),
          revenue: Number(d.revenue || 0),
        }),
      }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['traffic'] });
      client.invalidateQueries({ queryKey: ['traffic-summary'] });
      reset();
      setOpen(false);
    },
  });

  const cards = [
    ['investment', 'Investimento', brl],
    ['clicks', 'Cliques', num],
    ['leads', 'Leads', num],
    ['registrations', 'Registros', num],
    ['ftd', 'FTD', num],
    ['cpa', 'CPA', brl],
    ['cac', 'CAC', brl],
    ['roi', 'ROI', pct],
    ['profit', 'Lucro', brl],
  ] as const;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tráfego</h1>
        <button onClick={() => setOpen(true)} className="btn-brand">
          <IconPlus /> Nova campanha
        </button>
      </div>
      <FiltersBar />
      <div className="mb-4 flex flex-wrap gap-1.5">
        {PLATFORMS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setPlatform(key)}
            className={`chip ${platform === key ? 'chip-active' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map(([key, label, format], i) => (
          <StatCard key={key} label={label} value={format(Number(summary?.[key] ?? 0))} index={i} />
        ))}
      </div>
      <DataTable
        columns={[
          {
            key: 'platform',
            header: 'Plataforma',
            render: (r) => (
              <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] text-brand">
                {String(r.platform).replace('_', ' ')}
              </span>
            ),
          },
          { key: 'date', header: 'Data', render: (r) => dateTime(r.date) },
          { key: 'investment', header: 'Investimento', render: (r) => brl(r.investment) },
          { key: 'clicks', header: 'Cliques', render: (r) => num(r.clicks) },
          { key: 'leads', header: 'Leads', render: (r) => num(r.leads) },
          { key: 'registrations', header: 'Registros', render: (r) => num(r.registrations) },
          { key: 'ftd', header: 'FTD', render: (r) => num(r.ftd) },
          { key: 'cpa', header: 'CPA', render: (r) => brl(r.cpa) },
          { key: 'cac', header: 'CAC', render: (r) => brl(r.cac) },
          { key: 'roi', header: 'ROI', render: (r) => pct(r.roi) },
          { key: 'profit', header: 'Lucro', render: (r) => brl(r.profit) },
        ]}
        rows={rows}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Nova campanha de tráfego">
        <form onSubmit={handleSubmit((d) => create.mutate(d))} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs text-neutral-400">Plataforma</span>
            <select {...register('platform')} className="input">
              {PLATFORMS.slice(1).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ['investment', 'Investimento (R$)'],
                ['clicks', 'Cliques'],
                ['leads', 'Leads'],
                ['registrations', 'Registros'],
                ['ftd', 'FTD'],
                ['revenue', 'Receita (R$)'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className="mb-1 block text-xs text-neutral-400">{label}</span>
                <input type="number" step="any" {...register(key)} className="input" />
              </label>
            ))}
          </div>
          <p className="text-[11px] text-neutral-500">
            CPA, CAC, ROI e Lucro são calculados automaticamente.
          </p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
              Cancelar
            </button>
            <button type="submit" disabled={create.isPending} className="btn-brand">
              {create.isPending ? 'Salvando…' : 'Adicionar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
