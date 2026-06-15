export const dynamic = 'force-dynamic';

import { addDays, startOfDay, endOfDay } from 'date-fns';
import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { jsonResponse } from '@/lib/api';
import { resolveStatus } from '@/lib/finance/utils.js';
import { notifyInstallmentReminder, sendFinanceWhatsApp } from '@/lib/finance/whatsapp.js';
import { formatCurrency, formatDateShort } from '@/utils/format.js';
import { daysOverdue } from '@/lib/finance/utils.js';

export async function POST(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const today = startOfDay(new Date());
  const in3days = endOfDay(addDays(today, 3));

  const installments = await prisma.financialInstallment.findMany({
    where: {
      tenantId,
      dueDate: { gte: today, lte: in3days },
      status: { in: ['PENDING', 'OVERDUE', 'PARTIAL'] },
    },
  });

  let sent = 0;
  for (const inst of installments) {
    try {
      await notifyInstallmentReminder(tenantId, inst.id);
      sent += 1;
    } catch {
      /* skip */
    }
  }

  const overdue = await prisma.financialInstallment.findMany({
    where: { tenantId, status: { in: ['PENDING', 'OVERDUE', 'PARTIAL'] } },
  });

  for (const inst of overdue) {
    const status = resolveStatus(inst.amount, 0, inst.dueDate, inst.status);
    if (status !== 'OVERDUE') continue;
    if (!inst.clientId) continue;
    const client = await prisma.client.findFirst({ where: { id: inst.clientId, tenantId } });
    if (!client?.phone) continue;
    try {
      await sendFinanceWhatsApp(tenantId, client.phone, inst.clientName, 'overdue', {
        clientName: inst.clientName,
        number: inst.number,
        description: inst.description,
        dueDate: formatDateShort(inst.dueDate),
        amount: formatCurrency(inst.amount),
        days: daysOverdue(inst.dueDate),
      });
      sent += 1;
    } catch {
      /* skip */
    }
  }

  return jsonResponse({ success: true, sent });
}
