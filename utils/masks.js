export function onlyDigits(value, max) {
  const d = String(value ?? '').replace(/\D/g, '');
  return max ? d.slice(0, max) : d;
}

export function maskCPF(value) {
  const d = onlyDigits(value, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function maskCNPJ(value) {
  const d = onlyDigits(value, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export function maskPhone(value, mobile = false) {
  const max = mobile ? 11 : 10;
  const d = onlyDigits(value, max);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (mobile) {
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
}

export function maskCEP(value) {
  const d = onlyDigits(value, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function maskCurrency(value) {
  const d = onlyDigits(value);
  const cents = parseInt(d || '0', 10);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export function parseCurrencyToNumber(value) {
  const d = onlyDigits(value);
  return (parseInt(d || '0', 10) / 100).toFixed(2);
}

export function numberToCurrencyDigits(num) {
  const n = parseFloat(num);
  if (Number.isNaN(n)) return '';
  return String(Math.round(n * 100));
}

export function maskPercent(value) {
  const d = onlyDigits(value, 5);
  if (!d) return '';
  const cents = parseInt(d, 10);
  const formatted = (cents / 100).toFixed(2).replace('.', ',');
  return `${formatted}%`;
}

export function parsePercentToNumber(value) {
  const d = onlyDigits(value, 5);
  return (parseInt(d || '0', 10) / 100).toFixed(2);
}

export function maskDateBR(value) {
  const d = onlyDigits(value, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

export function dateBRToISO(value) {
  const d = onlyDigits(value, 8);
  if (d.length !== 8) return '';
  const day = d.slice(0, 2);
  const month = d.slice(2, 4);
  const year = d.slice(4, 8);
  return `${year}-${month}-${day}`;
}

export function isoToDateBR(value) {
  if (!value) return '';
  const iso = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return maskDateBR(value);
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function dateBRDigitsFromISO(value) {
  if (!value) return '';
  const iso = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return onlyDigits(value, 8);
  const [y, m, d] = iso.split('-');
  return `${d}${m}${y}`;
}

export function maskTime(value) {
  const d = onlyDigits(value, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}:${d.slice(2)}`;
}
