export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { jsonResponse, unauthorizedResponse } from '@/lib/api';

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  await prisma.holiday.update({
    where: { id: params.id },
    data: { active: false },
  });
  return jsonResponse({ success: true });
}
