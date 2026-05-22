export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/superRequire';
import { jsonResponse } from '@/lib/api';

export async function GET() {
  const { session, error } = await requireSuperAdmin();
  if (error) return error;
  const admin = await prisma.superAdmin.findUnique({
    where: { id: session.superAdminId },
    select: { id: true, email: true, name: true, role: true },
  });
  return jsonResponse({ success: true, admin });
}
