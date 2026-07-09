'use client';

import { useFilters } from '@/lib/filters-store';

const PERIODS = [
  ['hoje', 'Hoje'],
  ['ontem', 'Ontem'],
  ['semana', 'Semana'],
  ['mes', 'Mês'],
  ['ano', 'Ano'],
  ['personalizado', 'Personalizado'],
  ['todos', 'Todos'],
] as const;

const CATEGORIES = [
  ['TODOS', 'Todos'],
  ['CREATOR', 'Creator'],
  ['CASSINO', 'Cassino'],
  ['SPORTSBOOK', 'Sportsbook'],
] as const;

const STATUSES = [
  ['TODOS', 'Todos'],
  ['ATIVO', 'Ativos'],
  ['INATIVO', 'Inativos'],
] as const;

export function FiltersBar() {
  const f = useFilters();
  return (
    <div className="card mb-6 flex flex-wrap items-center gap-2 p-3">
      <div className="flex flex-wrap gap-1.5">
        {PERIODS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => f.set({ period: key })}
            className={`chip ${f.period === key ? 'chip-active' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>
      {f.period === 'personalizado' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={f.from ?? ''}
            onChange={(e) => f.set({ from: e.target.value })}
            className="input w-auto py-1 text-xs"
          />
          <span className="text-xs text-neutral-500">até</span>
          <input
            type="date"
            value={f.to ?? ''}
            onChange={(e) => f.set({ to: e.target.value })}
            className="input w-auto py-1 text-xs"
          />
        </div>
      )}
      <span className="mx-1 hidden h-5 w-px bg-line sm:block" />
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map(([key, label]) => (
          <button
            key={key}
            onClick={() => f.set({ category: key })}
            className={`chip ${f.category === key ? 'chip-active' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>
      <span className="mx-1 hidden h-5 w-px bg-line sm:block" />
      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map(([key, label]) => (
          <button
            key={key}
            onClick={() => f.set({ status: key })}
            className={`chip ${f.status === key ? 'chip-active' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
