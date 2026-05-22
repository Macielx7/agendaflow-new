export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { jsonResponse, errorResponse } from '@/lib/api';
import {
  getOrCreateInstanceRecord,
  connectWhatsapp,
  syncInstanceStatus,
} from '@/lib/whatsapp/service';
import { getEvolutionConfig } from '@/lib/evolution/client';

export async function GET() {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  let instance = await getOrCreateInstanceRecord(tenantId);
  if (getEvolutionConfig().configured) {
    instance = await syncInstanceStatus(tenantId);
  }

  const settings = await prisma.whatsappSettings.findUnique({ where: { tenantId } });

  return jsonResponse({
    success: true,
    instance,
    settings,
    evolutionConfigured: getEvolutionConfig().configured,
  });
}

export async function POST() {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  try {
    const instance = await connectWhatsapp(tenantId);
    return jsonResponse({ success: true, instance });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
