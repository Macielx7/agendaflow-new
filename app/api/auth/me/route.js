export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { jsonResponse, unauthorizedResponse } from '@/lib/api';

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true },
  });

  if (!user) return unauthorizedResponse();

  return jsonResponse({ success: true, user });
}
