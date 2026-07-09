import { Injectable } from '@nestjs/common';
import { periodRange } from '../common/date-filter';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Agrega todos os indicadores dos cards do dashboard.
   * Filtros: período (hoje/ontem/semana/mês/ano/personalizado),
   * categoria (creator/cassino/sportsbook/todos) e status (ativos/inativos/todos).
   */
  async overview(q: {
    period?: string;
    from?: string;
    to?: string;
    category?: string;
    status?: string;
  }) {
    const date = periodRange(q.period, q.from, q.to);
    const affiliateWhere: any = {};
    if (q.category && q.category !== 'TODOS') {
      affiliateWhere.categories = { some: { category: q.category } };
    }
    if (q.status && q.status !== 'TODOS') affiliateWhere.status = q.status;
    if (date) affiliateWhere.updatedAt = date;

    const [affiliates, byCategory, expensesAgg] = await Promise.all([
      this.prisma.affiliate.findMany({ where: affiliateWhere, include: { categories: true } }),
      this.prisma.affiliateCategory.groupBy({ by: ['category'], _count: true }),
      this.prisma.expense.aggregate({ where: date ? { date } : {}, _sum: { amount: true } }),
    ]);

    const sum = (f: string) => affiliates.reduce((acc, a: any) => acc + Number(a[f] ?? 0), 0);
    const count = (cat: string) =>
      byCategory.find((c) => c.category === cat)?._count ?? 0;

    const registrations = sum('registrations');
    const ftd = sum('ftd');
    const netPl = sum('netPl');
    const commission = sum('commission');
    const trafficInvestment = sum('trafficInvestment');
    const otherCosts = sum('otherCosts');
    const investment = trafficInvestment + otherCosts + commission;
    const profit = netPl - investment;
    const expenses = Number(expensesAgg._sum.amount ?? 0);

    return {
      totalAffiliates: affiliates.length,
      creators: count('CREATOR'),
      casino: count('CASSINO'),
      sportsbook: count('SPORTSBOOK'),
      registrations,
      deposits: sum('deposits'),
      ftd,
      volume: sum('volume'),
      netPl,
      investment,
      commission,
      profit,
      roi: investment > 0 ? profit / investment : 0,
      cac: registrations > 0 ? investment / registrations : 0,
      cpa: ftd > 0 ? investment / ftd : 0,
      expenses,
      netProfit: profit - expenses,
    };
  }

  /** Série temporal para os gráficos (Recharts). */
  async series(q: { period?: string; from?: string; to?: string }) {
    const date = periodRange(q.period ?? 'mes', q.from, q.to);
    const where = date ? { date } : {};
    const [deposits, registrations, netPl] = await Promise.all([
      this.prisma.deposit.findMany({ where, orderBy: { date: 'asc' } }),
      this.prisma.registration.findMany({ where, orderBy: { date: 'asc' } }),
      this.prisma.netPlEntry.findMany({ where, orderBy: { date: 'asc' } }),
    ]);
    const bucket = new Map<string, { date: string; deposits: number; registrations: number; netPl: number }>();
    const key = (d: Date) => d.toISOString().slice(0, 10);
    const get = (k: string) => {
      if (!bucket.has(k)) bucket.set(k, { date: k, deposits: 0, registrations: 0, netPl: 0 });
      return bucket.get(k)!;
    };
    deposits.forEach((d) => (get(key(d.date)).deposits += Number(d.amount)));
    registrations.forEach((r) => (get(key(r.date)).registrations += r.count));
    netPl.forEach((n) => (get(key(n.date)).netPl += Number(n.amount)));
    return [...bucket.values()].sort((a, b) => a.date.localeCompare(b.date));
  }
}
