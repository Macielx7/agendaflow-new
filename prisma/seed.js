const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@clinica.com.br';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@2024!';
  const adminName = process.env.ADMIN_NAME || 'Administrador';

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 12),
      name: adminName,
      role: 'ADMIN',
    },
  });

  const services = [
    { slug: 'avaliacao', name: 'Avaliação', description: 'Consulta inicial', duration: 60, price: 0, sortOrder: 1 },
    { slug: 'clareamento', name: 'Clareamento', description: 'Clareamento dental', duration: 60, price: 800, sortOrder: 2 },
    { slug: 'lentes', name: 'Lentes de Contato', description: 'Lentes cerâmicas', duration: 90, price: 3500, sortOrder: 3 },
    { slug: 'implante', name: 'Implante', description: 'Implante dentário', duration: 90, price: 4500, sortOrder: 4 },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
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
      where: { dayOfWeek: sched.dayOfWeek },
      update: sched,
      create: sched,
    });
  }

  const settings = [
    { key: 'company_name', value: 'Clínica Premium', label: 'Nome da empresa' },
    { key: 'company_phone', value: '(11) 99999-9999', label: 'WhatsApp' },
    { key: 'company_email', value: 'contato@clinica.com.br', label: 'E-mail' },
    { key: 'company_address', value: 'São Paulo, SP', label: 'Endereço' },
    { key: 'company_logo', value: '', label: 'Logo URL' },
    { key: 'max_appointments_per_day', value: '12', label: 'Máx. agendamentos/dia' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, label: setting.label },
      create: setting,
    });
  }

  const clients = [
    { name: 'Maria Silva', phone: '11999990001', email: 'maria@email.com' },
    { name: 'João Santos', phone: '11999990002', email: 'joao@email.com' },
  ];

  for (const c of clients) {
    const existing = await prisma.client.findFirst({ where: { phone: c.phone } });
    if (!existing) await prisma.client.create({ data: c });
  }

  console.log('✅ Seed concluído —', adminEmail);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
