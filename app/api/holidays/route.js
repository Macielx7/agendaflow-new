export const dynamic = 'force-dynamic';

import { startOfDay } from 'date-fns';
import prisma from '@/lib/prisma';
import { requireTenantId, withTenantData } from '@/lib/tenant';
import { sanitizeString } from '@/lib/validations';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';

export async function GET() {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const holidays = await prisma.holiday.findMany({
    where: { tenantId, active: true },
    orderBy: { date: 'asc' },
  });
  return jsonResponse({ success: true, holidays });
}

export async function POST(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const body = await parseBody(request);
  if (!body?.date) return errorResponse('Data obrigatória');
  const holiday = await prisma.holiday.create({
    data: withTenantData(tenantId, {
      date: startOfDay(new Date(body.date + 'T12:00:00')),
      name: sanitizeString(body.name || 'Feriado', 120),
      active: true,
    }),
  });
  return jsonResponse({ success: true, holiday }, 201);
}
