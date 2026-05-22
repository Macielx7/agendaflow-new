export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';

export async function GET() {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const schedules = await prisma.schedule.findMany({
    where: { tenantId },
    orderBy: { dayOfWeek: 'asc' },
  });
  return jsonResponse({ success: true, schedules });
}

export async function PUT(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const body = await parseBody(request);
  if (!body?.schedules || !Array.isArray(body.schedules)) {
    return errorResponse('Dados inválidos');
  }

  const results = await Promise.all(
    body.schedules.map((s) =>
      prisma.schedule.upsert({
        where: { tenantId_dayOfWeek: { tenantId, dayOfWeek: s.dayOfWeek } },
        update: {
          startTime: s.startTime,
          endTime: s.endTime,
          slotDuration: s.slotDuration || 60,
          breakStart: s.breakStart || null,
          breakEnd: s.breakEnd || null,
          active: s.active !== false,
        },
        create: {
          tenantId,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          slotDuration: s.slotDuration || 60,
          breakStart: s.breakStart || null,
          breakEnd: s.breakEnd || null,
          active: s.active !== false,
        },
      })
    )
  );

  return jsonResponse({ success: true, schedules: results });
}
