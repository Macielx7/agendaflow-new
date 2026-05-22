export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { jsonResponse } from '@/lib/api';

export async function GET(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '30', 10), 100);
  const status = searchParams.get('status');

  const where = { tenantId };
  if (status) where.status = status;

  const messages = await prisma.whatsappMessage.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return jsonResponse({ success: true, messages });
}
