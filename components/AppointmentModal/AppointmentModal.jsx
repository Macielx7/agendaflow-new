'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal/Modal';
import { api } from '@/services/api';
import { STATUS_LABELS, VALID_STATUSES } from '@/lib/validations';
import s from '@/styles/saas.module.css';

const empty = { clientId: '', serviceId: '', date: '', time: '', notes: '', status: 'PENDING', price: '' };

export default function AppointmentModal({ isOpen, onClose, onSave, appointment, clients = [], services = [] }) {
  const [form, setForm] = useState(empty);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (appointment) {
      setForm({
        clientId: appointment.clientId,
        serviceId: appointment.serviceId,
        date: appointment.date?.slice?.(0, 10) || '',
        time: appointment.time,
        notes: appointment.notes || '',
        status: appointment.status,
        price: appointment.price != null ? String(appointment.price) : '',
      });
    } else setForm(empty);
  }, [appointment, isOpen]);

  useEffect(() => {
    if (form.date && form.serviceId) {
      api.slots(form.date, form.serviceId).then((d) => setSlots(d.slots || [])).catch(() => setSlots([]));
    }
  }, [form.date, form.serviceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        ...form,
        price: form.price ? parseFloat(form.price) : undefined,
      });
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={appointment ? 'Editar agendamento' : 'Novo agendamento'} size="lg">
      <form onSubmit={handleSubmit}>
        <div className={s.formGroup}>
          <label className={s.label}>Cliente</label>
          <select className={s.select} value={form.clientId} onChange={(e) => set('clientId', e.target.value)} required>
            <option value="">Selecione</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
          </select>
        </div>
        <div className={s.formGroup}>
          <label className={s.label}>Serviço</label>
          <select className={s.select} value={form.serviceId} onChange={(e) => set('serviceId', e.target.value)} required>
            <option value="">Selecione</option>
            {services.filter((x) => x.active).map((sv) => (
              <option key={sv.id} value={sv.id}>{sv.name} ({sv.duration}min)</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className={s.formGroup}>
            <label className={s.label}>Data</label>
            <input type="date" className={s.input} value={form.date} onChange={(e) => set('date', e.target.value)} required />
          </div>
          <div className={s.formGroup}>
            <label className={s.label}>Horário</label>
            <select className={s.select} value={form.time} onChange={(e) => set('time', e.target.value)} required>
              <option value="">Selecione</option>
              {slots.map((t) => <option key={t} value={t}>{t}</option>)}
              {appointment?.time && !slots.includes(appointment.time) && (
                <option value={appointment.time}>{appointment.time}</option>
              )}
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className={s.formGroup}>
            <label className={s.label}>Status</label>
            <select className={s.select} value={form.status} onChange={(e) => set('status', e.target.value)}>
              {VALID_STATUSES.map((st) => <option key={st} value={st}>{STATUS_LABELS[st]}</option>)}
            </select>
          </div>
          <div className={s.formGroup}>
            <label className={s.label}>Valor (R$)</label>
            <input type="number" step="0.01" className={s.input} value={form.price} onChange={(e) => set('price', e.target.value)} />
          </div>
        </div>
        <div className={s.formGroup}>
          <label className={s.label}>Observações</label>
          <textarea className={s.input} rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} style={{ minHeight: 80, resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className={s.btnSecondary} onClick={onClose}>Cancelar</button>
          <button type="submit" className={s.btnPrimary} disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </form>
    </Modal>
  );
}
