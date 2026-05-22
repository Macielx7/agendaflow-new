export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { jsonResponse } from '@/lib/api';

export async function DELETE(request, { params }) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const existing = await prisma.holiday.findFirst({ where: { id: params.id, tenantId } });
  if (!existing) return jsonResponse({ success: false, error: 'Não encontrado' }, 404);
  await prisma.holiday.update({ where: { id: params.id }, data: { active: false } });
  return jsonResponse({ success: true });
}
