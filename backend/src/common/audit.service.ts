import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

export interface RequestContext {
  userId: string | null;
  userName: string;
  ip: string;
  device: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  context(req: Request): RequestContext {
    const user = (req as any).user;
    return {
      userId: user?.sub ?? null,
      userName: user?.email ?? '',
      ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip ?? '',
      device: (req.headers['user-agent'] as string) ?? '',
    };
  }

  async log(
    userId: string | null,
    action: string,
    entity: string,
    entityId: string,
    ip = '',
    device = '',
    meta?: Record<string, unknown>,
  ) {
    await this.prisma.log.create({
      data: { userId, action, entity, entityId, ip, device, meta: meta as any },
    });
  }

  /**
   * Grava o histórico campo-a-campo comparando estado antigo e novo.
   * O histórico é imutável — não existe endpoint de exclusão.
   */
  async recordDiff(
    ctx: RequestContext,
    entity: string,
    entityId: string,
    oldObj: Record<string, unknown>,
    newObj: Record<string, unknown>,
  ) {
    const rows = Object.keys(newObj)
      .filter((field) => {
        const before = oldObj[field];
        const after = newObj[field];
        return before !== undefined && String(before ?? '') !== String(after ?? '');
      })
      .map((field) => ({
        userId: ctx.userId,
        userName: ctx.userName,
        entity,
        entityId,
        field,
        oldValue: String(oldObj[field] ?? ''),
        newValue: String(newObj[field] ?? ''),
        ip: ctx.ip,
        device: ctx.device,
      }));
    if (rows.length) await this.prisma.history.createMany({ data: rows });
  }
}
