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
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return errorResponse('Credenciais inválidas', 401);
  if (!(await verifyPassword(password, user.password))) {
    return errorResponse('Credenciais inválidas', 401);
  }
  const token = await createToken({ userId: user.id, email: user.email, name: user.name, role: user.role });
  await setAuthCookie(token);
  return jsonResponse({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
}
