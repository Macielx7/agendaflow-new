'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/Modal/Modal';
import s from '@/styles/saas.module.css';

export default function PayableModal({ open, onClose, onSave, item }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    description: '', supplier: '', categoryId: '', amount: '', dueDate: '', notes: '',
  });

  useEffect(() => {
    if (!open) return;
    fetch('/api/finance/categories?type=EXPENSE').then((r) => r.json()).then((d) => setCategories(d.categories || []));
  }, [open]);

  useEffect(() => {
    if (item) {
      setForm({
        description: item.description || '',
        supplier: item.supplier || '',
        categoryId: item.categoryId || '',
        amount: item.amount || '',
        dueDate: item.dueDate || '',
        notes: item.notes || '',
      });
    } else {
      setForm({
        description: '', supplier: '', categoryId: '', amount: '',
        dueDate: new Date().toISOString().slice(0, 10), notes: '',
      });
    }
  }, [item, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(form);
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={onClose} title={item ? 'Editar conta a pagar' : 'Nova conta a pagar'}>
      <form onSubmit={handleSubmit}>
        <label className={s.label}>Descrição<input className={s.input} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></label>
        <label className={s.label}>Fornecedor<input className={s.input} value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></label>
        <label className={s.label}>Categoria
          <select className={s.input} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">—</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label className={s.label}>Valor<input type="number" step="0.01" className={s.input} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></label>
          <label className={s.label}>Vencimento<input type="date" className={s.input} value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required /></label>
        </div>
        <label className={s.label}>Observações<textarea className={s.input} rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
          <button type="button" className={s.btnSecondary} onClick={onClose}>Cancelar</button>
          <button type="submit" className={s.btnPrimary}>Salvar</button>
        </div>
      </form>
    </Modal>
  );
}
