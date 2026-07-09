import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { PermissionsGuard, RequirePermissions } from '../auth/permissions.guard';
import { AuditService } from '../common/audit.service';
import { TrafficDto, UpdateTrafficDto } from './dto';
import { TrafficService } from './traffic.service';

@Controller('traffic')
@UseGuards(PermissionsGuard)
export class TrafficController {
  constructor(
    private service: TrafficService,
    private audit: AuditService,
  ) {}

  @Get()
  @RequirePermissions('traffic.read')
  list(
    @Query('platform') platform?: string,
    @Query('period') period?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.list({ platform, period, from, to });
  }

  @Get('summary')
  @RequirePermissions('traffic.read')
  summary(
    @Query('period') period?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.summary({ period, from, to });
  }

  @Post()
  @RequirePermissions('traffic.write')
  create(@Body() dto: TrafficDto, @Req() req: Request) {
    return this.service.create(dto, this.audit.context(req));
  }

  @Patch(':id')
  @RequirePermissions('traffic.write')
  update(@Param('id') id: string, @Body() dto: UpdateTrafficDto, @Req() req: Request) {
    return this.service.update(id, dto, this.audit.context(req));
  }

  @Delete(':id')
  @RequirePermissions('traffic.write')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.service.remove(id, this.audit.context(req));
  }
}
