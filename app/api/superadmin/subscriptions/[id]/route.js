export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/superRequire';
import { logSystem } from '@/lib/superLog';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';

const VALID = ['TRIAL', 'ACTIVE', 'PENDING', 'SUSPENDED', 'CANCELLED', 'EXPIRED'];

export async function PATCH(request, { params }) {
  const { session, error } = await requireSuperAdmin();
  if (error) return error;
  const body = await parseBody(request);
  const data = {};
  if (body.status && VALID.includes(body.status)) {
    data.status = body.status;
    if (body.status === 'CANCELLED') data.cancelledAt = new Date();
    if (body.status === 'ACTIVE') data.renewedAt = new Date();
  }
  if (body.endsAt) data.endsAt = new Date(body.endsAt);
  if (body.planId) data.planId = body.planId;
  if (body.billingCycle) data.billingCycle = body.billingCycle;

  const subscription = await prisma.subscription.update({
    where: { id: params.id },
    data,
    include: { tenant: true, plan: true },
  });

  if (body.status === 'SUSPENDED') {
    await prisma.tenant.update({
      where: { id: subscription.tenantId },
      data: { status: 'SUSPENDED' },
    });
  }
  if (body.status === 'ACTIVE') {
    await prisma.tenant.update({
      where: { id: subscription.tenantId },
      data: { status: 'ACTIVE' },
    });
  }

  await logSystem({
    superAdminId: session.superAdminId,
    tenantId: subscription.tenantId,
    action: 'SUBSCRIPTION_UPDATED',
    details: body.status,
  });

  return jsonResponse({ success: true, subscription });
}
