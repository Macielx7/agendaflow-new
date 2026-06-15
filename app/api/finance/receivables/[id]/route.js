export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';
import { resolveStatus, serializeReceivable, toDecimal } from '@/lib/finance/utils.js';
import { calculateCommissionForReceivable } from '@/lib/finance/commissions.js';
import { notifyPaymentConfirmation, triggerFinanceWhatsAppAsync } from '@/lib/finance/whatsapp.js';

export async function PATCH(request, { params }) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const body = await parseBody(request);
  const existing = await prisma.financialReceivable.findFirst({
    where: { id: params.id, tenantId },
  });
  if (!existing) return errorResponse('Conta não encontrada', 404);

  const amount = body.amount != null ? toDecimal(body.amount) : parseFloat(existing.amount);
  const paidAmount = body.paidAmount != null ? toDecimal(body.paidAmount) : parseFloat(existing.paidAmount);
  const dueDate = body.dueDate ? new Date(body.dueDate) : existing.dueDate;
  const status = resolveStatus(amount, paidAmount, dueDate, body.status || existing.status);

  const wasPaid = existing.status !== 'PAID' && status === 'PAID';

  const item = await prisma.financialReceivable.update({
    where: { id: params.id },
    data: {
      clientId: body.clientId !== undefined ? body.clientId : undefined,
      clientName: body.clientName,
      clientCpf: body.clientCpf,
      description: body.description,
      serviceId: body.serviceId,
      categoryId: body.categoryId,
      dentistId: body.dentistId,
      dentistName: body.dentistName,
      amount,
      paidAmount,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      paidAt: body.paidAt ? new Date(body.paidAt) : wasPaid ? new Date() : body.paidAt === null ? null : undefined,
      paymentMethod: body.paymentMethod,
      status,
      notes: body.notes,
    },
    include: { client: true, category: true },
  });

  if (status === 'PAID') {
    await calculateCommissionForReceivable(tenantId, item);
    if (wasPaid) triggerFinanceWhatsAppAsync(notifyPaymentConfirmation, tenantId, item);
  }

  return jsonResponse({ success: true, receivable: serializeReceivable(item) });
}

export async function DELETE(request, { params }) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const existing = await prisma.financialReceivable.findFirst({
    where: { id: params.id, tenantId },
  });
  if (!existing) return errorResponse('Conta não encontrada', 404);

  await prisma.financialReceivable.update({
    where: { id: params.id },
    data: { status: 'CANCELLED' },
  });

  return jsonResponse({ success: true });
}
