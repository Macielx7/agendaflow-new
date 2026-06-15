export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';
import { toDecimal } from '@/lib/finance/utils.js';

export async function PATCH(request, { params }) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const body = await parseBody(request);

  const existing = await prisma.financialCommissionRule.findFirst({
    where: { id: params.id, tenantId },
  });
  if (!existing) return errorResponse('Regra não encontrada', 404);

  const rule = await prisma.financialCommissionRule.update({
    where: { id: params.id },
    data: {
      percentage: body.percentage != null ? toDecimal(body.percentage) : undefined,
      serviceId: body.serviceId,
      serviceName: body.serviceName,
      active: body.active,
    },
  });

  return jsonResponse({ success: true, rule: { ...rule, percentage: parseFloat(rule.percentage) } });
}

export async function DELETE(request, { params }) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const existing = await prisma.financialCommissionRule.findFirst({
    where: { id: params.id, tenantId },
  });
  if (!existing) return errorResponse('Regra não encontrada', 404);

  await prisma.financialCommissionRule.delete({ where: { id: params.id } });
  return jsonResponse({ success: true });
}
