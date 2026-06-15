export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId, withTenantData } from '@/lib/tenant';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';
import { ensureFinanceDefaults } from '@/lib/finance/ensureDefaults.js';

export async function GET(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  await ensureFinanceDefaults(tenantId);

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  const where = { tenantId };
  if (type) where.type = type;

  const categories = await prisma.financialCategory.findMany({
    where,
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
  });

  return jsonResponse({ success: true, categories });
}

export async function POST(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const body = await parseBody(request);

  if (!body.name || !body.type) return errorResponse('Nome e tipo são obrigatórios');

  const slug = (body.slug || body.name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const category = await prisma.financialCategory.create({
    data: withTenantData(tenantId, {
      name: body.name,
      slug,
      type: body.type,
      active: body.active !== false,
    }),
  });

  return jsonResponse({ success: true, category });
}
