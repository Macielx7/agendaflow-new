import { addMonths, startOfDay, format } from 'date-fns';

export function toDecimal(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

export function resolveStatus(amount, paidAmount, dueDate, currentStatus) {
  if (currentStatus === 'CANCELLED') return 'CANCELLED';
  const total = toDecimal(amount);
  const paid = toDecimal(paidAmount);
  if (paid >= total && total > 0) return 'PAID';
  if (paid > 0 && paid < total) return 'PARTIAL';
  const due = startOfDay(typeof dueDate === 'string' ? new Date(dueDate) : dueDate);
  if (due < startOfDay(new Date())) return 'OVERDUE';
  return 'PENDING';
}

export function splitInstallments(totalAmount, count, firstDueDate) {
  const total = toDecimal(totalAmount);
  const n = Math.max(1, parseInt(count, 10) || 1);
  const base = Math.floor((total / n) * 100) / 100;
  const remainder = Math.round((total - base * n) * 100) / 100;
  const start = startOfDay(typeof firstDueDate === 'string' ? new Date(firstDueDate) : firstDueDate);

  return Array.from({ length: n }, (_, i) => ({
    number: i + 1,
    amount: i === n - 1 ? toDecimal(base + remainder) : base,
    dueDate: addMonths(start, i),
  }));
}

export function serializeReceivable(r) {
  return {
    ...r,
    amount: parseFloat(r.amount),
    paidAmount: parseFloat(r.paidAmount),
    dueDate: format(r.dueDate, 'yyyy-MM-dd'),
    paidAt: r.paidAt ? format(r.paidAt, 'yyyy-MM-dd') : null,
    client: r.client || undefined,
    category: r.category || undefined,
  };
}

export function serializePayable(p) {
  return {
    ...p,
    amount: parseFloat(p.amount),
    paidAmount: parseFloat(p.paidAmount),
    dueDate: format(p.dueDate, 'yyyy-MM-dd'),
    paidAt: p.paidAt ? format(p.paidAt, 'yyyy-MM-dd') : null,
    category: p.category || undefined,
  };
}

export function serializeInstallment(i) {
  return {
    ...i,
    amount: parseFloat(i.amount),
    dueDate: format(i.dueDate, 'yyyy-MM-dd'),
    paidAt: i.paidAt ? format(i.paidAt, 'yyyy-MM-dd') : null,
  };
}

export function daysOverdue(dueDate) {
  const due = startOfDay(typeof dueDate === 'string' ? new Date(dueDate) : dueDate);
  const today = startOfDay(new Date());
  const diff = Math.floor((today - due) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}
