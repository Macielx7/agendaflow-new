import prisma from './prisma';
import { hashPassword } from './auth';

const DEFAULT_MODULES = ['agenda', 'clientes', 'servicos', 'horarios', 'configuracoes'];

export async function provisionTenant({
  companyName,
  ownerName,
  email,
  phone,
  planId,
  adminPassword,
  slug,
}) {
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error('Plano inválido');

  const finalSlug =
    slug ||
    companyName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);

  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 14);
  const subEnd = new Date();
  subEnd.setFullYear(subEnd.getFullYear() + 1);

  const tenant = await prisma.tenant.create({
    data: {
      slug: `${finalSlug}-${Date.now().toString(36)}`,
      companyName,
      ownerName,
      email,
      phone: phone || null,
      status: 'ACTIVE',
      planId: plan.id,
      subscription: {
        create: {
          planId: plan.id,
          status: 'TRIAL',
          trialEndsAt: trialEnd,
          endsAt: subEnd,
          billingCycle: 'monthly',
        },
      },
      users: {
        create: {
          email,
          password: await hashPassword(adminPassword || 'Admin@2024!'),
          name: ownerName,
          role: 'ADMIN',
        },
      },
    },
    include: { subscription: true, users: true },
  });

  const schedules = [
    { dayOfWeek: 0, startTime: '00:00', endTime: '00:00', active: false },
    { dayOfWeek: 1, startTime: '08:00', endTime: '18:00', slotDuration: 60, breakStart: '12:00', breakEnd: '13:00' },
    { dayOfWeek: 2, startTime: '08:00', endTime: '18:00', slotDuration: 60, breakStart: '12:00', breakEnd: '13:00' },
    { dayOfWeek: 3, startTime: '08:00', endTime: '18:00', slotDuration: 60, breakStart: '12:00', breakEnd: '13:00' },
    { dayOfWeek: 4, startTime: '08:00', endTime: '18:00', slotDuration: 60, breakStart: '12:00', breakEnd: '13:00' },
    { dayOfWeek: 5, startTime: '08:00', endTime: '18:00', slotDuration: 60, breakStart: '12:00', breakEnd: '13:00' },
    { dayOfWeek: 6, startTime: '08:00', endTime: '12:00', slotDuration: 60 },
  ];

  for (const s of schedules) {
    await prisma.schedule.create({ data: { tenantId: tenant.id, ...s } });
  }

  const settings = [
    { key: 'company_name', value: companyName, label: 'Nome da empresa' },
    { key: 'company_phone', value: phone || '', label: 'WhatsApp' },
    { key: 'company_email', value: email, label: 'E-mail' },
    { key: 'company_address', value: '', label: 'Endereço' },
    { key: 'max_appointments_per_day', value: String(plan.maxAppointments), label: 'Máx. agendamentos/dia' },
  ];

  for (const setting of settings) {
    await prisma.setting.create({ data: { tenantId: tenant.id, ...setting } });
  }

  const features = JSON.parse(plan.features || '[]');
  const modules = features.length ? features : DEFAULT_MODULES;
  for (const mod of modules) {
    await prisma.featurePermission.create({
      data: { tenantId: tenant.id, module: mod, enabled: true },
    });
  }

  return tenant;
}
