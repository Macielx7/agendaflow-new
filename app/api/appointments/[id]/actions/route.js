export const dynamic = 'force-dynamic';

import { startOfDay } from 'date-fns';
import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import {
  getAppointmentDuration,
  timeToMinutes,
  getEndTime,
  reorganizeSubsequentAppointments,
  isSlotOccupied,
} from '@/lib/scheduleEngine';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';

const include = { client: true, service: true };

export async function POST(request, { params }) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const body = await parseBody(request);
  const action = body?.action;

  const existing = await prisma.appointment.findFirst({
    where: { id: params.id, tenantId },
    include: { service: true },
  });
  if (!existing) return errorResponse('Agendamento não encontrado', 404);

  const dateStr = existing.date.toISOString().slice(0, 10);
  const dateObj = startOfDay(existing.date);

  if (action === 'presence') {
    const nextStatus =
      existing.status === 'PENDING' || existing.status === 'NO_SHOW'
        ? 'CONFIRMED'
        : existing.status === 'CONFIRMED'
          ? 'IN_PROGRESS'
          : existing.status;

    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: { status: nextStatus },
      include,
    });

    const { triggerWhatsAppAsync } = await import('@/lib/whatsapp/notify');
    if (nextStatus === 'CONFIRMED') {
      triggerWhatsAppAsync(tenantId, appointment.id, 'confirmed');
    }

    return jsonResponse({ success: true, appointment, action: 'presence' });
  }

  if (action === 'no_show') {
    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: { status: 'NO_SHOW' },
      include,
    });

    const freedStart = timeToMinutes(existing.time);
    await reorganizeSubsequentAppointments(prisma, tenantId, dateObj, freedStart);

    return jsonResponse({ success: true, appointment, action: 'no_show', reorganized: true });
  }

  if (action === 'finish') {
    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: { status: 'COMPLETED' },
      include,
    });

    const freedStart = timeToMinutes(existing.time);
    await reorganizeSubsequentAppointments(prisma, tenantId, dateObj, freedStart);

    const { triggerWhatsAppAsync } = await import('@/lib/whatsapp/notify');
    triggerWhatsAppAsync(tenantId, appointment.id, 'completed');

    return jsonResponse({ success: true, appointment, action: 'finish', reorganized: true });
  }

  if (action === 'resize') {
    const newDuration = parseInt(body.duration, 10);
    if (Number.isNaN(newDuration) || newDuration < 15 || newDuration > 480) {
      return errorResponse('Duração inválida (15–480 min)');
    }

    const booked = await prisma.appointment.findMany({
      where: {
        tenantId,
        date: dateObj,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        id: { not: params.id },
      },
      include: { service: true },
    });

    if (isSlotOccupied(existing.time, newDuration, booked)) {
      const endMin = timeToMinutes(existing.time) + newDuration;
      await prisma.appointment.update({
        where: { id: params.id },
        data: { duration: newDuration },
      });
      await reorganizeSubsequentAppointments(prisma, tenantId, dateObj, endMin);
    } else {
      await prisma.appointment.update({
        where: { id: params.id },
        data: { duration: newDuration },
      });
      const endMin = timeToMinutes(existing.time) + newDuration;
      await reorganizeSubsequentAppointments(prisma, tenantId, dateObj, endMin);
    }

    const appointment = await prisma.appointment.findFirst({
      where: { id: params.id, tenantId },
      include,
    });

    return jsonResponse({
      success: true,
      appointment: {
        ...appointment,
        effectiveDuration: getAppointmentDuration(appointment),
        endTime: getEndTime(appointment.time, getAppointmentDuration(appointment)),
      },
      action: 'resize',
      reorganized: true,
    });
  }

  if (action === 'move') {
    const newTime = body.time;
    if (!newTime || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(newTime)) {
      return errorResponse('Horário inválido');
    }

    const duration = getAppointmentDuration(existing);
    const booked = await prisma.appointment.findMany({
      where: {
        tenantId,
        date: dateObj,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        id: { not: params.id },
      },
      include: { service: true },
    });

    if (isSlotOccupied(newTime, duration, booked)) {
      return errorResponse('Horário ocupado');
    }

    await prisma.$transaction(async (tx) => {
      await tx.appointment.update({
        where: { id: params.id },
        data: { time: '96:00' },
      });
      await tx.appointment.update({
        where: { id: params.id },
        data: { time: newTime },
      });
    });

    const appointment = await prisma.appointment.findFirst({
      where: { id: params.id, tenantId },
      include,
    });

    const { triggerWhatsAppAsync } = await import('@/lib/whatsapp/notify');
    if (newTime !== existing.time) {
      triggerWhatsAppAsync(tenantId, appointment.id, 'rescheduled');
    }

    return jsonResponse({ success: true, appointment, action: 'move' });
  }

  return errorResponse('Ação inválida');
}
