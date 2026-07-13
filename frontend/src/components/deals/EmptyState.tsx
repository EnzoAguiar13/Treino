'use client';

import { motion } from 'framer-motion';
import { LucideIcon, Plus } from 'lucide-react';

export function EmptyState({
  icon: Icon,
  title,
  hint,
  cta,
  onCta,
}: {
  icon: LucideIcon;
  title: string;
  hint: string;
  cta: string;
  onCta: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid place-items-center rounded-2xl border border-dashed border-line bg-panel/40 px-6 py-16 text-center"
    >
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand/10 text-brand">
        <Icon size={28} />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-neutral-500">{hint}</p>
      <button onClick={onCta} className="btn-brand mt-5">
        <Plus size={16} /> {cta}
      </button>
    </motion.div>
  );
}
