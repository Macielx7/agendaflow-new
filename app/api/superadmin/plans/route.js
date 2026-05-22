export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/superRequire';
import { sanitizeString } from '@/lib/validations';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';

export async function GET() {
  const { error } = await requireSuperAdmin();
  if (error) return error;
  const plans = await prisma.plan.findMany({ orderBy: { sortOrder: 'asc' } });
  return jsonResponse({ success: true, plans });
}

export async function POST(request) {
  const { error } = await requireSuperAdmin();
  if (error) return error;
  const body = await parseBody(request);
  const slug = sanitizeString(body.slug || body.name, 80)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  const plan = await prisma.plan.create({
    data: {
      slug: `${slug}-${Date.now().toString(36)}`,
      name: sanitizeString(body.name, 120),
      description: sanitizeString(body.description || '', 500) || null,
      priceMonthly: parseFloat(body.priceMonthly) || 0,
      priceYearly: parseFloat(body.priceYearly) || 0,
      maxUsers: parseInt(body.maxUsers, 10) || 1,
      maxAppointments: parseInt(body.maxAppointments, 10) || 100,
      features: body.features || '[]',
      active: body.active !== false,
      sortOrder: parseInt(body.sortOrder, 10) || 0,
    },
  });
  return jsonResponse({ success: true, plan }, 201);
}
