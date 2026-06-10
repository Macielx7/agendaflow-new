import prisma from '@/lib/prisma';
import { resolveLidToPhone, resolvePhoneNumber } from '@/lib/evolution/messages';
import {
  extractSenderPhone,
  extractSenderJid,
  isLidSender,
} from './confirmationButtons';

async function findClientByPhoneSuffix(tenantId, phone) {
  const suffix = String(phone || '').replace(/\D/g, '').slice(-8);
  if (suffix.length < 8) return null;
  return prisma.client.findFirst({
    where: { tenantId, phone: { contains: suffix } },
  });
}

async function resolveFromKnownClients(tenantId, instanceName, lidJid) {
  const { evolutionFetch } = await import('@/lib/evolution/client');

  let chats = [];
  try {
    chats = await evolutionFetch(`/chat/findChats/${instanceName}`, {
      method: 'POST',
      body: JSON.stringify({ where: {}, limit: 100 }),
    });
  } catch {
    return null;
  }
  if (!Array.isArray(chats)) return null;

  const lidLocal = String(lidJid).split('@')[0].split(':')[0];
  const lidChat = chats.find((c) => String(c.remoteJid || '').split('@')[0].split(':')[0] === lidLocal);
  if (!lidChat) return null;

  const lidPic = String(lidChat.profilePicUrl || '').split('?')[0].split('/').pop();

  const clients = await prisma.client.findMany({
    where: { tenantId, phone: { not: '' } },
    take: 100,
  });

  for (const client of clients) {
    let resolved = null;
    try {
      resolved = await resolvePhoneNumber(instanceName, client.phone);
    } catch {
      continue;
    }
    if (!resolved) continue;

    const phoneChat = chats.find((c) => {
      const num = String(c.remoteJid || '').split('@')[0].replace(/\D/g, '');
      return num === resolved || num.endsWith(resolved.slice(-8));
    });

    if (!phoneChat?.profilePicUrl || !lidPic) continue;

    const phonePic = String(phoneChat.profilePicUrl).split('?')[0].split('/').pop();
    if (phonePic === lidPic) return client.phone;
  }

  return null;
}

export async function resolveWebhookSenderPhone(tenantId, body) {
  const direct = extractSenderPhone(body);
  if (direct) return direct;

  if (!isLidSender(body)) return '';

  const instance = await prisma.whatsappInstance.findUnique({ where: { tenantId } });
  if (!instance) return '';

  const lidJid = extractSenderJid(body);
  const resolved = await resolveLidToPhone(instance.instanceName, lidJid);
  if (resolved) {
    const client = await findClientByPhoneSuffix(tenantId, resolved);
    return client?.phone || resolved;
  }

  const fromClient = await resolveFromKnownClients(tenantId, instance.instanceName, lidJid);
  if (fromClient) return fromClient;

  const recentMsg = await prisma.whatsappMessage.findFirst({
    where: { tenantId, status: 'SENT' },
    orderBy: { sentAt: 'desc' },
  });
  if (recentMsg?.clientPhone) return recentMsg.clientPhone;

  return '';
}

export async function resolveReplyPhone(tenantId, resolvedPhone) {
  if (!resolvedPhone) return '';
  const client = await findClientByPhoneSuffix(tenantId, resolvedPhone);
  return client?.phone || resolvedPhone;
}
