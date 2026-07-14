'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ListTodo, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { KanbanTab } from '@/components/deals/KanbanTab';
import { useDeals } from '@/lib/deals-store';

/**
 * Trello pessoal: quadro simples de tarefas para não perder nem esquecer nada.
 * Entrada rápida no topo (Enter cria o card na primeira coluna) e
 * resumo de pendências/vencidas. Tudo salvo automaticamente no navegador.
 */
export default function TrelloPage() {
  const { columns, cards, addCard, updateCard } = useDeals();
  const [quick, setQuick] = useState('');
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const pending = cards.filter((c) => !c.done).length;
  const overdue = cards.filter(
    (c) => c.date && !c.done && new Date(c.date).getTime() < Date.now(),
  ).length;
  const done = cards.filter((c) => c.done).length;

  // Entrada rápida: cria o card na primeira coluna já com o título digitado.
  function quickAdd() {
    const title = quick.trim();
    const firstCol = columns[0];
    if (!title || !firstCol) return;
    addCard(firstCol.id);
    // O card recém-criado é o último do array — renomeia para o título digitado.
    const state = useDeals.getState();
    const created = state.cards[state.cards.length - 1];
    if (created) updateCard(created.id, { title });
    setQuick('');
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Trello</h1>
          <p className="text-sm text-neutral-500">
            Seu quadro pessoal de tarefas — anote aqui pra não esquecer de nada.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel/60 px-3 py-1.5 text-neutral-300">
            <ListTodo size={13} className="text-brand" /> {pending} pendente{pending === 1 ? '' : 's'}
          </span>
          {overdue > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-red-400">
              <AlertTriangle size={13} /> {overdue} vencida{overdue === 1 ? '' : 's'}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-400">
            <CheckCircle2 size={13} /> {done} feita{done === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Entrada rápida de tarefa */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-2"
      >
        <div className="relative flex-1">
          <Plus size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand" />
          <input
            value={quick}
            onChange={(e) => setQuick(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && quickAdd()}
            placeholder="Digite uma tarefa e aperte Enter — ela entra na primeira coluna…"
            className="input pl-10"
          />
        </div>
        <button onClick={quickAdd} disabled={!quick.trim()} className="btn-brand">
          Adicionar
        </button>
      </motion.div>

      {!hydrated ? (
        <div className="grid h-40 place-items-center text-sm text-neutral-600">Carregando…</div>
      ) : (
        <KanbanTab />
      )}
    </div>
  );
}
