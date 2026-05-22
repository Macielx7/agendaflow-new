export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/superRequire';
import { sanitizeString } from '@/lib/validations';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';

export async function PATCH(request, { params }) {
  const { error } = await requireSuperAdmin();
  if (error) return error;
  const body = await parseBody(request);
  const data = {};
  if (body.name) data.name = sanitizeString(body.name, 120);
  if (body.description !== undefined) data.description = sanitizeString(body.description, 500) || null;
  if (body.priceMonthly != null) data.priceMonthly = parseFloat(body.priceMonthly);
  if (body.priceYearly != null) data.priceYearly = parseFloat(body.priceYearly);
  if (body.maxUsers != null) data.maxUsers = parseInt(body.maxUsers, 10);
  if (body.maxAppointments != null) data.maxAppointments = parseInt(body.maxAppointments, 10);
  if (body.features != null) data.features = body.features;
  if (body.active != null) data.active = body.active;
  if (body.sortOrder != null) data.sortOrder = parseInt(body.sortOrder, 10);

  const plan = await prisma.plan.update({ where: { id: params.id }, data });
  return jsonResponse({ success: true, plan });
}
