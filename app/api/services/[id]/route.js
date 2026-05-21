export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { validateServiceBody } from '@/lib/validations';
import { jsonResponse, errorResponse, unauthorizedResponse, parseBody } from '@/lib/api';

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  const body = await parseBody(request);
  const validation = validateServiceBody(body);
  if (!validation.valid) return errorResponse(validation.error);
  const { slug, ...rest } = validation.data;
  const service = await prisma.service.update({
    where: { id: params.id },
    data: rest,
  });
  return jsonResponse({ success: true, service });
}

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  const count = await prisma.appointment.count({
    where: { serviceId: params.id, status: { not: 'CANCELLED' } },
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
