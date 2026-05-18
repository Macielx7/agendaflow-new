import { CONTACT } from './constants';

export function getWhatsAppLink(message) {
  const text = encodeURIComponent(message || CONTACT.whatsappMessage);
  return `https://wa.me/${CONTACT.whatsapp}?text=${text}`;
}

export function formatNumber(num) {
  return new Intl.NumberFormat('pt-BR').format(num);
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function scrollToSection(id) {
  const element = document.getElementById(id.replace('#', ''));
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
