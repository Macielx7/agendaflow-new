export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { createToken, setAuthCookie, verifyPassword } from '@/lib/auth';
import { validateLoginBody } from '@/lib/validations';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';

export async function POST(request) {
  const body = await parseBody(request);
  if (!body) return errorResponse('Dados inválidos');
  const validation = validateLoginBody(body);
  if (!validation.valid) return errorResponse(validation.error);
  const { email, password } = validation.data;
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) return errorResponse('Credenciais inválidas', 401);
  if (!(await verifyPassword(password, user.password))) {
    return errorResponse('Credenciais inválidas', 401);
  }
  const { assertTenantAccess } = await import('@/lib/tenantAccess');
  const access = await assertTenantAccess(user.tenantId);
  if (!access.ok) return errorResponse(access.error, 403);
  await prisma.tenant.update({
    where: { id: user.tenantId },
    data: { lastAccessAt: new Date() },
  });
  const token = await createToken({
    userId: user.id,
    tenantId: user.tenantId,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  await setAuthCookie(token);
  return jsonResponse({
    success: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, tenantId: user.tenantId },
  });
}
