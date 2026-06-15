'use client';

import { useState } from 'react';
import Modal from '@/components/Modal/Modal';
import { PAYMENT_METHODS } from '@/lib/finance/defaults';
import s from '@/styles/saas.module.css';

export default function PaymentModal({ open, onClose, onSave, title, amount }) {
  const [form, setForm] = useState({
    paidAmount: amount || '',
    paidAt: new Date().toISOString().slice(0, 10),
    paymentMethod: 'PIX',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave({
      paidAmount: parseFloat(form.paidAmount),
      paidAt: form.paidAt,
      paymentMethod: form.paymentMethod,
      status: 'PAID',
    });
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={onClose} title={title || 'Registrar pagamento'} size="sm">
      <form onSubmit={handleSubmit}>
        <label className={s.label}>
          Valor pago
          <input type="number" step="0.01" className={s.input} value={form.paidAmount} onChange={(e) => setForm({ ...form, paidAmount: e.target.value })} required />
        </label>
        <label className={s.label}>
          Data do pagamento
          <input type="date" className={s.input} value={form.paidAt} onChange={(e) => setForm({ ...form, paidAt: e.target.value })} required />
        </label>
        <label className={s.label}>
          Forma de pagamento
          <select className={s.input} value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
            {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </label>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
          <button type="button" className={s.btnSecondary} onClick={onClose}>Cancelar</button>
          <button type="submit" className={s.btnPrimary}>Confirmar</button>
        </div>
      </form>
    </Modal>
  );
}
