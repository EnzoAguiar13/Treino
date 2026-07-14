export type Category =
  | 'CREATOR'
  | 'CASSINO'
  | 'SPORTSBOOK'
  | 'INFLUENCER'
  | 'STREAMER'
  | 'TIPSTER'
  | 'TRADER';

export type SocialNetwork =
  | 'INSTAGRAM'
  | 'TIKTOK'
  | 'YOUTUBE'
  | 'TELEGRAM'
  | 'WHATSAPP'
  | 'DISCORD'
  | 'FACEBOOK'
  | 'TWITTER'
  | 'KWAI'
  | 'SITE'
  | 'LINKTREE';

export interface SocialAccount {
  id?: string;
  network: SocialNetwork;
  handle: string;
  url?: string;
  followers?: number;
  connected?: boolean;
}

export interface Affiliate {
  id: string;
  externalId: string;
  name: string;
  status: 'ATIVO' | 'INATIVO';
  registrations: number;
  ftd: number;
  deposits: string | number;
  volume: string | number;
  netPl: string | number;
  ggr: string | number;
  commission: string | number;
  cpa: string | number;
  revShare: string | number;
  fixedCost: string | number;
  otherCosts: string | number;
  trafficInvestment: string | number;
  roi: string | number;
  cac: string | number;
  profit: string | number;
  ggrMargin: string | number;
  notes: string;
  categories: { id: string; category: Category }[];
  socialAccounts: SocialAccount[];
  agreement?: { content: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardOverview {
  totalAffiliates: number;
  creators: number;
  casino: number;
  sportsbook: number;
  registrations: number;
  deposits: number;
  ftd: number;
  volume: number;
  netPl: number;
  ggr: number;
  ggrMargin: number;
  investment: number;
  commission: number;
  profit: number;
  roi: number;
  cac: number;
  cpa: number;
  expenses: number;
  netProfit: number;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roleLabel: string;
  permissions: string[];
}
