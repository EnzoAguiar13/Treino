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
import { FinanceResource, FinanceService } from './finance.service';

const RESOURCES = ['commissions', 'expenses', 'deposits', 'registrations', 'netpl'] as const;

function assertResource(r: string): asserts r is FinanceResource {
  if (!RESOURCES.includes(r as FinanceResource)) {
    throw new BadRequestException('Recurso financeiro inválido');
  }
}

@Controller('finance')
@UseGuards(PermissionsGuard)
export class FinanceController {
  constructor(
    private service: FinanceService,
    private audit: AuditService,
  ) {}

  @Get('summary')
  @RequirePermissions('finance.read')
  summary(
    @Query('period') period?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.summary({ period, from, to });
  }

  @Get(':resource')
  @RequirePermissions('finance.read')
  list(
    @Param('resource') resource: string,
    @Query('affiliateId') affiliateId?: string,
    @Query('period') period?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    assertResource(resource);
    return this.service.list(resource, { affiliateId, period, from, to });
  }

  @Post(':resource')
  @RequirePermissions('finance.write')
  create(@Param('resource') resource: string, @Body() body: any, @Req() req: Request) {
    assertResource(resource);
    return this.service.create(resource, body, this.audit.context(req));
  }

  @Patch(':resource/:id')
  @RequirePermissions('finance.write')
  update(
    @Param('resource') resource: string,
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: Request,
  ) {
    assertResource(resource);
    return this.service.update(resource, id, body, this.audit.context(req));
  }

  @Delete(':resource/:id')
  @RequirePermissions('finance.write')
  remove(@Param('resource') resource: string, @Param('id') id: string, @Req() req: Request) {
    assertResource(resource);
    return this.service.remove(resource, id, this.audit.context(req));
  }
}
