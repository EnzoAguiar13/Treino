'use client';

import { AnimatePresence } from 'framer-motion';
import { Handshake, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useDeals } from '@/lib/deals-store';
import { DealCard } from './DealCard';
import { EmptyState } from './EmptyState';

export function AffiliatesTab() {
  const { deals, addDeal, updateDeal, removeDeal } = useDeals();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return deals;
    return deals.filter((d) =>
      [d.dealId, d.contact, d.segment, d.contractStatus].join(' ').toLowerCase().includes(s),
    );
  }, [deals, q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por ID, contato, segmentação…"
            className="input pl-10"
          />
        </div>
        <button onClick={addDeal} className="btn-brand">
          <Plus size={16} /> Nova deal
        </button>
      </div>

      {deals.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="Nenhuma deal ainda"
          hint="Cadastre a primeira deal de afiliado — todos os campos são editáveis inline e ficam salvos no seu navegador."
          cta="Criar primeira deal"
          onCta={addDeal}
        />
      ) : (
        <div className="grid gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((deal, i) => (
              <DealCard
                key={deal.id}
                deal={deal}
                index={i}
                onChange={(patch) => updateDeal(deal.id, patch)}
                onRemove={() => removeDeal(deal.id)}
              />
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-neutral-600">
              Nenhuma deal corresponde à busca.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
