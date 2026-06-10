import prisma from '@/lib/prisma';
import { sendTextMessage, sendButtonsMessage } from '@/lib/evolution/messages';
import { isEvolutionBusinessApi } from '@/lib/evolution/client';
import {
  getTemplate,
  renderTemplate,
  buildAppointmentVars,
  buildClientVars,
} from './templates';
import {
  BUTTON_CONFIRM_LABEL,
  BUTTON_CANCEL_LABEL,
  REPLY_CONFIRM,
  REPLY_CANCEL,
  buildTextConfirmationMessage,
} from './confirmationButtons';
import { publishWhatsAppEvent } from './events';

const TYPE_MAP = {
  booking: 'BOOKING',
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

async function sendConfirmationInteractive(tenantId, appointment, content, vars) {
  const instance = await prisma.whatsappInstance.findUnique({ where: { tenantId } });
  if (!instance || instance.status !== 'CONNECTED') {
    throw new Error('WhatsApp não conectado');
  }

  const phone = appointment.client?.phone;
  const empresa = vars?.empresa || 'Clínica';
  const useBusinessButtons = isEvolutionBusinessApi();
  const messageContent = useBusinessButtons
    ? `${content}\n\nVocê irá comparecer?`
    : buildTextConfirmationMessage(content);

  const record = await prisma.whatsappMessage.create({
    data: {
      tenantId,
      appointmentId: appointment.id,
      clientPhone: phone,
      clientName: appointment.client?.name,
      type: 'CONFIRMATION',
      content: messageContent,
      status: 'PENDING',
    },
  });

  try {
    let result;

    if (useBusinessButtons) {
      result = await sendButtonsMessage(instance.instanceName, phone, {
        description: messageContent,
        footer: empresa,
        buttons: [
          { displayText: BUTTON_CONFIRM_LABEL, id: REPLY_CONFIRM },
          { displayText: BUTTON_CANCEL_LABEL, id: REPLY_CANCEL },
        ],
      });
    } else {
      result = await sendTextMessage(instance.instanceName, phone, messageContent);
    }

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
    BOOKING: settings?.bookingsEnabled ?? true,
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

  if (templateType === 'CONFIRMATION') {
    return sendConfirmationInteractive(tenantId, appointment, content, vars);
  }

  return sendWhatsappMessage({
    tenantId,
    phone,
    clientName: appointment.client?.name,
    type: templateType,
    content,
    appointmentId: appointment.id,
  });
}

export async function sendConfirmationForAppointment(tenantId, appointmentId) {
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, tenantId },
    include: { client: true, service: true },
  });
  if (!appointment) throw new Error('Agendamento não encontrado');
  if (!appointment.client?.phone) throw new Error('Cliente sem telefone cadastrado');
  if (['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(appointment.status)) {
    throw new Error('Não é possível enviar confirmação para este agendamento');
  }

  const message = await sendAppointmentMessage(tenantId, appointment, 'CONFIRMATION');
  if (!message) throw new Error('Envio de confirmação desativado nas configurações');
  return message;
}

export async function sendTemplateToClient(tenantId, { templateType, clientId, content, appointmentId }) {
  const client = await prisma.client.findFirst({
    where: { id: clientId, tenantId },
  });
  if (!client) throw new Error('Cliente não encontrado');
  if (!client.phone) throw new Error('Cliente sem telefone cadastrado');

  let appointment = null;
  if (appointmentId) {
    appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, tenantId, clientId },
      include: { client: true, service: true },
    });
    if (!appointment) throw new Error('Agendamento não encontrado');
  } else {
    appointment = await prisma.appointment.findFirst({
      where: {
        clientId,
        tenantId,
        status: { notIn: ['CANCELLED'] },
      },
      orderBy: [{ date: 'desc' }, { time: 'desc' }],
      include: { client: true, service: true },
    });
  }

  const vars = appointment
    ? await buildAppointmentVars(tenantId, appointment)
    : await buildClientVars(tenantId, client);

  const template = content || (await getTemplate(tenantId, templateType));
  const messageContent = renderTemplate(template, vars);

  if (templateType === 'CONFIRMATION' && appointment) {
    return sendConfirmationInteractive(tenantId, appointment, messageContent, vars);
  }

  return sendWhatsappMessage({
    tenantId,
    phone: client.phone,
    clientName: client.name,
    type: templateType,
    content: messageContent,
    appointmentId: appointment?.id || null,
  });
}
