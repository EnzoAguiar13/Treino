'use client';

import { create } from 'zustand';

export interface Filters {
  period: 'hoje' | 'ontem' | 'semana' | 'mes' | 'ano' | 'personalizado' | 'todos';
  from?: string;
  to?: string;
  category: 'TODOS' | 'CREATOR' | 'CASSINO' | 'SPORTSBOOK';
  status: 'TODOS' | 'ATIVO' | 'INATIVO';
  search: string;
}

interface FiltersState extends Filters {
  set: (f: Partial<Filters>) => void;
}

export const useFilters = create<FiltersState>((set) => ({
  period: 'todos',
  category: 'TODOS',
  status: 'TODOS',
  search: '',
  set: (f) => set(f),
}));
