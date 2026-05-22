import prisma from '@/lib/prisma';
import { mapConnectionState } from '@/lib/evolution/instances';
import { publishWhatsAppEvent } from './events';
import { logWhatsappEvent } from './service';

export async function handleEvolutionWebhook(tenantId, body) {
  const event = String(body?.event || body?.type || 'unknown').toUpperCase();
  await logWhatsappEvent(tenantId, event, body);

  const instance = await prisma.whatsappInstance.findUnique({ where: { tenantId } });
  if (!instance) return;

  if (event.includes('QRCODE')) {
    const qr =
      body?.data?.qrcode?.base64 ||
      body?.data?.base64 ||
      body?.qrcode?.base64 ||
      body?.base64;
    if (qr) {
      const qrCode = qr.startsWith('data:') ? qr : `data:image/png;base64,${qr}`;
      const updated = await prisma.whatsappInstance.update({
        where: { tenantId },
        data: {
          qrCode,
          qrExpiresAt: new Date(Date.now() + 60 * 1000),
          status: 'CONNECTING',
          lastEventAt: new Date(),
        },
      });
      publishWhatsAppEvent(tenantId, { type: 'qrcode', qrCode, status: updated.status });
    }
    return;
  }

  if (event.includes('CONNECTION')) {
    const state = body?.data?.state || body?.data?.status || body?.state;
    const status = mapConnectionState(state);
    const phone = body?.data?.wuid || body?.data?.phone || body?.instance?.owner;

    const updated = await prisma.whatsappInstance.update({
      where: { tenantId },
      data: {
        status,
        phoneNumber: phone ? String(phone).split('@')[0] : instance.phoneNumber,
        profileName: body?.data?.profileName || instance.profileName,
        connectedAt: status === 'CONNECTED' ? new Date() : instance.connectedAt,
        disconnectedAt: status === 'DISCONNECTED' ? new Date() : null,
        qrCode: status === 'CONNECTED' ? null : instance.qrCode,
        lastEventAt: new Date(),
      },
    });

    publishWhatsAppEvent(tenantId, {
      type: 'status',
      status: updated.status,
      phoneNumber: updated.phoneNumber,
      profileName: updated.profileName,
    });
  }
}

export function verifyWebhookSecret(request) {
  const secret = process.env.EVOLUTION_WEBHOOK_SECRET;
  if (!secret) return true;
  const header = request.headers.get('x-webhook-secret') || request.headers.get('apikey');
  const url = new URL(request.url);
  const query = url.searchParams.get('secret');
  return header === secret || query === secret;
}
