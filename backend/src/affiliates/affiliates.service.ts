import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditService, RequestContext } from '../common/audit.service';
import { computeIndicators } from '../common/calc';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateAffiliateDto, QueryAffiliatesDto, SocialAccountDto, UpdateAffiliateDto } from './dto';

const SOCIAL_BASE_URL: Record<string, (h: string) => string> = {
  INSTAGRAM: (h) => `https://instagram.com/${h.replace(/^@/, '')}`,
  TIKTOK: (h) => `https://tiktok.com/@${h.replace(/^@/, '')}`,
  YOUTUBE: (h) => `https://youtube.com/@${h.replace(/^@/, '')}`,
  TELEGRAM: (h) => `https://t.me/${h.replace(/^@/, '')}`,
  WHATSAPP: (h) => `https://wa.me/${h.replace(/\D/g, '')}`,
  DISCORD: (h) => (h.startsWith('http') ? h : `https://discord.gg/${h}`),
  FACEBOOK: (h) => `https://facebook.com/${h.replace(/^@/, '')}`,
  TWITTER: (h) => `https://x.com/${h.replace(/^@/, '')}`,
  KWAI: (h) => `https://kwai.com/@${h.replace(/^@/, '')}`,
  SITE: (h) => (h.startsWith('http') ? h : `https://${h}`),
  LINKTREE: (h) => (h.startsWith('http') ? h : `https://linktr.ee/${h.replace(/^@/, '')}`),
};

const FINANCIAL_FIELDS = [
  'registrations',
  'ftd',
  'deposits',
  'volume',
  'netPl',
  'cpa',
  'revShare',
  'fixedCost',
  'otherCosts',
  'trafficInvestment',
] as const;

@Injectable()
export class AffiliatesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private realtime: RealtimeGateway,
  ) {}

  private include = {
    categories: true,
    socialAccounts: true,
    agreement: true,
  } satisfies Prisma.AffiliateInclude;

  async findAll(q: QueryAffiliatesDto) {
    const where: Prisma.AffiliateWhereInput = {};
    if (q.search) {
      const s = q.search.trim();
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { externalId: { contains: s, mode: 'insensitive' } },
        { socialAccounts: { some: { handle: { contains: s, mode: 'insensitive' } } } },
        { categories: { some: { category: { in: this.matchCategories(s) } } } },
      ];
    }
    if (q.category && q.category !== 'TODOS') {
      where.categories = { some: { category: q.category as any } };
    }
    if (q.status && q.status !== 'TODOS') {
      where.status = q.status as any;
    }
    return this.prisma.affiliate.findMany({
      where,
      include: this.include,
      orderBy: { updatedAt: 'desc' },
    });
  }

  private matchCategories(s: string) {
    const upper = s.toUpperCase();
    return [
      'CREATOR',
      'CASSINO',
      'SPORTSBOOK',
      'INFLUENCER',
      'STREAMER',
      'TIPSTER',
      'TRADER',
    ].filter((c) => c.includes(upper)) as any[];
  }

  async findOne(id: string) {
    const affiliate = await this.prisma.affiliate.findUnique({
      where: { id },
      include: this.include,
    });
    if (!affiliate) throw new NotFoundException('Afiliado não encontrado');
    return affiliate;
  }

  async create(dto: CreateAffiliateDto, ctx: RequestContext) {
    const affiliate = await this.prisma.affiliate.create({
      data: {
        name: dto.name,
        externalId: dto.externalId,
        categories: { create: dto.categories.map((category) => ({ category })) },
        socialAccounts: {
          create: (dto.socialAccounts ?? []).map((s) => this.socialData(s)),
        },
        agreement: { create: { content: '' } },
      },
      include: this.include,
    });
    await this.audit.log(ctx.userId, 'CRIAR', 'affiliate', affiliate.id, ctx.ip, ctx.device);
    await this.audit.recordDiff(ctx, 'affiliate', affiliate.id, { criado: '' }, { criado: dto.name });
    this.realtime.emit('affiliate.created', { id: affiliate.id });
    this.realtime.emit('dashboard.updated');
    return affiliate;
  }

  private socialData(s: SocialAccountDto) {
    const url = s.url || (s.handle ? SOCIAL_BASE_URL[s.network]?.(s.handle) ?? '' : '');
    return {
      network: s.network as any,
      handle: s.handle,
      url,
      followers: s.followers ?? 0,
      connected: s.connected ?? false,
    };
  }

  /**
   * Auto save: o frontend envia PATCHes parciais a cada alteração de campo.
   * Recalcula indicadores, grava histórico imutável e emite atualização em tempo real.
   */
  async update(id: string, dto: UpdateAffiliateDto, ctx: RequestContext) {
    const current = await this.findOne(id);

    const data: Prisma.AffiliateUpdateInput = {};
    const scalarKeys = [
      'name',
      'externalId',
      'status',
      'notes',
      ...FINANCIAL_FIELDS,
    ] as const;
    for (const key of scalarKeys) {
      if (dto[key as keyof UpdateAffiliateDto] !== undefined) {
        (data as any)[key] = dto[key as keyof UpdateAffiliateDto];
      }
    }

    // Recalcular indicadores sempre que qualquer campo financeiro mudar
    const touchesFinance = FINANCIAL_FIELDS.some((f) => dto[f] !== undefined);
    if (touchesFinance) {
      const merged = Object.fromEntries(
        FINANCIAL_FIELDS.map((f) => [f, Number(dto[f] ?? current[f])]),
      ) as any;
      const ind = computeIndicators(merged);
      data.commission = ind.commission;
      data.roi = ind.roi;
      data.cac = ind.cac;
      data.profit = ind.profit;
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.categories) {
        await tx.affiliateCategory.deleteMany({ where: { affiliateId: id } });
        await tx.affiliateCategory.createMany({
          data: dto.categories.map((category) => ({ affiliateId: id, category: category as any })),
        });
      }
      if (dto.socialAccounts) {
        for (const s of dto.socialAccounts) {
          const payload = this.socialData(s);
          await tx.socialAccount.upsert({
            where: { affiliateId_network: { affiliateId: id, network: s.network as any } },
            update: payload,
            create: { ...payload, affiliateId: id },
          });
        }
      }
      if (dto.agreement !== undefined) {
        await tx.agreement.upsert({
          where: { affiliateId: id },
          update: { content: dto.agreement },
          create: { affiliateId: id, content: dto.agreement },
        });
      }
      return tx.affiliate.update({ where: { id }, data, include: this.include });
    });

    const newValues = Object.fromEntries(
      Object.entries(dto).filter(([, v]) => v !== undefined),
    ) as Record<string, unknown>;
    const oldValues: Record<string, unknown> = {
      ...(current as unknown as Record<string, unknown>),
      agreement: current.agreement?.content ?? '',
      categories: current.categories.map((c) => c.category).join(', '),
      socialAccounts: undefined,
    };
    if (dto.categories) newValues.categories = dto.categories.join(', ');
    delete newValues.socialAccounts;
    await this.audit.recordDiff(ctx, 'affiliate', id, oldValues, newValues);
    await this.audit.log(ctx.userId, 'ATUALIZAR', 'affiliate', id, ctx.ip, ctx.device);
    this.realtime.emit('affiliate.updated', { id });
    this.realtime.emit('dashboard.updated');
    return updated;
  }

  async remove(id: string, ctx: RequestContext) {
    await this.findOne(id);
    await this.prisma.affiliate.delete({ where: { id } });
    await this.audit.log(ctx.userId, 'EXCLUIR', 'affiliate', id, ctx.ip, ctx.device);
    this.realtime.emit('affiliate.deleted', { id });
    this.realtime.emit('dashboard.updated');
    return { ok: true };
  }
}
