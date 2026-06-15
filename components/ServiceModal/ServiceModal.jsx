'use client';

import { useState, useEffect } from 'react';
import { Scissors } from 'lucide-react';
import Modal from '@/components/Modal/Modal';
import { InputText, InputMoeda } from '@/components/FormInput';
import { numberToCurrencyDigits, parseCurrencyToNumber } from '@/utils/masks';
import { validateNameField } from '@/utils/fieldValidators';
import s from '@/styles/saas.module.css';

const empty = { name: '', description: '', duration: 60, price: '', active: true };

export default function ServiceModal({ isOpen, onClose, onSave, service }) {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    setForm(
      service
        ? {
            name: service.name,
            description: service.description || '',
            duration: service.duration,
            price: numberToCurrencyDigits(service.price),
            active: service.active,
          }
        : empty,
    );
    setSubmitError('');
  }, [service, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nameError = validateNameField(form.name, true);
    if (nameError) {
      setSubmitError(nameError);
      return;
    }
    setSubmitError('');
    setLoading(true);
    try {
      await onSave({
        ...form,
        price: parseFloat(parseCurrencyToNumber(form.price)) || 0,
        duration: parseInt(form.duration, 10),
      });
      onClose();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={service ? 'Editar serviço' : 'Novo serviço'}>
      <form onSubmit={handleSubmit}>
        <InputText label="Nome" icon={Scissors} value={form.name} onChange={(v) => set('name', v)} required />
        <InputText
          label="Descrição"
          value={form.description}
          onChange={(v) => set('description', v)}
          multiline
          rows={2}
          validate={() => null}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
          <InputText
            label="Duração (min)"
            value={String(form.duration)}
            onChange={(v) => set('duration', v)}
            type="number"
            validate={() => null}
          />
          <InputMoeda label="Valor" value={form.price} onChange={(v) => set('price', v)} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: '0.875rem' }}>
          <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} />
          Serviço ativo
        </label>
        {submitError && (
          <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: 12 }}>{submitError}</p>
        )}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" className={s.btnSecondary} onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className={s.btnPrimary} disabled={loading}>
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  );
}
