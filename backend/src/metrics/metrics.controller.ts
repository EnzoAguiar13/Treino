import {
  BadRequestException,
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
import { MetricsService } from './metrics.service';

const PANELS = ['creator', 'casino', 'sportsbook'] as const;
type Panel = (typeof PANELS)[number];

function assertPanel(panel: string): asserts panel is Panel {
  if (!PANELS.includes(panel as Panel)) throw new BadRequestException('Painel inválido');
}

@Controller('metrics/:panel')
@UseGuards(PermissionsGuard)
export class MetricsController {
  constructor(
    private service: MetricsService,
    private audit: AuditService,
  ) {}

  @Get()
  @RequirePermissions('affiliates.read')
  list(
    @Param('panel') panel: string,
    @Query('affiliateId') affiliateId?: string,
    @Query('period') period?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    assertPanel(panel);
    return this.service.list(panel, { affiliateId, period, from, to });
  }

  @Get('summary')
  @RequirePermissions('affiliates.read')
  summary(
    @Param('panel') panel: string,
    @Query('period') period?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    assertPanel(panel);
    return this.service.summary(panel, { period, from, to });
  }

  @Post()
  @RequirePermissions('affiliates.write')
  create(@Param('panel') panel: string, @Body() body: any, @Req() req: Request) {
    assertPanel(panel);
    return this.service.create(panel, body, this.audit.context(req));
  }

  @Patch(':id')
  @RequirePermissions('affiliates.write')
  update(
    @Param('panel') panel: string,
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: Request,
  ) {
    assertPanel(panel);
    return this.service.update(panel, id, body, this.audit.context(req));
  }

  @Delete(':id')
  @RequirePermissions('affiliates.write')
  remove(@Param('panel') panel: string, @Param('id') id: string, @Req() req: Request) {
    assertPanel(panel);
    return this.service.remove(panel, id, this.audit.context(req));
  }
}
