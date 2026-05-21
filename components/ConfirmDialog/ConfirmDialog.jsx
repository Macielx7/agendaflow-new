'use client';

import Modal from '@/components/Modal/Modal';
import s from '@/styles/saas.module.css';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading, danger }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>{message}</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button type="button" className={s.btnSecondary} onClick={onClose}>Cancelar</button>
        <button
          type="button"
          className={s.btnPrimary}
          onClick={onConfirm}
          disabled={loading}
          style={danger ? { background: 'linear-gradient(135deg, #ef4444, #dc2626)' } : {}}
        >
          {loading ? 'Aguarde...' : 'Confirmar'}
        </button>
      </div>
    </Modal>
  );
}
