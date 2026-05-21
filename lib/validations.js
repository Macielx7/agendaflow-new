const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s()+-]{10,20}$/;

export function sanitizeString(str, maxLen = 500) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen).replace(/<[^>]*>/g, '');
}

export function validateEmail(email) {
  if (!email) return { valid: true };
  const clean = sanitizeString(email, 120);
  if (!EMAIL_REGEX.test(clean)) {
    return { valid: false, error: 'E-mail inválido' };
  }
  return { valid: true, value: clean };
}

export function validatePhone(phone) {
  const clean = sanitizeString(phone, 20).replace(/\D/g, '');
  if (clean.length < 10 || clean.length > 15) {
    return { valid: false, error: 'WhatsApp inválido. Informe DDD + número.' };
  }
  return { valid: true, value: clean };
}

export function validateName(name) {
  const clean = sanitizeString(name, 120);
  if (clean.length < 3) {
    return { valid: false, error: 'Nome deve ter pelo menos 3 caracteres' };
  }
  return { valid: true, value: clean };
}

export function validateAppointmentBody(body) {
  const errors = [];

  const nameResult = validateName(body.patientName || '');
  if (!nameResult.valid) errors.push(nameResult.error);

  const phoneResult = validatePhone(body.patientPhone || '');
  if (!phoneResult.valid) errors.push(phoneResult.error);

  const emailResult = validateEmail(body.patientEmail || '');
  if (!emailResult.valid) errors.push(emailResult.error);

  if (!body.procedureId) errors.push('Selecione um procedimento');
  if (!body.date) errors.push('Selecione uma data');
  if (!body.time) errors.push('Selecione um horário');

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (body.date && !dateRegex.test(body.date)) {
    errors.push('Data inválida');
  }

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (body.time && !timeRegex.test(body.time)) {
    errors.push('Horário inválido');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      procedureId: body.procedureId,
      date: body.date,
      time: body.time,
      patientName: nameResult.value,
      patientPhone: phoneResult.value,
      patientEmail: emailResult.value || null,
      notes: sanitizeString(body.notes || '', 1000) || null,
    },
  };
}

export function validateLoginBody(body) {
  const email = sanitizeString(body.email || '', 120).toLowerCase();
  const password = body.password || '';

  if (!email || !EMAIL_REGEX.test(email)) {
    return { valid: false, error: 'E-mail inválido' };
  }
  if (password.length < 6) {
    return { valid: false, error: 'Senha deve ter pelo menos 6 caracteres' };
  }

  return { valid: true, data: { email, password } };
}

export const STATUS_LABELS = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Finalizado',
};

export const STATUS_COLORS = {
  PENDING: '#f59e0b',
  CONFIRMED: '#10b981',
  CANCELLED: '#ef4444',
  COMPLETED: '#6366f1',
};
