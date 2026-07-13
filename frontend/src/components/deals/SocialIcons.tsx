'use client';

import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { SOCIAL_NETWORKS, type Social, type SocialNetwork } from '@/lib/deals-types';
import { SOCIAL_META } from './social';

/**
 * Mostra apenas o ícone de cada rede existente. Hover revela o @/nome;
 * clique abre o link. No modo edição, permite adicionar/remover redes.
 */
export function SocialIcons({
  socials,
  onChange,
  editing,
}: {
  socials: Social[];
  onChange?: (socials: Social[]) => void;
  editing?: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const used = new Set(socials.map((s) => s.network));
  const available = SOCIAL_NETWORKS.filter((n) => !used.has(n.value));

  function setValue(network: SocialNetwork, value: string) {
    onChange?.(socials.map((s) => (s.network === network ? { ...s, value } : s)));
  }
  function add(network: SocialNetwork) {
    onChange?.([...socials, { network, value: '' }]);
    setAdding(false);
  }
  function remove(network: SocialNetwork) {
    onChange?.(socials.filter((s) => s.network !== network));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {socials.map(({ network, value }) => {
        const { Icon, color, href } = SOCIAL_META[network];
        return (
          <div key={network} className="group/soc relative">
            <motion.a
              href={editing ? undefined : href(value)}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -2, scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-ink/60 text-neutral-300 transition-colors"
              style={{ ['--soc' as string]: color }}
              onMouseEnter={(e) => (e.currentTarget.style.color = color)}
              onMouseLeave={(e) => (e.currentTarget.style.color = '')}
            >
              <Icon size={16} />
            </motion.a>
            {/* Tooltip com @/nome */}
            {value && !editing && (
              <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-line bg-panel px-2 py-1 text-[10px] text-neutral-200 opacity-0 shadow-card transition group-hover/soc:opacity-100">
                {value}
              </span>
            )}
            {editing && (
              <>
                <input
                  value={value}
                  onChange={(e) => setValue(network, e.target.value)}
                  placeholder="@ / link"
                  className="mt-1 w-24 rounded-lg border border-line bg-ink px-2 py-1 text-[11px] outline-none focus:border-brand/60"
                />
                <button
                  onClick={() => remove(network)}
                  className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-red-500/80 text-white"
                >
                  <X size={10} />
                </button>
              </>
            )}
          </div>
        );
      })}

      {editing && available.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setAdding((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-dashed border-line text-neutral-500 transition hover:border-brand/60 hover:text-brand"
          >
            <Plus size={16} />
          </button>
          {adding && (
            <div className="absolute left-0 top-11 z-20 w-40 rounded-xl border border-line bg-panel p-1 shadow-card">
              {available.map((n) => {
                const { Icon } = SOCIAL_META[n.value];
                return (
                  <button
                    key={n.value}
                    onClick={() => add(n.value)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-neutral-300 hover:bg-white/5"
                  >
                    <Icon size={14} /> {n.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {socials.length === 0 && !editing && (
        <span className="text-[11px] text-neutral-600">—</span>
      )}
    </div>
  );
}
