'use client';

import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import Modal from '@/components/Modal/Modal';
import ClientModal from '@/components/ClientModal/ClientModal';
import { api } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { STATUS_LABELS, VALID_STATUSES } from '@/lib/validations';
import s from '@/styles/saas.module.css';

const empty = { clientId: '', serviceId: '', date: '', time: '', notes: '', status: 'PENDING', price: '' };

export default function AppointmentModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  appointment,
  clients: clientsProp = [],
  services = [],
  defaultDate,
  onClientsChange,
}) {
  const [form, setForm] = useState(empty);
  const [clients, setClients] = useState(clientsProp);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientModal, setClientModal] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setClients(clientsProp);
  }, [clientsProp]);

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
    } else setForm({ ...empty, date: defaultDate || '' });
  }, [appointment, isOpen, defaultDate]);

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

  const handleCreateClient = async (clientForm) => {
    const { client } = await api.createClient(clientForm);
    const updated = [...clients, client].sort((a, b) => a.name.localeCompare(b.name));
    setClients(updated);
    setForm((f) => ({ ...f, clientId: client.id }));
    onClientsChange?.(updated);
    toast.success('Cliente cadastrado e selecionado');
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const canDelete = appointment && appointment.status !== 'CANCELLED' && onDelete;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={appointment ? 'Editar agendamento' : 'Novo agendamento'} size="lg">
        <form onSubmit={handleSubmit}>
          <div className={s.formGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className={s.label} style={{ marginBottom: 0 }}>Cliente</label>
              <button
                type="button"
                className={s.btnSecondary}
                style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                onClick={() => setClientModal(true)}
              >
                <UserPlus size={14} /> Novo cliente
              </button>
            </div>
            <select className={s.select} value={form.clientId} onChange={(e) => set('clientId', e.target.value)} required>
              <option value="">Selecione</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.phone}
                </option>
              ))}
            </select>
          </div>
          <div className={s.formGroup}>
            <label className={s.label}>Serviço</label>
            <select className={s.select} value={form.serviceId} onChange={(e) => set('serviceId', e.target.value)} required>
              <option value="">Selecione</option>
              {services.filter((x) => x.active).map((sv) => (
                <option key={sv.id} value={sv.id}>
                  {sv.name} ({sv.duration}min)
                </option>
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
                {slots.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
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
                {VALID_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {STATUS_LABELS[st]}
                  </option>
                ))}
              </select>
            </div>
            <div className={s.formGroup}>
              <label className={s.label}>Valor (R$)</label>
              <input type="number" step="0.01" className={s.input} value={form.price} onChange={(e) => set('price', e.target.value)} />
            </div>
          </div>
          <div className={s.formGroup}>
            <label className={s.label}>Observações</label>
            <textarea
              className={s.input}
              rows={3}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              style={{ minHeight: 80, resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', marginTop: 8, flexWrap: 'wrap' }}>
            <div>
              {canDelete && (
                <button
                  type="button"
                  className={s.btnSecondary}
                  style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.4)' }}
                  onClick={() => onDelete(appointment)}
                >
                  Excluir agendamento
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" className={s.btnSecondary} onClick={onClose}>
                Fechar
              </button>
              <button type="submit" className={s.btnPrimary} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <ClientModal
        isOpen={clientModal}
        onClose={() => setClientModal(false)}
        onSave={handleCreateClient}
      />
    </>
  );
}
