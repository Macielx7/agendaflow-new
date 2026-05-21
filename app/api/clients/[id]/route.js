export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { validateClientBody } from '@/lib/validations';
import { jsonResponse, errorResponse, unauthorizedResponse, parseBody } from '@/lib/api';

export async function GET(request, { params }) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      appointments: {
        orderBy: [{ date: 'desc' }, { time: 'desc' }],
        include: { service: true },
      },
    },
  });
  if (!client) return errorResponse('Cliente não encontrado', 404);
  return jsonResponse({ success: true, client });
}

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  const body = await parseBody(request);
  const validation = validateClientBody(body);
  if (!validation.valid) return errorResponse(validation.errors.join('. '));
  const client = await prisma.client.update({
    where: { id: params.id },
    data: validation.data,
  });
  return jsonResponse({ success: true, client });
}

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  const count = await prisma.appointment.count({
    where: { clientId: params.id, status: { not: 'CANCELLED' } },
  });
  if (count > 0) return errorResponse('Cliente possui agendamentos ativos');
  await prisma.client.delete({ where: { id: params.id } });
  return jsonResponse({ success: true });
}
