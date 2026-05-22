import { addHours, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import prisma from '@/lib/prisma';
import { sendAppointmentMessage } from './send';

const include = { client: true, service: true };

export async function processRemindersForTenant(tenantId) {
  const [instance, settings] = await Promise.all([
    prisma.whatsappInstance.findUnique({ where: { tenantId } }),
    prisma.whatsappSettings.findUnique({ where: { tenantId } }),
  ]);

  if (!instance || instance.status !== 'CONNECTED') return { sent: 0 };
  if (!settings?.remindersEnabled) return { sent: 0 };

  const hours = settings.reminderHoursBefore || 24;
  const now = new Date();
  const windowStart = addHours(now, hours - 1);
  const windowEnd = addHours(now, hours + 1);

  const appointments = await prisma.appointment.findMany({
    where: {
      tenantId,
      status: { in: ['PENDING', 'CONFIRMED'] },
      date: {
        gte: startOfDay(windowStart),
        lte: endOfDay(windowEnd),
      },
    },
    include,
  });

  let sent = 0;

  for (const apt of appointments) {
    const aptDateTime = new Date(`${apt.date.toISOString().slice(0, 10)}T${apt.time}:00`);
    if (!isWithinInterval(aptDateTime, { start: windowStart, end: windowEnd })) continue;

    const already = await prisma.whatsappMessage.findFirst({
      where: {
        tenantId,
        appointmentId: apt.id,
        type: 'REMINDER',
        status: 'SENT',
      },
    });
    if (already) continue;

    try {
      await sendAppointmentMessage(tenantId, apt, 'REMINDER');
      sent += 1;
    } catch {
      /* continue */
    }
  }

  return { sent };
}

export async function processAllReminders() {
  const instances = await prisma.whatsappInstance.findMany({
    where: { status: 'CONNECTED' },
    select: { tenantId: true },
  });

  let total = 0;
  for (const { tenantId } of instances) {
    const { sent } = await processRemindersForTenant(tenantId);
    total += sent;
  }
  return { total };
}
