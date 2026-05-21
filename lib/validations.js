const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function sanitizeString(str, maxLen = 500) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen).replace(/<[^>]*>/g, '');
}

export const STATUS_LABELS = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Finalizado',
  CANCELLED: 'Cancelado',
};

export const STATUS_COLORS = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  IN_PROGRESS: '#8b5cf6',
  COMPLETED: '#10b981',
  CANCELLED: '#ef4444',
};

export const VALID_STATUSES = Object.keys(STATUS_LABELS);

export function validateEmail(email) {
  if (!email) return { valid: true, value: null };
  const clean = sanitizeString(email, 120);
  if (!EMAIL_REGEX.test(clean)) return { valid: false, error: 'E-mail inválido' };
  return { valid: true, value: clean };
}

export function validatePhone(phone) {
  const clean = sanitizeString(phone, 20).replace(/\D/g, '');
  if (clean.length < 10) return { valid: false, error: 'Telefone inválido' };
  return { valid: true, value: clean };
}

export function validateName(name) {
  const clean = sanitizeString(name, 120);
  if (clean.length < 2) return { valid: false, error: 'Nome inválido' };
  return { valid: true, value: clean };
}

export function validateLoginBody(body) {
  const email = sanitizeString(body?.email || '', 120).toLowerCase();
  const password = body?.password || '';
  if (!email || !EMAIL_REGEX.test(email)) return { valid: false, error: 'E-mail inválido' };
  if (password.length < 6) return { valid: false, error: 'Senha deve ter pelo menos 6 caracteres' };
  return { valid: true, data: { email, password } };
}

export function validateClientBody(body) {
  const errors = [];
  const name = validateName(body?.name || '');
  if (!name.valid) errors.push(name.error);
  const phone = validatePhone(body?.phone || '');
  if (!phone.valid) errors.push(phone.error);
  const email = validateEmail(body?.email || '');
  if (!email.valid) errors.push(email.error);
  if (errors.length) return { valid: false, errors };
  return {
    valid: true,
    data: {
      name: name.value,
      phone: phone.value,
      email: email.value,
      notes: sanitizeString(body?.notes || '', 1000) || null,
    },
  };
}

export function validateServiceBody(body) {
  const name = sanitizeString(body?.name || '', 120);
  if (!name) return { valid: false, error: 'Nome do serviço obrigatório' };
  const duration = parseInt(body?.duration, 10) || 60;
  const price = parseFloat(body?.price) || 0;
  return {
    valid: true,
    data: {
      name,
      description: sanitizeString(body?.description || '', 500) || null,
      duration: Math.max(15, Math.min(duration, 480)),
      price,
      active: body?.active !== false,
      slug: sanitizeString(body?.slug || name, 80)
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, ''),
    },
  };
}

export function validateAppointmentBody(body) {
  const errors = [];
  if (!body?.clientId) errors.push('Cliente obrigatório');
  if (!body?.serviceId) errors.push('Serviço obrigatório');
  if (!body?.date) errors.push('Data obrigatória');
  if (!body?.time) errors.push('Horário obrigatório');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body?.date || '')) errors.push('Data inválida');
  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(body?.time || '')) errors.push('Horário inválido');
  if (body?.status && !VALID_STATUSES.includes(body.status)) errors.push('Status inválido');
  if (errors.length) return { valid: false, errors };
  return {
    valid: true,
    data: {
      clientId: body.clientId,
      serviceId: body.serviceId,
      date: body.date,
      time: body.time,
      notes: sanitizeString(body?.notes || '', 1000) || null,
      status: body?.status || 'PENDING',
      price: body?.price != null ? parseFloat(body.price) : null,
    },
  };
}
