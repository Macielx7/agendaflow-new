export const dynamic = 'force-dynamic';

import { startOfDay, endOfDay, addDays } from 'date-fns';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { jsonResponse, unauthorizedResponse } from '@/lib/api';

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const today = startOfDay(new Date());
  const weekEnd = endOfDay(addDays(today, 7));

  const [todayAppointments, weekCount, pendingCount, confirmedCount, recent, byProcedure] =
    await Promise.all([
      prisma.appointment.findMany({
        where: {
          date: today,
          status: { not: 'CANCELLED' },
        },
        include: { procedure: { select: { name: true, color: true } } },
        orderBy: { time: 'asc' },
      }),
      prisma.appointment.count({
        where: {
          date: { gte: today, lte: weekEnd },
          status: { not: 'CANCELLED' },
        },
      }),
      prisma.appointment.count({ where: { status: 'PENDING' } }),
      prisma.appointment.count({ where: { status: 'CONFIRMED' } }),
      prisma.appointment.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { procedure: { select: { name: true } } },
      }),
      prisma.appointment.groupBy({
        by: ['procedureId'],
        _count: { procedureId: true },
        where: { status: { not: 'CANCELLED' } },
      }),
    ]);

  const procedureIds = byProcedure.map((p) => p.procedureId);
  const procedures = await prisma.procedure.findMany({
    where: { id: { in: procedureIds } },
    select: { id: true, name: true, color: true },
  });

  const procedureMap = Object.fromEntries(procedures.map((p) => [p.id, p]));
  const procedureStats = byProcedure.map((p) => ({
    procedure: procedureMap[p.procedureId],
    count: p._count.procedureId,
  }));

  return jsonResponse({
    success: true,
    stats: {
      today: todayAppointments.length,
      week: weekCount,
      pending: pendingCount,
      confirmed: confirmedCount,
    },
    todayAppointments,
    recent,
    procedureStats,
  });
}
