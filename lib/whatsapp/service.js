import prisma from '@/lib/prisma';
import {
  createInstance,
  connectInstance,
  getConnectionState,
  logoutInstance,
  deleteInstance,
  setInstanceWebhook,
  extractQrCode,
  mapConnectionState,
  getWebhookUrl,
} from '@/lib/evolution/instances';
import { getEvolutionConfig } from '@/lib/evolution/client';
import { getInstanceName } from './instanceName';
import { publishWhatsAppEvent } from './events';
import { ensureWhatsappDefaults } from './templates';

export async function getOrCreateInstanceRecord(tenantId) {
  await ensureWhatsappDefaults(tenantId);
  const instanceName = getInstanceName(tenantId);
  let record = await prisma.whatsappInstance.findUnique({ where: { tenantId } });

  if (!record) {
    record = await prisma.whatsappInstance.create({
      data: { tenantId, instanceName, status: 'DISCONNECTED' },
    });
  }

  return record;
}

export async function syncInstanceStatus(tenantId) {
  const record = await getOrCreateInstanceRecord(tenantId);
  const { configured } = getEvolutionConfig();
  if (!configured) return record;

  try {
    const stateRes = await getConnectionState(record.instanceName);
    const rawState = stateRes?.instance?.state || stateRes?.state || stateRes?.status;
    const status = mapConnectionState(rawState);
    const phone = stateRes?.instance?.owner || stateRes?.instance?.wuid || record.phoneNumber;

    const updated = await prisma.whatsappInstance.update({
      where: { tenantId },
      data: {
        status,
        phoneNumber: status === 'CONNECTED' ? String(phone || '').split('@')[0] : record.phoneNumber,
        connectedAt: status === 'CONNECTED' ? record.connectedAt || new Date() : record.connectedAt,
        disconnectedAt: status === 'DISCONNECTED' ? new Date() : null,
        lastEventAt: new Date(),
      },
    });

    publishWhatsAppEvent(tenantId, { type: 'status', status: updated.status, phoneNumber: updated.phoneNumber });
    return updated;
  } catch {
    return record;
  }
}

export async function connectWhatsapp(tenantId) {
  const record = await getOrCreateInstanceRecord(tenantId);
  const { configured } = getEvolutionConfig();

  if (!configured) {
    throw new Error('Evolution API não configurada');
  }

  await prisma.whatsappInstance.update({
    where: { tenantId },
    data: { status: 'CONNECTING', qrCode: null },
  });

  try {
    await createInstance(record.instanceName).catch(() => null);
    await setInstanceWebhook(record.instanceName, getWebhookUrl(tenantId)).catch(() => null);
    const connectRes = await connectInstance(record.instanceName);
    const qrCode = extractQrCode(connectRes);
    const expires = new Date(Date.now() + 60 * 1000);

    const updated = await prisma.whatsappInstance.update({
      where: { tenantId },
      data: {
        status: 'CONNECTING',
        qrCode,
        qrExpiresAt: expires,
        lastEventAt: new Date(),
      },
    });

    publishWhatsAppEvent(tenantId, { type: 'qrcode', qrCode, status: 'CONNECTING' });
    return updated;
  } catch (err) {
    await prisma.whatsappInstance.update({
      where: { tenantId },
      data: { status: 'DISCONNECTED' },
    });
    throw err;
  }
}

export async function refreshQrCode(tenantId) {
  const record = await getOrCreateInstanceRecord(tenantId);
  const connectRes = await connectInstance(record.instanceName);
  const qrCode = extractQrCode(connectRes);
  const updated = await prisma.whatsappInstance.update({
    where: { tenantId },
    data: {
      qrCode,
      qrExpiresAt: new Date(Date.now() + 60 * 1000),
      status: 'CONNECTING',
      lastEventAt: new Date(),
    },
  });
  publishWhatsAppEvent(tenantId, { type: 'qrcode', qrCode, status: 'CONNECTING' });
  return updated;
}

export async function disconnectWhatsapp(tenantId) {
  const record = await getOrCreateInstanceRecord(tenantId);
  const { configured } = getEvolutionConfig();

  if (configured) {
    await logoutInstance(record.instanceName).catch(() => null);
  }

  const updated = await prisma.whatsappInstance.update({
    where: { tenantId },
    data: {
      status: 'DISCONNECTED',
      qrCode: null,
      disconnectedAt: new Date(),
      lastEventAt: new Date(),
    },
  });

  publishWhatsAppEvent(tenantId, { type: 'status', status: 'DISCONNECTED' });
  return updated;
}

export async function removeWhatsappInstance(tenantId) {
  const record = await getOrCreateInstanceRecord(tenantId);
  const { configured } = getEvolutionConfig();
  if (configured) {
    await logoutInstance(record.instanceName).catch(() => null);
    await deleteInstance(record.instanceName).catch(() => null);
  }
  return prisma.whatsappInstance.update({
    where: { tenantId },
    data: { status: 'DISCONNECTED', qrCode: null, phoneNumber: null, profileName: null },
  });
}

export async function logWhatsappEvent(tenantId, event, payload, level = 'info') {
  return prisma.whatsappLog.create({
    data: {
      tenantId,
      event,
      payload: payload ? JSON.stringify(payload).slice(0, 8000) : null,
      level,
    },
  });
}
