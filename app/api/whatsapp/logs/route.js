export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { jsonResponse } from '@/lib/api';

export async function GET(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

  const logs = await prisma.whatsappLog.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return jsonResponse({ success: true, logs });
}
