'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Check,
  GripVertical,
  Plus,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useDeals } from '@/lib/deals-store';
import type { KanbanCard } from '@/lib/deals-types';

const LABEL_COLORS = ['emerald', 'amber', 'sky', 'brand', 'red', 'neutral'];
const LABEL_BG: Record<string, string> = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  sky: 'bg-sky-500',
  brand: 'bg-brand',
  red: 'bg-red-500',
  neutral: 'bg-neutral-500',
};

const isOverdue = (c: KanbanCard) => !!c.date && !c.done && new Date(c.date).getTime() < Date.now();

/**
 * Kanban estilo Trello: colunas customizáveis, cards arrastáveis entre colunas
 * (HTML5 drag & drop + animações de layout do Framer Motion), automação simples
 * (coluna "Feito" conclui o card; alerta de vencido; contadores por coluna).
 */
export function KanbanTab() {
  const {
    columns,
    cards,
    addColumn,
    updateColumn,
    removeColumn,
    addCard,
    updateCard,
    removeCard,
    moveCard,
  } = useDeals();

  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<string | null>(null);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => {
        const colCards = cards.filter((c) => c.columnId === col.id);
        const overdue = colCards.filter(isOverdue).length;
        return (
          <div
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCol(col.id);
            }}
            onDrop={() => {
              if (dragId) moveCard(dragId, col.id);
              setDragId(null);
              setOverCol(null);
            }}
            className={`flex w-72 shrink-0 flex-col rounded-2xl border bg-panel/50 p-3 transition ${
              overCol === col.id ? 'border-brand/60 bg-panel' : 'border-line'
            }`}
          >
            <div className="mb-3 flex items-center gap-2">
              <input
                value={col.title}
                onChange={(e) => updateColumn(col.id, { title: e.target.value })}
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none"
              />
              <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] text-neutral-400">
                {colCards.length}
              </span>
              {overdue > 0 && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-red-500/15 px-1.5 py-0.5 text-[10px] text-red-400">
                  <AlertTriangle size={10} /> {overdue}
                </span>
              )}
              <button
                onClick={() => updateColumn(col.id, { autoDone: !col.autoDone })}
                title="Concluir cards automaticamente ao entrar nesta coluna"
                className={`grid h-6 w-6 place-items-center rounded-md border text-[10px] transition ${
                  col.autoDone
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
                    : 'border-line text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <Check size={12} />
              </button>
              <button
                onClick={() => removeColumn(col.id)}
                className="grid h-6 w-6 place-items-center rounded-md text-neutral-600 hover:text-red-400"
              >
                <Trash2 size={13} />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-2">
              <AnimatePresence mode="popLayout">
                {colCards.map((card) => (
                  <motion.div
                    layout
                    key={card.id}
                    layoutId={card.id}
                    draggable
                    onDragStart={() => setDragId(card.id)}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverCol(null);
                    }}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: dragId === card.id ? 0.4 : 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -2 }}
                    className={`group cursor-grab rounded-xl border bg-ink/80 p-3 shadow-card active:cursor-grabbing ${
                      isOverdue(card) ? 'border-red-500/40' : 'border-line'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical size={14} className="mt-0.5 shrink-0 text-neutral-600" />
                      <div className="min-w-0 flex-1">
                        {card.labels.length > 0 && (
                          <div className="mb-1.5 flex flex-wrap gap-1">
                            {card.labels.map((l, i) => (
                              <span
                                key={i}
                                className={`h-1.5 w-8 rounded-full ${LABEL_BG[l.color] ?? LABEL_BG.neutral}`}
                                title={l.text}
                              />
                            ))}
                          </div>
                        )}
                        <input
                          value={card.title}
                          onChange={(e) => updateCard(card.id, { title: e.target.value })}
                          className={`w-full bg-transparent text-sm font-medium outline-none ${
                            card.done ? 'text-neutral-500 line-through' : 'text-white'
                          }`}
                        />
                        {(editingCard === card.id || card.description) && (
                          <textarea
                            value={card.description}
                            onChange={(e) => updateCard(card.id, { description: e.target.value })}
                            placeholder="Descrição curta…"
                            rows={2}
                            className="mt-1 w-full resize-none bg-transparent text-xs text-neutral-400 outline-none placeholder:text-neutral-600"
                          />
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <input
                            type="date"
                            value={card.date ?? ''}
                            onChange={(e) => updateCard(card.id, { date: e.target.value })}
                            className={`rounded-md border bg-transparent px-1.5 py-0.5 text-[10px] outline-none ${
                              isOverdue(card) ? 'border-red-500/40 text-red-400' : 'border-line text-neutral-400'
                            }`}
                          />
                          <button
                            onClick={() => updateCard(card.id, { done: !card.done })}
                            className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] transition ${
                              card.done
                                ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
                                : 'border-line text-neutral-500 hover:text-neutral-300'
                            }`}
                          >
                            <Check size={10} /> {card.done ? 'Feito' : 'Concluir'}
                          </button>
                          <LabelPicker
                            onPick={(color) =>
                              updateCard(card.id, {
                                labels: [...card.labels, { text: color, color }],
                              })
                            }
                            onClear={() => updateCard(card.id, { labels: [] })}
                          />
                          <button
                            onClick={() =>
                              setEditingCard((v) => (v === card.id ? null : card.id))
                            }
                            className="text-[10px] text-neutral-600 hover:text-neutral-300"
                          >
                            {card.description ? '' : 'descrição'}
                          </button>
                          <button
                            onClick={() => removeCard(card.id)}
                            className="ml-auto text-neutral-600 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <button
              onClick={() => addCard(col.id)}
              className="mt-2 flex items-center justify-center gap-1 rounded-xl border border-dashed border-line py-2 text-xs text-neutral-500 transition hover:border-brand/60 hover:text-brand"
            >
              <Plus size={14} /> Adicionar card
            </button>
          </div>
        );
      })}

      <button
        onClick={addColumn}
        className="flex h-12 w-64 shrink-0 items-center justify-center gap-1 rounded-2xl border border-dashed border-line text-sm text-neutral-500 transition hover:border-brand/60 hover:text-brand"
      >
        <Plus size={16} /> Nova coluna
      </button>
    </div>
  );
}

function LabelPicker({
  onPick,
  onClear,
}: {
  onPick: (color: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-md border border-line px-1.5 py-0.5 text-[10px] text-neutral-500 hover:text-neutral-300"
      >
        <Tag size={10} />
      </button>
      {open && (
        <div className="absolute left-0 top-6 z-20 flex items-center gap-1 rounded-lg border border-line bg-panel p-1.5 shadow-card">
          {LABEL_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                onPick(c);
                setOpen(false);
              }}
              className={`h-4 w-4 rounded-full ${LABEL_BG[c]}`}
            />
          ))}
          <button onClick={onClear} className="text-neutral-500 hover:text-red-400">
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
