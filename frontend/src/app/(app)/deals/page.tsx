'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Handshake, Sparkles, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AffiliatesTab } from '@/components/deals/AffiliatesTab';
import { CreatorsTab } from '@/components/deals/CreatorsTab';

type TabKey = 'afiliados' | 'creators';

const TABS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: 'afiliados', label: 'Afiliados', icon: Handshake },
  { key: 'creators', label: 'Creators', icon: Sparkles },
];

export default function DealsPage() {
  const [tab, setTab] = useState<TabKey>('afiliados');
  const [hydrated, setHydrated] = useState(false);

  // Estado persistente (localStorage) só resolve no cliente.
  useEffect(() => setHydrated(true), []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Deals & Creators</h1>
        <p className="text-sm text-neutral-500">
          Gestão de deals e creators — tudo editável inline e salvo automaticamente.
        </p>
      </div>

      {/* Navegação por abas com indicador animado (shared layout) */}
      <div className="mb-6 inline-flex rounded-2xl border border-line bg-panel/60 p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
              tab === key ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {tab === key && (
              <motion.span
                layoutId="deals-tab"
                className="absolute inset-0 rounded-xl bg-brand/20 ring-1 ring-brand/40"
                transition={{ type: 'spring', stiffness: 400, damping: 34 }}
              />
            )}
            <Icon size={16} className={`relative z-10 ${tab === key ? 'text-brand' : ''}`} />
            <span className="relative z-10">{label}</span>
          </button>
        ))}
      </div>

      {!hydrated ? (
        <div className="grid h-40 place-items-center text-sm text-neutral-600">Carregando…</div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {tab === 'afiliados' && <AffiliatesTab />}
            {tab === 'creators' && <CreatorsTab />}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
