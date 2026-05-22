export const dynamic = 'force-dynamic';

import { requireTenantId } from '@/lib/tenant';
import { jsonResponse, errorResponse } from '@/lib/api';
import { refreshQrCode } from '@/lib/whatsapp/service';
import { getEvolutionConfig } from '@/lib/evolution/client';

export async function GET() {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  if (!getEvolutionConfig().configured) {
    return errorResponse('Evolution API não configurada');
  }

  try {
    const instance = await refreshQrCode(tenantId);
    return jsonResponse({ success: true, instance });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
