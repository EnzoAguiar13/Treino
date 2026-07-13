'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Creator,
  Deal,
  Deliverable,
  ExtraField,
  KanbanCard,
  KanbanColumn,
} from './deals-types';

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

function emptyDeal(): Deal {
  return {
    id: uid(),
    dealId: '',
    pipefy: false,
    contractStatus: 'EM_NEGOCIACAO',
    dueDate: '',
    aditivo: false,
    contact: '',
    segment: '',
    socials: [],
    hasTraffic: false,
    dealValue: 0,
    exclusive: false,
    notes: '',
    createdAt: Date.now(),
  };
}

interface DealsState {
  deals: Deal[];
  creators: Creator[];
  columns: KanbanColumn[];
  cards: KanbanCard[];

  // Afiliados
  addDeal: () => string;
  updateDeal: (id: string, patch: Partial<Deal>) => void;
  removeDeal: (id: string) => void;

  // Creators
  addCreator: () => string;
  updateCreator: (id: string, patch: Partial<Creator>) => void;
  removeCreator: (id: string) => void;
  addDeliverable: (creatorId: string) => void;
  updateDeliverable: (creatorId: string, d: Deliverable) => void;
  removeDeliverable: (creatorId: string, deliverableId: string) => void;
  addExtraField: (creatorId: string) => void;
  updateExtraField: (creatorId: string, f: ExtraField) => void;
  removeExtraField: (creatorId: string, fieldId: string) => void;

  // Kanban
  addColumn: () => void;
  updateColumn: (id: string, patch: Partial<KanbanColumn>) => void;
  removeColumn: (id: string) => void;
  addCard: (columnId: string) => void;
  updateCard: (id: string, patch: Partial<KanbanCard>) => void;
  removeCard: (id: string) => void;
  moveCard: (cardId: string, toColumnId: string, toIndex?: number) => void;
}

export const useDeals = create<DealsState>()(
  persist(
    (set, get) => ({
      deals: [],
      creators: [],
      columns: [
        { id: uid(), title: 'A Fazer' },
        { id: uid(), title: 'Fazendo' },
        { id: uid(), title: 'Feito', autoDone: true },
      ],
      cards: [],

      addDeal: () => {
        const deal = emptyDeal();
        set((s) => ({ deals: [deal, ...s.deals] }));
        return deal.id;
      },
      updateDeal: (id, patch) =>
        set((s) => ({ deals: s.deals.map((d) => (d.id === id ? { ...d, ...patch } : d)) })),
      removeDeal: (id) => set((s) => ({ deals: s.deals.filter((d) => d.id !== id) })),

      addCreator: () => {
        const creator: Creator = { ...emptyDeal(), deliverables: [], extraFields: [] };
        set((s) => ({ creators: [creator, ...s.creators] }));
        return creator.id;
      },
      updateCreator: (id, patch) =>
        set((s) => ({
          creators: s.creators.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      removeCreator: (id) => set((s) => ({ creators: s.creators.filter((c) => c.id !== id) })),

      addDeliverable: (creatorId) =>
        set((s) => ({
          creators: s.creators.map((c) =>
            c.id === creatorId
              ? {
                  ...c,
                  deliverables: [
                    ...c.deliverables,
                    { id: uid(), title: '', status: 'A_FAZER' as const },
                  ],
                }
              : c,
          ),
        })),
      updateDeliverable: (creatorId, d) =>
        set((s) => ({
          creators: s.creators.map((c) =>
            c.id === creatorId
              ? { ...c, deliverables: c.deliverables.map((x) => (x.id === d.id ? d : x)) }
              : c,
          ),
        })),
      removeDeliverable: (creatorId, deliverableId) =>
        set((s) => ({
          creators: s.creators.map((c) =>
            c.id === creatorId
              ? { ...c, deliverables: c.deliverables.filter((x) => x.id !== deliverableId) }
              : c,
          ),
        })),

      addExtraField: (creatorId) =>
        set((s) => ({
          creators: s.creators.map((c) =>
            c.id === creatorId
              ? { ...c, extraFields: [...c.extraFields, { id: uid(), label: '', value: '' }] }
              : c,
          ),
        })),
      updateExtraField: (creatorId, f) =>
        set((s) => ({
          creators: s.creators.map((c) =>
            c.id === creatorId
              ? { ...c, extraFields: c.extraFields.map((x) => (x.id === f.id ? f : x)) }
              : c,
          ),
        })),
      removeExtraField: (creatorId, fieldId) =>
        set((s) => ({
          creators: s.creators.map((c) =>
            c.id === creatorId
              ? { ...c, extraFields: c.extraFields.filter((x) => x.id !== fieldId) }
              : c,
          ),
        })),

      addColumn: () =>
        set((s) => ({ columns: [...s.columns, { id: uid(), title: 'Nova coluna' }] })),
      updateColumn: (id, patch) =>
        set((s) => ({ columns: s.columns.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      removeColumn: (id) =>
        set((s) => ({
          columns: s.columns.filter((c) => c.id !== id),
          cards: s.cards.filter((c) => c.columnId !== id),
        })),

      addCard: (columnId) =>
        set((s) => {
          const col = s.columns.find((c) => c.id === columnId);
          return {
            cards: [
              ...s.cards,
              {
                id: uid(),
                columnId,
                title: 'Novo card',
                description: '',
                labels: [],
                done: !!col?.autoDone,
              },
            ],
          };
        }),
      updateCard: (id, patch) =>
        set((s) => ({ cards: s.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      removeCard: (id) => set((s) => ({ cards: s.cards.filter((c) => c.id !== id) })),

      // Automação: mover para uma coluna autoDone marca o card como concluído.
      moveCard: (cardId, toColumnId, toIndex) => {
        const { cards, columns } = get();
        const card = cards.find((c) => c.id === cardId);
        if (!card) return;
        const col = columns.find((c) => c.id === toColumnId);
        const others = cards.filter((c) => c.id !== cardId);
        const inTarget = others.filter((c) => c.columnId === toColumnId);
        const rest = others.filter((c) => c.columnId !== toColumnId);
        const moved: KanbanCard = {
          ...card,
          columnId: toColumnId,
          done: col?.autoDone ? true : card.done,
        };
        const idx = toIndex ?? inTarget.length;
        inTarget.splice(idx, 0, moved);
        set({ cards: [...rest, ...inTarget] });
      },
    }),
    { name: 'esportivabet-deals', skipHydration: false },
  ),
);
