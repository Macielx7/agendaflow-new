export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';

export async function POST(request) {
  const body = await parseBody(request);
  const { token, password } = body || {};
  if (!token || !password || password.length < 6) {
    return errorResponse('Token e senha (mín. 6 caracteres) obrigatórios');
  }

  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
  });

  if (!user) return errorResponse('Token inválido ou expirado', 400);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await hashPassword(password),
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return jsonResponse({ success: true, message: 'Senha redefinida com sucesso' });
}
