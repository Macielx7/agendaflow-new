export const dynamic = 'force-dynamic';

import {
  startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear,
  subMonths, format, eachMonthOfInterval, subDays,
} from 'date-fns';
import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { jsonResponse } from '@/lib/api';
import { ensureFinanceDefaults } from '@/lib/finance/ensureDefaults.js';
import { resolveStatus } from '@/lib/finance/utils.js';

export async function GET() {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  await ensureFinanceDefaults(tenantId);

  const today = startOfDay(new Date());
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const yearStart = startOfYear(today);
  const yearEnd = endOfYear(today);
  const tf = { tenantId };

  const receivables = await prisma.financialReceivable.findMany({ where: tf });
  const payables = await prisma.financialPayable.findMany({ where: tf });
  const installments = await prisma.financialInstallment.findMany({ where: tf });

  const syncStatus = (items) =>
    items.map((item) => ({
      ...item,
      status: resolveStatus(item.amount, item.paidAmount, item.dueDate, item.status),
    }));

  const rec = syncStatus(receivables);
  const pay = syncStatus(payables);
  const inst = syncStatus(installments);

  const paidReceivables = rec.filter((r) => r.status === 'PAID' || r.status === 'PARTIAL');
  const monthRevenue = paidReceivables
    .filter((r) => r.paidAt && r.paidAt >= monthStart && r.paidAt <= monthEnd)
    .reduce((s, r) => s + parseFloat(r.paidAmount || 0), 0);

  const dayRevenue = paidReceivables
    .filter((r) => r.paidAt && startOfDay(r.paidAt).getTime() === today.getTime())
    .reduce((s, r) => s + parseFloat(r.paidAmount || 0), 0);

  const yearRevenue = paidReceivables
    .filter((r) => r.paidAt && r.paidAt >= yearStart && r.paidAt <= yearEnd)
    .reduce((s, r) => s + parseFloat(r.paidAmount || 0), 0);

  const monthExpenses = pay
    .filter((p) => p.paidAt && p.paidAt >= monthStart && p.paidAt <= monthEnd)
    .reduce((s, p) => s + parseFloat(p.paidAmount || 0), 0);

  const overdueCount = [...rec, ...inst].filter((i) => i.status === 'OVERDUE').length;
  const dueSoon = [...rec, ...inst].filter((i) => {
    if (i.status === 'PAID' || i.status === 'CANCELLED') return false;
    const due = startOfDay(i.dueDate);
    const limit = endOfDay(subDays(today, -7));
    return due >= today && due <= limit;
  }).length;

  const activeClients = await prisma.client.count({
    where: {
      tenantId,
      OR: [
        { financialReceivables: { some: { status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } } } },
        { financialBudgets: { some: { status: 'APPROVED' } } },
      ],
    },
  });

  const delinquentClientIds = new Set();
  inst.filter((i) => i.status === 'OVERDUE' && i.clientId).forEach((i) => delinquentClientIds.add(i.clientId));
  rec.filter((r) => r.status === 'OVERDUE' && r.clientId).forEach((r) => delinquentClientIds.add(r.clientId));

  const completedCount = paidReceivables.length || 1;
  const ticketMedio = monthRevenue / Math.max(paidReceivables.filter((r) => r.paidAt >= monthStart).length, 1);

  const months = eachMonthOfInterval({ start: subMonths(today, 11), end: today });
  const monthlyRevenue = months.map((m) => {
    const ms = startOfMonth(m);
    const me = endOfMonth(m);
    const revenue = paidReceivables
      .filter((r) => r.paidAt && r.paidAt >= ms && r.paidAt <= me)
      .reduce((s, r) => s + parseFloat(r.paidAmount || 0), 0);
    const expenses = pay
      .filter((p) => p.paidAt && p.paidAt >= ms && p.paidAt <= me)
      .reduce((s, p) => s + parseFloat(p.paidAmount || 0), 0);
    return { month: format(m, 'yyyy-MM'), label: format(m, 'MMM/yy'), revenue, expenses, profit: revenue - expenses };
  });

  const byProcedure = {};
  rec.forEach((r) => {
    const key = r.description || 'Outros';
    if (r.status === 'PAID' || r.status === 'PARTIAL') {
      byProcedure[key] = (byProcedure[key] || 0) + parseFloat(r.paidAmount || 0);
    }
  });
  const revenueByProcedure = Object.entries(byProcedure)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const byDentist = {};
  rec.forEach((r) => {
    if (!r.dentistName) return;
    if (r.status === 'PAID' || r.status === 'PARTIAL') {
      byDentist[r.dentistName] = (byDentist[r.dentistName] || 0) + parseFloat(r.paidAmount || 0);
    }
  });
  const revenueByDentist = Object.entries(byDentist)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const cashflowDays = Array.from({ length: 30 }, (_, i) => {
    const d = subDays(today, 29 - i);
    const ds = startOfDay(d);
    const de = endOfDay(d);
    const inflow = paidReceivables
      .filter((r) => r.paidAt && r.paidAt >= ds && r.paidAt <= de)
      .reduce((s, r) => s + parseFloat(r.paidAmount || 0), 0);
    const outflow = pay
      .filter((p) => p.paidAt && p.paidAt >= ds && p.paidAt <= de)
      .reduce((s, p) => s + parseFloat(p.paidAmount || 0), 0);
    return { date: format(d, 'yyyy-MM-dd'), inflow, outflow, balance: inflow - outflow };
  });

  let running = 0;
  const evolution = cashflowDays.map((d) => {
    running += d.balance;
    return { ...d, cumulative: running };
  });

  return jsonResponse({
    success: true,
    kpis: {
      monthRevenue,
      dayRevenue,
      yearRevenue,
      monthExpenses,
      netProfit: monthRevenue - monthExpenses,
      ticketMedio,
      activeClients,
      delinquentClients: delinquentClientIds.size,
      overdueCount,
      dueSoon,
    },
    charts: {
      monthlyRevenue,
      revenueByProcedure,
      revenueByDentist,
      cashflow: cashflowDays,
      evolution,
    },
  });
}
