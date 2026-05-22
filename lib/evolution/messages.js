import { evolutionFetch } from './client';

export function formatPhoneNumber(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('55')) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

export async function sendTextMessage(instanceName, phone, text) {
  const number = formatPhoneNumber(phone);
  if (!number) throw new Error('Telefone inválido');

  return evolutionFetch(`/message/sendText/${instanceName}`, {
    method: 'POST',
    body: JSON.stringify({ number, text }),
  });
}
