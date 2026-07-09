'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { IconLink, IconTrash } from '@/components/Icons';
import { AutoField } from '@/components/ui/AutoField';
import { StatCard } from '@/components/ui/StatCard';
import { api } from '@/lib/api';
import { brl, pct } from '@/lib/format';
import type { Affiliate, Category, SocialNetwork } from '@/lib/types';

const CATEGORIES: Category[] = [
  'CREATOR',
  'CASSINO',
  'SPORTSBOOK',
  'INFLUENCER',
  'STREAMER',
  'TIPSTER',
  'TRADER',
];

const NETWORKS: { key: SocialNetwork; label: string }[] = [
  { key: 'INSTAGRAM', label: 'Instagram' },
  { key: 'TIKTOK', label: 'TikTok' },
  { key: 'YOUTUBE', label: 'YouTube' },
  { key: 'TELEGRAM', label: 'Telegram' },
  { key: 'WHATSAPP', label: 'WhatsApp' },
  { key: 'DISCORD', label: 'Discord' },
  { key: 'FACEBOOK', label: 'Facebook' },
  { key: 'TWITTER', label: 'Twitter' },
  { key: 'KWAI', label: 'Kwai' },
  { key: 'SITE', label: 'Site' },
  { key: 'LINKTREE', label: 'Linktree' },
];

const FINANCIAL_FIELDS: { key: keyof Affiliate; label: string; int?: boolean }[] = [
  { key: 'registrations', label: 'Registro', int: true },
  { key: 'ftd', label: 'FTD', int: true },
  { key: 'deposits', label: 'Depósito (R$)' },
  { key: 'volume', label: 'Volume (R$)' },
  { key: 'netPl', label: 'Net P&L (R$)' },
  { key: 'ggr', label: 'GGR (R$)' },
  { key: 'cpa', label: 'CPA (R$)' },
  { key: 'revShare', label: 'RevShare (%)' },
  { key: 'fixedCost', label: 'Fixo (R$)' },
  { key: 'otherCosts', label: 'Outros Custos (R$)' },
  { key: 'trafficInvestment', label: 'Investimento em Tráfego (R$)' },
];

export default function AffiliateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const client = useQueryClient();

  const { data: a } = useQuery({
    queryKey: ['affiliate', id],
    queryFn: () => api<Affiliate>(`/affiliates/${id}`),
  });

  const patch = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api(`/affiliates/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['affiliate', id] });
      client.invalidateQueries({ queryKey: ['affiliates'] });
    },
  });

  const remove = useMutation({
    mutationFn: () => api(`/affiliates/${id}`, { method: 'DELETE' }),
    onSuccess: () => router.push('/afiliados'),
  });

  if (!a) {
    return <div className="card grid h-40 place-items-center text-sm text-neutral-500">Carregando…</div>;
  }

  const cats = a.categories.map((c) => c.category);
  const social = (n: SocialNetwork) => a.socialAccounts.find((s) => s.network === n);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{a.name}</h1>
          <p className="text-sm text-neutral-500">ID {a.externalId}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              patch.mutate({ status: a.status === 'ATIVO' ? 'INATIVO' : 'ATIVO' })
            }
            className={`chip ${a.status === 'ATIVO' ? 'chip-active' : ''}`}
          >
            {a.status}
          </button>
          <button
            onClick={() => {
              if (confirm('Excluir este afiliado?')) remove.mutate();
            }}
            className="grid h-9 w-9 place-items-center rounded-xl border border-line text-neutral-500 hover:border-red-500/60 hover:text-red-400"
          >
            <IconTrash />
          </button>
        </div>
      </div>

      {/* Indicadores recalculados automaticamente */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="ROI" value={pct(a.roi)} index={0} />
        <StatCard label="CAC" value={brl(a.cac)} index={1} />
        <StatCard label="GGR" value={brl(a.ggr)} index={2} />
        <StatCard label="Margem GGR" value={pct(a.ggrMargin)} index={3} />
        <StatCard label="Lucro" value={brl(a.profit)} index={4} />
        <StatCard label="Comissão" value={brl(a.commission)} index={5} />
      </div>

      <section className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-neutral-300">Cadastro</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <AutoField label="Nome" value={a.name} onSave={(v) => patch.mutateAsync({ name: v })} />
          <AutoField
            label="ID"
            value={a.externalId}
            onSave={(v) => patch.mutateAsync({ externalId: v })}
          />
        </div>
        <div className="mt-4">
          <span className="mb-2 block text-xs font-medium text-neutral-400">Categorias</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() =>
                  patch.mutate({
                    categories: cats.includes(c) ? cats.filter((x) => x !== c) : [...cats, c],
                  })
                }
                className={`chip ${cats.includes(c) ? 'chip-active' : ''}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-neutral-300">Redes Sociais</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {NETWORKS.map(({ key, label }) => {
            const account = social(key);
            return (
              <div key={key}>
                <AutoField
                  label={label}
                  value={account?.handle ?? ''}
                  placeholder={`@usuario`}
                  onSave={(v) =>
                    patch.mutateAsync({ socialAccounts: [{ network: key, handle: v }] })
                  }
                />
                {account?.url && (
                  <a
                    href={account.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-[11px] text-brand hover:underline"
                  >
                    <IconLink width={12} height={12} /> {account.url}
                    {account.followers ? ` · ${account.followers.toLocaleString('pt-BR')} seguidores` : ''}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="mb-1 text-sm font-semibold text-neutral-300">Financeiro</h2>
        <p className="mb-4 text-[11px] text-neutral-500">
          Todos os indicadores (ROI, CAC, Lucro, Comissão) são recalculados automaticamente a cada
          alteração — auto save em tempo real, sem botão salvar.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FINANCIAL_FIELDS.map(({ key, label, int }) => (
            <AutoField
              key={key}
              type="number"
              label={label}
              value={String(a[key] ?? 0)}
              onSave={(v) =>
                patch.mutateAsync({ [key]: int ? parseInt(v || '0', 10) : Number(v || 0) })
              }
            />
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-neutral-300">Acordo Atual</h2>
        <AutoField
          label="Termos do acordo (aceita formatação Markdown)"
          textarea
          rows={8}
          value={a.agreement?.content ?? ''}
          onSave={(v) => patch.mutateAsync({ agreement: v })}
        />
      </section>

      <section className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-neutral-300">Observações</h2>
        <AutoField
          label="Notas internas (ilimitado)"
          textarea
          rows={6}
          value={a.notes}
          onSave={(v) => patch.mutateAsync({ notes: v })}
        />
      </section>
    </div>
  );
}
