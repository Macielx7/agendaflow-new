export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId, withTenantData } from '@/lib/tenant';
import { validateServiceBody } from '@/lib/validations';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';

export async function GET() {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const services = await prisma.service.findMany({ where: { tenantId }, orderBy: { sortOrder: 'asc' } });
  return jsonResponse({ success: true, services });
}

export async function POST(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const body = await parseBody(request);
  const validation = validateServiceBody(body);
  if (!validation.valid) return errorResponse(validation.error);
  const { slug, ...rest } = validation.data;
  const existing = await prisma.service.findUnique({
    where: { tenantId_slug: { tenantId, slug } },
  });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;
  const service = await prisma.service.create({
    data: withTenantData(tenantId, { ...rest, slug: finalSlug }),
  });
  return jsonResponse({ success: true, service }, 201);
}
