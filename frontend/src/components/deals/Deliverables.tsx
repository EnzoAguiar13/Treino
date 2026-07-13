'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import {
  DELIVERABLE_STATUS,
  type Creator,
  type Deliverable,
  type DeliverableStatus,
} from '@/lib/deals-types';
import { useDeals } from '@/lib/deals-store';
import { Badge, FieldLabel } from './primitives';

/** Mini-kanban / checklist de entregas por creator, com progresso visível. */
export function Deliverables({ creator }: { creator: Creator }) {
  const { addDeliverable, updateDeliverable, removeDeliverable, addExtraField, updateExtraField, removeExtraField } =
    useDeals();

  const total = creator.deliverables.length;
  const done = creator.deliverables.filter((d) => d.status === 'ENTREGUE').length;
  const progress = total ? Math.round((done / total) * 100) : 0;

  const next: Record<DeliverableStatus, DeliverableStatus> = {
    A_FAZER: 'EM_PRODUCAO',
    EM_PRODUCAO: 'ENTREGUE',
    ENTREGUE: 'A_FAZER',
  };

  return (
    <div className="space-y-4 sm:col-span-2 lg:col-span-3">
      <div className="rounded-xl border border-line bg-ink/40 p-4">
        <div className="mb-3 flex items-center justify-between">
          <FieldLabel>Entregas · {done}/{total} concluídas</FieldLabel>
          <button
            onClick={() => addDeliverable(creator.id)}
            className="inline-flex items-center gap-1 rounded-lg border border-line px-2 py-1 text-[11px] text-neutral-300 transition hover:border-brand/60 hover:text-brand"
          >
            <Plus size={12} /> Entrega
          </button>
        </div>

        {/* barra de progresso */}
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-line">
          <motion.div
            className="h-full rounded-full bg-brand"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>

        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {creator.deliverables.map((d) => {
              const meta = DELIVERABLE_STATUS.find((s) => s.value === d.status)!;
              const save = (patch: Partial<Deliverable>) =>
                updateDeliverable(creator.id, { ...d, ...patch });
              return (
                <motion.div
                  layout
                  key={d.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-panel/60 p-2"
                >
                  <button onClick={() => save({ status: next[d.status] })} title="Avançar status">
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </button>
                  <input
                    value={d.title}
                    onChange={(e) => save({ title: e.target.value })}
                    placeholder="O que foi combinado…"
                    className="min-w-40 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-600"
                  />
                  <input
                    type="date"
                    value={d.date ?? ''}
                    onChange={(e) => save({ date: e.target.value })}
                    className="rounded-lg border border-line bg-ink px-2 py-1 text-[11px] outline-none focus:border-brand/60"
                  />
                  <input
                    value={d.notes ?? ''}
                    onChange={(e) => save({ notes: e.target.value })}
                    placeholder="obs."
                    className="w-28 rounded-lg border border-line bg-ink px-2 py-1 text-[11px] outline-none focus:border-brand/60"
                  />
                  <button
                    onClick={() => removeDeliverable(creator.id, d.id)}
                    className="grid h-6 w-6 place-items-center rounded-md text-neutral-600 hover:text-red-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {total === 0 && (
            <p className="py-3 text-center text-xs text-neutral-600">
              Nenhuma entrega registrada — adicione a primeira.
            </p>
          )}
        </div>
      </div>

      {/* Campos extras específicos do creator */}
      <div className="rounded-xl border border-line bg-ink/40 p-4">
        <div className="mb-3 flex items-center justify-between">
          <FieldLabel>Informações extras</FieldLabel>
          <button
            onClick={() => addExtraField(creator.id)}
            className="inline-flex items-center gap-1 rounded-lg border border-line px-2 py-1 text-[11px] text-neutral-300 transition hover:border-brand/60 hover:text-brand"
          >
            <Plus size={12} /> Campo
          </button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {creator.extraFields.map((f) => (
              <motion.div
                layout
                key={f.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 rounded-lg border border-line bg-panel/60 p-2"
              >
                <input
                  value={f.label}
                  onChange={(e) => updateExtraField(creator.id, { ...f, label: e.target.value })}
                  placeholder="Rótulo"
                  className="w-28 bg-transparent text-xs font-medium text-neutral-300 outline-none placeholder:text-neutral-600"
                />
                <input
                  value={f.value}
                  onChange={(e) => updateExtraField(creator.id, { ...f, value: e.target.value })}
                  placeholder="Valor"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-600"
                />
                <button
                  onClick={() => removeExtraField(creator.id, f.id)}
                  className="grid h-6 w-6 place-items-center rounded-md text-neutral-600 hover:text-red-400"
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {creator.extraFields.length === 0 && (
            <p className="py-2 text-center text-xs text-neutral-600 sm:col-span-2">
              Sem campos extras.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
