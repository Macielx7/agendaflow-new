'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal/Modal';
import s from '@/styles/saas.module.css';

const empty = { name: '', description: '', duration: 60, price: '', active: true };

export default function ServiceModal({ isOpen, onClose, onSave, service }) {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(service ? {
      name: service.name, description: service.description || '',
      duration: service.duration, price: String(service.price), active: service.active,
    } : empty);
  }, [service, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await onSave({ ...form, price: parseFloat(form.price) || 0, duration: parseInt(form.duration, 10) }); onClose(); }
    catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={service ? 'Editar serviço' : 'Novo serviço'}>
      <form onSubmit={handleSubmit}>
        <div className={s.formGroup}><label className={s.label}>Nome</label><input className={s.input} value={form.name} onChange={(e) => set('name', e.target.value)} required /></div>
        <div className={s.formGroup}><label className={s.label}>Descrição</label><textarea className={s.input} rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className={s.formGroup}><label className={s.label}>Duração (min)</label><input type="number" className={s.input} value={form.duration} onChange={(e) => set('duration', e.target.value)} /></div>
          <div className={s.formGroup}><label className={s.label}>Valor (R$)</label><input type="number" step="0.01" className={s.input} value={form.price} onChange={(e) => set('price', e.target.value)} /></div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: '0.875rem' }}>
          <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} />
          Serviço ativo
        </label>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" className={s.btnSecondary} onClick={onClose}>Cancelar</button>
          <button type="submit" className={s.btnPrimary} disabled={loading}>Salvar</button>
        </div>
      </form>
    </Modal>
  );
}
