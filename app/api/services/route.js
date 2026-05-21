export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { validateServiceBody } from '@/lib/validations';
import { jsonResponse, errorResponse, unauthorizedResponse, parseBody } from '@/lib/api';

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  const services = await prisma.service.findMany({ orderBy: { sortOrder: 'asc' } });
  return jsonResponse({ success: true, services });
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  const body = await parseBody(request);
  const validation = validateServiceBody(body);
  if (!validation.valid) return errorResponse(validation.error);
  const { slug, ...rest } = validation.data;
  const existing = await prisma.service.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;
  const service = await prisma.service.create({
    data: { ...rest, slug: finalSlug },
  });
  return jsonResponse({ success: true, service }, 201);
}
