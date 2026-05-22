import prisma from '@/lib/prisma';
import { sendTextMessage } from '@/lib/evolution/messages';
import { getTemplate, renderTemplate, buildAppointmentVars } from './templates';
import { publishWhatsAppEvent } from './events';

const TYPE_MAP = {
  confirmation: 'CONFIRMATION',
  reminder: 'REMINDER',
  cancellation: 'CANCELLATION',
  reschedule: 'RESCHEDULE',
  completion: 'COMPLETION',
  manual: 'MANUAL',
};

export async function sendWhatsappMessage({
  tenantId,
  phone,
  clientName,
  type = 'MANUAL',
  content,
  appointmentId = null,
}) {
  const instance = await prisma.whatsappInstance.findUnique({ where: { tenantId } });
  if (!instance || instance.status !== 'CONNECTED') {
    throw new Error('WhatsApp não conectado');
  }

  const msgType = TYPE_MAP[type] || type || 'MANUAL';

  const record = await prisma.whatsappMessage.create({
    data: {
      tenantId,
      appointmentId,
      clientPhone: phone,
      clientName,
      type: msgType,
      content,
      status: 'PENDING',
    },
  });

  try {
    const result = await sendTextMessage(instance.instanceName, phone, content);
    const externalId = result?.key?.id || result?.messageId || null;

    const updated = await prisma.whatsappMessage.update({
      where: { id: record.id },
      data: { status: 'SENT', sentAt: new Date(), externalId },
    });

    publishWhatsAppEvent(tenantId, { type: 'message', message: updated });
    return updated;
  } catch (err) {
    const updated = await prisma.whatsappMessage.update({
      where: { id: record.id },
      data: { status: 'FAILED', errorMessage: err.message },
    });
    publishWhatsAppEvent(tenantId, { type: 'message', message: updated });
    throw err;
  }
}

export async function sendAppointmentMessage(tenantId, appointment, templateType) {
  const settings = await prisma.whatsappSettings.findUnique({ where: { tenantId } });
  const flags = {
    CONFIRMATION: settings?.confirmationsEnabled ?? true,
    REMINDER: settings?.remindersEnabled ?? true,
    CANCELLATION: settings?.cancellationsEnabled ?? true,
    RESCHEDULE: settings?.reschedulesEnabled ?? true,
    COMPLETION: settings?.completionsEnabled ?? true,
  };

  if (!flags[templateType]) return null;

  const phone = appointment.client?.phone;
  if (!phone) return null;

  const template = await getTemplate(tenantId, templateType);
  const vars = await buildAppointmentVars(tenantId, appointment);
  const content = renderTemplate(template, vars);

  return sendWhatsappMessage({
    tenantId,
    phone,
    clientName: appointment.client?.name,
    type: templateType,
    content,
    appointmentId: appointment.id,
  });
}
