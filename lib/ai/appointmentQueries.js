import { addDays, format, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import prisma from '@/lib/prisma';

async function findClientByPhone(tenantId, phone) {
  const suffix = String(phone || '').replace(/\D/g, '').slice(-8);
  if (suffix.length < 8) return null;

  return prisma.client.findFirst({
    where: { tenantId, phone: { contains: suffix } },
  });
}

function formatDate(date) {
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
}

export async function getClientAppointments(tenantId, phone, { upcoming = true } = {}) {
  const client = await findClientByPhone(tenantId, phone);
  if (!client) return { client: null, appointments: [] };

  const where = {
    tenantId,
    clientId: client.id,
    status: { notIn: ['CANCELLED'] },
  };

  if (upcoming) {
    where.date = { gte: startOfDay(new Date()) };
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: { service: true },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
    take: 5,
  });

  return { client, appointments };
}

export async function getNextAppointment(tenantId, phone) {
  const { client, appointments } = await getClientAppointments(tenantId, phone);
  return { client, appointment: appointments[0] || null };
}

export async function cancelClientAppointment(tenantId, phone) {
  const { client, appointment } = await getNextAppointment(tenantId, phone);
  if (!client) return { ok: false, reason: 'CLIENT_NOT_FOUND' };
  if (!appointment) return { ok: false, reason: 'NO_APPOINTMENT' };
  if (appointment.status === 'CANCELLED') return { ok: false, reason: 'ALREADY_CANCELLED' };

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: 'CANCELLED' },
  });

  return {
    ok: true,
    appointment,
    client,
    message: `Seu agendamento de *${appointment.service?.name || 'consulta'}* em *${formatDate(appointment.date)}* às *${appointment.time}* foi cancelado.`,
  };
}

export async function buildAppointmentInfoResponse(tenantId, phone, empresa) {
  const { client, appointments } = await getClientAppointments(tenantId, phone);

  if (!client) {
    return `Não encontrei seu cadastro na *${empresa}*. Informe seu nome completo para localizarmos seu agendamento.`;
  }

  if (!appointments.length) {
    return `Olá, ${client.name}! Não encontrei agendamentos futuros em seu nome. Deseja marcar uma consulta?`;
  }

  const lines = appointments.map((apt) => {
    const svc = apt.service?.name || 'Consulta';
    const st = apt.status === 'CONFIRMED' ? '✅ Confirmado' : '⏳ Pendente';
    return `• *${svc}* — ${formatDate(apt.date)} às *${apt.time}* (${st})`;
  });

  return `Olá, ${client.name}! Seus agendamentos na *${empresa}*:\n\n${lines.join('\n')}`;
}

export async function buildTomorrowCheck(tenantId, phone, empresa) {
  const client = await findClientByPhone(tenantId, phone);
  if (!client) return null;

  const tomorrow = addDays(startOfDay(new Date()), 1);
  const appointment = await prisma.appointment.findFirst({
    where: {
      tenantId,
      clientId: client.id,
      date: { gte: startOfDay(tomorrow), lte: endOfDay(tomorrow) },
      status: { notIn: ['CANCELLED'] },
    },
    include: { service: true },
    orderBy: { time: 'asc' },
  });

  if (!appointment) {
    return `Olá, ${client.name}! Você não tem consulta marcada para amanhã na *${empresa}*.`;
  }

  return `Sim, ${client.name}! Amanhã você tem *${appointment.service?.name || 'consulta'}* às *${appointment.time}* na *${empresa}*.`;
}
