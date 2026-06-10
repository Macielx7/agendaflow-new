import prisma from '@/lib/prisma';
import { sendTextMessage } from '@/lib/evolution/messages';
import { extractTextResponse } from '@/lib/whatsapp/confirmationButtons';
import { ensureAiDefaults } from './ensureDefaults';
import { detectIntent, INTENTS } from './intents';
import { searchKnowledge, searchServices, enrichQueryWithContext } from './semanticSearch';
import {
  getConversationContext,
  appendConversationMessage,
  getOrCreateChatSession,
  isHumanSession,
  transferToHuman,
} from './conversationMemory';
import {
  buildAppointmentInfoResponse,
  buildTomorrowCheck,
  cancelClientAppointment,
  getNextAppointment,
} from './appointmentQueries';
import {
  buildIntentResponse,
  buildTransferMessage,
  buildLowConfidenceMessage,
} from './responseBuilder';
import { resolveWebhookSenderPhone, resolveReplyPhone } from './resolveSender';
import { normalizeText } from './normalize';
import { logWhatsappEvent } from '@/lib/whatsapp/service';

async function getClinicName(tenantId) {
  const s = await prisma.setting.findFirst({
    where: { tenantId, key: 'company_name' },
  });
  return s?.value || 'Clínica';
}

async function sendReply(tenantId, phone, text) {
  const instance = await prisma.whatsappInstance.findUnique({ where: { tenantId } });
  if (!instance || instance.status !== 'CONNECTED') return false;
  await sendTextMessage(instance.instanceName, phone, text).catch(() => null);
  return true;
}

async function logIntent(tenantId, data) {
  return prisma.intentLog.create({ data: { tenantId, ...data } });
}

export async function processIncomingMessage(tenantId, body) {
  const settings = await ensureAiDefaults(tenantId);
  if (!settings.enabled || !settings.autoReplyEnabled) {
    return { handled: false, reason: 'AI_DISABLED' };
  }

  if (body?.data?.key?.fromMe || body?.key?.fromMe) {
    return { handled: false, reason: 'FROM_ME' };
  }

  const text = extractTextResponse(body);
  if (!text || !String(text).trim()) {
    return { handled: false, reason: 'NO_TEXT' };
  }

  const phone = await resolveWebhookSenderPhone(tenantId, body);
  if (!phone) {
    await logWhatsappEvent(tenantId, 'AI_NO_PHONE', {
      jid: body?.data?.key?.remoteJid,
      text: String(text).slice(0, 200),
    });
    return { handled: false, reason: 'NO_PHONE' };
  }

  const replyPhone = await resolveReplyPhone(tenantId, phone);

  if (await isHumanSession(tenantId, phone)) {
    return { handled: false, reason: 'HUMAN_SESSION' };
  }

  const empresa = await getClinicName(tenantId);
  const context = await getConversationContext(tenantId, phone);
  const { intent, confidence: intentConfidence } = detectIntent(text, context);

  const enrichedQuery = enrichQueryWithContext(text, context);
  const searchResults = await searchKnowledge(tenantId, enrichedQuery, { limit: 3 });
  const serviceResults = await searchServices(tenantId, enrichedQuery);
  const topSearch = searchResults[0] || null;

  let response = await buildIntentResponse(intent, {
    tenantId,
    clientName: null,
    phone,
    settings,
    searchResult: topSearch,
    serviceResults,
  });

  const { client } = await getNextAppointment(tenantId, phone);
  if (client) {
    await getOrCreateChatSession(tenantId, phone, client.id);
  } else {
    await getOrCreateChatSession(tenantId, phone);
  }

  if (response.action === 'APPOINTMENT_INFO') {
    const normalized = normalizeText(text);
    if (normalized.includes('amanha')) {
      response.text = await buildTomorrowCheck(tenantId, phone, empresa);
    } else {
      response.text = await buildAppointmentInfoResponse(tenantId, phone, empresa);
    }
    response.matched = true;
  }

  if (response.action === 'CANCEL_APPOINTMENT') {
    if (!settings.allowCancellations) {
      response.text = `Para cancelar seu agendamento, entre em contato com a *${empresa}* diretamente.`;
      response.matched = true;
    } else {
      const result = await cancelClientAppointment(tenantId, phone);
      if (result.ok) {
        response.text = result.message;
        response.matched = true;
      } else if (result.reason === 'NO_APPOINTMENT') {
        response.text = `Não encontrei agendamentos futuros em seu nome na *${empresa}*.`;
        response.matched = true;
      } else {
        response.text = `Não localizei seu cadastro. Informe seu nome completo para cancelarmos o agendamento.`;
        response.matched = false;
      }
    }
  }

  if (response.action === 'TRANSFER' || intent === INTENTS.HUMANO) {
    if (settings.transferToHuman) {
      await transferToHuman(tenantId, phone);
      response.text = response.text || buildTransferMessage(empresa);
      response.transferred = true;
    }
  }

  const threshold = settings.confidenceThreshold || 0.45;
  const finalConfidence = Math.max(response.confidence || 0, intentConfidence, topSearch?.score || 0);

  if (!response.text) {
    if (topSearch && topSearch.score >= threshold) {
      response.text = topSearch.item.answer;
      response.topic = topSearch.item.question;
      response.matched = true;
    } else if (settings.transferToHuman) {
      response.text = buildLowConfidenceMessage(empresa);
      response.matched = false;
    } else {
      return { handled: false, reason: 'LOW_CONFIDENCE' };
    }
  }

  if (!response.matched && finalConfidence < threshold && settings.transferToHuman) {
    response.text = buildLowConfidenceMessage(empresa);
  }

  const clientName = client?.name || null;
  if (clientName && response.text && intent === INTENTS.SAUDACAO) {
    response.text = response.text.replace('Olá!', `Olá, ${clientName}!`);
  }

  const sent = await sendReply(tenantId, replyPhone || phone, response.text);
  if (!sent) {
    await logWhatsappEvent(tenantId, 'AI_SEND_FAILED', { phone: replyPhone || phone, text: response.text?.slice(0, 100) });
  }

  await appendConversationMessage(tenantId, phone, {
    role: 'user',
    text,
    clientId: client?.id,
    intent,
    topic: response.topic,
  });

  await appendConversationMessage(tenantId, phone, {
    role: 'assistant',
    text: response.text,
    clientId: client?.id,
    intent,
    topic: response.topic,
  });

  await logIntent(tenantId, {
    clientPhone: phone,
    intent,
    confidence: finalConfidence,
    message: text,
    response: response.text,
    matched: Boolean(response.matched),
    transferred: Boolean(response.transferred),
  });

  return { handled: true, intent, confidence: finalConfidence, response: response.text };
}
