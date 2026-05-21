export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { getSession, hashPassword, verifyPassword } from '@/lib/auth';
import { sanitizeString } from '@/lib/validations';
import { jsonResponse, unauthorizedResponse, errorResponse, parseBody } from '@/lib/api';

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true, avatar: true },
  });
  return jsonResponse({ success: true, user });
}

export async function PATCH(request) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  const body = await parseBody(request);
  const data = {};
  if (body.name) data.name = sanitizeString(body.name, 120);
  if (body.currentPassword && body.newPassword) {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!(await verifyPassword(body.currentPassword, user.password))) {
      return errorResponse('Senha atual incorreta');
    }
    if (body.newPassword.length < 6) return errorResponse('Nova senha mín. 6 caracteres');
    data.password = await hashPassword(body.newPassword);
  }
  const user = await prisma.user.update({
    where: { id: session.userId },
    data,
    select: { id: true, email: true, name: true, role: true },
  });
  return jsonResponse({ success: true, user });
}
