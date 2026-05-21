export const dynamic = 'force-dynamic';

import { startOfDay } from 'date-fns';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sanitizeString } from '@/lib/validations';
import { jsonResponse, unauthorizedResponse, errorResponse, parseBody } from '@/lib/api';

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  const holidays = await prisma.holiday.findMany({
    orderBy: { date: 'asc' },
    where: { active: true },
  });
  return jsonResponse({ success: true, holidays });
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  const body = await parseBody(request);
  if (!body?.date) return errorResponse('Data obrigatória');
  const holiday = await prisma.holiday.create({
    data: {
      date: startOfDay(new Date(body.date + 'T12:00:00')),
      name: sanitizeString(body.name || 'Feriado', 120),
      active: true,
    },
  });
  return jsonResponse({ success: true, holiday }, 201);
}
