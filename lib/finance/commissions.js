import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { toDecimal } from './utils.js';

export async function calculateCommissionForReceivable(tenantId, receivable) {
  if (!receivable.dentistId || receivable.status !== 'PAID') return null;

  const rules = await prisma.financialCommissionRule.findMany({
    where: {
      tenantId,
      dentistId: receivable.dentistId,
      active: true,
      OR: [{ serviceId: null }, { serviceId: receivable.serviceId || undefined }],
    },
    orderBy: { serviceId: 'desc' },
  });

  const rule = rules[0];
  if (!rule) return null;

  const baseAmount = toDecimal(receivable.paidAmount || receivable.amount);
  const percentage = parseFloat(rule.percentage);
  const commissionAmount = toDecimal((baseAmount * percentage) / 100);
  const referenceMonth = receivable.paidAt
    ? format(receivable.paidAt, 'yyyy-MM')
    : format(new Date(), 'yyyy-MM');

  const existing = await prisma.financialCommission.findFirst({
    where: { tenantId, receivableId: receivable.id },
  });

  if (existing) {
    return prisma.financialCommission.update({
      where: { id: existing.id },
      data: { baseAmount, percentage, commissionAmount, referenceMonth, paidAt: receivable.paidAt },
    });
  }

  return prisma.financialCommission.create({
    data: {
      tenantId,
      receivableId: receivable.id,
      dentistId: receivable.dentistId,
      dentistName: receivable.dentistName || rule.dentistName,
      baseAmount,
      percentage,
      commissionAmount,
      referenceMonth,
      paidAt: receivable.paidAt,
    },
  });
}
