// Tipos do workspace "Deals" (Afiliados · Creators · Trello).
// Toda a informação vive em estado local persistente (localStorage) — não some ao recarregar.

export type ContractStatus = 'ATIVO' | 'EM_NEGOCIACAO' | 'ENCERRADO' | 'PAUSADO';

export const CONTRACT_STATUS: { value: ContractStatus; label: string; tone: string }[] = [
  { value: 'ATIVO', label: 'Ativo', tone: 'emerald' },
  { value: 'EM_NEGOCIACAO', label: 'Em negociação', tone: 'amber' },
  { value: 'PAUSADO', label: 'Pausado', tone: 'sky' },
  { value: 'ENCERRADO', label: 'Encerrado', tone: 'neutral' },
];

// Redes suportadas — só aparece o ícone da rede que existir no afiliado.
export type SocialNetwork =
  | 'INSTAGRAM'
  | 'TELEGRAM'
  | 'WHATSAPP'
  | 'YOUTUBE'
  | 'TIKTOK'
  | 'TWITTER'
  | 'DISCORD'
  | 'SITE';

export const SOCIAL_NETWORKS: { value: SocialNetwork; label: string }[] = [
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'TELEGRAM', label: 'Telegram' },
  { value: 'WHATSAPP', label: 'Grupo de WhatsApp' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'TIKTOK', label: 'TikTok' },
  { value: 'TWITTER', label: 'Twitter / X' },
  { value: 'DISCORD', label: 'Discord' },
  { value: 'SITE', label: 'Site' },
];

export interface Social {
  network: SocialNetwork;
  value: string; // @ ou URL/nome
}

export interface Deal {
  id: string; // chave interna (uuid)
  dealId: string; // identificador da deal exibido
  pipefy: boolean; // checagem Pipefy: feito / pendente
  contractStatus: ContractStatus;
  dueDate: string; // vencimento (ISO date)
  aditivo: boolean; // controle de aditivo
  contact: string; // ponto de contato
  segment: string; // segmentação / nicho
  socials: Social[];
  hasTraffic: boolean;
  dealValue: number; // R$
  exclusive: boolean;
  notes: string;
  createdAt: number;
}

export type DeliverableStatus = 'A_FAZER' | 'EM_PRODUCAO' | 'ENTREGUE';

export const DELIVERABLE_STATUS: { value: DeliverableStatus; label: string; tone: string }[] = [
  { value: 'A_FAZER', label: 'A fazer', tone: 'neutral' },
  { value: 'EM_PRODUCAO', label: 'Em produção', tone: 'amber' },
  { value: 'ENTREGUE', label: 'Entregue', tone: 'emerald' },
];

export interface Deliverable {
  id: string;
  title: string;
  status: DeliverableStatus;
  date?: string;
  notes?: string;
}

export interface ExtraField {
  id: string;
  label: string;
  value: string;
}

export interface Creator extends Deal {
  deliverables: Deliverable[];
  extraFields: ExtraField[];
}

// ---------- Trello / Kanban ----------

export interface KanbanLabel {
  text: string;
  color: string; // classe de cor tailwind base (ex.: 'emerald')
}

export interface KanbanCard {
  id: string;
  columnId: string;
  title: string;
  description: string;
  labels: KanbanLabel[];
  date?: string;
  done: boolean;
}

export interface KanbanColumn {
  id: string;
  title: string;
  // Quando definido, mover um card para esta coluna marca-o como concluído automaticamente.
  autoDone?: boolean;
}
