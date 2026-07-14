export const brl = (v: number | string | null | undefined) =>
  Number(v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const num = (v: number | string | null | undefined) =>
  Number(v ?? 0).toLocaleString('pt-BR');

export const pct = (v: number | string | null | undefined) =>
  `${(Number(v ?? 0) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;

export const dateTime = (v: string | Date) =>
  new Date(v).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
