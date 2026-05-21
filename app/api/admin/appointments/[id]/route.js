export const dynamic = 'force-dynamic';

import { startOfDay } from 'date-fns';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { getAvailableSlots } from '@/lib/slots';
import { sanitizeString } from '@/lib/validations';
import { jsonResponse, errorResponse, unauthorizedResponse, parseBody } from '@/lib/api';

export async function GET(request, { params }) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: { procedure: true },
  });

  if (!appointment) return errorResponse('Agendamento não encontrado', 404);

  return jsonResponse({ success: true, appointment });
}

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const body = await parseBody(request);
  if (!body) return errorResponse('Dados inválidos');

  const existing = await prisma.appointment.findUnique({
    where: { id: params.id },
  });

  if (!existing) return errorResponse('Agendamento não encontrado', 404);

  const updateData = {};

  if (body.status) {
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(body.status)) {
      return errorResponse('Status inválido');
    }
    updateData.status = body.status;
  }

  if (body.patientName) {
    updateData.patientName = sanitizeString(body.patientName, 120);
  }
  if (body.patientPhone) {
    updateData.patientPhone = sanitizeString(body.patientPhone, 20).replace(/\D/g, '');
  }
  if (body.patientEmail !== undefined) {
    updateData.patientEmail = body.patientEmail
      ? sanitizeString(body.patientEmail, 120)
      : null;
  }
  if (body.notes !== undefined) {
    updateData.notes = body.notes ? sanitizeString(body.notes, 1000) : null;
  }

  if (body.date && body.time) {
    const dateStr = body.date;
    const { slots } = await getAvailableSlots(dateStr);
    const isSameSlot =
      existing.date.toISOString().slice(0, 10) === dateStr && existing.time === body.time;

    if (!isSameSlot && !slots.includes(body.time)) {
      return errorResponse('Horário indisponível');
    }

    updateData.date = startOfDay(new Date(dateStr + 'T12:00:00'));
    updateData.time = body.time;
  }

  const appointment = await prisma.appointment.update({
    where: { id: params.id },
    data: updateData,
    include: { procedure: true },
  });

  return jsonResponse({ success: true, appointment });
}

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const appointment = await prisma.appointment.update({
    where: { id: params.id },
    data: { status: 'CANCELLED' },
    include: { procedure: true },
  });

  return jsonResponse({ success: true, appointment });
}
