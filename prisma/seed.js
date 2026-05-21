const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@drjoaomarcos.com.br';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@2024!';
  const adminName = process.env.ADMIN_NAME || 'Administrador';

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: 'ADMIN',
    },
  });

  const procedures = [
    {
      slug: 'lente-contato',
      name: 'Lente de Contato Dental',
      description: 'Harmonização milimétrica do sorriso com lentes ultrafinas personalizadas.',
      duration: 90,
      icon: 'sparkles',
      color: '#4a9fd4',
      sortOrder: 1,
    },
    {
      slug: 'implante',
      name: 'Implante Dentário',
      description: 'Reabilitação completa com implantes de última geração e planejamento 3D.',
      duration: 90,
      icon: 'shield',
      color: '#1a4d7a',
      sortOrder: 2,
    },
    {
      slug: 'clareamento',
      name: 'Clareamento Premium',
      description: 'Protocolo seguro para tonalidade luminosa e uniforme do esmalte.',
      duration: 60,
      icon: 'sun',
      color: '#c9a962',
      sortOrder: 3,
    },
    {
      slug: 'avaliacao',
      name: 'Avaliação Personalizada',
      description: 'Consulta inicial com diagnóstico completo e plano de tratamento sob medida.',
      duration: 60,
      icon: 'clipboard',
      color: '#10b981',
      sortOrder: 4,
    },
  ];

  for (const proc of procedures) {
    await prisma.procedure.upsert({
      where: { slug: proc.slug },
      update: proc,
      create: proc,
    });
  }

  const schedules = [
    { dayOfWeek: 0, startTime: '00:00', endTime: '00:00', active: false },
    { dayOfWeek: 1, startTime: '09:00', endTime: '19:00', slotDuration: 60, breakStart: '12:00', breakEnd: '13:00' },
    { dayOfWeek: 2, startTime: '09:00', endTime: '19:00', slotDuration: 60, breakStart: '12:00', breakEnd: '13:00' },
    { dayOfWeek: 3, startTime: '09:00', endTime: '19:00', slotDuration: 60, breakStart: '12:00', breakEnd: '13:00' },
    { dayOfWeek: 4, startTime: '09:00', endTime: '19:00', slotDuration: 60, breakStart: '12:00', breakEnd: '13:00' },
    { dayOfWeek: 5, startTime: '09:00', endTime: '19:00', slotDuration: 60, breakStart: '12:00', breakEnd: '13:00' },
    { dayOfWeek: 6, startTime: '09:00', endTime: '14:00', slotDuration: 60 },
  ];

  for (const sched of schedules) {
    await prisma.schedule.upsert({
      where: { dayOfWeek: sched.dayOfWeek },
      update: sched,
      create: sched,
    });
  }

  const settings = [
    { key: 'clinic_name', value: 'Dr. João Marcos', label: 'Nome da Clínica' },
    { key: 'clinic_phone', value: '(61) 9 9230-8500', label: 'Telefone' },
    { key: 'clinic_email', value: 'contato@drjoaomarcos.com.br', label: 'E-mail' },
    { key: 'booking_advance_days', value: '60', label: 'Dias de antecedência para agendamento' },
    { key: 'confirmation_message', value: 'Seu agendamento foi recebido com sucesso. Em breve nossa equipe entrará em contato para confirmar.', label: 'Mensagem de confirmação' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, label: setting.label },
      create: setting,
    });
  }

  console.log('✅ Seed concluído');
  console.log(`   Admin: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
