export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/superRequire';
import { logSystem } from '@/lib/superLog';
import { sanitizeString } from '@/lib/validations';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';

export async function GET(request, { params }) {
  const { error } = await requireSuperAdmin();
  if (error) return error;
  const tenant = await prisma.tenant.findUnique({
    where: { id: params.id },
    include: {
      plan: true,
      subscription: true,
      users: { select: { id: true, email: true, name: true, role: true, createdAt: true } },
      featurePermissions: true,
      _count: { select: { appointments: true, clients: true, services: true } },
    },
  });
  if (!tenant) return errorResponse('Não encontrado', 404);
  return jsonResponse({ success: true, tenant });
}

export async function PATCH(request, { params }) {
  const { session, error } = await requireSuperAdmin();
  if (error) return error;
  const body = await parseBody(request);

  const data = {};
  if (body.companyName) data.companyName = sanitizeString(body.companyName, 120);
  if (body.ownerName) data.ownerName = sanitizeString(body.ownerName, 120);
  if (body.email) data.email = sanitizeString(body.email, 120).toLowerCase();
  if (body.phone !== undefined) data.phone = body.phone ? sanitizeString(body.phone, 20) : null;
  if (body.status) data.status = body.status;
  if (body.planId) data.planId = body.planId;

  const tenant = await prisma.tenant.update({
    where: { id: params.id },
    data,
    include: { plan: true, subscription: true },
  });

  if (body.planId && tenant.subscription) {
    await prisma.subscription.update({
      where: { tenantId: params.id },
      data: { planId: body.planId },
    });
  }

  await logSystem({
    superAdminId: session.superAdminId,
    tenantId: params.id,
    action: 'TENANT_UPDATED',
    details: JSON.stringify(body),
  });

  return jsonResponse({ success: true, tenant });
}

export async function DELETE(request, { params }) {
  const { session, error } = await requireSuperAdmin();
  if (error) return error;
  await prisma.tenant.update({
    where: { id: params.id },
    data: { status: 'CANCELLED' },
  });
  await prisma.subscription.updateMany({
    where: { tenantId: params.id },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
  });
  await logSystem({
    superAdminId: session.superAdminId,
    tenantId: params.id,
    action: 'TENANT_CANCELLED',
  });
  return jsonResponse({ success: true });
}
