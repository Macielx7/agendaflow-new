export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { getAvailableSlots } from '@/lib/slots';
import { jsonResponse, errorResponse } from '@/lib/api';

export async function GET(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const serviceId = searchParams.get('serviceId');
  if (!date) return errorResponse('Informe a data');

  let duration = 60;
  if (serviceId) {
    const service = await prisma.service.findFirst({ where: { id: serviceId, tenantId } });
    if (service) duration = service.duration;
  }

  const result = await getAvailableSlots(date, tenantId, duration);
  return jsonResponse({ success: true, date, ...result });
}
