export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';

export async function GET() {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const sessions = await prisma.chatSession.findMany({
    where: { tenantId },
    orderBy: { lastMessageAt: 'desc' },
    take: 50,
  });

  return jsonResponse({ success: true, sessions });
}

export async function PATCH(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const body = await parseBody(request);
  const clientPhone = String(body?.clientPhone || '').replace(/\D/g, '');
  const status = body?.status;

  if (!clientPhone) return errorResponse('Telefone obrigatório');
  if (!['BOT', 'HUMAN', 'CLOSED'].includes(status)) return errorResponse('Status inválido');

  const session = await prisma.chatSession.upsert({
    where: { tenantId_clientPhone: { tenantId, clientPhone } },
    create: {
      tenantId,
      clientPhone,
      status,
      transferredAt: status === 'HUMAN' ? new Date() : null,
      closedAt: status === 'CLOSED' ? new Date() : null,
    },
    update: {
      status,
      transferredAt: status === 'HUMAN' ? new Date() : undefined,
      closedAt: status === 'CLOSED' ? new Date() : null,
      lastMessageAt: new Date(),
    },
  });

  return jsonResponse({ success: true, session });
}
