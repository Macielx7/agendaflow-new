export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { jsonResponse } from '@/lib/api';
import { resolveStatus, serializeInstallment } from '@/lib/finance/utils.js';

export async function GET(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const budgetId = searchParams.get('budgetId');
  const search = searchParams.get('search');

  const where = { tenantId };
  if (status && status !== 'all') where.status = status;
  if (budgetId) where.budgetId = budgetId;
  if (search) {
    where.OR = [
      { clientName: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const items = await prisma.financialInstallment.findMany({
    where,
    orderBy: [{ dueDate: 'asc' }, { number: 'asc' }],
  });

  const installments = items.map((i) => {
    const statusResolved = resolveStatus(i.amount, i.status === 'PAID' ? i.amount : 0, i.dueDate, i.status);
    return serializeInstallment({ ...i, status: statusResolved });
  });

  return jsonResponse({ success: true, installments });
}
