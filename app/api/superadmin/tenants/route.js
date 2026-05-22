export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/superRequire';
import { provisionTenant } from '@/lib/tenantProvision';
import { logSystem } from '@/lib/superLog';
import { sanitizeString } from '@/lib/validations';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';

export async function GET(request) {
  const { error } = await requireSuperAdmin();
  if (error) return error;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  const where = {};
  if (status && status !== 'all') where.status = status;
  if (search) {
    where.OR = [
      { companyName: { contains: search, mode: 'insensitive' } },
      { ownerName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const tenants = await prisma.tenant.findMany({
    where,
    include: {
      plan: true,
      subscription: true,
      _count: { select: { users: true, appointments: true, clients: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return jsonResponse({ success: true, tenants });
}

export async function POST(request) {
  const { session, error } = await requireSuperAdmin();
  if (error) return error;
  const body = await parseBody(request);
  if (!body?.companyName || !body?.email || !body?.planId) {
    return errorResponse('Empresa, e-mail e plano obrigatórios');
  }

  const tenant = await provisionTenant({
    companyName: sanitizeString(body.companyName, 120),
    ownerName: sanitizeString(body.ownerName || body.companyName, 120),
    email: sanitizeString(body.email, 120).toLowerCase(),
    phone: body.phone ? sanitizeString(body.phone, 20) : null,
    planId: body.planId,
    adminPassword: body.adminPassword,
    slug: body.slug,
  });

  await logSystem({
    superAdminId: session.superAdminId,
    tenantId: tenant.id,
    action: 'TENANT_CREATED',
    details: tenant.companyName,
  });

  return jsonResponse({ success: true, tenant }, 201);
}
