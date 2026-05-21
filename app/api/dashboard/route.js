export const dynamic = 'force-dynamic';

import { startOfDay, endOfDay, addDays, subDays, format } from 'date-fns';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { jsonResponse, unauthorizedResponse } from '@/lib/api';

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const today = startOfDay(new Date());
  const weekStart = subDays(today, 6);
  const monthStart = subDays(today, 29);

  const [
    totalAppointments,
    todayCount,
    todayAppointments,
    pendingCount,
    confirmedCount,
    recent,
    weekData,
    revenueAgg,
  ] = await Promise.all([
    prisma.appointment.count({ where: { status: { not: 'CANCELLED' } } }),
    prisma.appointment.count({
      where: { date: today, status: { not: 'CANCELLED' } },
    }),
    prisma.appointment.findMany({
      where: { date: today, status: { not: 'CANCELLED' } },
      include: { client: true, service: true },
      orderBy: { time: 'asc' },
      take: 10,
    }),
    prisma.appointment.count({ where: { status: 'PENDING' } }),
    prisma.appointment.count({ where: { status: 'CONFIRMED' } }),
    prisma.appointment.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { client: true, service: true },
    }),
    prisma.appointment.findMany({
      where: {
        date: { gte: weekStart, lte: endOfDay(today) },
        status: { not: 'CANCELLED' },
      },
      select: { date: true, price: true },
    }),
    prisma.appointment.aggregate({
      where: {
        date: { gte: monthStart },
        status: { in: ['CONFIRMED', 'COMPLETED', 'IN_PROGRESS'] },
      },
      _sum: { price: true },
    }),
  ]);

  const chartMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = format(subDays(today, i), 'yyyy-MM-dd');
    chartMap[d] = { date: d, count: 0, revenue: 0 };
  }
  weekData.forEach((a) => {
    const d = format(a.date, 'yyyy-MM-dd');
    if (chartMap[d]) {
      chartMap[d].count += 1;
      chartMap[d].revenue += parseFloat(a.price || 0);
    }
  });

  const upcoming = await prisma.appointment.findMany({
    where: {
      date: { gte: today, lte: endOfDay(addDays(today, 7)) },
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
    include: { client: true, service: true },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
    take: 6,
  });

  const byStatus = await prisma.appointment.groupBy({
    by: ['status'],
    _count: { status: true },
  });

  return jsonResponse({
    success: true,
    stats: {
      total: totalAppointments,
      today: todayCount,
      pending: pendingCount,
      confirmed: confirmedCount,
      revenue: parseFloat(revenueAgg._sum.price || 0),
    },
    todayAppointments,
    recent,
    upcoming,
    chart: Object.values(chartMap),
    statusCounts: byStatus.reduce((acc, s) => {
      acc[s.status] = s._count.status;
      return acc;
    }, {}),
  });
}
