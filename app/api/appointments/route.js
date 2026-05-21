export const dynamic = 'force-dynamic';

import { startOfDay, isBefore } from 'date-fns';
import prisma from '@/lib/prisma';
import { getAvailableSlots } from '@/lib/slots';
import { validateAppointmentBody } from '@/lib/validations';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';

export async function POST(request) {
  const body = await parseBody(request);
  if (!body) return errorResponse('Dados inválidos');

  const validation = validateAppointmentBody(body);
  if (!validation.valid) {
    return errorResponse(validation.errors.join('. '));
  }

  const { procedureId, date, time, patientName, patientPhone, patientEmail, notes } =
    validation.data;

  const procedure = await prisma.procedure.findUnique({
    where: { id: procedureId, active: true },
  });
  if (!procedure) return errorResponse('Procedimento não encontrado');

  const appointmentDate = startOfDay(new Date(date + 'T12:00:00'));
  const today = startOfDay(new Date());

  if (isBefore(appointmentDate, today)) {
    return errorResponse('Não é possível agendar em datas passadas');
  }

  const { slots } = await getAvailableSlots(date);
  if (!slots.includes(time)) {
    return errorResponse('Horário indisponível. Escolha outro horário.');
  }

  const existing = await prisma.appointment.findFirst({
    where: {
      date: appointmentDate,
      time,
      status: { not: 'CANCELLED' },
    },
  });

  if (existing) {
    return errorResponse('Este horário acabou de ser reservado. Escolha outro.');
  }

  const appointment = await prisma.appointment.create({
    data: {
      procedureId,
      date: appointmentDate,
      time,
      patientName,
      patientPhone,
      patientEmail,
      notes,
      status: 'PENDING',
    },
    include: {
      procedure: { select: { name: true, slug: true, duration: true } },
    },
  });

  return jsonResponse({ success: true, appointment }, 201);
}
