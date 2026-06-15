export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId, withTenantData } from '@/lib/tenant';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';
import { toDecimal } from '@/lib/finance/utils.js';

export async function GET(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view') || 'commissions';
  const month = searchParams.get('month');

  if (view === 'rules') {
    const rules = await prisma.financialCommissionRule.findMany({
      where: { tenantId },
      orderBy: { dentistName: 'asc' },
    });
    return jsonResponse({
      success: true,
      rules: rules.map((r) => ({ ...r, percentage: parseFloat(r.percentage) })),
    });
  }

  const where = { tenantId };
  if (month) where.referenceMonth = month;

  const commissions = await prisma.financialCommission.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  const serialized = commissions.map((c) => ({
    ...c,
    baseAmount: parseFloat(c.baseAmount),
    percentage: parseFloat(c.percentage),
    commissionAmount: parseFloat(c.commissionAmount),
  }));

  const byDentist = {};
  serialized.forEach((c) => {
    if (!byDentist[c.dentistName]) {
      byDentist[c.dentistName] = { dentistName: c.dentistName, total: 0, count: 0 };
    }
    byDentist[c.dentistName].total += c.commissionAmount;
    byDentist[c.dentistName].count += 1;
  });

  return jsonResponse({
    success: true,
    commissions: serialized,
    summary: Object.values(byDentist),
  });
}

export async function POST(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const body = await parseBody(request);

  if (!body.dentistId || !body.dentistName || body.percentage == null) {
    return errorResponse('Dentista e percentual são obrigatórios');
  }

  const rule = await prisma.financialCommissionRule.create({
    data: withTenantData(tenantId, {
      dentistId: body.dentistId,
      dentistName: body.dentistName,
      percentage: toDecimal(body.percentage),
      serviceId: body.serviceId || null,
      serviceName: body.serviceName || null,
      active: body.active !== false,
    }),
  });

  return jsonResponse({ success: true, rule: { ...rule, percentage: parseFloat(rule.percentage) } });
}
