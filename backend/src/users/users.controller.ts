import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { PermissionsGuard, RequirePermissions } from '../auth/permissions.guard';
import { AuditService } from '../common/audit.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(PermissionsGuard)
@RequirePermissions('users.manage')
export class UsersController {
  constructor(
    private service: UsersService,
    private audit: AuditService,
  ) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('roles')
  listRoles() {
    return this.service.listRoles();
  }

  @Post()
  create(@Body() dto: CreateUserDto, @Req() req: Request) {
    return this.service.create(dto, this.audit.context(req));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Req() req: Request) {
    return this.service.update(id, dto, this.audit.context(req));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.service.remove(id, this.audit.context(req));
  }
}
