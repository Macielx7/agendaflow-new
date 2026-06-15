export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';

export async function PATCH(request, { params }) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const body = await parseBody(request);

  const existing = await prisma.financialCategory.findFirst({
    where: { id: params.id, tenantId },
  });
  if (!existing) return errorResponse('Categoria não encontrada', 404);

  const category = await prisma.financialCategory.update({
    where: { id: params.id },
    data: {
      name: body.name,
      active: body.active,
    },
  });

  return jsonResponse({ success: true, category });
}

export async function DELETE(request, { params }) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const existing = await prisma.financialCategory.findFirst({
    where: { id: params.id, tenantId },
  });
  if (!existing) return errorResponse('Categoria não encontrada', 404);
  if (existing.isSystem) return errorResponse('Categorias do sistema não podem ser removidas');

  await prisma.financialCategory.delete({ where: { id: params.id } });
  return jsonResponse({ success: true });
}
