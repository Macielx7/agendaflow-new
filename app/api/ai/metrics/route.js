export const dynamic = 'force-dynamic';

import { requireTenantId } from '@/lib/tenant';
import { jsonResponse } from '@/lib/api';
import { getAiMetrics } from '@/lib/ai/metrics';

export async function GET(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const days = Math.min(90, Math.max(1, parseInt(searchParams.get('days') || '30', 10)));

  const metrics = await getAiMetrics(tenantId, days);
  return jsonResponse({ success: true, metrics });
}
