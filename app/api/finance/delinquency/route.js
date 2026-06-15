export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { jsonResponse } from '@/lib/api';
import { resolveStatus, daysOverdue } from '@/lib/finance/utils.js';

export async function GET(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || 'all';

  const [receivables, installments] = await Promise.all([
    prisma.financialReceivable.findMany({
      where: { tenantId },
      include: { client: true },
    }),
    prisma.financialInstallment.findMany({ where: { tenantId } }),
  ]);

  const overdueItems = [];

  receivables.forEach((r) => {
    const status = resolveStatus(r.amount, r.paidAmount, r.dueDate, r.status);
    if (status !== 'OVERDUE') return;
    const days = daysOverdue(r.dueDate);
    overdueItems.push({
      id: r.id,
      type: 'receivable',
      clientId: r.clientId,
      clientName: r.clientName,
      clientCpf: r.clientCpf,
      clientPhone: r.client?.phone,
      description: r.description,
      amount: parseFloat(r.amount) - parseFloat(r.paidAmount || 0),
      dueDate: r.dueDate,
      daysOverdue: days,
    });
  });

  installments.forEach((i) => {
    const status = resolveStatus(i.amount, i.status === 'PAID' ? i.amount : 0, i.dueDate, i.status);
    if (status !== 'OVERDUE') return;
    const days = daysOverdue(i.dueDate);
    overdueItems.push({
      id: i.id,
      type: 'installment',
      clientId: i.clientId,
      clientName: i.clientName,
      clientCpf: i.clientCpf,
      description: i.description,
      amount: parseFloat(i.amount),
      dueDate: i.dueDate,
      daysOverdue: days,
      number: i.number,
    });
  });

  const filtered = overdueItems.filter((item) => {
    if (range === '30') return item.daysOverdue <= 30;
    if (range === '60') return item.daysOverdue > 30 && item.daysOverdue <= 60;
    if (range === '90') return item.daysOverdue > 60 && item.daysOverdue <= 90;
    if (range === '120') return item.daysOverdue > 90;
    return true;
  });

  const byClient = {};
  filtered.forEach((item) => {
    const key = item.clientId || item.clientName;
    if (!byClient[key]) {
      byClient[key] = {
        clientId: item.clientId,
        clientName: item.clientName,
        clientCpf: item.clientCpf,
        clientPhone: item.clientPhone,
        totalOverdue: 0,
        maxDays: 0,
        items: [],
      };
    }
    byClient[key].totalOverdue += item.amount;
    byClient[key].maxDays = Math.max(byClient[key].maxDays, item.daysOverdue);
    byClient[key].items.push(item);
  });

  const clients = Object.values(byClient).sort((a, b) => b.totalOverdue - a.totalOverdue);
  const totalOverdue = filtered.reduce((s, i) => s + i.amount, 0);

  return jsonResponse({
    success: true,
    totalOverdue,
    clientCount: clients.length,
    itemCount: filtered.length,
    clients,
    items: filtered.sort((a, b) => b.daysOverdue - a.daysOverdue),
  });
}
