'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { ReactNode } from 'react';

const TONES: Record<string, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  sky: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  neutral: 'bg-white/5 text-neutral-400 border-line',
  brand: 'bg-brand/15 text-brand border-brand/30',
  red: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export function Badge({ tone = 'neutral', children }: { tone?: string; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
        TONES[tone] ?? TONES.neutral
      }`}
    >
      {children}
    </span>
  );
}

/** Toggle pílula com animação de spring. */
export function Toggle({
  on,
  onToggle,
  labelOn = 'Sim',
  labelOff = 'Não',
}: {
  on: boolean;
  onToggle: () => void;
  labelOn?: string;
  labelOff?: string;
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 rounded-full border px-1 py-1 pr-2.5 text-[11px] font-medium transition ${
        on ? TONES.emerald : TONES.neutral
      }`}
    >
      <span
        className={`grid h-4 w-4 place-items-center rounded-full ${
          on ? 'bg-emerald-400 text-black' : 'bg-neutral-700 text-transparent'
        }`}
      >
        <Check size={11} strokeWidth={3} />
      </span>
      {on ? labelOn : labelOff}
    </button>
  );
}

/** Campo de texto/número editável inline com salvamento imediato no store. */
export function InlineField({
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
  prefix,
}: {
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'date';
  className?: string;
  prefix?: string;
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {prefix && <span className="text-xs text-neutral-500">{prefix}</span>}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-sm text-white outline-none transition placeholder:text-neutral-600 hover:border-line focus:border-brand/60 focus:bg-ink"
      />
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
      {children}
    </span>
  );
}

export const MotionCard = motion.div;
