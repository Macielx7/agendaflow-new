export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { validateClientBody } from '@/lib/validations';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';

export async function GET(request, { params }) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const client = await prisma.client.findFirst({
    where: { id: params.id, tenantId },
    include: { appointments: { orderBy: [{ date: 'desc' }, { time: 'desc' }], include: { service: true } } },
  });
  if (!client) return errorResponse('Cliente não encontrado', 404);
  return jsonResponse({ success: true, client });
}

export async function PATCH(request, { params }) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const body = await parseBody(request);
  const validation = validateClientBody(body);
  if (!validation.valid) return errorResponse(validation.errors.join('. '));
  const existing = await prisma.client.findFirst({ where: { id: params.id, tenantId } });
  if (!existing) return errorResponse('Cliente não encontrado', 404);
  try {
    const client = await prisma.client.update({ where: { id: params.id }, data: validation.data });
    return jsonResponse({ success: true, client });
  } catch (err) {
    if (err.code === 'P2002') return errorResponse('CPF já cadastrado para este cliente');
    throw err;
  }
}

export async function DELETE(request, { params }) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const existing = await prisma.client.findFirst({ where: { id: params.id, tenantId } });
  if (!existing) return errorResponse('Cliente não encontrado', 404);

  const activeCount = await prisma.appointment.count({
    where: {
      clientId: params.id,
      tenantId,
      status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
    },
  });
  if (activeCount > 0) {
    return errorResponse('Cliente possui agendamentos ativos. Cancele ou finalize antes de excluir.');
  }

  try {
    await prisma.$transaction([
      prisma.appointment.deleteMany({ where: { clientId: params.id, tenantId } }),
      prisma.client.delete({ where: { id: params.id } }),
    ]);
    return jsonResponse({ success: true });
  } catch (err) {
    console.error('DELETE /api/clients:', err);
    return errorResponse('Não foi possível excluir o cliente', 500);
  }
}
