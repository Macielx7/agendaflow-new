export const dynamic = 'force-dynamic';

import { startOfDay } from 'date-fns';
import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { getAvailableSlots } from '@/lib/slots';
import { sanitizeString, VALID_STATUSES } from '@/lib/validations';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';

const include = { client: true, service: true };

export async function GET(request, { params }) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const appointment = await prisma.appointment.findFirst({
    where: { id: params.id, tenantId },
    include,
  });
  if (!appointment) return errorResponse('Não encontrado', 404);
  return jsonResponse({ success: true, appointment });
}

export async function PATCH(request, { params }) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const body = await parseBody(request);
  const existing = await prisma.appointment.findFirst({
    where: { id: params.id, tenantId },
    include: { service: true },
  });
  if (!existing) return errorResponse('Não encontrado', 404);

  const data = {};
  const prevStatus = existing.status;
  const prevDate = existing.date.toISOString().slice(0, 10);
  const prevTime = existing.time;
  if (body.status && VALID_STATUSES.includes(body.status)) data.status = body.status;
  if (body.notes !== undefined) data.notes = body.notes ? sanitizeString(body.notes, 1000) : null;
  if (body.price != null) data.price = parseFloat(body.price);

  if (body.date && body.time) {
    const service = await prisma.service.findFirst({ where: { id: existing.serviceId, tenantId } });
    const { slots } = await getAvailableSlots(body.date, tenantId, service?.duration);
    const same = existing.date.toISOString().slice(0, 10) === body.date && existing.time === body.time;
    if (!same && !slots.includes(body.time)) return errorResponse('Horário indisponível');
    data.date = startOfDay(new Date(body.date + 'T12:00:00'));
    data.time = body.time;
  }

  if (body.clientId) data.clientId = body.clientId;
  if (body.serviceId) data.serviceId = body.serviceId;

  const appointment = await prisma.appointment.update({
    where: { id: params.id },
    data,
    include,
  });

  const { triggerWhatsAppAsync } = await import('@/lib/whatsapp/notify');
  if (data.status === 'CANCELLED') {
    triggerWhatsAppAsync(tenantId, appointment.id, 'cancelled');
  } else if (data.status === 'COMPLETED') {
    triggerWhatsAppAsync(tenantId, appointment.id, 'completed');
  } else if (data.date || data.time) {
    const newDate = appointment.date.toISOString().slice(0, 10);
    if (newDate !== prevDate || appointment.time !== prevTime) {
      triggerWhatsAppAsync(tenantId, appointment.id, 'rescheduled');
    }
  } else if (data.status === 'CONFIRMED' && prevStatus !== 'CONFIRMED') {
    triggerWhatsAppAsync(tenantId, appointment.id, 'confirmed');
  }

  return jsonResponse({ success: true, appointment });
}

export async function DELETE(request, { params }) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const existing = await prisma.appointment.findFirst({ where: { id: params.id, tenantId } });
  if (!existing) return errorResponse('Não encontrado', 404);
  const appointment = await prisma.appointment.update({
    where: { id: params.id },
    data: { status: 'CANCELLED' },
    include,
  });

  const { triggerWhatsAppAsync } = await import('@/lib/whatsapp/notify');
  triggerWhatsAppAsync(tenantId, appointment.id, 'cancelled');

  return jsonResponse({ success: true, appointment });
}
