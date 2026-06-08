'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal/Modal';
import s from '@/styles/saas.module.css';
import styles from './DayAgenda.module.css';

export default function DurationModal({ isOpen, onClose, appointment, onSave, loading }) {
  const initial =
    appointment?.effectiveDuration ?? appointment?.duration ?? appointment?.service?.duration ?? 60;
  const [duration, setDuration] = useState(initial);

  useEffect(() => {
    if (isOpen && appointment) {
      setDuration(
        appointment.effectiveDuration ?? appointment.duration ?? appointment.service?.duration ?? 60,
      );
    }
  }, [isOpen, appointment]);

  const adjust = (delta) => {
    setDuration((d) => Math.max(15, Math.min(480, d + delta)));
  };

  const handleSave = async () => {
    await onSave(duration);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar tempo do atendimento" size="sm">
      <div className={styles.durationModal}>
        <p className={styles.durationHint}>
          Ajuste a duração de <strong>{appointment?.client?.name}</strong>.
          Os próximos horários serão reorganizados automaticamente.
        </p>
        <div className={styles.durationControl}>
          <button type="button" className={styles.durationBtn} onClick={() => adjust(-15)} disabled={loading}>
            −
          </button>
          <div className={styles.durationValue}>{duration} min</div>
          <button type="button" className={styles.durationBtn} onClick={() => adjust(15)} disabled={loading}>
            +
          </button>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" className={s.btnSecondary} onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className={s.btnPrimary} onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Aplicar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
