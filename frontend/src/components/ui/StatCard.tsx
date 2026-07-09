'use client';

import { motion } from 'framer-motion';

export function StatCard({
  label,
  value,
  hint,
  index = 0,
}: {
  label: string;
  value: string;
  hint?: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.03 }}
      whileHover={{ y: -3 }}
      className="card p-4"
    >
      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="mt-1.5 truncate text-xl font-semibold text-white">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-brand">{hint}</p>}
    </motion.div>
  );
}
