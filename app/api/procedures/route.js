export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { jsonResponse } from '@/lib/api';

export async function GET() {
  const procedures = await prisma.procedure.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      duration: true,
      icon: true,
      color: true,
    },
  });

  return jsonResponse({ success: true, procedures });
}
