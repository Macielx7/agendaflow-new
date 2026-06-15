export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';
import { serializeInstallment, toDecimal } from '@/lib/finance/utils.js';
import { notifyPaymentConfirmation, triggerFinanceWhatsAppAsync } from '@/lib/finance/whatsapp.js';

export async function PATCH(request, { params }) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const body = await parseBody(request);

  const existing = await prisma.financialInstallment.findFirst({
    where: { id: params.id, tenantId },
  });
  if (!existing) return errorResponse('Parcela não encontrada', 404);

  const markPaid = body.status === 'PAID' || body.markPaid;
  const wasPaid = existing.status !== 'PAID' && markPaid;

  const item = await prisma.financialInstallment.update({
    where: { id: params.id },
    data: {
      status: markPaid ? 'PAID' : body.status || existing.status,
      paidAt: markPaid ? new Date(body.paidAt || Date.now()) : body.paidAt === null ? null : body.paidAt ? new Date(body.paidAt) : undefined,
      paymentMethod: body.paymentMethod,
      notes: body.notes,
    },
  });

  if (markPaid && existing.receivableId) {
    const rec = await prisma.financialReceivable.findFirst({
      where: { id: existing.receivableId, tenantId },
    });
    if (rec) {
      const paidAmount = toDecimal(rec.paidAmount) + toDecimal(existing.amount);
      await prisma.financialReceivable.update({
        where: { id: rec.id },
        data: {
          paidAmount,
          status: paidAmount >= parseFloat(rec.amount) ? 'PAID' : 'PARTIAL',
          paidAt: paidAmount >= parseFloat(rec.amount) ? new Date() : rec.paidAt,
        },
      });
      if (wasPaid && rec.clientId) {
        triggerFinanceWhatsAppAsync(notifyPaymentConfirmation, tenantId, {
          ...rec,
          paidAmount: toDecimal(existing.amount),
          description: `${rec.description} - Parcela ${existing.number}`,
        });
      }
    }
  }

  return jsonResponse({ success: true, installment: serializeInstallment(item) });
}
