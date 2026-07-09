import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { PermissionsGuard, RequirePermissions } from '../auth/permissions.guard';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Controller('settings')
@UseGuards(PermissionsGuard)
export class SettingsController {
  constructor(
    private prisma: PrismaService,
    private realtime: RealtimeGateway,
  ) {}

  @Get()
  list() {
    return this.prisma.setting.findMany();
  }

  @Put(':key')
  @RequirePermissions('settings.manage')
  async set(@Param('key') key: string, @Body() body: { value: unknown }) {
    const setting = await this.prisma.setting.upsert({
      where: { key },
      update: { value: body.value as any },
      create: { key, value: body.value as any },
    });
    this.realtime.emit('settings.updated', { key });
    return setting;
  }
}
