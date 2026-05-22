import prisma from '@/lib/prisma';
import { sendAppointmentMessage } from './send';

const include = { client: true, service: true };

export async function dispatchAppointmentWhatsApp(tenantId, appointmentId, action) {
  try {
    const instance = await prisma.whatsappInstance.findUnique({ where: { tenantId } });
    if (!instance || instance.status !== 'CONNECTED') return;

    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, tenantId },
      include,
    });
    if (!appointment?.client?.phone) return;

    const map = {
      created: 'CONFIRMATION',
      confirmed: 'CONFIRMATION',
      cancelled: 'CANCELLATION',
      rescheduled: 'RESCHEDULE',
      completed: 'COMPLETION',
    };

    const templateType = map[action];
    if (!templateType) return;

    await sendAppointmentMessage(tenantId, appointment, templateType);
  } catch (err) {
    console.error('[whatsapp notify]', err.message);
  }
}

export function triggerWhatsAppAsync(tenantId, appointmentId, action) {
  dispatchAppointmentWhatsApp(tenantId, appointmentId, action).catch(() => {});
}
