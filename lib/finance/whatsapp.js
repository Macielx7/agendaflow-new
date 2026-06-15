import prisma from '@/lib/prisma';
import { sendWhatsappMessage } from '@/lib/whatsapp/send.js';
import { formatCurrency, formatDateShort } from '@/utils/format.js';
import { STATUS_LABELS } from './defaults.js';

const TEMPLATES = {
  reminder: (data) =>
    `Olá ${data.clientName}! 😊\n\nLembrete: parcela ${data.number}/${data.total} de *${data.description}* vence em *${data.dueDate}*.\nValor: *${data.amount}*\n\nQualquer dúvida, estamos à disposição.`,
  overdue: (data) =>
    `Olá ${data.clientName},\n\nIdentificamos a parcela ${data.number} de *${data.description}* com vencimento em *${data.dueDate}* ainda em aberto.\nValor: *${data.amount}* (${data.days} dias em atraso).\n\nPodemos ajudar com o pagamento?`,
  paid: (data) =>
    `Olá ${data.clientName}! ✅\n\nConfirmamos o recebimento de *${data.amount}* referente a *${data.description}*.\n\nObrigado pela confiança!`,
  dueSoon: (data) =>
    `Olá ${data.clientName}!\n\nAviso: sua parcela de *${data.description}* vence em *${data.dueDate}*.\nValor: *${data.amount}*\n\nStatus: ${data.status}`,
};

export async function sendFinanceWhatsApp(tenantId, phone, clientName, templateKey, payload) {
  if (!phone) return;
  const fn = TEMPLATES[templateKey];
  if (!fn) return;
  const content = fn(payload);
  await sendWhatsappMessage({
    tenantId,
    phone,
    clientName,
    type: 'MANUAL',
    content,
  });
}

export async function notifyInstallmentReminder(tenantId, installmentId) {
  const inst = await prisma.financialInstallment.findFirst({
    where: { id: installmentId, tenantId },
  });
  if (!inst || inst.status === 'PAID' || inst.status === 'CANCELLED') return;

  let clientPhone = null;
  if (inst.clientId) {
    const client = await prisma.client.findFirst({ where: { id: inst.clientId, tenantId } });
    clientPhone = client?.phone;
  }

  const total = await prisma.financialInstallment.count({
    where: { budgetId: inst.budgetId || undefined, tenantId },
  });

  await sendFinanceWhatsApp(tenantId, clientPhone, inst.clientName, 'reminder', {
    clientName: inst.clientName,
    number: inst.number,
    total: total || inst.number,
    description: inst.description,
    dueDate: formatDateShort(inst.dueDate),
    amount: formatCurrency(inst.amount),
  });
}

export async function notifyPaymentConfirmation(tenantId, receivable) {
  if (!receivable.clientId) return;
  const client = await prisma.client.findFirst({
    where: { id: receivable.clientId, tenantId },
  });
  if (!client?.phone) return;

  await sendFinanceWhatsApp(tenantId, client.phone, receivable.clientName, 'paid', {
    clientName: receivable.clientName,
    description: receivable.description,
    amount: formatCurrency(receivable.paidAmount || receivable.amount),
  });
}

export function triggerFinanceWhatsAppAsync(fn, ...args) {
  fn(...args).catch((err) => console.error('[finance whatsapp]', err.message));
}
