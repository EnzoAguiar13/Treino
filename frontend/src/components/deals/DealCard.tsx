'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgeCheck,
  CalendarClock,
  ChevronDown,
  Crown,
  Radio,
  StickyNote,
  Trash2,
} from 'lucide-react';
import { ReactNode, useState } from 'react';
import { CONTRACT_STATUS, type Deal } from '@/lib/deals-types';
import { SocialIcons } from './SocialIcons';
import { Badge, FieldLabel, InlineField, Toggle } from './primitives';

const brl = (v: number) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Destaca vencimentos próximos (<= 14 dias) ou vencidos.
function dueMeta(dueDate: string): { tone: string; label: string } | null {
  if (!dueDate) return null;
  const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { tone: 'red', label: `Vencido há ${Math.abs(days)}d` };
  if (days <= 14) return { tone: 'amber', label: `Vence em ${days}d` };
  return { tone: 'neutral', label: new Date(dueDate).toLocaleDateString('pt-BR') };
}

export function DealCard({
  deal,
  onChange,
  onRemove,
  index,
  children,
}: {
  deal: Deal;
  onChange: (patch: Partial<Deal>) => void;
  onRemove: () => void;
  index: number;
  children?: ReactNode; // seção extra (entregas dos creators)
}) {
  const [open, setOpen] = useState(false);
  const status = CONTRACT_STATUS.find((s) => s.value === deal.contractStatus)!;
  const due = dueMeta(deal.dueDate);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
      className="group relative overflow-hidden rounded-2xl border border-line bg-panel/70 shadow-card backdrop-blur transition hover:border-brand/40"
    >
      {/* glow sutil no topo */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent opacity-0 transition group-hover:opacity-100" />

      <div className="flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg bg-ink/70 px-2 py-1">
              <span className="text-[10px] text-neutral-500">ID</span>
              <input
                value={deal.dealId}
                onChange={(e) => onChange({ dealId: e.target.value })}
                placeholder="deal-000"
                className="w-24 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-neutral-600"
              />
            </div>
            <Badge tone={status.tone}>{status.label}</Badge>
            {deal.exclusive && (
              <Badge tone="brand">
                <Crown size={11} /> Exclusivo
              </Badge>
            )}
            {deal.hasTraffic && (
              <Badge tone="sky">
                <Radio size={11} /> Tráfego
              </Badge>
            )}
            {due && (
              <Badge tone={due.tone}>
                <CalendarClock size={11} /> {due.label}
              </Badge>
            )}
            <Badge tone={deal.pipefy ? 'emerald' : 'neutral'}>
              <BadgeCheck size={11} /> Pipefy {deal.pipefy ? 'OK' : 'pendente'}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="text-neutral-400">
              {deal.contact || <span className="text-neutral-600">sem contato</span>}
            </span>
            {deal.segment && <span className="text-neutral-500">· {deal.segment}</span>}
            <span className="font-semibold text-brand">{brl(deal.dealValue)}</span>
          </div>

          <div className="mt-3">
            <SocialIcons socials={deal.socials} />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <motion.button
            onClick={() => setOpen((v) => !v)}
            whileTap={{ scale: 0.9 }}
            className="grid h-8 w-8 place-items-center rounded-lg border border-line text-neutral-400 transition hover:border-brand/60 hover:text-brand"
          >
            <ChevronDown size={16} className={`transition ${open ? 'rotate-180' : ''}`} />
          </motion.button>
          <button
            onClick={onRemove}
            className="grid h-8 w-8 place-items-center rounded-lg border border-line text-neutral-500 opacity-0 transition hover:border-red-500/60 hover:text-red-400 group-hover:opacity-100"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden border-t border-line"
          >
            <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="space-y-1">
                <FieldLabel>Ponto de contato</FieldLabel>
                <InlineField
                  value={deal.contact}
                  onChange={(v) => onChange({ contact: v })}
                  placeholder="Responsável"
                />
              </label>
              <label className="space-y-1">
                <FieldLabel>Segmentação</FieldLabel>
                <InlineField
                  value={deal.segment}
                  onChange={(v) => onChange({ segment: v })}
                  placeholder="Nicho / categoria"
                />
              </label>
              <label className="space-y-1">
                <FieldLabel>Valor da deal</FieldLabel>
                <InlineField
                  type="number"
                  prefix="R$"
                  value={deal.dealValue}
                  onChange={(v) => onChange({ dealValue: Number(v) })}
                />
              </label>
              <label className="space-y-1">
                <FieldLabel>Vencimento</FieldLabel>
                <InlineField
                  type="date"
                  value={deal.dueDate}
                  onChange={(v) => onChange({ dueDate: v })}
                />
              </label>
              <div className="space-y-1">
                <FieldLabel>Status do contrato</FieldLabel>
                <select
                  value={deal.contractStatus}
                  onChange={(e) => onChange({ contractStatus: e.target.value as Deal['contractStatus'] })}
                  className="w-full rounded-lg border border-line bg-ink px-2 py-1.5 text-sm outline-none focus:border-brand/60"
                >
                  {CONTRACT_STATUS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <FieldLabel>Redes sociais</FieldLabel>
                <SocialIcons
                  socials={deal.socials}
                  editing
                  onChange={(socials) => onChange({ socials })}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-3">
                <Toggle on={deal.pipefy} onToggle={() => onChange({ pipefy: !deal.pipefy })} labelOn="Pipefy OK" labelOff="Pipefy pendente" />
                <Toggle on={deal.hasTraffic} onToggle={() => onChange({ hasTraffic: !deal.hasTraffic })} labelOn="Com tráfego" labelOff="Sem tráfego" />
                <Toggle on={deal.aditivo} onToggle={() => onChange({ aditivo: !deal.aditivo })} labelOn="Com aditivo" labelOff="Sem aditivo" />
                <Toggle on={deal.exclusive} onToggle={() => onChange({ exclusive: !deal.exclusive })} labelOn="Exclusivo" labelOff="Não exclusivo" />
              </div>

              <label className="space-y-1 sm:col-span-2 lg:col-span-3">
                <FieldLabel>
                  <span className="inline-flex items-center gap-1">
                    <StickyNote size={11} /> Anotações
                  </span>
                </FieldLabel>
                <textarea
                  value={deal.notes}
                  onChange={(e) => onChange({ notes: e.target.value })}
                  rows={3}
                  placeholder="Observações da deal…"
                  className="w-full rounded-xl border border-line bg-ink px-3 py-2 text-sm outline-none focus:border-brand/60"
                />
              </label>

              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
