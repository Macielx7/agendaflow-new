import nodemailer from 'nodemailer';

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@agendaflow.com';

  if (!host || !user || !pass) return null;

  return {
    from,
    transport: nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    }),
  };
}

export function isEmailConfigured() {
  return Boolean(getSmtpConfig());
}

export async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const config = getSmtpConfig();
  if (!config) {
    return { sent: false, reason: 'SMTP_NOT_CONFIGURED' };
  }

  const displayName = name || 'usuário';

  await config.transport.sendMail({
    from: config.from,
    to,
    subject: 'Redefinição de senha — AgendaFlow',
    text: [
      `Olá, ${displayName}!`,
      '',
      'Recebemos uma solicitação para redefinir sua senha no AgendaFlow.',
      'Clique no link abaixo para criar uma nova senha (válido por 1 hora):',
      '',
      resetUrl,
      '',
      'Se você não solicitou esta alteração, ignore este e-mail.',
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
        <h2 style="color:#7c3aed">Redefinição de senha</h2>
        <p>Olá, <strong>${displayName}</strong>!</p>
        <p>Recebemos uma solicitação para redefinir sua senha no <strong>AgendaFlow</strong>.</p>
        <p>Clique no botão abaixo para criar uma nova senha. O link é válido por <strong>1 hora</strong>.</p>
        <p style="margin:28px 0">
          <a href="${resetUrl}" style="background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
            Redefinir minha senha
          </a>
        </p>
        <p style="font-size:13px;color:#666;word-break:break-all">${resetUrl}</p>
        <p style="font-size:13px;color:#999;margin-top:32px">Se você não solicitou esta alteração, ignore este e-mail.</p>
      </div>
    `,
  });

  return { sent: true };
}
