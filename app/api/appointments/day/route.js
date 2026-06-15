export const dynamic = 'force-dynamic';

import { startOfDay } from 'date-fns';
import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { getDayScheduleContext, getAppointmentDuration, getEndTime } from '@/lib/scheduleEngine';
import { getAvailableSlots } from '@/lib/slots';
import { jsonResponse, errorResponse } from '@/lib/api';

const include = { client: true, service: true };

export async function GET(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return errorResponse('Data inválida');
  }

  const ctx = await getDayScheduleContext(prisma, date, tenantId);

  let appointments = ctx.appointments.map((apt) => ({
    ...apt,
    effectiveDuration: getAppointmentDuration(apt),
    endTime: getEndTime(apt.time, getAppointmentDuration(apt)),
  }));

  if (status && status !== 'all') {
    appointments = appointments.filter((a) => a.status === status);
  }

  if (search) {
    const q = search.toLowerCase();
    appointments = appointments.filter(
      (a) =>
        a.client?.name?.toLowerCase().includes(q) ||
        a.client?.phone?.includes(q) ||
        a.service?.name?.toLowerCase().includes(q),
    );
  }

  const activeCount = ctx.activeAppointments.length;

  let bookableSlots = [];
  if (ctx.schedule) {
    const { slots } = await getAvailableSlots(date, tenantId, ctx.schedule.slotDuration);
    bookableSlots = slots;
  }

  return jsonResponse({
    success: true,
    date,
    schedule: ctx.schedule
      ? {
          startTime: ctx.schedule.startTime,
          endTime: ctx.schedule.endTime,
          slotDuration: ctx.schedule.slotDuration,
        }
      : null,
    appointments,
    timeline: ctx.timeline,
    freeSlots: bookableSlots,
    hasAvailableSlots: bookableSlots.length > 0,
    stats: {
      total: activeCount,
      freeSlots: bookableSlots.length,
      completed: ctx.appointments.filter((a) => a.status === 'COMPLETED').length,
      noShow: ctx.appointments.filter((a) => a.status === 'NO_SHOW').length,
    },
    message: ctx.message,
  });
}
