export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId, withTenantData } from '@/lib/tenant';
import { validateClientBody } from '@/lib/validations';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';

const appointmentSelect = {
  id: true,
  date: true,
  time: true,
  status: true,
  createdAt: true,
  service: { select: { name: true } },
};

export async function GET(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const category = searchParams.get('category');
  const createdFrom = searchParams.get('createdFrom');
  const createdTo = searchParams.get('createdTo');

  const where = { tenantId };

  if (search) {
    const searchDigits = search.replace(/\D/g, '');
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
      { email: { contains: search, mode: 'insensitive' } },
      ...(searchDigits ? [{ cpf: { contains: searchDigits } }] : []),
    ];
  }

  if (createdFrom || createdTo) {
    where.createdAt = {};
    if (createdFrom) where.createdAt.gte = new Date(`${createdFrom}T00:00:00`);
    if (createdTo) where.createdAt.lte = new Date(`${createdTo}T23:59:59.999`);
  }

  if (category === 'consulted') {
    where.appointments = { some: { status: 'COMPLETED' } };
  } else if (category === 'no_show') {
    where.appointments = { some: { status: 'NO_SHOW' } };
  } else if (category === 'no_appointments') {
    where.appointments = { none: {} };
  } else if (category === 'has_appointments') {
    where.appointments = { some: {} };
  } else if (category === 'never_consulted') {
    where.AND = [
      ...(where.AND || []),
      { appointments: { some: {} } },
      { appointments: { none: { status: 'COMPLETED' } } },
    ];
  }

  const clients = await prisma.client.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      appointments: {
        orderBy: [{ date: 'desc' }, { time: 'desc' }],
        select: appointmentSelect,
      },
      _count: { select: { appointments: true } },
    },
  });

  const enriched = clients.map((c) => {
    const completed = c.appointments.filter((a) => a.status === 'COMPLETED');
    const noShows = c.appointments.filter((a) => a.status === 'NO_SHOW');
    const lastCompleted = completed[0] || null;
    const lastNoShow = noShows[0] || null;
    const lastAppointment = c.appointments[0] || null;

    return {
      ...c,
      stats: {
        totalAppointments: c._count.appointments,
        completedCount: completed.length,
        noShowCount: noShows.length,
        hasConsulted: completed.length > 0,
        isNoShow: noShows.length > 0,
        lastCompletedDate: lastCompleted?.date || null,
        lastNoShowDate: lastNoShow?.date || null,
        lastAppointmentDate: lastAppointment?.date || null,
      },
    };
  });

  return jsonResponse({ success: true, clients: enriched });
}

export async function POST(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  try {
    const body = await parseBody(request);
    const validation = validateClientBody(body);
    if (!validation.valid) return errorResponse(validation.errors.join('. '));

    const client = await prisma.client.create({
      data: withTenantData(tenantId, validation.data),
    });
    return jsonResponse({ success: true, client }, 201);
  } catch (err) {
    console.error('POST /api/clients:', err);
    if (err.code === 'P2002') return errorResponse('CPF já cadastrado para este cliente');
    return errorResponse(err.message || 'Erro ao criar cliente', 500);
  }
}
