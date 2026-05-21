import {
  Sparkles,
  Shield,
  Sun,
  ClipboardList,
} from 'lucide-react';

export const PROCEDURE_ICONS = {
  sparkles: Sparkles,
  shield: Shield,
  sun: Sun,
  clipboard: ClipboardList,
};

export function formatDateBR(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ];
  const weekdays = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
    'Quinta-feira', 'Sexta-feira', 'Sábado',
  ];
  const date = new Date(dateStr + 'T12:00:00');
  const weekday = weekdays[date.getDay()];
  return `${weekday}, ${parseInt(d)} de ${months[parseInt(m) - 1]} de ${y}`;
}

export function formatPhoneDisplay(phone) {
  const clean = (phone || '').replace(/\D/g, '');
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  }
  if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  return phone;
}
