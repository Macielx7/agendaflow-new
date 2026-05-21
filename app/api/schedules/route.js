export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { jsonResponse, unauthorizedResponse, errorResponse, parseBody } from '@/lib/api';

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  const schedules = await prisma.schedule.findMany({ orderBy: { dayOfWeek: 'asc' } });
  return jsonResponse({ success: true, schedules });
}

export async function PUT(request) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  const body = await parseBody(request);
  if (!body?.schedules || !Array.isArray(body.schedules)) {
    return errorResponse('Dados inválidos');
  }

  const results = await Promise.all(
    body.schedules.map((s) =>
      prisma.schedule.upsert({
        where: { dayOfWeek: s.dayOfWeek },
        update: {
          startTime: s.startTime,
          endTime: s.endTime,
          slotDuration: s.slotDuration || 60,
          breakStart: s.breakStart || null,
          breakEnd: s.breakEnd || null,
          active: s.active !== false,
        },
        create: {
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
