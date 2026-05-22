export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { validateServiceBody } from '@/lib/validations';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';

export async function PATCH(request, { params }) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const body = await parseBody(request);
  const validation = validateServiceBody(body);
  if (!validation.valid) return errorResponse(validation.error);
  const existing = await prisma.service.findFirst({ where: { id: params.id, tenantId } });
  if (!existing) return errorResponse('Não encontrado', 404);
  const { slug, ...rest } = validation.data;
  const service = await prisma.service.update({ where: { id: params.id }, data: rest });
  return jsonResponse({ success: true, service });
}

export async function DELETE(request, { params }) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const count = await prisma.appointment.count({
    where: { serviceId: params.id, tenantId, status: { not: 'CANCELLED' } },
  });
  if (count > 0) {
    const service = await prisma.service.update({
      where: { id: params.id },
      data: { active: false },
    });
    return jsonResponse({ success: true, service, deactivated: true });
  }
  await prisma.service.delete({ where: { id: params.id } });
  return jsonResponse({ success: true });
}
