export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { getAvailableSlots } from '@/lib/slots';
import { jsonResponse, unauthorizedResponse, errorResponse } from '@/lib/api';

export async function GET(request) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const serviceId = searchParams.get('serviceId');
  if (!date) return errorResponse('Informe a data');

  let duration = 60;
  if (serviceId) {
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (service) duration = service.duration;
  }

  const result = await getAvailableSlots(date, duration);
  return jsonResponse({ success: true, date, ...result });
}
