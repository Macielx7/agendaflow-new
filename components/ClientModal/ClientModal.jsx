'use client';

import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import Modal from '@/components/Modal/Modal';
import { InputCPF, InputWhatsApp, InputEmail, InputText } from '@/components/FormInput';
import {
  validateCPFField,
  validateWhatsAppField,
  validateEmailField,
  validateNameField,
} from '@/utils/fieldValidators';
import s from '@/styles/saas.module.css';

const empty = { name: '', cpf: '', phone: '', email: '', notes: '' };

export default function ClientModal({ isOpen, onClose, onSave, client }) {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    setForm(
      client
        ? {
            name: client.name,
            cpf: client.cpf || '',
            phone: client.phone,
            email: client.email || '',
            notes: client.notes || '',
          }
        : empty,
    );
    setSubmitError('');
  }, [client, isOpen]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validateForm = () => {
    const errors = [
      validateNameField(form.name, true),
      validateCPFField(form.cpf, true),
      validateWhatsAppField(form.phone, true),
      validateEmailField(form.email, false),
    ].filter(Boolean);
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length) {
      setSubmitError(errors[0]);
      return;
    }
    setSubmitError('');
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={client ? 'Editar cliente' : 'Novo cliente'}>
      <form onSubmit={handleSubmit}>
        <InputText
          label="Nome Completo"
          icon={User}
          value={form.name}
          onChange={(v) => set('name', v)}
          required
        />
        <InputCPF value={form.cpf} onChange={(v) => set('cpf', v)} required />
        <InputWhatsApp value={form.phone} onChange={(v) => set('phone', v)} required />
        <InputEmail value={form.email} onChange={(v) => set('email', v)} />
        <InputText
          label="Observações"
          value={form.notes}
          onChange={(v) => set('notes', v)}
          multiline
          rows={3}
          placeholder="Informe se a cliente possui alguma doença, alergia ou restrição de tratamento..."
          validate={() => null}
        />
        {submitError && (
          <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: 12 }}>{submitError}</p>
        )}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" className={s.btnSecondary} onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className={s.btnPrimary} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
