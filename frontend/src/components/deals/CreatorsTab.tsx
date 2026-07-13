'use client';

import { AnimatePresence } from 'framer-motion';
import { Plus, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useDeals } from '@/lib/deals-store';
import { DealCard } from './DealCard';
import { Deliverables } from './Deliverables';
import { EmptyState } from './EmptyState';

export function CreatorsTab() {
  const { creators, addCreator, updateCreator, removeCreator } = useDeals();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return creators;
    return creators.filter((c) =>
      [c.dealId, c.contact, c.segment].join(' ').toLowerCase().includes(s),
    );
  }, [creators, q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar creator…"
            className="input pl-10"
          />
        </div>
        <button onClick={addCreator} className="btn-brand">
          <Plus size={16} /> Novo creator
        </button>
      </div>

      {creators.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Nenhum creator ainda"
          hint="Creators têm os mesmos campos das deals, mais uma seção de entregas com progresso e campos extras personalizados."
          cta="Adicionar creator"
          onCta={addCreator}
        />
      ) : (
        <div className="grid gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((creator, i) => (
              <DealCard
                key={creator.id}
                deal={creator}
                index={i}
                onChange={(patch) => updateCreator(creator.id, patch)}
                onRemove={() => removeCreator(creator.id)}
              >
                <Deliverables creator={creator} />
              </DealCard>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-neutral-600">
              Nenhum creator corresponde à busca.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
