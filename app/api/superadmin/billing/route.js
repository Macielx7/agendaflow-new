export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/superRequire';
import { jsonResponse } from '@/lib/api';

export async function GET() {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const [history, summary] = await Promise.all([
    prisma.billingHistory.findMany({
      include: { tenant: { select: { companyName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.billingHistory.groupBy({
      by: ['status'],
      _sum: { amount: true },
      _count: { status: true },
    }),
  ]);

  const totalPaid = history
    .filter((h) => h.status === 'PAID')
    .reduce((s, h) => s + parseFloat(h.amount), 0);

  return jsonResponse({ success: true, history, summary, totalPaid });
}
