export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { jsonResponse, unauthorizedResponse } from '@/lib/api';

export async function GET(request) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const date = searchParams.get('date');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const skip = (page - 1) * limit;

  const where = {};

  if (status && status !== 'all') {
    where.status = status;
  }

  if (date) {
    where.date = new Date(date + 'T12:00:00');
  }

  if (search) {
    where.OR = [
      { patientName: { contains: search, mode: 'insensitive' } },
      { patientPhone: { contains: search } },
      { patientEmail: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [appointments, total, stats] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        procedure: { select: { name: true, slug: true, icon: true, color: true } },
      },
      orderBy: [{ date: 'desc' }, { time: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.appointment.count({ where }),
    prisma.appointment.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
  ]);

  const statusCounts = stats.reduce((acc, s) => {
    acc[s.status] = s._count.status;
    return acc;
  }, {});

  return jsonResponse({
    success: true,
    appointments,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    statusCounts,
  });
}
