export const dynamic = 'force-dynamic';

import { subDays, startOfMonth } from 'date-fns';
import prisma from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/superRequire';
import { jsonResponse } from '@/lib/api';

export async function GET() {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const now = new Date();
  const monthStart = startOfMonth(now);
  const last30 = subDays(now, 30);

  const [
    totalTenants,
    activeTenants,
    suspendedTenants,
    activeSubs,
    trialSubs,
    expiredSubs,
    newTenants,
    billingPaid,
    plans,
    recentTenants,
    chartSubs,
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { status: 'ACTIVE' } }),
    prisma.tenant.count({ where: { status: 'SUSPENDED' } }),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.subscription.count({ where: { status: 'TRIAL' } }),
    prisma.subscription.count({ where: { status: 'EXPIRED' } }),
    prisma.tenant.count({ where: { createdAt: { gte: last30 } } }),
    prisma.billingHistory.aggregate({
      where: { status: 'PAID', paidAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.plan.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.tenant.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { plan: true, subscription: true, _count: { select: { users: true } } },
    }),
    prisma.tenant.findMany({
      where: { createdAt: { gte: subDays(now, 6) } },
      select: { createdAt: true },
    }),
  ]);

  let mrr = 0;
  const activeWithPlan = await prisma.subscription.findMany({
    where: { status: { in: ['ACTIVE', 'TRIAL'] } },
    include: { plan: true },
  });
  activeWithPlan.forEach((s) => {
    mrr += parseFloat(s.plan?.priceMonthly || 0);
  });

  const chartMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = subDays(now, i).toISOString().slice(0, 10);
    chartMap[d] = { date: d, count: 0 };
  }
  chartSubs.forEach((t) => {
    const d = t.createdAt.toISOString().slice(0, 10);
    if (chartMap[d]) chartMap[d].count += 1;
  });

  const byPlan = await prisma.tenant.groupBy({
    by: ['planId'],
    _count: { planId: true },
    where: { planId: { not: null } },
  });

  return jsonResponse({
    success: true,
    stats: {
      totalTenants,
      activeTenants,
      suspendedTenants,
      activeSubs,
      trialSubs,
      expiredSubs,
      newTenants,
      mrr,
      revenueMonth: parseFloat(billingPaid._sum.amount || 0),
      churn: expiredSubs,
    },
    plans,
    recentTenants,
    chart: Object.values(chartMap),
    byPlan,
  });
}
