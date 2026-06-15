export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId, withTenantData } from '@/lib/tenant';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';
import { ensureFinanceDefaults } from '@/lib/finance/ensureDefaults.js';
import { resolveStatus, serializePayable, toDecimal } from '@/lib/finance/utils.js';

export async function GET(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  await ensureFinanceDefaults(tenantId);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  const where = { tenantId };
  if (status && status !== 'all') where.status = status;
  if (search) {
    where.OR = [
      { description: { contains: search, mode: 'insensitive' } },
      { supplier: { contains: search, mode: 'insensitive' } },
    ];
  }

  const items = await prisma.financialPayable.findMany({
    where,
    include: { category: true },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
  });

  const payables = items.map((p) => {
    const statusResolved = resolveStatus(p.amount, p.paidAmount, p.dueDate, p.status);
    return serializePayable({ ...p, status: statusResolved });
  });

  return jsonResponse({ success: true, payables });
}

export async function POST(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const body = await parseBody(request);

  if (!body.description || !body.amount || !body.dueDate) {
    return errorResponse('Descrição, valor e vencimento são obrigatórios');
  }

  const amount = toDecimal(body.amount);
  const paidAmount = toDecimal(body.paidAmount || 0);
  const status = resolveStatus(amount, paidAmount, body.dueDate, body.status || 'PENDING');

  const item = await prisma.financialPayable.create({
    data: withTenantData(tenantId, {
      description: body.description,
      supplier: body.supplier || null,
      categoryId: body.categoryId || null,
      amount,
      paidAmount,
      dueDate: new Date(body.dueDate),
      paidAt: body.paidAt ? new Date(body.paidAt) : status === 'PAID' ? new Date() : null,
      paymentMethod: body.paymentMethod || null,
      status,
      notes: body.notes || null,
    }),
    include: { category: true },
  });

  return jsonResponse({ success: true, payable: serializePayable(item) });
}
