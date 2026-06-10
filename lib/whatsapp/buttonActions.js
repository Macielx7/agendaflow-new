import { startOfDay } from 'date-fns';
import prisma from '@/lib/prisma';
import { sendTextMessage, formatPhoneNumber } from '@/lib/evolution/messages';
import { resolveWebhookSenderPhone } from './resolveSenderPhone';
import {
  parseAppointmentButtonId,
  extractButtonResponse,
  extractSenderJid,
  extractPollResponse,
  extractListResponse,
  extractTextResponse,
  parsePollOrTextAction,
} from './confirmationButtons';
import { buildAppointmentVars } from './templates';
import { buildNaturalReply } from './conversationReplies';
import { logWhatsappEvent } from './service';

async function replyToClient(tenantId, phone, text) {
  const instance = await prisma.whatsappInstance.findUnique({ where: { tenantId } });
  if (!instance || instance.status !== 'CONNECTED') return;
  await sendTextMessage(instance.instanceName, phone, text).catch(() => null);
}

async function buildContextFromAppointment(tenantId, appointment) {
  const confirmationMsg = await prisma.whatsappMessage.findFirst({
    where: {
      tenantId,
      appointmentId: appointment.id,
      type: 'CONFIRMATION',
      status: 'SENT',
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { createdAt: 'desc' },
  });
  if (!confirmationMsg) return null;

  const vars = await buildAppointmentVars(tenantId, appointment);
  return { appointment, vars, clientPhone: appointment.client.phone };
}

async function findContextByRecentConfirmation(tenantId) {
  const recent = await prisma.whatsappMessage.findMany({
    where: {
      tenantId,
      type: 'CONFIRMATION',
      status: 'SENT',
      appointmentId: { not: null },
      createdAt: { gte: new Date(Date.now() - 4 * 60 * 60 * 1000) },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const contexts = [];
  for (const msg of recent) {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: msg.appointmentId,
        tenantId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        date: { gte: startOfDay(new Date()) },
      },
      include: { client: true, service: true },
    });
    if (!appointment) continue;
    const ctx = await buildContextFromAppointment(tenantId, appointment);
    if (ctx) contexts.push(ctx);
  }

  if (contexts.length === 1) return contexts[0];
  return null;
}

async function findActiveConfirmationContext(tenantId, body) {
  let senderPhone = await resolveWebhookSenderPhone(tenantId, body);

  if (senderPhone) {
    const suffix = senderPhone.slice(-8);
    const clients = await prisma.client.findMany({
      where: { tenantId, phone: { contains: suffix } },
      select: { id: true, phone: true, name: true },
    });

    if (clients.length) {
      const appointment = await prisma.appointment.findFirst({
        where: {
          tenantId,
          clientId: { in: clients.map((c) => c.id) },
          status: { in: ['PENDING', 'CONFIRMED'] },
          date: { gte: startOfDay(new Date()) },
        },
        orderBy: [{ date: 'asc' }, { time: 'asc' }],
        include: { client: true, service: true },
      });

      if (appointment) {
        const ctx = await buildContextFromAppointment(tenantId, appointment);
        if (ctx) return ctx;
      }
    }
  }

  if (extractSenderJid(body).includes('@lid')) {
    return findContextByRecentConfirmation(tenantId);
  }

  return null;
}

async function processAppointmentAction(tenantId, appointment, action, vars) {
  const phone = appointment.client.phone;
  const name = appointment.client.name;
  const when = `${vars.data} às ${vars.hora}`;

  if (action === 'confirm') {
    if (appointment.status === 'CONFIRMED') {
      await replyToClient(
        tenantId,
        phone,
        `Oi, ${name}! Sua presença já estava confirmada para *${when}*. Te esperamos na *${vars.empresa}*!`
      );
      return;
    }
    if (appointment.status === 'CANCELLED') {
      await replyToClient(
        tenantId,
        phone,
        `Olá, ${name}. Este agendamento já havia sido cancelado. Se quiser remarcar, fale com a *${vars.empresa}*.`
      );
      return;
    }

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: 'CONFIRMED' },
    });

    await logWhatsappEvent(tenantId, 'APPOINTMENT_CONFIRMED_BY_CLIENT', {
      appointmentId: appointment.id,
      phone: formatPhoneNumber(phone),
    });

    await replyToClient(
      tenantId,
      phone,
      `Perfeito, ${name}! ✅ Confirmamos sua consulta de *${vars.servico}* para *${when}*. Te esperamos na *${vars.empresa}*!`
    );
    return;
  }

  if (action === 'cancel') {
    if (appointment.status === 'CANCELLED') {
      await replyToClient(tenantId, phone, `Oi, ${name}! Este agendamento já estava cancelado.`);
      return;
    }

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: 'CANCELLED' },
    });

    await logWhatsappEvent(tenantId, 'APPOINTMENT_CANCELLED_BY_CLIENT', {
      appointmentId: appointment.id,
      phone: formatPhoneNumber(phone),
    });

    await replyToClient(
      tenantId,
      phone,
      `Tudo certo, ${name}. Seu agendamento de *${vars.servico}* em *${when}* foi cancelado. Se quiser reagendar, a *${vars.empresa}* fica à disposição.`
    );
  }
}

async function handleStructuredResponse(tenantId, action, appointmentId) {
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, tenantId },
    include: { client: true, service: true },
  });
  if (!appointment) return;

  const vars = await buildAppointmentVars(tenantId, appointment);
  await processAppointmentAction(tenantId, appointment, action, vars);
}

export async function handleAppointmentButtonResponse(tenantId, body) {
  if (body?.data?.key?.fromMe || body?.key?.fromMe) return false;

  const pollOption = extractPollResponse(body);
  if (pollOption) {
    const action = parsePollOrTextAction(pollOption);
    if (!action) return false;
    const ctx = await findActiveConfirmationContext(tenantId, body);
    if (!ctx) return false;
    await processAppointmentAction(tenantId, ctx.appointment, action, ctx.vars);
    return true;
  }

  const listOption = extractListResponse(body);
  if (listOption) {
    const action = parsePollOrTextAction(listOption);
    if (!action) return false;
    const ctx = await findActiveConfirmationContext(tenantId, body);
    if (!ctx) return false;
    await processAppointmentAction(tenantId, ctx.appointment, action, ctx.vars);
    return true;
  }

  const buttonId = extractButtonResponse(body);
  if (buttonId) {
    let parsed = parseAppointmentButtonId(buttonId);
    if (!parsed && buttonId === 'display_confirm') {
      const ctx = await findActiveConfirmationContext(tenantId, body);
      if (ctx) parsed = { action: 'confirm', appointmentId: ctx.appointment.id };
    }
    if (!parsed && buttonId === 'display_cancel') {
      const ctx = await findActiveConfirmationContext(tenantId, body);
      if (ctx) parsed = { action: 'cancel', appointmentId: ctx.appointment.id };
    }
    if (!parsed) {
      const action = parsePollOrTextAction(buttonId);
      if (action) {
        const ctx = await findActiveConfirmationContext(tenantId, body);
        if (ctx) {
          await processAppointmentAction(tenantId, ctx.appointment, action, ctx.vars);
          return true;
        }
      }
      return false;
    }
    await handleStructuredResponse(tenantId, parsed.action, parsed.appointmentId);
    return true;
  }

  const textResponse = extractTextResponse(body);
  if (!textResponse) return false;

  const ctx = await findActiveConfirmationContext(tenantId, body);
  if (!ctx) {
    await logWhatsappEvent(tenantId, 'CONFIRMATION_CONTEXT_NOT_FOUND', {
      jid: extractSenderJid(body),
      text: textResponse,
    });
    return false;
  }

  const action = parsePollOrTextAction(textResponse);
  if (action) {
    await processAppointmentAction(tenantId, ctx.appointment, action, ctx.vars);
    return true;
  }

  const reply = buildNaturalReply(textResponse, {
    clientName: ctx.appointment.client.name,
    ...ctx.vars,
  });
  await replyToClient(tenantId, ctx.clientPhone, reply);
  return true;
}
