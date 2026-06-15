'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/Modal/Modal';
import { api } from '@/services/api';
import s from '@/styles/saas.module.css';

export default function ReceivableModal({ open, onClose, onSave, item }) {
  const [clients, setClients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    clientId: '', clientName: '', clientCpf: '', description: '', amount: '',
    dueDate: '', notes: '', categoryId: '', dentistName: '',
  });

  useEffect(() => {
    if (!open) return;
    api.clients().then((d) => setClients(d.clients || []));
    fetch('/api/finance/categories?type=INCOME').then((r) => r.json()).then((d) => setCategories(d.categories || []));
  }, [open]);

  useEffect(() => {
    if (item) {
      setForm({
        clientId: item.clientId || '',
        clientName: item.clientName || '',
        clientCpf: item.clientCpf || '',
        description: item.description || '',
        amount: item.amount || '',
        dueDate: item.dueDate || '',
        notes: item.notes || '',
        categoryId: item.categoryId || '',
        dentistName: item.dentistName || '',
      });
    } else {
      setForm({
        clientId: '', clientName: '', clientCpf: '', description: '', amount: '',
        dueDate: new Date().toISOString().slice(0, 10), notes: '', categoryId: '', dentistName: '',
      });
    }
  }, [item, open]);

  const onClientChange = (id) => {
    const c = clients.find((x) => x.id === id);
    setForm({ ...form, clientId: id, clientName: c?.name || '', clientCpf: c?.cpf || '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(form);
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={onClose} title={item ? 'Editar conta a receber' : 'Nova conta a receber'}>
      <form onSubmit={handleSubmit}>
        <label className={s.label}>Cliente
          <select className={s.input} value={form.clientId} onChange={(e) => onClientChange(e.target.value)}>
            <option value="">Manual</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        {!form.clientId && (
          <>
            <label className={s.label}>Nome<input className={s.input} value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} required /></label>
            <label className={s.label}>CPF<input className={s.input} value={form.clientCpf} onChange={(e) => setForm({ ...form, clientCpf: e.target.value })} /></label>
          </>
        )}
        <label className={s.label}>Procedimento<input className={s.input} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></label>
        <label className={s.label}>Categoria
          <select className={s.input} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">—</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className={s.label}>Dentista<input className={s.input} value={form.dentistName} onChange={(e) => setForm({ ...form, dentistName: e.target.value })} /></label>
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
