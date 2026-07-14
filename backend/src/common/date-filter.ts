export type PeriodKey = 'hoje' | 'ontem' | 'semana' | 'mes' | 'ano' | 'personalizado' | 'todos';

export function periodRange(
  period?: string,
  from?: string,
  to?: string,
): { gte?: Date; lte?: Date } | undefined {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  switch (period as PeriodKey) {
    case 'hoje':
      return { gte: startOfDay(now) };
    case 'ontem': {
      const y = startOfDay(new Date(now.getTime() - 86_400_000));
      return { gte: y, lte: startOfDay(now) };
    }
    case 'semana': {
      const d = startOfDay(now);
      d.setDate(d.getDate() - d.getDay());
      return { gte: d };
    }
    case 'mes':
      return { gte: new Date(now.getFullYear(), now.getMonth(), 1) };
    case 'ano':
      return { gte: new Date(now.getFullYear(), 0, 1) };
    case 'personalizado':
      return {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      };
    default:
      return undefined;
  }
}
