import { isValidCPF, isValidCNPJ } from '@/lib/documentValidators';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function sanitizeString(str, maxLen = 500) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen).replace(/<[^>]*>/g, '');
}

export const STATUS_LABELS = {
  PENDING: 'Aguardando',
  CONFIRMED: 'Confirmado',
  IN_PROGRESS: 'Em atendimento',
  COMPLETED: 'Finalizado',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Faltante',
};

export const STATUS_COLORS = {
  PENDING: '#3b82f6',
  CONFIRMED: '#22c55e',
  IN_PROGRESS: '#eab308',
  COMPLETED: '#9ca3af',
  CANCELLED: '#ef4444',
  NO_SHOW: '#ef4444',
};

export const ACTIVE_STATUSES = ['PENDING', 'CONFIRMED', 'IN_PROGRESS'];
export const INACTIVE_STATUSES = ['COMPLETED', 'CANCELLED', 'NO_SHOW'];

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

export function validateWhatsApp(phone) {
  const clean = sanitizeString(phone, 20).replace(/\D/g, '');
  if (clean.length === 11) {
    if (clean[2] !== '9') return { valid: false, error: 'WhatsApp inválido' };
    return { valid: true, value: clean };
  }
  if (clean.length === 10) return { valid: true, value: clean };
  return { valid: false, error: 'WhatsApp inválido' };
}

export function validateCPF(cpf) {
  const clean = sanitizeString(cpf, 14).replace(/\D/g, '');
  if (!clean) return { valid: false, error: 'CPF obrigatório' };
  if (clean.length !== 11) return { valid: false, error: 'CPF inválido' };
  if (!isValidCPF(clean)) return { valid: false, error: 'CPF inválido' };
  return { valid: true, value: clean };
}

export function validateCNPJ(cnpj) {
  const clean = sanitizeString(cnpj, 18).replace(/\D/g, '');
  if (!clean) return { valid: false, error: 'CNPJ obrigatório' };
  if (clean.length !== 14) return { valid: false, error: 'CNPJ inválido' };
  if (!isValidCNPJ(clean)) return { valid: false, error: 'CNPJ inválido' };
  return { valid: true, value: clean };
}

export function validateCEP(cep) {
  const clean = sanitizeString(cep, 10).replace(/\D/g, '');
  if (!clean) return { valid: false, error: 'CEP obrigatório' };
  if (clean.length !== 8) return { valid: false, error: 'CEP inválido' };
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

export function validateAge(age) {
  if (age === '' || age === null || age === undefined) return { valid: true, value: null };
  const num = parseInt(age, 10);
  if (Number.isNaN(num) || num < 0 || num > 150) return { valid: false, error: 'Idade inválida' };
  return { valid: true, value: num };
}

export function validateClientBody(body) {
  const errors = [];
  const name = validateName(body?.name || '');
  if (!name.valid) errors.push(name.error);
  const cpf = validateCPF(body?.cpf || '');
  if (!cpf.valid) errors.push(cpf.error);
  const phone = validateWhatsApp(body?.phone || '');
  if (!phone.valid) errors.push(phone.error);
  const email = validateEmail(body?.email || '');
  if (!email.valid) errors.push(email.error);
  const age = validateAge(body?.age);
  if (!age.valid) errors.push(age.error);
  if (errors.length) return { valid: false, errors };
  return {
    valid: true,
    data: {
      name: name.value,
      cpf: cpf.value,
      phone: phone.value,
      email: email.value,
      age: age.value,
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
      duration: body?.duration != null ? Math.max(15, Math.min(parseInt(body.duration, 10) || 60, 480)) : null,
    },
  };
}
