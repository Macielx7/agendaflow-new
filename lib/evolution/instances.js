import { evolutionFetch, getEvolutionConfig } from './client';

export async function createInstance(instanceName) {
  return evolutionFetch('/instance/create', {
    method: 'POST',
    body: JSON.stringify({
      instanceName,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
    }),
  });
}

export async function connectInstance(instanceName) {
  return evolutionFetch(`/instance/connect/${instanceName}`);
}

export async function getConnectionState(instanceName) {
  return evolutionFetch(`/instance/connectionState/${instanceName}`);
}

export async function fetchInstance(instanceName) {
  const data = await evolutionFetch(`/instance/fetchInstances?instanceName=${instanceName}`);
  if (Array.isArray(data)) return data.find((i) => i.name === instanceName || i.instance?.instanceName === instanceName) || data[0];
  return data;
}

export async function logoutInstance(instanceName) {
  return evolutionFetch(`/instance/logout/${instanceName}`, { method: 'DELETE' });
}

export async function deleteInstance(instanceName) {
  return evolutionFetch(`/instance/delete/${instanceName}`, { method: 'DELETE' });
}

export async function setInstanceWebhook(instanceName, webhookUrl) {
  const secret = process.env.EVOLUTION_WEBHOOK_SECRET || '';
  return evolutionFetch(`/webhook/set/${instanceName}`, {
    method: 'POST',
    body: JSON.stringify({
      webhook: {
        enabled: true,
        url: webhookUrl,
        webhookByEvents: true,
        webhookBase64: true,
        events: ['CONNECTION_UPDATE', 'QRCODE_UPDATED', 'MESSAGES_UPSERT', 'SEND_MESSAGE'],
        headers: secret ? { 'x-webhook-secret': secret } : undefined,
      },
    }),
  });
}

export function extractQrCode(data) {
  if (!data) return null;
  const base64 =
    data.base64 ||
    data.qrcode?.base64 ||
    data.qrCode?.base64 ||
    data.code ||
    (typeof data.qrcode === 'string' ? data.qrcode : null);
  if (!base64) return null;
  if (base64.startsWith('data:image')) return base64;
  return `data:image/png;base64,${base64}`;
}

export function mapConnectionState(state) {
  const s = String(state || '').toLowerCase();
  if (['open', 'connected'].includes(s)) return 'CONNECTED';
  if (['connecting', 'pairing'].includes(s)) return 'CONNECTING';
  if (['close', 'closed', 'disconnected'].includes(s)) return 'DISCONNECTED';
  if (['expired', 'timeout'].includes(s)) return 'EXPIRED';
  return 'CONNECTING';
}

export function getWebhookUrl(tenantId) {
  const { webhookBase } = getEvolutionConfig();
  return `${webhookBase}/api/webhooks/evolution?tenantId=${tenantId}`;
}
