import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuditService, RequestContext } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  private select = {
    id: true,
    name: true,
    email: true,
    active: true,
    createdAt: true,
    role: { select: { id: true, name: true, label: true } },
  };

  findAll() {
    return this.prisma.user.findMany({ select: this.select, orderBy: { createdAt: 'asc' } });
  }

  listRoles() {
    return this.prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateUserDto, ctx: RequestContext) {
    const role = await this.prisma.role.findUnique({ where: { name: dto.role } });
    if (!role) throw new BadRequestException('Papel inválido');
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash: await bcrypt.hash(dto.password, 10),
        roleId: role.id,
      },
      select: this.select,
    });
    await this.audit.log(ctx.userId, 'CRIAR', 'user', user.id, ctx.ip, ctx.device);
    return user;
  }

  async update(id: string, dto: UpdateUserDto, ctx: RequestContext) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Usuário não encontrado');
    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.active !== undefined) data.active = dto.active;
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 10);
    if (dto.role) {
      const role = await this.prisma.role.findUnique({ where: { name: dto.role } });
      if (!role) throw new BadRequestException('Papel inválido');
      data.roleId = role.id;
    }
    const user = await this.prisma.user.update({ where: { id }, data, select: this.select });
    await this.audit.recordDiff(ctx, 'user', id, existing as any, dto as any);
    await this.audit.log(ctx.userId, 'ATUALIZAR', 'user', id, ctx.ip, ctx.device);
    return user;
  }

  async remove(id: string, ctx: RequestContext) {
    await this.prisma.user.delete({ where: { id } });
    await this.audit.log(ctx.userId, 'EXCLUIR', 'user', id, ctx.ip, ctx.device);
    return { ok: true };
  }
}
