import { Injectable } from '@nestjs/common';
import { AuditService, RequestContext } from '../common/audit.service';
import { computeTrafficIndicators } from '../common/calc';
import { periodRange } from '../common/date-filter';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { TrafficDto } from './dto';

@Injectable()
export class TrafficService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private realtime: RealtimeGateway,
  ) {}

  list(q: { platform?: string; period?: string; from?: string; to?: string }) {
    const date = periodRange(q.period, q.from, q.to);
    return this.prisma.traffic.findMany({
      where: {
        ...(q.platform && q.platform !== 'TODOS' ? { platform: q.platform as any } : {}),
        ...(date ? { date } : {}),
      },
      include: { affiliate: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async summary(q: { period?: string; from?: string; to?: string }) {
    const rows = await this.list(q);
    const sum = (f: string) => rows.reduce((acc, r: any) => acc + Number(r[f] ?? 0), 0);
    const investment = sum('investment');
    const profit = sum('profit');
    return {
      investment,
      clicks: sum('clicks'),
      leads: sum('leads'),
      registrations: sum('registrations'),
      ftd: sum('ftd'),
      revenue: sum('revenue'),
      profit,
      cpa: sum('ftd') > 0 ? investment / sum('ftd') : 0,
      cac: sum('registrations') > 0 ? investment / sum('registrations') : 0,
      roi: investment > 0 ? profit / investment : 0,
    };
  }

  private withIndicators(dto: Partial<TrafficDto>, base?: any) {
    const merged = {
      investment: Number(dto.investment ?? base?.investment ?? 0),
      registrations: Number(dto.registrations ?? base?.registrations ?? 0),
      ftd: Number(dto.ftd ?? base?.ftd ?? 0),
      revenue: Number(dto.revenue ?? base?.revenue ?? 0),
    };
    return { ...dto, ...computeTrafficIndicators(merged) };
  }

  async create(dto: TrafficDto, ctx: RequestContext) {
    const row = await this.prisma.traffic.create({ data: this.withIndicators(dto) as any });
    await this.audit.log(ctx.userId, 'CRIAR', 'traffic', row.id, ctx.ip, ctx.device);
    this.realtime.emit('traffic.updated', { id: row.id });
    this.realtime.emit('dashboard.updated');
    return row;
  }

  async update(id: string, dto: Partial<TrafficDto>, ctx: RequestContext) {
    const before = await this.prisma.traffic.findUniqueOrThrow({ where: { id } });
    const row = await this.prisma.traffic.update({
      where: { id },
      data: this.withIndicators(dto, before) as any,
    });
    await this.audit.recordDiff(ctx, 'traffic', id, before as any, dto as any);
    this.realtime.emit('traffic.updated', { id });
    this.realtime.emit('dashboard.updated');
    return row;
  }

  async remove(id: string, ctx: RequestContext) {
    await this.prisma.traffic.delete({ where: { id } });
    await this.audit.log(ctx.userId, 'EXCLUIR', 'traffic', id, ctx.ip, ctx.device);
    this.realtime.emit('traffic.updated', { id });
    this.realtime.emit('dashboard.updated');
    return { ok: true };
  }
}
