export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId, withTenantData } from '@/lib/tenant';
import { validateClientBody } from '@/lib/validations';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';

export async function GET(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');

  const where = { tenantId };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const clients = await prisma.client.findMany({
    where,
    orderBy: { name: 'asc' },
    include: {
      appointments: { take: 1, orderBy: { date: 'desc' }, include: { service: { select: { name: true } } } },
      _count: { select: { appointments: true } },
    },
  });

  return jsonResponse({ success: true, clients });
}

export async function POST(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const body = await parseBody(request);
  const validation = validateClientBody(body);
  if (!validation.valid) return errorResponse(validation.errors.join('. '));

  const client = await prisma.client.create({
    data: withTenantData(tenantId, validation.data),
  });
  return jsonResponse({ success: true, client }, 201);
}
