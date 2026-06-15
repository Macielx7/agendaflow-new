export const dynamic = 'force-dynamic';

import { startOfDay, endOfDay, subDays, format } from 'date-fns';
import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { jsonResponse } from '@/lib/api';
import { resolveStatus } from '@/lib/finance/utils.js';

export async function GET(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '60', 10);
  const today = startOfDay(new Date());
  const tf = { tenantId };

  const [receivables, payables] = await Promise.all([
    prisma.financialReceivable.findMany({ where: tf }),
    prisma.financialPayable.findMany({ where: tf }),
  ]);

  const rec = receivables.map((r) => ({
    ...r,
    status: resolveStatus(r.amount, r.paidAmount, r.dueDate, r.status),
  }));
  const pay = payables.map((p) => ({
    ...p,
    status: resolveStatus(p.amount, p.paidAmount, p.dueDate, p.status),
  }));

  const movements = [];

  rec.forEach((r) => {
    if (r.paidAt && (r.status === 'PAID' || r.status === 'PARTIAL')) {
      movements.push({
        id: `rec-${r.id}`,
        type: 'IN',
        description: r.description,
        clientName: r.clientName,
        amount: parseFloat(r.paidAmount || 0),
        date: format(r.paidAt, 'yyyy-MM-dd'),
        paymentMethod: r.paymentMethod,
      });
    }
  });

  pay.forEach((p) => {
    if (p.paidAt && (p.status === 'PAID' || p.status === 'PARTIAL')) {
      movements.push({
        id: `pay-${p.id}`,
        type: 'OUT',
        description: p.description,
        supplier: p.supplier,
        amount: parseFloat(p.paidAmount || 0),
        date: format(p.paidAt, 'yyyy-MM-dd'),
        paymentMethod: p.paymentMethod,
      });
    }
  });

  movements.sort((a, b) => b.date.localeCompare(a.date));

  const totalIn = movements.filter((m) => m.type === 'IN').reduce((s, m) => s + m.amount, 0);
  const totalOut = movements.filter((m) => m.type === 'OUT').reduce((s, m) => s + m.amount, 0);
  const currentBalance = totalIn - totalOut;

  const pendingIn = rec
    .filter((r) => r.status !== 'PAID' && r.status !== 'CANCELLED')
    .reduce((s, r) => s + parseFloat(r.amount) - parseFloat(r.paidAmount || 0), 0);

  const pendingOut = pay
    .filter((p) => p.status !== 'PAID' && p.status !== 'CANCELLED')
    .reduce((s, p) => s + parseFloat(p.amount) - parseFloat(p.paidAmount || 0), 0);

  const projectedBalance = currentBalance + pendingIn - pendingOut;

  const chart = Array.from({ length: Math.min(days, 90) }, (_, i) => {
    const d = subDays(today, days - 1 - i);
    const ds = format(d, 'yyyy-MM-dd');
    const dayMovements = movements.filter((m) => m.date === ds);
    const inflow = dayMovements.filter((m) => m.type === 'IN').reduce((s, m) => s + m.amount, 0);
    const outflow = dayMovements.filter((m) => m.type === 'OUT').reduce((s, m) => s + m.amount, 0);
    return { date: ds, inflow, outflow, net: inflow - outflow };
  });

  return jsonResponse({
    success: true,
    summary: {
      totalIn,
      totalOut,
      currentBalance,
      projectedBalance,
      pendingIn,
      pendingOut,
    },
    movements: movements.slice(0, 100),
    chart,
  });
}
