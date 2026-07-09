import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Histórico é somente leitura por design — não há endpoints de
 * alteração ou exclusão. Nunca apagar histórico.
 */
@Controller()
export class HistoryController {
  constructor(private prisma: PrismaService) {}

  @Get('history')
  history(
    @Query('entity') entity?: string,
    @Query('entityId') entityId?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.prisma.history.findMany({
      where: {
        ...(entity ? { entity } : {}),
        ...(entityId ? { entityId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(take ?? 100), 500),
      skip: Number(skip ?? 0),
    });
  }

  @Get('logs')
  logs(@Query('take') take?: string, @Query('skip') skip?: string) {
    return this.prisma.log.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(take ?? 100), 500),
      skip: Number(skip ?? 0),
      include: { user: { select: { name: true, email: true } } },
    });
  }
}
