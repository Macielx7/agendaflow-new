export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/superRequire';
import { createToken, setAuthCookie } from '@/lib/auth';
import { logSystem } from '@/lib/superLog';
import { jsonResponse, errorResponse } from '@/lib/api';

export async function POST(request, { params }) {
  const { session, error } = await requireSuperAdmin();
  if (error) return error;

  const tenant = await prisma.tenant.findUnique({
    where: { id: params.id },
    include: { users: { where: { role: 'ADMIN' }, take: 1 } },
  });
  if (!tenant) return errorResponse('Tenant não encontrado', 404);
  const user = tenant.users[0];
  if (!user) return errorResponse('Sem usuário admin nesta conta', 400);

  const token = await createToken({
    userId: user.id,
    tenantId: tenant.id,
    email: user.email,
    name: user.name,
    role: user.role,
    impersonated: true,
  });
  await setAuthCookie(token);

  await logSystem({
    superAdminId: session.superAdminId,
    tenantId: tenant.id,
    action: 'IMPERSONATE',
    details: user.email,
  });

  return jsonResponse({
    success: true,
    redirect: '/dashboard',
    user: { id: user.id, email: user.email, tenantId: tenant.id },
  });
}
