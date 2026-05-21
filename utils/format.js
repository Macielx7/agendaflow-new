import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDateBR(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date.slice(0, 10)) : date;
  return format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatDateShort(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date.slice(0, 10)) : date;
  return format(d, 'dd/MM/yyyy', { locale: ptBR });
}

export function formatCurrency(value) {
  const num = parseFloat(value) || 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
}

export function formatPhone(phone) {
  const c = (phone || '').replace(/\D/g, '');
  if (c.length === 11) return `(${c.slice(0, 2)}) ${c.slice(2, 7)}-${c.slice(7)}`;
  if (c.length === 10) return `(${c.slice(0, 2)}) ${c.slice(2, 6)}-${c.slice(6)}`;
  return phone;
}

export function toDateInput(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? date.slice(0, 10) : format(date, 'yyyy-MM-dd');
  return d;
}

export function getWeekDays(baseDate = new Date()) {
  const start = startOfWeek(baseDate, { weekStartsOn: 0 });
  const end = endOfWeek(baseDate, { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

export function getMonthDays(year, month) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return eachDayOfInterval({ start, end });
}

export { format, addDays, startOfWeek, endOfWeek };
