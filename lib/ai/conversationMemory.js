import prisma from '@/lib/prisma';

const MAX_MESSAGES = 30;

export function parseMessages(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getConversationContext(tenantId, clientPhone) {
  const ctx = await prisma.conversationContext.findUnique({
    where: { tenantId_clientPhone: { tenantId, clientPhone } },
  });
  if (!ctx) {
    return { messages: [], lastIntent: null, lastTopic: null, clientId: null };
  }
  return {
    messages: parseMessages(ctx.messages),
    lastIntent: ctx.lastIntent,
    lastTopic: ctx.lastTopic,
    clientId: ctx.clientId,
  };
}

export async function appendConversationMessage(tenantId, clientPhone, { role, text, clientId, intent, topic }) {
  const existing = await prisma.conversationContext.findUnique({
    where: { tenantId_clientPhone: { tenantId, clientPhone } },
  });

  const messages = existing ? parseMessages(existing.messages) : [];
  messages.push({ role, text, at: new Date().toISOString() });
  const trimmed = messages.slice(-MAX_MESSAGES);

  const data = {
    messages: JSON.stringify(trimmed),
    lastIntent: intent || existing?.lastIntent || null,
    lastTopic: topic || existing?.lastTopic || null,
    clientId: clientId || existing?.clientId || null,
  };

  if (existing) {
    return prisma.conversationContext.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.conversationContext.create({
    data: { tenantId, clientPhone, ...data },
  });
}

export async function getOrCreateChatSession(tenantId, clientPhone, clientId = null) {
  const existing = await prisma.chatSession.findUnique({
    where: { tenantId_clientPhone: { tenantId, clientPhone } },
  });

  if (existing) {
    return prisma.chatSession.update({
      where: { id: existing.id },
      data: { lastMessageAt: new Date(), clientId: clientId || existing.clientId },
    });
  }

  return prisma.chatSession.create({
    data: { tenantId, clientPhone, clientId, status: 'BOT' },
  });
}

export async function transferToHuman(tenantId, clientPhone) {
  return prisma.chatSession.upsert({
    where: { tenantId_clientPhone: { tenantId, clientPhone } },
    create: {
      tenantId,
      clientPhone,
      status: 'HUMAN',
      transferredAt: new Date(),
    },
    update: {
      status: 'HUMAN',
      transferredAt: new Date(),
      lastMessageAt: new Date(),
    },
  });
}

export async function isHumanSession(tenantId, clientPhone) {
  const session = await prisma.chatSession.findUnique({
    where: { tenantId_clientPhone: { tenantId, clientPhone } },
  });
  return session?.status === 'HUMAN';
}
