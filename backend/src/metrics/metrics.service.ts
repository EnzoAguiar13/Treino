import { Injectable } from '@nestjs/common';
import { AuditService, RequestContext } from '../common/audit.service';
import { periodRange } from '../common/date-filter';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

type Panel = 'creator' | 'casino' | 'sportsbook';

@Injectable()
export class MetricsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private realtime: RealtimeGateway,
  ) {}

  private model(panel: Panel) {
    return {
      creator: this.prisma.creatorMetric,
      casino: this.prisma.casinoMetric,
      sportsbook: this.prisma.sportsbookMetric,
    }[panel] as any;
  }

  list(panel: Panel, q: { affiliateId?: string; period?: string; from?: string; to?: string }) {
    const date = periodRange(q.period, q.from, q.to);
    return this.model(panel).findMany({
      where: {
        ...(q.affiliateId ? { affiliateId: q.affiliateId } : {}),
        ...(date ? { date } : {}),
      },
      include: { affiliate: { select: { id: true, name: true, externalId: true, status: true } } },
      orderBy: { date: 'desc' },
    });
  }

  /** Resumo agregado do painel (cards do topo). */
  async summary(panel: Panel, q: { period?: string; from?: string; to?: string }) {
    const rows = await this.list(panel, q);
    const sum = (field: string) =>
      rows.reduce((acc: number, r: any) => acc + Number(r[field] ?? 0), 0);
    if (panel === 'creator') {
      return {
        followers: sum('followers'),
        stories: sum('stories'),
        reels: sum('reels'),
        posts: sum('posts'),
        views: sum('views'),
        clicks: sum('clicks'),
        registrations: sum('registrations'),
        ftd: sum('ftd'),
        deposits: sum('deposits'),
        volume: sum('volume'),
        netPl: sum('netPl'),
        commission: sum('commission'),
      };
    }
    if (panel === 'casino') {
      return {
        ftd: sum('ftd'),
        volume: sum('volume'),
        netPl: sum('netPl'),
        profit: sum('profit'),
        commission: sum('commission'),
        roi: sum('volume') > 0 ? sum('profit') / sum('volume') : 0,
      };
    }
    return {
      volume: sum('volume'),
      bets: sum('bets'),
      profit: sum('profit'),
      netPl: sum('netPl'),
      commission: sum('commission'),
      roi: sum('volume') > 0 ? sum('profit') / sum('volume') : 0,
    };
  }

  async create(panel: Panel, data: any, ctx: RequestContext) {
    const row = await this.model(panel).create({ data });
    await this.audit.log(ctx.userId, 'CRIAR', `${panel}_metric`, row.id, ctx.ip, ctx.device);
    this.realtime.emit(`${panel}.updated`, { id: row.id });
    this.realtime.emit('dashboard.updated');
    return row;
  }

  async update(panel: Panel, id: string, data: any, ctx: RequestContext) {
    const before = await this.model(panel).findUniqueOrThrow({ where: { id } });
    const row = await this.model(panel).update({ where: { id }, data });
    await this.audit.recordDiff(ctx, `${panel}_metric`, id, before, data);
    this.realtime.emit(`${panel}.updated`, { id });
    this.realtime.emit('dashboard.updated');
    return row;
  }

  async remove(panel: Panel, id: string, ctx: RequestContext) {
    await this.model(panel).delete({ where: { id } });
    await this.audit.log(ctx.userId, 'EXCLUIR', `${panel}_metric`, id, ctx.ip, ctx.device);
    this.realtime.emit(`${panel}.updated`, { id });
    this.realtime.emit('dashboard.updated');
    return { ok: true };
  }
}
