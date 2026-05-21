'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal/Modal';
import s from '@/styles/saas.module.css';

const empty = { name: '', phone: '', email: '', notes: '' };

export default function ClientModal({ isOpen, onClose, onSave, client }) {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(client ? { name: client.name, phone: client.phone, email: client.email || '', notes: client.notes || '' } : empty);
  }, [client, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await onSave(form); onClose(); } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={client ? 'Editar cliente' : 'Novo cliente'}>
      <form onSubmit={handleSubmit}>
        <div className={s.formGroup}><label className={s.label}>Nome</label><input className={s.input} value={form.name} onChange={(e) => set('name', e.target.value)} required /></div>
        <div className={s.formGroup}><label className={s.label}>WhatsApp</label><input className={s.input} value={form.phone} onChange={(e) => set('phone', e.target.value)} required /></div>
        <div className={s.formGroup}><label className={s.label}>E-mail</label><input type="email" className={s.input} value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
        <div className={s.formGroup}><label className={s.label}>Observações</label><textarea className={s.input} rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} /></div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" className={s.btnSecondary} onClick={onClose}>Cancelar</button>
          <button type="submit" className={s.btnPrimary} disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </form>
    </Modal>
  );
}
