export const dynamic = 'force-dynamic';

import { requireTenantId } from '@/lib/tenant';
import { jsonResponse } from '@/lib/api';
import { syncInstanceStatus, getOrCreateInstanceRecord } from '@/lib/whatsapp/service';
import { getEvolutionConfig } from '@/lib/evolution/client';

export async function GET() {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  let instance = await getOrCreateInstanceRecord(tenantId);
  if (getEvolutionConfig().configured) {
    instance = await syncInstanceStatus(tenantId);
  }

  return jsonResponse({ success: true, instance });
}
