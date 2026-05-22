export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';
import { handleEvolutionWebhook, verifyWebhookSecret } from '@/lib/whatsapp/webhook';
import { getInstanceName } from '@/lib/whatsapp/instanceName';

export async function POST(request) {
  if (!verifyWebhookSecret(request)) {
    return errorResponse('Webhook não autorizado', 401);
  }

  const { searchParams } = new URL(request.url);
  let tenantId = searchParams.get('tenantId');
  const body = await parseBody(request);

  if (!tenantId && body?.instance) {
    const record = await prisma.whatsappInstance.findFirst({
      where: { instanceName: body.instance },
    });
    tenantId = record?.tenantId;
  }

  if (!tenantId && body?.instanceName) {
    const record = await prisma.whatsappInstance.findFirst({
      where: { instanceName: body.instanceName },
    });
    tenantId = record?.tenantId;
  }

  if (!tenantId) {
    const name = body?.instance || body?.instanceName || body?.data?.instance;
    if (name?.startsWith('tenant_')) {
      const partial = name.replace('tenant_', '');
      const record = await prisma.whatsappInstance.findFirst({
        where: { instanceName: { contains: partial } },
      });
      tenantId = record?.tenantId;
    }
  }

  if (!tenantId) {
    return jsonResponse({ success: true, ignored: true });
  }

  try {
    await handleEvolutionWebhook(tenantId, body || {});
    return jsonResponse({ success: true });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId');
  if (!tenantId) return jsonResponse({ success: true, message: 'Evolution webhook ativo' });
  return jsonResponse({
    success: true,
    webhookUrl: `${process.env.EVOLUTION_WEBHOOK_URL || process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/evolution?tenantId=${tenantId}`,
    instanceName: getInstanceName(tenantId),
  });
}
