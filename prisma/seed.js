const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const plans = [
    { id: 'plan_basico', slug: 'basico', name: 'Básico', description: 'Ideal para começar', priceMonthly: 97, priceYearly: 970, maxUsers: 2, maxAppointments: 100, features: '["agenda","clientes","servicos"]', sortOrder: 1 },
    { id: 'plan_pro', slug: 'profissional', name: 'Profissional', description: 'Para clínicas em crescimento', priceMonthly: 197, priceYearly: 1970, maxUsers: 5, maxAppointments: 500, features: '["agenda","clientes","servicos","horarios","relatorios"]', sortOrder: 2 },
    { id: 'plan_premium', slug: 'premium', name: 'Premium', description: 'Recursos completos', priceMonthly: 397, priceYearly: 3970, maxUsers: 20, maxAppointments: 9999, features: '["agenda","clientes","servicos","horarios","configuracoes","relatorios","api","suporte"]', sortOrder: 3 },
  ];

  for (const p of plans) {
    await prisma.plan.upsert({ where: { slug: p.slug }, update: p, create: p });
  }

  const superEmail = process.env.SUPER_ADMIN_EMAIL || 'super@agendapro.com';
  const superPass = process.env.SUPER_ADMIN_PASSWORD || 'Super@2024!';
  await prisma.superAdmin.upsert({
    where: { email: superEmail },
    update: {},
    create: {
      email: superEmail,
      password: await bcrypt.hash(superPass, 12),
      name: 'Super Administrador',
      role: 'SUPER_ADMIN',
    },
  });

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@clinica.com.br';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@2024!';
  const adminName = process.env.ADMIN_NAME || 'Administrador';

  let tenant = await prisma.tenant.findUnique({ where: { slug: 'clinica-default' } });
  if (!tenant) {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);
    const subEnd = new Date();
    subEnd.setFullYear(subEnd.getFullYear() + 1);
    tenant = await prisma.tenant.create({
      data: {
        slug: 'clinica-default',
        companyName: 'Clínica Premium',
        ownerName: adminName,
        email: adminEmail,
        phone: '(11) 99999-9999',
        status: 'ACTIVE',
        planId: 'plan_pro',
        subscription: {
          create: { planId: 'plan_pro', status: 'ACTIVE', trialEndsAt: trialEnd, endsAt: subEnd },
        },
      },
    });
  }

  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: adminEmail } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 12),
      name: adminName,
      role: 'ADMIN',
    },
  });

  const services = [
    { slug: 'avaliacao', name: 'Avaliação', description: 'Consulta inicial', duration: 60, price: 0, sortOrder: 1 },
    { slug: 'clareamento', name: 'Clareamento', duration: 60, price: 800, sortOrder: 2 },
    { slug: 'lentes', name: 'Lentes de Contato', duration: 90, price: 3500, sortOrder: 3 },
    { slug: 'implante', name: 'Implante', duration: 90, price: 4500, sortOrder: 4 },
  ];

  for (const sv of services) {
    await prisma.service.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: sv.slug } },
      update: sv,
      create: { tenantId: tenant.id, ...sv },
    });
  }

  const schedules = [
    { dayOfWeek: 0, startTime: '00:00', endTime: '00:00', active: false },
    { dayOfWeek: 1, startTime: '08:00', endTime: '18:00', slotDuration: 60, breakStart: '12:00', breakEnd: '13:00' },
    { dayOfWeek: 2, startTime: '08:00', endTime: '18:00', slotDuration: 60, breakStart: '12:00', breakEnd: '13:00' },
    { dayOfWeek: 3, startTime: '08:00', endTime: '18:00', slotDuration: 60, breakStart: '12:00', breakEnd: '13:00' },
    { dayOfWeek: 4, startTime: '08:00', endTime: '18:00', slotDuration: 60, breakStart: '12:00', breakEnd: '13:00' },
    { dayOfWeek: 5, startTime: '08:00', endTime: '18:00', slotDuration: 60, breakStart: '12:00', breakEnd: '13:00' },
    { dayOfWeek: 6, startTime: '08:00', endTime: '12:00', slotDuration: 60 },
  ];

  for (const sched of schedules) {
    await prisma.schedule.upsert({
      where: { tenantId_dayOfWeek: { tenantId: tenant.id, dayOfWeek: sched.dayOfWeek } },
      update: sched,
      create: { tenantId: tenant.id, ...sched },
    });
  }

  const settings = [
    { key: 'company_name', value: 'Clínica Premium', label: 'Nome da empresa' },
    { key: 'company_phone', value: '(11) 99999-9999', label: 'WhatsApp' },
    { key: 'company_email', value: adminEmail, label: 'E-mail' },
    { key: 'max_appointments_per_day', value: '12', label: 'Máx. agendamentos/dia' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { tenantId_key: { tenantId: tenant.id, key: setting.key } },
      update: { value: setting.value, label: setting.label },
      create: { tenantId: tenant.id, ...setting },
    });
  }

  const modules = ['agenda', 'clientes', 'servicos', 'horarios', 'configuracoes'];
  for (const mod of modules) {
    await prisma.featurePermission.upsert({
      where: { tenantId_module: { tenantId: tenant.id, module: mod } },
      update: { enabled: true },
      create: { tenantId: tenant.id, module: mod, enabled: true },
    });
  }

  console.log('✅ Seed OK');
  console.log('   Tenant admin:', adminEmail, '/', adminPassword);
  console.log('   Super admin:', superEmail, '/', superPass);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
