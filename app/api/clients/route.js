export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { validateClientBody } from '@/lib/validations';
import { jsonResponse, errorResponse, unauthorizedResponse, parseBody } from '@/lib/api';

export async function GET(request) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const clients = await prisma.client.findMany({
    where,
    orderBy: { name: 'asc' },
    include: {
      appointments: {
        take: 1,
        orderBy: { date: 'desc' },
        include: { service: { select: { name: true } } },
      },
      _count: { select: { appointments: true } },
    },
  });

  return jsonResponse({ success: true, clients });
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  const body = await parseBody(request);
  const validation = validateClientBody(body);
  if (!validation.valid) return errorResponse(validation.errors.join('. '));

  const client = await prisma.client.create({ data: validation.data });
  return jsonResponse({ success: true, client }, 201);
}
