export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';
import { resolveStatus, serializePayable, toDecimal } from '@/lib/finance/utils.js';

export async function PATCH(request, { params }) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const body = await parseBody(request);
  const existing = await prisma.financialPayable.findFirst({
    where: { id: params.id, tenantId },
  });
  if (!existing) return errorResponse('Conta não encontrada', 404);

  const amount = body.amount != null ? toDecimal(body.amount) : parseFloat(existing.amount);
  const paidAmount = body.paidAmount != null ? toDecimal(body.paidAmount) : parseFloat(existing.paidAmount);
  const dueDate = body.dueDate ? new Date(body.dueDate) : existing.dueDate;
  const status = resolveStatus(amount, paidAmount, dueDate, body.status || existing.status);

  const item = await prisma.financialPayable.update({
    where: { id: params.id },
    data: {
      description: body.description,
      supplier: body.supplier,
      categoryId: body.categoryId,
      amount,
      paidAmount,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      paidAt: body.paidAt ? new Date(body.paidAt) : status === 'PAID' && existing.status !== 'PAID' ? new Date() : body.paidAt === null ? null : undefined,
      paymentMethod: body.paymentMethod,
      status,
      notes: body.notes,
    },
    include: { category: true },
  });

  return jsonResponse({ success: true, payable: serializePayable(item) });
}

export async function DELETE(request, { params }) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const existing = await prisma.financialPayable.findFirst({
    where: { id: params.id, tenantId },
  });
  if (!existing) return errorResponse('Conta não encontrada', 404);

  await prisma.financialPayable.update({
    where: { id: params.id },
    data: { status: 'CANCELLED' },
  });

  return jsonResponse({ success: true });
}
