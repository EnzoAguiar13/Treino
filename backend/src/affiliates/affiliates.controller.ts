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
import { AffiliatesService } from './affiliates.service';
import { CreateAffiliateDto, QueryAffiliatesDto, UpdateAffiliateDto } from './dto';

@Controller('affiliates')
@UseGuards(PermissionsGuard)
export class AffiliatesController {
  constructor(
    private service: AffiliatesService,
    private audit: AuditService,
  ) {}

  @Get()
  @RequirePermissions('affiliates.read')
  findAll(@Query() query: QueryAffiliatesDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('affiliates.read')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions('affiliates.write')
  create(@Body() dto: CreateAffiliateDto, @Req() req: Request) {
    return this.service.create(dto, this.audit.context(req));
  }

  @Patch(':id')
  @RequirePermissions('affiliates.write')
  update(@Param('id') id: string, @Body() dto: UpdateAffiliateDto, @Req() req: Request) {
    return this.service.update(id, dto, this.audit.context(req));
  }

  @Delete(':id')
  @RequirePermissions('affiliates.write')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.service.remove(id, this.audit.context(req));
  }
}
