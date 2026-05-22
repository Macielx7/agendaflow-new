export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/superRequire';
import { jsonResponse } from '@/lib/api';

export async function GET(request) {
  const { error } = await requireSuperAdmin();
  if (error) return error;
  const status = new URL(request.url).searchParams.get('status');

  const where = {};
  if (status && status !== 'all') where.status = status;

  const subscriptions = await prisma.subscription.findMany({
    where,
    include: { tenant: true, plan: true },
    orderBy: { createdAt: 'desc' },
  });

  return jsonResponse({ success: true, subscriptions });
}
