export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { generateResetToken } from '@/lib/auth';
import { sanitizeString } from '@/lib/validations';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';

export async function POST(request) {
  const body = await parseBody(request);
  const email = sanitizeString(body?.email || '', 120).toLowerCase();
  if (!email) return errorResponse('Informe o e-mail');

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return jsonResponse({ success: true, message: 'Se o e-mail existir, você receberá instruções.' });
  }

  const resetToken = generateResetToken();
  const resetTokenExpiry = new Date(Date.now() + 3600000);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/redefinir-senha?token=${resetToken}`;

  return jsonResponse({
    success: true,
    message: 'Token gerado. Em produção, envie por e-mail.',
    resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined,
  });
}
