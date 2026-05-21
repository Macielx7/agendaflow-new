export const dynamic = 'force-dynamic';

import { startOfDay, isBefore } from 'date-fns';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { getAvailableSlots } from '@/lib/slots';
import { validateAppointmentBody } from '@/lib/validations';
import { jsonResponse, errorResponse, unauthorizedResponse, parseBody } from '@/lib/api';

const include = { client: true, service: true };

export async function GET(request) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const date = searchParams.get('date');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const clientId = searchParams.get('clientId');
  const search = searchParams.get('search');

  const where = {};
  if (status && status !== 'all') where.status = status;
  if (date) where.date = new Date(date + 'T12:00:00');
  if (from && to) {
    where.date = { gte: new Date(from + 'T12:00:00'), lte: new Date(to + 'T12:00:00') };
  }
  if (clientId) where.clientId = clientId;
  if (search) {
    where.OR = [
      { client: { name: { contains: search, mode: 'insensitive' } } },
      { client: { phone: { contains: search } } },
    ];
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include,
    orderBy: [{ date: 'desc' }, { time: 'desc' }],
  });

  return jsonResponse({ success: true, appointments });
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const body = await parseBody(request);
  const validation = validateAppointmentBody(body);
  if (!validation.valid) return errorResponse(validation.errors.join('. '));

  const { clientId, serviceId, date, time, notes, status, price } = validation.data;

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return errorResponse('Serviço não encontrado');

  const appointmentDate = startOfDay(new Date(date + 'T12:00:00'));
  if (isBefore(appointmentDate, startOfDay(new Date()))) {
    return errorResponse('Data passada não permitida');
  }

  const { slots } = await getAvailableSlots(date, service.duration);
  if (!slots.includes(time)) return errorResponse('Horário indisponível');

  const existing = await prisma.appointment.findFirst({
    where: { date: appointmentDate, time, status: { not: 'CANCELLED' } },
  });
  if (existing) return errorResponse('Horário já reservado');

  const finalPrice = price ?? parseFloat(service.price);

  const appointment = await prisma.appointment.create({
    data: {
      clientId,
      serviceId,
      date: appointmentDate,
      time,
      notes,
      status,
      price: finalPrice,
    },
    include,
  });

  return jsonResponse({ success: true, appointment }, 201);
}
