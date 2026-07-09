import { BadRequestException, Injectable } from '@nestjs/common';
import { AuditService, RequestContext } from '../common/audit.service';
import { periodRange } from '../common/date-filter';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

export type FinanceResource = 'commissions' | 'expenses' | 'deposits' | 'registrations' | 'netpl';

@Injectable()
export class FinanceService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private realtime: RealtimeGateway,
  ) {}

  private model(resource: FinanceResource) {
    const map = {
      commissions: this.prisma.commission,
      expenses: this.prisma.expense,
      deposits: this.prisma.deposit,
      registrations: this.prisma.registration,
      netpl: this.prisma.netPlEntry,
    } as const;
    const model = map[resource];
    if (!model) throw new BadRequestException('Recurso financeiro inválido');
    return model as any;
  }

  list(
    resource: FinanceResource,
    q: { affiliateId?: string; period?: string; from?: string; to?: string },
  ) {
    const date = periodRange(q.period, q.from, q.to);
    return this.model(resource).findMany({
      where: {
        ...(q.affiliateId ? { affiliateId: q.affiliateId } : {}),
        ...(date ? { date } : {}),
      },
      include: { affiliate: { select: { id: true, name: true, externalId: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async summary(q: { period?: string; from?: string; to?: string }) {
    const date = periodRange(q.period, q.from, q.to);
    const where = date ? { date } : {};
    const [commissions, expenses, deposits, registrations, netPl] = await Promise.all([
      this.prisma.commission.aggregate({ where, _sum: { amount: true } }),
      this.prisma.expense.aggregate({ where, _sum: { amount: true } }),
      this.prisma.deposit.aggregate({ where, _sum: { amount: true }, _count: true }),
      this.prisma.registration.aggregate({ where, _sum: { count: true } }),
      this.prisma.netPlEntry.aggregate({ where, _sum: { amount: true } }),
    ]);
    const totalCommissions = Number(commissions._sum.amount ?? 0);
    const totalExpenses = Number(expenses._sum.amount ?? 0);
    const totalNetPl = Number(netPl._sum.amount ?? 0);
    return {
      commissions: totalCommissions,
      expenses: totalExpenses,
      deposits: Number(deposits._sum.amount ?? 0),
      depositCount: deposits._count,
      registrations: Number(registrations._sum.count ?? 0),
      netPl: totalNetPl,
      netProfit: totalNetPl - totalCommissions - totalExpenses,
    };
  }

  async create(resource: FinanceResource, data: any, ctx: RequestContext) {
    const row = await this.model(resource).create({ data });
    await this.audit.log(ctx.userId, 'CRIAR', resource, row.id, ctx.ip, ctx.device);
    this.realtime.emit('finance.updated', { resource, id: row.id });
    this.realtime.emit('dashboard.updated');
    return row;
  }

  async update(resource: FinanceResource, id: string, data: any, ctx: RequestContext) {
    const before = await this.model(resource).findUniqueOrThrow({ where: { id } });
    const row = await this.model(resource).update({ where: { id }, data });
    await this.audit.recordDiff(ctx, resource, id, before, data);
    this.realtime.emit('finance.updated', { resource, id });
    this.realtime.emit('dashboard.updated');
    return row;
  }

  async remove(resource: FinanceResource, id: string, ctx: RequestContext) {
    await this.model(resource).delete({ where: { id } });
    await this.audit.log(ctx.userId, 'EXCLUIR', resource, id, ctx.ip, ctx.device);
    this.realtime.emit('finance.updated', { resource, id });
    this.realtime.emit('dashboard.updated');
    return { ok: true };
  }
}
