import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

class CreateNotificationDto {
  @IsString() @IsNotEmpty() title!: string;
  @IsString() @IsNotEmpty() message!: string;
  @IsOptional() @IsString() userId?: string;
}

@Controller('notifications')
export class NotificationsController {
  constructor(
    private prisma: PrismaService,
    private realtime: RealtimeGateway,
  ) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.prisma.notification.findMany({
      where: { OR: [{ userId: user.sub }, { userId: null }] },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  @Post()
  async create(@Body() dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({ data: dto });
    this.realtime.emit('notification.created', notification);
    return notification;
  }

  @Patch(':id/read')
  read(@Param('id') id: string) {
    return this.prisma.notification.update({ where: { id }, data: { read: true } });
  }

  @Patch('read-all')
  async readAll(@CurrentUser() user: JwtPayload) {
    await this.prisma.notification.updateMany({
      where: { OR: [{ userId: user.sub }, { userId: null }], read: false },
      data: { read: true },
    });
    return { ok: true };
  }
}
