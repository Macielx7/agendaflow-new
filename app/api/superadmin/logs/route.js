export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/superRequire';
import { jsonResponse } from '@/lib/api';

export async function GET(request) {
  const { error } = await requireSuperAdmin();
  if (error) return error;
  const limit = parseInt(new URL(request.url).searchParams.get('limit') || '50', 10);

  const logs = await prisma.systemLog.findMany({
    include: {
      tenant: { select: { companyName: true } },
      superAdmin: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: Math.min(limit, 200),
  });

  return jsonResponse({ success: true, logs });
}
