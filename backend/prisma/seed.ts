import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ROLES = [
  { name: 'ADMINISTRADOR', label: 'Administrador' },
  { name: 'FINANCEIRO', label: 'Financeiro' },
  { name: 'CS', label: 'CS' },
  { name: 'GESTOR', label: 'Gestor' },
  { name: 'MARKETING', label: 'Marketing' },
  { name: 'TRAFEGO', label: 'Tráfego' },
  { name: 'VISUALIZACAO', label: 'Visualização' },
];

const PERMISSIONS = [
  { key: 'affiliates.read', label: 'Ver afiliados' },
  { key: 'affiliates.write', label: 'Editar afiliados' },
  { key: 'finance.read', label: 'Ver financeiro' },
  { key: 'finance.write', label: 'Editar financeiro' },
  { key: 'traffic.read', label: 'Ver tráfego' },
  { key: 'traffic.write', label: 'Editar tráfego' },
  { key: 'reports.export', label: 'Exportar relatórios' },
  { key: 'users.manage', label: 'Gerenciar usuários' },
  { key: 'settings.manage', label: 'Gerenciar configurações' },
];

// Permissões por papel — Administrador recebe todas.
const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMINISTRADOR: PERMISSIONS.map((p) => p.key),
  FINANCEIRO: ['affiliates.read', 'finance.read', 'finance.write', 'reports.export'],
  CS: ['affiliates.read', 'affiliates.write'],
  GESTOR: ['affiliates.read', 'affiliates.write', 'finance.read', 'traffic.read', 'reports.export'],
  MARKETING: ['affiliates.read', 'traffic.read', 'reports.export'],
  TRAFEGO: ['affiliates.read', 'traffic.read', 'traffic.write'],
  VISUALIZACAO: ['affiliates.read', 'finance.read', 'traffic.read'],
};

async function main() {
  for (const p of PERMISSIONS) {
    await prisma.permission.upsert({ where: { key: p.key }, update: { label: p.label }, create: p });
  }
  for (const r of ROLES) {
    const role = await prisma.role.upsert({ where: { name: r.name }, update: { label: r.label }, create: r });
    for (const key of ROLE_PERMISSIONS[r.name] ?? []) {
      const perm = await prisma.permission.findUniqueOrThrow({ where: { key } });
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }

  const admin = await prisma.role.findUniqueOrThrow({ where: { name: 'ADMINISTRADOR' } });
  const password = process.env.ACCESS_PASSWORD ?? 'Espo1306';
  await prisma.user.upsert({
    where: { email: 'admin@esportivabet.com' },
    update: {},
    create: {
      name: 'Administrador EsportivaBet',
      email: 'admin@esportivabet.com',
      passwordHash: await bcrypt.hash(password, 10),
      roleId: admin.id,
    },
  });

  console.log('Seed concluído: papéis, permissões e usuário administrador.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
