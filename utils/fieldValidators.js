import { isValidCPF, isValidCNPJ } from '@/lib/documentValidators';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCPFField(value, required = true) {
  const clean = String(value || '').replace(/\D/g, '');
  if (!clean) return required ? 'CPF é obrigatório' : null;
  if (clean.length !== 11) return 'CPF deve ter 11 dígitos';
  if (!isValidCPF(clean)) return 'CPF inválido';
  return null;
}

export function validateCNPJField(value, required = true) {
  const clean = String(value || '').replace(/\D/g, '');
  if (!clean) return required ? 'CNPJ é obrigatório' : null;
  if (clean.length !== 14) return 'CNPJ deve ter 14 dígitos';
  if (!isValidCNPJ(clean)) return 'CNPJ inválido';
  return null;
}

export function validatePhoneField(value, required = true, mobile = false) {
  const clean = String(value || '').replace(/\D/g, '');
  if (!clean) return required ? 'Telefone é obrigatório' : null;
  if (mobile) {
    if (clean.length !== 11) return 'Celular deve ter 11 dígitos';
    if (clean[2] !== '9') return 'Celular deve começar com 9 após o DDD';
    return null;
  }
  if (clean.length !== 10) return 'Telefone deve ter 10 dígitos';
  return null;
}

export function validateWhatsAppField(value, required = true) {
  const clean = String(value || '').replace(/\D/g, '');
  if (!clean) return required ? 'WhatsApp é obrigatório' : null;
  if (clean.length === 11) {
    if (clean[2] !== '9') return 'WhatsApp inválido';
    return null;
  }
  if (clean.length === 10) return null;
  return 'WhatsApp deve ter 10 ou 11 dígitos';
}

export function validateEmailField(value, required = false) {
  const clean = String(value || '').trim();
  if (!clean) return required ? 'E-mail é obrigatório' : null;
  if (!EMAIL_REGEX.test(clean)) return 'E-mail inválido';
  return null;
}

export function validateCEPField(value, required = true) {
  const clean = String(value || '').replace(/\D/g, '');
  if (!clean) return required ? 'CEP é obrigatório' : null;
  if (clean.length !== 8) return 'CEP deve ter 8 dígitos';
  return null;
}

export function validateCurrencyField(value, required = false) {
  const clean = String(value || '').replace(/\D/g, '');
  if (!clean || clean === '0') return required ? 'Valor é obrigatório' : null;
  return null;
}

export function validateDateField(value, required = true) {
  const clean = String(value || '').replace(/\D/g, '');
  if (!clean) return required ? 'Data é obrigatória' : null;
  if (clean.length !== 8) return 'Data inválida';
  const day = parseInt(clean.slice(0, 2), 10);
  const month = parseInt(clean.slice(2, 4), 10);
  const year = parseInt(clean.slice(4, 8), 10);
  if (month < 1 || month > 12) return 'Mês inválido';
  if (day < 1 || day > 31) return 'Dia inválido';
  if (year < 1900 || year > 2100) return 'Ano inválido';
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return 'Data inválida';
  }
  return null;
}

export function validateTimeField(value, required = true) {
  const clean = String(value || '').replace(/\D/g, '');
  if (!clean) return required ? 'Horário é obrigatório' : null;
  if (clean.length !== 4) return 'Horário inválido';
  const h = parseInt(clean.slice(0, 2), 10);
  const m = parseInt(clean.slice(2, 4), 10);
  if (h > 23) return 'Hora inválida';
  if (m > 59) return 'Minuto inválido';
  return null;
}

export function validateNameField(value, required = true) {
  const clean = String(value || '').trim();
  if (!clean) return required ? 'Nome é obrigatório' : null;
  if (clean.length < 2) return 'Nome deve ter pelo menos 2 caracteres';
  return null;
}

export function validatePercentField(value, required = false) {
  const clean = String(value || '').replace(/\D/g, '');
  if (!clean) return required ? 'Porcentagem é obrigatória' : null;
  const num = parseInt(clean, 10) / 100;
  if (num > 100) return 'Porcentagem não pode ser maior que 100%';
  return null;
}
