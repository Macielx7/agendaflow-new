export const dynamic = 'force-dynamic';

import { requireTenantId } from '@/lib/tenant';
import { jsonResponse, errorResponse } from '@/lib/api';
import { disconnectWhatsapp } from '@/lib/whatsapp/service';

export async function POST() {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  try {
    const instance = await disconnectWhatsapp(tenantId);
    return jsonResponse({ success: true, instance });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
