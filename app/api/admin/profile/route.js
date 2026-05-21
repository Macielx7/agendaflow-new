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
    select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true },
  });

  return jsonResponse({ success: true, user });
}

export async function PATCH(request) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const body = await parseBody(request);
  if (!body) return errorResponse('Dados inválidos');

  const updateData = {};

  if (body.name) {
    updateData.name = sanitizeString(body.name, 120);
  }

  if (body.currentPassword && body.newPassword) {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    const valid = await verifyPassword(body.currentPassword, user.password);
    if (!valid) return errorResponse('Senha atual incorreta');
    if (body.newPassword.length < 6) {
      return errorResponse('Nova senha deve ter pelo menos 6 caracteres');
    }
    updateData.password = await hashPassword(body.newPassword);
  }

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: updateData,
    select: { id: true, email: true, name: true, role: true, avatar: true },
  });

  return jsonResponse({ success: true, user });
}
