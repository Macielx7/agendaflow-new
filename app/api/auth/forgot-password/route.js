export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { generateResetToken } from '@/lib/auth';
import { sanitizeString, validateEmail } from '@/lib/validations';
import { sendPasswordResetEmail } from '@/lib/email';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';

export async function POST(request) {
  try {
    const body = await parseBody(request);
    const raw = sanitizeString(body?.email || '', 120).toLowerCase();
    if (!raw) return errorResponse('Informe o e-mail');

    const emailCheck = validateEmail(raw);
    if (!emailCheck.valid) return errorResponse(emailCheck.error || 'E-mail inválido');

    const email = emailCheck.value;
    const user = await prisma.user.findFirst({
      where: { email },
      include: { tenant: { select: { companyName: true, status: true } } },
    });

    if (!user) {
      return errorResponse('E-mail não cadastrado no sistema', 404);
    }

    if (user.tenant?.status && !['ACTIVE', 'TRIAL'].includes(user.tenant.status)) {
      return errorResponse('Conta inativa. Entre em contato com o suporte.', 403);
    }

    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/redefinir-senha?token=${resetToken}`;
    const emailResult = await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    });

    if (emailResult.sent) {
      return jsonResponse({
        success: true,
        message: 'Link de redefinição enviado para o seu e-mail. Verifique sua caixa de entrada e spam.',
      });
    }

    if (process.env.NODE_ENV === 'development') {
      return jsonResponse({
        success: true,
        message: 'SMTP não configurado. Use o link abaixo para redefinir a senha (ambiente de desenvolvimento).',
        resetUrl,
      });
    }

    return errorResponse(
      'Não foi possível enviar o e-mail. Configure SMTP_HOST, SMTP_USER e SMTP_PASS no servidor.',
      503,
    );
  } catch (err) {
    console.error('POST /api/auth/forgot-password:', err);
    return errorResponse('Erro ao processar solicitação de redefinição de senha', 500);
  }
}
